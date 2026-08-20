/**
 * AI 自动回复服务
 * - 优先调用大语言模型生成自然回复
 * - SDK 不可用或调用失败时，回退到基于关键词的规则回复
 * - 永远保证客户消息后有回复
 */

// 教育课程相关的知识库（兜底回复用）— 真实课程信息
const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["价格", "多少钱", "费用", "收费", "价位", "贵", "学费", "课费"],
    answer:
      "我们有两个课程方案：\n\n1. 【体验课】99元 / 3节，适合先感受课堂氛围和老师风格\n2. 【正式课】2980元 / 99节，系统完整学习\n\n正式课平均下来一节课不到30元，性价比很高。方便告诉我孩子今年几岁吗？我帮您看看适合从哪个阶段开始~",
  },
  {
    keywords: ["几岁", "年龄", "多大", "适合", "0岁", "3岁", "6岁", "12岁", "18岁"],
    answer:
      "我们的课程适合 0-18 岁的孩子，会根据年龄段匹配相应的内容和老师：\n\n🍼 0-3岁：早期启蒙、亲子陪伴\n🌱 3-6岁：专注力、思维启蒙、学习习惯\n📚 6-12岁：学科基础、学习方法\n🎓 12-18岁：学习规划、能力提升\n\n您家孩子今年几岁啦？我可以发对应年龄段的课程大纲给您参考~",
  },
  {
    keywords: ["试听", "体验课", "试试", "先上一节", "体验"],
    answer:
      "可以的！我们有【99元3节体验课】，让孩子先真实感受一下：\n\n✅ 3节完整课程（每节60分钟）\n✅ liu老师亲自授课\n✅ 课后给您一份孩子的学情反馈\n\n体验后再决定是否报正式课，没有任何压力。需要我现在帮您预约吗？",
  },
  {
    keywords: ["上课", "时间", "安排", "几点", "时长", "多久", "一周几次", "每周"],
    answer:
      "课程安排如下：\n\n⏰ 每节课 60 分钟\n📅 每周 3 次课\n👨‍🏫 由 liu 老师授课\n\n具体上课时间段可以根据您和孩子的时间协调预约。您一般工作日晚上还是周末比较方便？我帮您看看还有哪些时段可以选~",
  },
  {
    keywords: ["老师", "师资", "谁教", "教学", "liu老师", "刘老师", "liu"],
    answer:
      "我们的课程由 liu 老师主讲：\n\n👨‍🏫 教学经验丰富，带过各个年龄段的孩子\n📖 擅长根据孩子特点调整授课节奏\n💬 家长反馈老师耐心、负责、孩子喜欢\n\n您可以先约一节体验课，亲自感受一下 liu 老师的授课风格~",
  },
  {
    keywords: ["效果", "有用吗", "靠谱", "怎么样", "能学到", "学得会"],
    answer:
      "课程效果主要取决于坚持，我们正式课设计为 99 节系统课程，每周 3 次、持续约 8 个月，能让孩子在稳定节奏下形成习惯、看到进步。\n\n很多家长反馈孩子在专注力、学习主动性上变化明显。建议您先约 99 元体验课，实际感受一下再判断~",
  },
  {
    keywords: ["报名", "怎么买", "购买", "下单", "付款", "支付", "报课", "怎么报"],
    answer:
      "报名很简单：\n\n1️⃣ 告诉我孩子年龄和您方便的上课时间段\n2️⃣ 我帮您安排体验课或推荐合适的课程方案\n3️⃣ 微信/支付宝支付后即可开通课程\n\n您看是先约 99 元 3 节的体验课，还是直接了解 2980 元的正式课？",
  },
  {
    keywords: ["退款", "退费", "不满意", "退课", "能退吗", "不想上了"],
    answer:
      "关于退款政策需要跟您说明清楚：\n\n📌 课程进度未超过 50% 可以申请退款\n📌 一旦上课进度达到 50% 及以上，不支持退款\n\n所以建议您先报 99 元体验课，确认孩子喜欢、能坚持，再考虑正式课，这样更稳妥~",
  },
  {
    keywords: ["你好", "您好", "在吗", "hi", "hello", "在么", "在不在"],
    answer:
      "您好呀~我是课程顾问小艾，很高兴为您服务！😊\n\n我可以帮您：\n• 了解 0-18 岁课程安排\n• 预约 liu 老师体验课\n• 查询价格和上课时间\n• 解答报名/退款相关问题\n\n请问有什么可以帮您的？",
  },
  {
    keywords: ["谢谢", "感谢", "好的", "ok", "嗯", "行"],
    answer: "不客气~ 如果还有其他问题随时问我。您也可以直接留下孩子的年龄和联系方式，我帮您预约 liu 老师的体验课哦！",
  },
];

const FALLBACK_RESPONSES = [
  "这个问题很重要！为了给您最准确的答案，我让专属顾问老师来详细解答一下。方便留一下您的微信号或手机号吗？我们会在10分钟内联系您~",
  "您说的我记下了。我们的课程顾问会给您更详细的介绍，方便告诉我您的联系方式吗？",
  "感谢您的咨询！关于这个问题，我需要请资深顾问为您做专业解答。请稍等，或者留下您的联系方式，我们主动联系您~",
];

function ruleBasedReply(userText: string): string {
  const text = userText.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return item.answer;
    }
  }
  // 随机兜底
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/**
 * 生成 AI 回复（带 LLM 兜底）
 */
export async function generateAIReply(
  userText: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<{ content: string; confidence: number; source: string }> {
  const systemPrompt = `你是"智能规划"的AI课程顾问，名字叫"小艾"，专业、亲切、有耐心。
你的服务对象是 0-18 岁孩子的家长。

【核心课程信息（必须准确，不能编造）】
- 适合年龄：0-18 岁
- 体验课：99 元 / 3 节
- 正式课：2980 元 / 99 节
- 课时安排：每节 60 分钟，每周 3 次
- 授课老师：liu 老师
- 退款政策：课程进度超过 50% 后不退款；未超过 50% 可申请退款

【沟通原则】
1. 语气温和亲切，像朋友聊天，可以适度使用 emoji
2. 回答简洁，控制在 3-5 句话，用短段落和符号让内容易读
3. 主动了解孩子年龄，自然引导预约 99 元体验课
4. 价格、课时、退款政策必须按上面的信息回答，不能编造其他套餐或承诺
5. 涉及优惠、活动、具体上课时段等不确定信息，引导家长留联系方式由顾问确认
6. 不要使用 Markdown 标题语法，用中文回答`;

  // 尝试用 LLM SDK
  try {
    const { LLMClient, Config } = await import("coze-coding-dev-sdk");
    const config = new Config({ timeout: 15000 });
    const client = new LLMClient(config);

    // 构造消息（最多带最近6轮历史）
    const recent = history.slice(-12);
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...recent,
      { role: "user", content: userText },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-mini-260215",
      temperature: 0.6,
    });

    if (response?.content && response.content.trim().length > 0) {
      return {
        content: response.content.trim(),
        confidence: 0.9,
        source: "doubao",
      };
    }
  } catch (err) {
    console.warn("[AI Reply] LLM failed, falling back to rules:", err);
  }

  // 兜底：规则匹配
  const reply = ruleBasedReply(userText);
  return {
    content: reply,
    confidence: 0.65,
    source: "rule-based",
  };
}

/**
 * 从客户消息中提取标签（意向度、预算、孩子年龄等）
 */
export function extractTagsFromMessage(text: string): { tag_type: string; tag_value: string; confidence: number }[] {
  const tags: { tag_type: string; tag_value: string; confidence: number }[] = [];
  const lower = text.toLowerCase();

  // 意向度判断
  if (/(报名|下单|付款|支付|购买|怎么买|多少钱)/.test(text)) {
    tags.push({ tag_type: "intent_level", tag_value: "S", confidence: 0.85 });
  } else if (/(试听|体验课|预约|了解|怎么收费|时间安排)/.test(text)) {
    tags.push({ tag_type: "intent_level", tag_value: "A", confidence: 0.7 });
  } else if (/(你好|在吗|请问|咨询|想了解)/.test(text)) {
    tags.push({ tag_type: "intent_level", tag_value: "B", confidence: 0.5 });
  }

  // 孩子年龄（0-18岁）
  const ageMatch = text.match(/(\d{1,2})\s*岁/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 0 && age <= 18) {
      tags.push({ tag_type: "child_age", tag_value: `${age}岁`, confidence: 0.95 });
    }
  }

  // 预算
  if (/(\d{3,5})\s*元/.test(text)) {
    const m = text.match(/(\d{3,5})\s*元/);
    if (m) {
      const price = parseInt(m[1]);
      if (price <= 200) tags.push({ tag_type: "budget_range", tag_value: "100-500元", confidence: 0.8 });
      else if (price <= 1500) tags.push({ tag_type: "budget_range", tag_value: "500-1500元", confidence: 0.8 });
      else tags.push({ tag_type: "budget_range", tag_value: "1500元以上", confidence: 0.8 });
    }
  }

  //  urgency
  if (/(今天|现在|马上|赶紧|着急)/.test(text)) {
    tags.push({ tag_type: "urgency", tag_value: "高", confidence: 0.85 });
  }

  // 课程偏好
  if (/语言|说话|表达/.test(text)) tags.push({ tag_type: "preferred_course", tag_value: "语言启蒙", confidence: 0.75 });
  if (/思维|数学|逻辑/.test(text)) tags.push({ tag_type: "preferred_course", tag_value: "思维训练", confidence: 0.75 });
  if (/阅读|绘本|看书/.test(text)) tags.push({ tag_type: "preferred_course", tag_value: "阅读培养", confidence: 0.75 });
  if (/入学|幼小衔接|小学/.test(text)) tags.push({ tag_type: "preferred_course", tag_value: "入学准备", confidence: 0.8 });

  // 决策人
  if (/我是妈妈|孩子妈/.test(text)) tags.push({ tag_type: "decision_maker", tag_value: "妈妈", confidence: 0.9 });
  if (/我是爸爸|孩子爸/.test(text)) tags.push({ tag_type: "decision_maker", tag_value: "爸爸", confidence: 0.9 });

  return tags;
}
