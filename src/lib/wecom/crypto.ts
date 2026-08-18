import crypto from "crypto";

/**
 * 企业微信消息加解密工具
 * 参考官方文档：https://developer.work.weixin.qq.com/document/path/90968
 */

interface WeComConfig {
  token: string;
  encodingAESKey: string;
  corpId: string;
}

function getKey(config: WeComConfig): Buffer {
  return Buffer.from(config.encodingAESKey + "=", "base64");
}

function getIV(config: WeComConfig): Buffer {
  return getKey(config).subarray(0, 16);
}

/**
 * 计算签名：SHA1(sort([token, timestamp, nonce, encrypt]))
 */
function calcSignature(
  token: string,
  timestamp: string,
  nonce: string,
  encrypt: string
): string {
  const arr = [token, timestamp, nonce, encrypt].sort();
  const sha1 = crypto.createHash("sha1");
  sha1.update(arr.join(""));
  return sha1.digest("hex");
}

/**
 * 验证签名
 */
export function verifySignature(
  config: WeComConfig,
  msgSignature: string,
  timestamp: string,
  nonce: string,
  encrypt: string
): boolean {
  const expected = calcSignature(config.token, timestamp, nonce, encrypt);
  return expected === msgSignature;
}

/**
 * AES-256-CBC 解密
 */
function decryptAES(key: Buffer, iv: Buffer, encrypted: string): Buffer {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([
    decipher.update(encrypted, "base64"),
    decipher.final(),
  ]);

  // PKCS#7 unpadding
  const pad = decrypted[decrypted.length - 1];
  if (pad < 1 || pad > 32) {
    return decrypted;
  }
  return decrypted.subarray(0, decrypted.length - pad);
}

/**
 * AES-256-CBC 加密
 */
function encryptAES(key: Buffer, iv: Buffer, plaintext: Buffer): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  cipher.setAutoPadding(false);

  // PKCS#7 padding
  const blockSize = 32;
  const padSize = blockSize - (plaintext.length % blockSize);
  const padded = Buffer.concat([
    plaintext,
    Buffer.alloc(padSize, padSize),
  ]);

  return Buffer.concat([cipher.update(padded), cipher.final()]).toString(
    "base64"
  );
}

/**
 * 解密企业微信消息
 * 明文结构：16字节随机串 + 4字节消息长度(网络序) + 消息内容 + receiveid
 */
export function decrypt(
  config: WeComConfig,
  encrypted: string
): { message: string; receiveId: string } {
  const key = getKey(config);
  const iv = getIV(config);
  const decrypted = decryptAES(key, iv, encrypted);

  // Skip 16 bytes random
  let offset = 16;
  const msgLen = decrypted.readUInt32BE(offset);
  offset += 4;

  const message = decrypted.subarray(offset, offset + msgLen).toString("utf8");
  offset += msgLen;

  const receiveId = decrypted.subarray(offset).toString("utf8");

  return { message, receiveId };
}

/**
 * 加密回复消息
 * 明文结构：16字节随机串 + 4字节消息长度(网络序) + 消息内容 + corpId
 */
export function encrypt(config: WeComConfig, replyMessage: string): string {
  const key = getKey(config);
  const iv = getIV(config);

  const random16 = crypto.randomBytes(16);
  const msgBuffer = Buffer.from(replyMessage, "utf8");
  const msgLen = Buffer.alloc(4);
  msgLen.writeUInt32BE(msgBuffer.length, 0);
  const corpIdBuffer = Buffer.from(config.corpId, "utf8");

  const plaintext = Buffer.concat([
    random16,
    msgLen,
    msgBuffer,
    corpIdBuffer,
  ]);

  return encryptAES(key, iv, plaintext);
}

/**
 * 生成加密的 XML 回复
 */
export function buildEncryptedReply(
  config: WeComConfig,
  replyMessage: string,
  timestamp: string,
  nonce: string
): string {
  const encrypted = encrypt(config, replyMessage);
  const signature = calcSignature(config.token, timestamp, nonce, encrypted);

  return `<xml>
<Encrypt><![CDATA[${encrypted}]]></Encrypt>
<MsgSignature><![CDATA[${signature}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce><![CDATA[${nonce}]]></Nonce>
</xml>`;
}
