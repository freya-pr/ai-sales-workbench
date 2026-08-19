/**
 * AI 自动回复服务
 * - 优先调用大语言模型生成自然回复
 * - SDK 不可用或调用失败时，回退到基于关键词的规则回复
 * - 永远保证客户消息后有回复
 */

// 教育课程相关的知识库（兜底回复用）
const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["价格", "多少钱", "费用", "收费", "价位", "贵"],
    answer:
      "我们的课程根据孩子年龄和学习目标分了几个套餐：\n\n1. 【启蒙体验课】4节，99元，适合初次体验\n2. 【月度成长班】16节，1280元，含1对1学情规划\n3. 【季度系统课】48节，3280元，赠送配套教具礼盒\n\n每个套餐都支持7天无理由退款。方便告诉我孩子的年龄吗？我帮您推荐最合适的方案~",
  },
  {
    keywords: ["几岁", "年龄", "多大", "3岁", "4岁", "5岁", "6岁"],
    answer:
      "我们的课程专为3-6岁学龄前儿童设计，按年龄分了三个阶段：\n\n🌸 3-4岁：语言启蒙+专注力训练\n🌱 4-5岁：思维启蒙+阅读习惯\n🎓 5-6岁：入学准备+学习力培养\n\n您家孩子今年几岁啦？我可以发对应年龄段的课程大纲给您看看~",
  },
  {
    keywords: ["试听", "体验课", "免费", "试试"],
    answer:
      "可以的！我们提供【99元4节启蒙体验课】，包含：\n\n✅ 1对1学情测评（15分钟）\n✅ 2节AI互动课\n✅ 1节名师直播课\n✅ 专属成长规划报告\n\n体验课结束后如果不满意，全额退款，没有任何风险。需要我现在帮您预约吗？",
  },
  {
    keywords: ["上课", "时间", "安排", "几点", "时长", "多久"],
    answer:
      "课程时间非常灵活：\n\n⏰ 周一到周日 9:00-21:00 均可预约\n⏰ 每节课15-25分钟（符合学龄前儿童注意力特点）\n⏰ 每周建议3-4次，可根据孩子状态调整\n⏰ 支持随时调课、请假\n\n您一般工作日晚上还是周末比较方便？我帮您预留一个黄金时段~",
  },
  {
    keywords: ["老师", "师资", "谁教", "教学"],
    answer:
      "我们的老师团队：\n\n👩‍🏫 主讲老师：100% 学前教育专业本科以上，平均教龄8年+\n🎓 教研团队：北师大、华东师大教育学专家领衔\n🤖 AI辅导老师：实时陪伴、即时纠音、个性化练习\n\n每位主讲老师都经过严格筛选（通过率<5%），并持有教师资格证。需要我发一份老师介绍吗？",
  },
  {
    keywords: ["效果", "有用吗", "靠谱", "怎么样"],
    answer:
      "我们已服务超过12万个家庭，根据第三方测评数据：\n\n📈 93% 的孩子在4周内语言表达明显提升\n📈 87% 的家长反馈孩子专注力改善\n📈 续费率达78%\n\n课程设计参考了皮亚杰认知发展理论和多元智能理论，每节课都有明确的能力目标。我可以发几个真实学员案例给您参考~",
  },
  {
    keywords: ["报名", "怎么买", "购买", "下单", "付款", "支付"],
    answer:
      "报名很简单，3步搞定：\n\n1️⃣ 告诉我孩子年龄和您方便的时间段\n2️⃣ 我为您推荐最合适的套餐并安排学情测评\n3️⃣ 微信/支付宝扫码支付，立即开通课程\n\n现在报名本月活动还赠送价值199元的教具礼盒，需要我帮您预留名额吗？",
  },
  {
    keywords: ["退款", "退费", "不满意", "不靠谱"],
    answer:
      "请您放心，我们有完善的保障：\n\n🛡️ 7天无理由全额退款（未上完3节课）\n🛡️ 课程质量问题随时退款\n🛡️ 退款3个工作日内到账，不扣任何手续费\n\n教育是个长期的事，我们更希望您和孩子真心喜欢课程，而不是勉强报名~",
  },
  {
    keywords: ["你好", "您好", "在吗", "hi", "hello", "在么"],
    answer:
      "您好呀~我是课程顾问小艾，很高兴为您服务！😊\n\n我可以帮您：\n• 了解3-6岁学龄前课程\n• 预约免费学情测评\n• 查询课程价格和时间\n• 解答任何教育疑问\n\n请问有什么可以帮您的？",
  },
  {
    keywords: ["谢谢", "感谢", "好的", "ok", "嗯"],
    answer: "不客气~ 如果还有其他问题随时问我。您也可以直接留下手机号，我让专属顾问老师给您做1对1的学情规划哦！",
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
你的服务对象是3-6岁学龄前儿童的家长。

【核心信息】
- 课程：3-6岁学龄前家庭教育课程（语言启蒙/思维训练/阅读习惯/入学准备）
- 价格：99元4节体验课；月度1280元/16节；季度3280元/48节
- 上课时间：9:00-21:00 灵活预约，每节15-25分钟
- 师资：学前教育专业本科以上，平均教龄8年，教师资格证
- 保障：7天无理由退款

【沟通原则】
1. 语气温和亲切，像朋友一样聊天，可以用合适的emoji
2. 回答简洁，控制在3-5句话，使用短段落和符号
3. 主动了解孩子年龄和家长需求，自然引导预约体验课
4. 不夸大承诺，不强行推销，尊重家长选择
5. 涉及具体价格/时间要准确，不确定的就说请顾问确认
6. 用中文回答，不要使用Markdown标题语法`;

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

  // 孩子年龄
  const ageMatch = text.match(/(\d)\s*岁/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 3 && age <= 6) {
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
