// Mock data matching the prototype

export type IntentLevel = 'S' | 'A' | 'B';
export type AIStatus = 'pending' | 'done';

export interface DailySummaryItem {
  date: string;
  summary: string;
  suggestion: string;
}

export interface AISuggestion {
  text: string;
  confidence: number;
  level: 'high' | 'medium';
}

export interface Message {
  type?: 'date';
  text?: string;
  from?: 'customer' | 'sales';
  time?: string;
}

export interface Customer {
  id: number;
  name: string;
  avatar: string;
  color: string;
  level: IntentLevel;
  childAge: string;
  childName: string;
  tags: string[];
  tagClasses: ('s' | 'a' | 'b' | 'info' | 'purple' | 'green')[];
  decisionMaker: string;
  budget: string;
  source: string;
  online: boolean;
  lastActive: string;
  unread: number;
  aiStatus: AIStatus;
  preview: string;
  courseProgress: number; // index of current step (0-4), 4 = all complete
  checkinDays: number;
  totalDays: number;
  streakDays: number;
  messages: Message[];
  aiSuggestions: AISuggestion[];
  dailySummaries: DailySummaryItem[];
}

export const customers: Customer[] = [
  {
    id: 1,
    name: '张雨萱妈妈',
    avatar: '张',
    color: '#0891b2',
    level: 'S',
    childAge: '4岁',
    childName: '小萱萱',
    tags: ['#S级', '#3-6岁', '#专注力', '#高意向'],
    tagClasses: ['s', 'info', 'purple', 'green'],
    decisionMaker: '妈妈（主要决策人）',
    budget: '8,000-15,000元/年',
    source: '抖音直播',
    online: true,
    lastActive: '3分钟前',
    unread: 3,
    aiStatus: 'pending',
    preview: '老师，我想问下专注力课程具体怎么安排的？',
    courseProgress: 2,
    checkinDays: 3,
    totalDays: 4,
    streakDays: 3,
    messages: [
      { type: 'date', text: '今天' },
      { from: 'customer', text: '老师你好，我是通过抖音直播了解到咱们课程的', time: '14:20' },
      { from: 'sales', text: '雨萱妈妈您好！感谢您的关注～请问宝贝现在多大了呢？', time: '14:22' },
      { from: 'customer', text: '我家小萱萱4岁了，上幼儿园中班', time: '14:23' },
      { from: 'sales', text: '4岁正好是专注力培养的黄金期！我们有一套专门针对3-6岁的专注力训练课程，通过游戏化教学帮助孩子提升注意力。', time: '14:25' },
      { from: 'customer', text: '听起来不错，老师能具体介绍一下吗？另外我家孩子特别坐不住，玩玩具也是三分钟热度', time: '14:28' },
      { from: 'sales', text: '理解您的担心！其实4岁孩子注意力集中时间在10-15分钟是正常的。我们的课程正是针对这个特点设计的，每节课15分钟，循序渐进。很多学员家长反馈，坚持2-3周就能看到明显变化。', time: '14:30' },
      { from: 'customer', text: '老师，我想问下专注力课程具体怎么安排的？', time: '14:35' },
    ],
    aiSuggestions: [
      {
        text: '雨萱妈妈，我们专注力课程分为三个阶段：\n\n🎯 第一阶段（Day1-Day7）：趣味感知期\n通过互动游戏和视觉训练，让孩子在快乐中建立专注习惯\n\n🧩 第二阶段（Day8-Day14）：能力建构期\n引入听觉+触觉多感官训练，系统性提升注意力时长\n\n🌟 第三阶段（Day15-Day21）：巩固提升期\n结合生活场景练习，让专注力迁移到日常学习中\n\n现在报名可以享受首阶段体验价99元，要不要先给小萱萱预约一个体验名额？',
        confidence: 92,
        level: 'high',
      },
      {
        text: '萱萱妈妈，4岁正是培养专注力的最佳窗口期！我先给您发一份我们的课程大纲和学员案例，您看看是否适合小萱萱？\n\n另外我们有一个3天的免费体验营，很多家长反馈孩子参与后变化很大，我帮您预约明天的名额好吗？',
        confidence: 86,
        level: 'high',
      },
    ],
    dailySummaries: [
      {
        date: '今天',
        summary:
          '客户通过抖音直播了解课程，主动询问专注力课程详情。孩子4岁中班，注意力集中时间短是主要痛点。决策人为妈妈，预算充足，意向度很高。',
        suggestion:
          '重点推送课程大纲+学员案例，趁热邀约3天体验营，利用"黄金窗口期"话术强化紧迫感。',
      },
      {
        date: '昨天',
        summary: '客户首次接触，填写了抖音直播间留资表单，关注专注力方向。',
        suggestion: '已建立初步信任，今日重点转化为体验营学员。',
      },
    ],
  },
  {
    id: 2,
    name: '李明轩爸爸',
    avatar: '李',
    color: '#8b5cf6',
    level: 'A',
    childAge: '7岁',
    childName: '轩轩',
    tags: ['#A级', '#幼小衔接', '#逻辑思维', '#价格敏感'],
    tagClasses: ['a', 'info', 'purple', 'info'],
    decisionMaker: '爸爸+妈妈（共同决策）',
    budget: '3,000-8,000元/年',
    source: '微信公众号',
    online: true,
    lastActive: '15分钟前',
    unread: 1,
    aiStatus: 'done',
    preview: '好的，我再考虑一下',
    courseProgress: 3,
    checkinDays: 5,
    totalDays: 7,
    streakDays: 2,
    messages: [
      { type: 'date', text: '今天' },
      { from: 'customer', text: '老师你好，我看了你发的课程介绍，幼小衔接的逻辑思维课看着挺好的', time: '10:15' },
      { from: 'sales', text: '明轩爸爸好！是的，逻辑思维课是我们最受欢迎的课程之一，特别适合即将上小学的孩子～轩轩今年几岁了？', time: '10:18' },
      { from: 'customer', text: '7岁了，今年9月上小学', time: '10:19' },
      { from: 'sales', text: '那时间刚刚好！很多家长都在这个阶段给孩子报名，帮助孩子顺利过渡。我们的逻辑思维课涵盖数感培养、图形推理、规律发现等核心能力。', time: '10:22' },
      { from: 'customer', text: '价格怎么样？', time: '10:30' },
      { from: 'sales', text: '全年课程原价6980元，现在春季活动价4980元，包含24节系统课+每日练习+老师1对1点评。平均下来一节课不到210元，性价比很高～', time: '10:32' },
      { from: 'customer', text: '好的，我再考虑一下', time: '10:45' },
    ],
    aiSuggestions: [
      {
        text: '明轩爸爸理解您的考虑！其实9月就要上小学了，现在开始准备时间是刚刚好的。\n\n跟您分享一个数据：我们的学员中，85%的孩子在课程结束后，数学思维测试成绩提升了30%以上。\n\n另外我这边有一个限时福利：本周报名可以额外赠送价值399元的《幼小衔接家长指导手册》，帮助您在家也能配合训练。这个名额只剩3个了，要不要先锁定一个？',
        confidence: 88,
        level: 'high',
      },
    ],
    dailySummaries: [
      {
        date: '今天',
        summary:
          '客户主动询问逻辑思维课详情，对课程内容感兴趣，但对价格表现出犹豫。决策为父母共同决策，需要给爸爸足够的"说服素材"去和妈妈商量。',
        suggestion:
          '提供学员效果数据+限时优惠制造紧迫感，同时发一份课程试听链接降低决策门槛。建议今晚8点左右跟进（爸爸下班后）。',
      },
      {
        date: '昨天',
        summary: '通过公众号文章留资，关注幼小衔接方向。',
        suggestion: '初次接触，重点建立专业形象。',
      },
      {
        date: '前天',
        summary: '参加了逻辑思维公开课体验，反馈积极。',
        suggestion: '趁热度进行一对一深度沟通。',
      },
    ],
  },
  {
    id: 3,
    name: '王诗涵妈妈',
    avatar: '王',
    color: '#f97316',
    level: 'S',
    childAge: '5岁',
    childName: '诗诗',
    tags: ['#S级', '#3-6岁', '#英语启蒙', '#已购课'],
    tagClasses: ['s', 'info', 'purple', 'green'],
    decisionMaker: '妈妈',
    budget: '15,000-25,000元/年',
    source: '老学员推荐',
    online: false,
    lastActive: '1小时前',
    unread: 0,
    aiStatus: 'done',
    preview: '好的，那我再看看英语进阶课',
    courseProgress: 4,
    checkinDays: 12,
    totalDays: 14,
    streakDays: 7,
    messages: [
      { type: 'date', text: '今天' },
      { from: 'sales', text: '诗涵妈妈好！诗诗最近的英语启蒙课打卡非常棒，已经连续7天了！🎉', time: '09:00' },
      { from: 'customer', text: '谢谢老师！诗诗现在每天主动要学英语，变化确实很大', time: '09:15' },
      { from: 'sales', text: '太好了！这说明诗诗的语言敏感期抓得非常好。5岁是英语启蒙的黄金阶段，现在打好基础，以后学起来会轻松很多～', time: '09:18' },
      { from: 'customer', text: '对了老师，我听说你们有个英语进阶课程，适合学完启蒙之后的孩子吗？', time: '09:25' },
      { from: 'sales', text: '有的！我们的英语进阶课程正好适合完成启蒙阶段的孩子，内容涵盖自然拼读、绘本阅读和口语表达，帮助孩子在启蒙基础上进一步拓展。诗诗目前的表现完全可以进入了！', time: '09:28' },
      { from: 'customer', text: '好的，那我再看看英语进阶课', time: '09:35' },
    ],
    aiSuggestions: [
      {
        text: '诗涵妈妈，给您发一下英语进阶课的详细安排：\n\n📚 课程结构：36节系统课 + 每日绘本打卡\n🎯 核心内容：自然拼读 → 分级绘本阅读 → 情景口语\n👩‍🏫 教学特色：外教录播+中教直播双师模式\n💰 老学员专属价：5980元（原价7980元）\n\n诗诗启蒙阶段表现这么好，进阶课对她来说正好衔接！而且作为老学员，我还额外帮您申请了价值299元的英文绘本礼包～',
        confidence: 94,
        level: 'high',
      },
    ],
    dailySummaries: [
      {
        date: '今天',
        summary:
          '已购课老学员，打卡情况优秀（连续7天）。主动询问英语进阶课程，有明确的二次购买意向。属于高价值客户。',
        suggestion:
          '快速推送进阶课详情+老学员专属优惠，利用家长对课程的认可度促成续费/升级。',
      },
      {
        date: '近7天',
        summary:
          '持续保持良好打卡习惯，家长满意度高，曾主动推荐2位新用户。',
        suggestion: '维护良好关系，适时推动进阶课升级。',
      },
    ],
  },
  {
    id: 4,
    name: '陈浩宇爸爸',
    avatar: '陈',
    color: '#22c55e',
    level: 'B',
    childAge: '6岁',
    childName: '浩浩',
    tags: ['#B级', '#幼小衔接', '#感统训练', '#观望中'],
    tagClasses: ['b', 'info', 'purple', 'info'],
    decisionMaker: '妈妈（爸爸配合）',
    budget: '5,000元以下/年',
    source: '小红书',
    online: false,
    lastActive: '昨天',
    unread: 0,
    aiStatus: 'pending',
    preview: '嗯嗯，了解了解',
    courseProgress: 0,
    checkinDays: 0,
    totalDays: 3,
    streakDays: 0,
    messages: [
      { type: 'date', text: '昨天' },
      { from: 'sales', text: '浩宇爸爸好！看到您在小红书关注了我们的感统训练内容，请问浩浩有什么具体表现让您关注这方面的呢？', time: '16:00' },
      { from: 'customer', text: '嗯，就是感觉孩子有时候走路会摔跤，平衡感不太好', time: '16:20' },
      { from: 'sales', text: '了解了！6岁是感统发展的关键期，平衡感不足确实会影响孩子的运动协调和注意力。我们有专门的感统训练课程，在家就能做，每天15分钟就能看到改善。', time: '16:25' },
      { from: 'customer', text: '嗯嗯，了解了解', time: '16:40' },
    ],
    aiSuggestions: [
      {
        text: '浩宇爸爸，我发一篇我们整理的《6岁感统发展评估清单》给您，您可以先对照看看浩浩的情况。\n\n很多家长和您的感受一样，孩子走路摔跤、系扣子困难这些其实都是感统失调的表现。如果不及时干预，上小学后可能会影响书写和体育成绩。\n\n我们有一个免费的3天感统体验营，在家就能带孩子做，您要不要试试？',
        confidence: 78,
        level: 'medium',
      },
    ],
    dailySummaries: [
      {
        date: '昨天',
        summary:
          '小红书留资用户，首次沟通。关注感统训练，但回复简短，意向度一般。主要决策人是妈妈，爸爸初步了解中。',
        suggestion:
          '发送感统评估清单作为价值输出，邀约免费体验营。如爸爸犹豫，询问是否可以拉妈妈进群了解。',
      },
    ],
  },
];
