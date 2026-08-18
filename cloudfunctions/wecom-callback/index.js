const crypto = require('crypto');

// ========== Config ==========
const TOKEN = process.env.WECOM_TOKEN || 'YProNvmnzbPiaqTom9L7K6';
const ENCODING_AES_KEY = process.env.WECOM_ENCODING_AES_KEY || 'OuFSIwlaiCWEgdtzFyuuPMBOGG64wc54rV9FNBtj4lh';
const CORP_ID = process.env.WECOM_CORP_ID || 'ww4ee39cdaa0955782';
const AGENT_ID = process.env.WECOM_AGENT_ID || '1000003';
const CORP_SECRET = process.env.WECOM_SECRET || 'cwy0T8UwpW-3ERCn6RfuyQEEOtVnO0K9b_psL2OaI1M';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://br-prime-rook-1c727bd5.supabase2.aidap-global.cn-beijing.volces.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ========== Crypto Utils ==========
function getSignature(token, timestamp, nonce, echostr) {
  const arr = [token, timestamp, nonce, echostr].sort();
  return crypto.createHash('sha1').update(arr.join('')).digest('hex');
}

function decrypt(echostr) {
  const key = Buffer.from(ENCODING_AES_KEY + '=', 'base64');
  const iv = key.slice(0, 16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  decipher.setAutoPadding(false);
  let decrypted = Buffer.concat([decipher.update(echostr, 'base64'), decipher.final()]);
  const pad = decrypted[decrypted.length - 1];
  if (pad < 1 || pad > 32) return '';
  decrypted = decrypted.slice(0, decrypted.length - pad);
  const msgLen = decrypted.readUInt32BE(16);
  return decrypted.slice(20, 20 + msgLen).toString('utf8');
}

function encryptMsg(replyMsg, nonce, timestamp) {
  const key = Buffer.from(ENCODING_AES_KEY + '=', 'base64');
  const iv = key.slice(0, 16);
  const msgBuf = Buffer.from(replyMsg, 'utf8');
  const corpBuf = Buffer.from(CORP_ID, 'utf8');
  const randomBytes = crypto.randomBytes(16);
  const msgLen = Buffer.alloc(4);
  msgLen.writeUInt32BE(msgBuf.length, 0);
  let raw = Buffer.concat([randomBytes, msgLen, msgBuf, corpBuf]);
  const padLen = 32 - (raw.length % 32);
  const pad = Buffer.alloc(padLen, padLen);
  raw = Buffer.concat([raw, pad]);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(raw), cipher.final()]).toString('base64');
  const signature = getSignature(TOKEN, timestamp, nonce, encrypted);
  return `<xml><Encrypt><![CDATA[${encrypted}]]></Encrypt><MsgSignature><![CDATA[${signature}]]></MsgSignature><TimeStamp>${timestamp}</TimeStamp><Nonce><![CDATA[${nonce}]]></Nonce></xml>`;
}

function parseXml(xml) {
  const result = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) result[match[1]] = match[2];
    else if (match[3]) result[match[3]] = match[4];
  }
  return result;
}

// ========== Supabase Utils ==========
async function supabaseRequest(method, path, body) {
  if (!SUPABASE_SERVICE_KEY) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (resp.status === 204) return true;
    return await resp.json();
  } catch (e) {
    console.error('Supabase error:', e.message);
    return null;
  }
}

async function saveWecomMessage(openId, content, fromUser) {
  // Find or create customer
  let customers = await supabaseRequest('GET', `customers?wecom_open_id=eq.${openId}&select=id`, null);
  let customerId;
  if (customers && customers.length > 0) {
    customerId = customers[0].id;
  } else {
    const name = fromUser || `微信用户_${openId.slice(-6)}`;
    const created = await supabaseRequest('POST', 'customers', {
      name,
      wecom_open_id: openId,
      source: 'wechat',
      intent_level: 'B',
      follow_up_status: 'pending',
      ai_mode: true,
      unread_count: 1,
      last_message_preview: content,
      last_message_at: new Date().toISOString(),
      urgency: 3,
    });
    if (created && created.length > 0) customerId = created[0].id;
  }

  if (!customerId) return null;

  // Update customer
  await supabaseRequest('PATCH', `customers?id=eq.${customerId}`, {
    unread_count: 1,
    last_message_preview: content,
    last_message_at: new Date().toISOString(),
  });

  // Find or create conversation
  let convs = await supabaseRequest('GET', `conversations?customer_id=eq.${customerId}&status=eq.active&select=id`, null);
  let conversationId;
  if (convs && convs.length > 0) {
    conversationId = convs[0].id;
  } else {
    const created = await supabaseRequest('POST', 'conversations', {
      customer_id: customerId,
      status: 'active',
      title: `微信咨询-${fromUser || openId.slice(-6)}`,
      ai_participation: 'full',
    });
    if (created && created.length > 0) conversationId = created[0].id;
  }

  if (!conversationId) return null;

  // Save message
  await supabaseRequest('POST', 'messages', {
    conversation_id: conversationId,
    customer_id: customerId,
    sender_type: 'customer',
    sender_name: fromUser || '客户',
    message_type: 'text',
    content,
    is_read: false,
  });

  return { customerId, conversationId };
}

// ========== WeCom API ==========
let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${CORP_ID}&corpsecret=${CORP_SECRET}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.access_token) {
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };
    return data.access_token;
  }
  throw new Error('Failed to get access_token: ' + JSON.stringify(data));
}

async function sendWecomMessage(openId, content) {
  try {
    const token = await getAccessToken();
    const resp = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        touser: openId,
        msgtype: 'text',
        agentid: parseInt(AGENT_ID),
        text: { content },
      }),
    });
    const data = await resp.json();
    if (data.errcode !== 0) {
      console.error('Send message failed:', JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.error('Send message error:', e.message);
    return null;
  }
}

// ========== Main Handler ==========
exports.main = async (event, context) => {
  const { httpMethod, queryStringParameters, body, headers } = event;

  if (httpMethod === 'GET') {
    // URL verification
    const { msg_signature, timestamp, nonce, echostr } = queryStringParameters || {};
    if (!msg_signature || !timestamp || !nonce || !echostr) {
      return { statusCode: 400, body: 'missing params' };
    }
    const signature = getSignature(TOKEN, timestamp, nonce, echostr);
    if (signature !== msg_signature) {
      return { statusCode: 403, body: 'invalid signature' };
    }
    const decrypted = decrypt(echostr);
    return { statusCode: 200, body: decrypted, headers: { 'Content-Type': 'text/plain' } };
  }

  if (httpMethod === 'POST') {
    try {
      const { msg_signature, timestamp, nonce } = queryStringParameters || {};
      const xmlBody = typeof body === 'string' ? body : JSON.stringify(body);
      const xmlData = parseXml(xmlBody);
      const encrypted = xmlData.Encrypt;

      if (!encrypted) {
        return { statusCode: 400, body: 'no encrypt' };
      }

      const signature = getSignature(TOKEN, timestamp || String(Math.floor(Date.now() / 1000)), nonce || 'nonce', encrypted);
      if (signature !== msg_signature) {
        return { statusCode: 403, body: 'invalid signature' };
      }

      const decryptedXml = decrypt(encrypted);
      const msg = parseXml(decryptedXml);

      const msgType = msg.MsgType;
      const fromUser = msg.FromUserName;
      const content = msg.Content || '';

      console.log('Received message:', { msgType, fromUser, content: content.substring(0, 100) });

      if (msgType === 'text' && content && fromUser) {
        const result = await saveWecomMessage(fromUser, content, fromUser);

        // Auto-reply if AI mode
        if (result) {
          let reply = '您好！感谢您的咨询，我们的课程顾问会尽快回复您。';
          if (content.includes('价格') || content.includes('多少钱') || content.includes('费用')) {
            reply = '您好！我们的课程价格如下：\n• 专注力体验课：99元/4周\n• 专注力系统课：2980元/8周\n• 逻辑思维启蒙课：1680元/8周\n• 感统训练基础课：3680元/12周\n\n具体优惠可以咨询课程顾问，需要帮您安排免费体验吗？';
          } else if (content.includes('试听') || content.includes('体验')) {
            reply = '您好！我们提供免费体验课，4周仅需99元（含1对1专注力测评+4次直播课）。需要帮您预约一个时间段吗？';
          } else if (content.includes('几岁') || content.includes('年龄') || content.includes('多大')) {
            reply = '您好！我们的课程适合3-6岁学龄前儿童。请问您家宝贝今年几岁了？我可以帮您推荐最适合的课程。';
          }
          await sendWecomMessage(fromUser, reply);
        }
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/xml' },
        body: 'success',
      };
    } catch (e) {
      console.error('Callback error:', e.message, e.stack);
      return { statusCode: 500, body: 'internal error' };
    }
  }

  return { statusCode: 405, body: 'method not allowed' };
};
