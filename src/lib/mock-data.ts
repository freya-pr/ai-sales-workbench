// Mock data for AI Sales Workbench

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  source: string;
  intentLevel: 'S' | 'A' | 'B';
  budgetRange: string;
  preferredCourse: string;
  childAge: number;
  decisionRole: string;
  aiReception: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  tags: Tag[];
  courseProgress: CourseProgress[];
}

export interface Tag {
  label: string;
  value: string;
  confidence: number;
  editable: boolean;
}

export interface CourseProgress {
  day: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  date: string;
}

export interface Message {
  id: string;
  customerId: string;
  sender: 'customer' | 'sales' | 'ai';
  content: string;
  type: 'text' | 'image';
  timestamp: string;
  imageUrl?: string;
}

export interface AISuggestion {
  id: string;
  content: string;
  confidence: number;
  source: string;
}

export interface DailySummary {
  date: string;
  summary: string;
  intentChanges: string[];
  actionItems: string[];
  tomorrowPriority: string[];
}

export interface Conversation {
  customerId: string;
  messages: Message[];
}

export const customers: Customer[] = [
  {
    id: 'c1',
    name: '张女士',
    phone: '138****5678',
    avatar: 'Z',
    source: '抖音广告',
    intentLevel: 'S',
    budgetRange: '8000-15000',
    preferredCourse: '家庭教育规划高级班',
    childAge: 8,
    decisionRole: '母亲（主要决策人）',
    aiReception: true,
    unreadCount: 3,
    lastMessage: '请问高级班的课程安排是怎样的？我周末有时间',
    lastMessageTime: '2分钟前',
    tags: [
      { label: '意向度', value: 'S级-高意向', confidence: 92, editable: true },
      { label: '预算区间', value: '8000-15000元', confidence: 85, editable: true },
      { label: '偏好课程', value: '家庭教育规划高级班', confidence: 88, editable: true },
      { label: '孩子年龄', value: '8岁', confidence: 95, editable: true },
      { label: '决策人角色', value: '母亲（主要决策人）', confidence: 90, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '初次咨询', status: 'completed', date: '2025-08-15' },
      { day: 'Day1', title: '课程介绍发送', status: 'completed', date: '2025-08-16' },
      { day: 'Day2', title: '深度需求沟通', status: 'in-progress', date: '2025-08-17' },
      { day: 'Day3', title: '试听课邀约', status: 'upcoming', date: '2025-08-18' },
    ],
  },
  {
    id: 'c2',
    name: '李先生',
    phone: '139****1234',
    avatar: 'L',
    source: '微信社群',
    intentLevel: 'A',
    budgetRange: '5000-8000',
    preferredCourse: '亲子关系改善课',
    childAge: 12,
    decisionRole: '父亲',
    aiReception: false,
    unreadCount: 1,
    lastMessage: '我考虑一下，能给我发一份课程大纲吗？',
    lastMessageTime: '15分钟前',
    tags: [
      { label: '意向度', value: 'A级-中意向', confidence: 78, editable: true },
      { label: '预算区间', value: '5000-8000元', confidence: 72, editable: true },
      { label: '偏好课程', value: '亲子关系改善课', confidence: 80, editable: true },
      { label: '孩子年龄', value: '12岁', confidence: 93, editable: true },
      { label: '决策人角色', value: '父亲', confidence: 85, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '社群引流', status: 'completed', date: '2025-08-14' },
      { day: 'Day1', title: '需求初探', status: 'completed', date: '2025-08-15' },
      { day: 'Day2', title: '方案推荐', status: 'completed', date: '2025-08-16' },
      { day: 'Day3', title: '异议处理', status: 'in-progress', date: '2025-08-17' },
    ],
  },
  {
    id: 'c3',
    name: '王女士',
    phone: '136****9876',
    avatar: 'W',
    source: '小红书笔记',
    intentLevel: 'S',
    budgetRange: '15000+',
    preferredCourse: '全栈家庭教育方案',
    childAge: 6,
    decisionRole: '母亲（主要决策人）',
    aiReception: true,
    unreadCount: 5,
    lastMessage: '我想直接报名全栈方案，怎么操作？',
    lastMessageTime: '刚刚',
    tags: [
      { label: '意向度', value: 'S级-高意向', confidence: 96, editable: true },
      { label: '预算区间', value: '15000+元', confidence: 88, editable: true },
      { label: '偏好课程', value: '全栈家庭教育方案', confidence: 94, editable: true },
      { label: '孩子年龄', value: '6岁', confidence: 91, editable: true },
      { label: '决策人角色', value: '母亲（主要决策人）', confidence: 87, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '小红书咨询', status: 'completed', date: '2025-08-13' },
      { day: 'Day1', title: '方案讲解', status: 'completed', date: '2025-08-14' },
      { day: 'Day2', title: '试听体验', status: 'completed', date: '2025-08-16' },
      { day: 'Day3', title: '签约成交', status: 'in-progress', date: '2025-08-17' },
    ],
  },
  {
    id: 'c4',
    name: '陈先生',
    phone: '137****4321',
    avatar: 'C',
    source: '官网咨询',
    intentLevel: 'B',
    budgetRange: '3000-5000',
    preferredCourse: '亲子沟通基础课',
    childAge: 10,
    decisionRole: '父亲（需与妻子商议）',
    aiReception: true,
    unreadCount: 0,
    lastMessage: '好的，我回去和爱人商量一下',
    lastMessageTime: '1小时前',
    tags: [
      { label: '意向度', value: 'B级-低意向', confidence: 65, editable: true },
      { label: '预算区间', value: '3000-5000元', confidence: 60, editable: true },
      { label: '偏好课程', value: '亲子沟通基础课', confidence: 70, editable: true },
      { label: '孩子年龄', value: '10岁', confidence: 88, editable: true },
      { label: '决策人角色', value: '父亲（需与妻子商议）', confidence: 75, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '官网留言', status: 'completed', date: '2025-08-12' },
      { day: 'Day1', title: '电话回访', status: 'completed', date: '2025-08-13' },
      { day: 'Day2', title: '需求了解', status: 'completed', date: '2025-08-15' },
      { day: 'Day3', title: '方案推荐', status: 'upcoming', date: '2025-08-18' },
    ],
  },
  {
    id: 'c5',
    name: '赵女士',
    phone: '135****7890',
    avatar: 'Z',
    source: '朋友推荐',
    intentLevel: 'A',
    budgetRange: '5000-8000',
    preferredCourse: '学习习惯养成课',
    childAge: 9,
    decisionRole: '母亲',
    aiReception: false,
    unreadCount: 2,
    lastMessage: '孩子写作业总是拖拉，这个课程能解决吗？',
    lastMessageTime: '30分钟前',
    tags: [
      { label: '意向度', value: 'A级-中意向', confidence: 75, editable: true },
      { label: '预算区间', value: '5000-8000元', confidence: 68, editable: true },
      { label: '偏好课程', value: '学习习惯养成课', confidence: 82, editable: true },
      { label: '孩子年龄', value: '9岁', confidence: 94, editable: true },
      { label: '决策人角色', value: '母亲', confidence: 89, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '朋友推荐', status: 'completed', date: '2025-08-14' },
      { day: 'Day1', title: '需求沟通', status: 'completed', date: '2025-08-15' },
      { day: 'Day2', title: '课程匹配', status: 'in-progress', date: '2025-08-17' },
      { day: 'Day3', title: '试听安排', status: 'upcoming', date: '2025-08-19' },
    ],
  },
  {
    id: 'c6',
    name: '刘先生',
    phone: '133****2468',
    avatar: 'L',
    source: '百度推广',
    intentLevel: 'A',
    budgetRange: '8000-12000',
    preferredCourse: '升学规划指导课',
    childAge: 14,
    decisionRole: '父亲（主要决策人）',
    aiReception: true,
    unreadCount: 0,
    lastMessage: '课程对中考有帮助吗？能具体说说吗',
    lastMessageTime: '45分钟前',
    tags: [
      { label: '意向度', value: 'A级-中意向', confidence: 73, editable: true },
      { label: '预算区间', value: '8000-12000元', confidence: 70, editable: true },
      { label: '偏好课程', value: '升学规划指导课', confidence: 86, editable: true },
      { label: '孩子年龄', value: '14岁', confidence: 92, editable: true },
      { label: '决策人角色', value: '父亲（主要决策人）', confidence: 82, editable: true },
    ],
    courseProgress: [
      { day: 'Day0', title: '百度咨询', status: 'completed', date: '2025-08-13' },
      { day: 'Day1', title: '需求分析', status: 'completed', date: '2025-08-14' },
      { day: 'Day2', title: '课程详解', status: 'completed', date: '2025-08-16' },
      { day: 'Day3', title: '案例分享', status: 'in-progress', date: '2025-08-17' },
    ],
  },
];

export const conversations: Record<string, Message[]> = {
  c1: [
    { id: 'm1', customerId: 'c1', sender: 'customer', content: '你好，我看到你们的广告，想了解下家庭教育课程', type: 'text', timestamp: '10:30' },
    { id: 'm2', customerId: 'c1', sender: 'ai', content: '您好张女士！感谢关注我们的家庭教育课程。我们有针对不同年龄段孩子的课程方案，请问您的孩子多大了呢？', type: 'text', timestamp: '10:31' },
    { id: 'm3', customerId: 'c1', sender: 'customer', content: '孩子8岁了，上小学二年级', type: 'text', timestamp: '10:33' },
    { id: 'm4', customerId: 'c1', sender: 'ai', content: '8岁正是培养学习习惯和亲子关系的关键期！根据您的需求，我推荐我们的「家庭教育规划高级班」，这个课程包含：\n1. 亲子沟通技巧\n2. 学习习惯培养方法\n3. 情绪管理指导\n4. 家庭氛围营造\n\n您想了解哪方面更多呢？', type: 'text', timestamp: '10:34' },
    { id: 'm5', customerId: 'c1', sender: 'customer', content: '听起来不错，价格大概是多少？', type: 'text', timestamp: '10:40' },
    { id: 'm6', customerId: 'c1', sender: 'sales', content: '张女士您好，我是您的专属顾问小杨。高级班原价12800元，本周有优惠活动，报名可享8折，实际9800元，还赠送3次一对一咨询。', type: 'text', timestamp: '10:42' },
    { id: 'm7', customerId: 'c1', sender: 'customer', content: '请问高级班的课程安排是怎样的？我周末有时间', type: 'text', timestamp: '10:45' },
  ],
  c2: [
    { id: 'm1', customerId: 'c2', sender: 'customer', content: '你好，我在群里看到你们的课程分享', type: 'text', timestamp: '09:15' },
    { id: 'm2', customerId: 'c2', sender: 'sales', content: '李先生您好！很高兴您对我们的课程感兴趣。请问您家孩子多大了？目前在教育方面有什么困惑吗？', type: 'text', timestamp: '09:20' },
    { id: 'm3', customerId: 'c2', sender: 'customer', content: '孩子12岁，上初一，最近叛逆期，沟通很困难', type: 'text', timestamp: '09:25' },
    { id: 'm4', customerId: 'c2', sender: 'sales', content: '非常理解您的困扰，青春期孩子的沟通确实是很多家长面临的挑战。我们的「亲子关系改善课」专门针对这类问题设计，包含青春期心理分析、有效沟通技巧、冲突化解方法等。', type: 'text', timestamp: '09:28' },
    { id: 'm5', customerId: 'c2', sender: 'customer', content: '我考虑一下，能给我发一份课程大纲吗？', type: 'text', timestamp: '09:35' },
  ],
  c3: [
    { id: 'm1', customerId: 'c3', sender: 'customer', content: '你好，我在小红书上看到你们的笔记，很感兴趣', type: 'text', timestamp: '08:00' },
    { id: 'm2', customerId: 'c3', sender: 'ai', content: '王女士您好！感谢您的关注。我们的全栈家庭教育方案已经帮助超过500个家庭改善了教育方式。请问您的孩子多大了？', type: 'text', timestamp: '08:02' },
    { id: 'm3', customerId: 'c3', sender: 'customer', content: '孩子6岁，刚上小学，我想系统地学习家庭教育', type: 'text', timestamp: '08:05' },
    { id: 'm4', customerId: 'c3', sender: 'ai', content: '6岁是家庭教育的黄金起点！全栈方案非常适合您，它涵盖0-18岁全阶段教育规划。我先为您安排一次免费的教育诊断，您看方便吗？', type: 'text', timestamp: '08:06' },
    { id: 'm5', customerId: 'c3', sender: 'customer', content: '好的，什么时候可以安排？', type: 'text', timestamp: '08:10' },
    { id: 'm6', customerId: 'c3', sender: 'sales', content: '王女士您好！我可以为您安排明天下午2点或后天上午10点的免费教育诊断，您哪个时间方便？', type: 'text', timestamp: '08:15' },
    { id: 'm7', customerId: 'c3', sender: 'customer', content: '明天下午2点可以', type: 'text', timestamp: '08:20' },
    { id: 'm8', customerId: 'c3', sender: 'customer', content: '我想直接报名全栈方案，怎么操作？', type: 'text', timestamp: '11:30' },
  ],
  c4: [
    { id: 'm1', customerId: 'c4', sender: 'customer', content: '你好，在官网上看到你们的课程', type: 'text', timestamp: '昨天 14:00' },
    { id: 'm2', customerId: 'c4', sender: 'ai', content: '陈先生您好！欢迎来到智学教育。请问有什么可以帮您的？', type: 'text', timestamp: '昨天 14:01' },
    { id: 'm3', customerId: 'c4', sender: 'customer', content: '孩子10岁了，想提升下亲子沟通能力', type: 'text', timestamp: '昨天 14:05' },
    { id: 'm4', customerId: 'c4', sender: 'sales', content: '陈先生您好！推荐您我们的「亲子沟通基础课」，专门针对6-12岁孩子家长设计，课程费用3800元，共8节课。', type: 'text', timestamp: '昨天 14:10' },
    { id: 'm5', customerId: 'c4', sender: 'customer', content: '好的，我回去和爱人商量一下', type: 'text', timestamp: '昨天 14:15' },
  ],
  c5: [
    { id: 'm1', customerId: 'c5', sender: 'customer', content: '你好，我朋友推荐我来的', type: 'text', timestamp: '10:00' },
    { id: 'm2', customerId: 'c5', sender: 'sales', content: '赵女士您好！请问是哪位朋友推荐的呢？我来帮您了解课程。', type: 'text', timestamp: '10:05' },
    { id: 'm3', customerId: 'c5', sender: 'customer', content: '我同事小刘推荐的，她说效果不错', type: 'text', timestamp: '10:08' },
    { id: 'm4', customerId: 'c5', sender: 'sales', content: '感谢您的信任！请问您家孩子多大了？目前在哪些方面需要帮助？', type: 'text', timestamp: '10:10' },
    { id: 'm5', customerId: 'c5', sender: 'customer', content: '孩子9岁了，写作业总是拖拉', type: 'text', timestamp: '10:15' },
    { id: 'm6', customerId: 'c5', sender: 'customer', content: '孩子写作业总是拖拉，这个课程能解决吗？', type: 'text', timestamp: '10:30' },
  ],
  c6: [
    { id: 'm1', customerId: 'c6', sender: 'customer', content: '你好，想了解升学规划的课程', type: 'text', timestamp: '09:00' },
    { id: 'm2', customerId: 'c6', sender: 'ai', content: '刘先生您好！我们的升学规划指导课覆盖了小升初、中考、高考全阶段。请问您的孩子目前几年级？', type: 'text', timestamp: '09:02' },
    { id: 'm3', customerId: 'c6', sender: 'customer', content: '初二了，明年中考', type: 'text', timestamp: '09:05' },
    { id: 'm4', customerId: 'c6', sender: 'sales', content: '刘先生您好！初二正是中考备战的关键期。我们的课程包含学业规划、志愿填报指导、心理调适等内容，已帮助200+学生成功进入理想高中。', type: 'text', timestamp: '09:10' },
    { id: 'm5', customerId: 'c6', sender: 'customer', content: '课程对中考有帮助吗？能具体说说吗', type: 'text', timestamp: '09:20' },
  ],
};

export const aiSuggestions: Record<string, AISuggestion[]> = {
  c1: [
    { id: 's1', content: '张女士，高级班每周六上午9:00-12:00上课，共12周。课程采用小班制（6-8人），确保每位家长都能得到充分指导。您周末时间方便的话，这周六就有一期新班开课，我可以帮您预留名额。', confidence: 94, source: '课程知识库 + 历史对话' },
    { id: 's2', content: '高级班课程安排灵活，工作日晚间和周末都有班次。根据您的情况，推荐周六班。每期12节课，每节3小时，包含理论讲解+案例分析+实操练习。现在报名还赠送学习资料包。', confidence: 87, source: '课程大纲文档' },
  ],
  c2: [
    { id: 's1', content: '李先生，课程大纲已为您准备好。亲子关系改善课共8个模块，包括：青春期心理特点、有效倾听技巧、非暴力沟通、情绪管理、界限设定等。我发到您微信，您方便时查看。', confidence: 91, source: '课程资料库' },
  ],
  c3: [
    { id: 's1', content: '王女士，太感谢您的信任了！报名流程很简单：1. 确认课程方案 2. 签署培训协议 3. 完成缴费。我这边可以为您生成专属报名链接，支持微信/支付宝付款。全栈方案原价19800元，本月活动价16800元。', confidence: 96, source: '销售流程SOP + 优惠政策' },
    { id: 's2', content: '好的王女士！我为您准备了一份详细的课程方案书和报名须知，您过目后我们即可办理入学手续。另外，全栈方案学员还可加入VIP家长社群，享受终身学习权益。', confidence: 89, source: '成交话术库' },
  ],
  c5: [
    { id: 's1', content: '赵女士，学习习惯养成课专门针对这类问题！课程中有专门的「时间管理」和「自主学习力」模块，通过21天习惯养成法，帮助孩子建立高效的学习节奏。已有87%的学员反馈孩子作业效率明显提升。', confidence: 88, source: '课程效果数据 + 家长反馈' },
  ],
  c6: [
    { id: 's1', content: '刘先生，课程对中考的帮助非常直接。具体包括：1. 学业诊断与目标校定位 2. 各科学习策略优化 3. 考前心理调适 4. 志愿填报技巧。我们上学期的学员中，92%成功进入第一志愿学校。', confidence: 90, source: '学员成绩数据 + 课程大纲' },
  ],
};

export const dailySummaries: DailySummary[] = [
  {
    date: '2025-08-17',
    summary: '今日共处理23条客户会话，其中AI自动回复15条，人工介入8条。新增客户线索4条，S级意向客户2条。王女士（全栈方案）进入签约阶段，预计本周成交。',
    intentChanges: [
      '张女士：B级 → S级（主动询问课程安排，意向显著提升）',
      '王女士：A级 → S级（明确表示要报名全栈方案）',
      '赵女士：B级 → A级（朋友推荐背书，信任度提升）',
    ],
    actionItems: [
      '跟进张女士：发送课程时间表，确认周六班名额',
      '跟进李先生：发送课程大纲，48h内回访',
      '协助王女士完成签约流程',
      '回访赵女士：解答作业拖拉问题，推荐试听课',
    ],
    tomorrowPriority: [
      '优先跟进王女士签约（S级，预计成交）',
      '张女士课程安排确认（S级，高意向）',
      '赵女士需求深度挖掘（A级，朋友推荐）',
      '刘先生中考方案详解（A级，时间紧迫）',
    ],
  },
  {
    date: '2025-08-16',
    summary: '今日处理19条客户会话，AI自动回复12条。重点推进了3位A级客户的课程匹配工作，完成2次试听安排。整体转化率较昨日提升15%。',
    intentChanges: [
      '刘先生：B级 → A级（对升学规划表现出强烈兴趣）',
      '李先生：B级 → A级（主动询问课程大纲）',
    ],
    actionItems: [
      '发送课程资料给李先生',
      '安排赵女士试听课',
      '准备王女士的签约材料',
    ],
    tomorrowPriority: [
      '跟进已试听客户的反馈',
      '推进A级客户的课程匹配',
      '处理新进入的客户线索',
    ],
  },
];

// AI Insights data
export const topFAQs = [
  { rank: 1, question: '课程价格是多少？有优惠吗？', count: 45, trend: 'up' as const },
  { rank: 2, question: '课程适合多大年龄的孩子？', count: 38, trend: 'up' as const },
  { rank: 3, question: '上课时间怎么安排？', count: 32, trend: 'stable' as const },
  { rank: 4, question: '课程效果怎么样？有案例吗？', count: 28, trend: 'up' as const },
  { rank: 5, question: '可以退费吗？退费政策是什么？', count: 22, trend: 'down' as const },
  { rank: 6, question: '课程是线上还是线下？', count: 20, trend: 'stable' as const },
  { rank: 7, question: '老师资质怎么样？', count: 18, trend: 'up' as const },
  { rank: 8, question: '有没有试听课？', count: 16, trend: 'stable' as const },
  { rank: 9, question: '一个班多少人？', count: 14, trend: 'down' as const },
  { rank: 10, question: '报名后多久开始上课？', count: 12, trend: 'stable' as const },
];

export const intentDistribution = [
  { level: 'S级', count: 12, percentage: 20, color: '#ef4444' },
  { level: 'A级', count: 28, percentage: 47, color: '#f59e0b' },
  { level: 'B级', count: 20, percentage: 33, color: '#22c55e' },
];

// Sales dashboard data
export const funnelData = [
  { stage: '线索获取', count: 156, percentage: 100 },
  { stage: '首次沟通', count: 98, percentage: 63 },
  { stage: '需求确认', count: 67, percentage: 43 },
  { stage: '方案推荐', count: 45, percentage: 29 },
  { stage: '试听体验', count: 28, percentage: 18 },
  { stage: '签约成交', count: 15, percentage: 10 },
];

export const teamStats = [
  { name: '杨明', deals: 8, amount: 126400, conversionRate: 18, rank: 1 },
  { name: '李华', deals: 6, amount: 98800, conversionRate: 15, rank: 2 },
  { name: '张丽', deals: 5, amount: 79000, conversionRate: 12, rank: 3 },
  { name: '王强', deals: 4, amount: 63200, conversionRate: 10, rank: 4 },
];

// Script library for AI Co-pilot
export const scriptLibrary = [
  {
    category: '开场白',
    scripts: [
      { title: '新客户首次咨询', content: '您好！感谢关注智学教育。我是您的专属教育顾问{销售名}。请问您家孩子多大了？目前在教育方面有什么困惑吗？' },
      { title: '朋友推荐客户', content: '您好！感谢您的信任。请问是哪位朋友推荐的呢？我来帮您了解最适合的课程方案。' },
    ],
  },
  {
    category: '需求挖掘',
    scripts: [
      { title: '了解孩子情况', content: '方便告诉我孩子目前的学习情况吗？比如成绩、学习习惯、兴趣爱好等，这样我能更好地为您推荐合适的课程。' },
      { title: '了解家长期望', content: '您希望通过学习课程达到什么样的效果呢？比如改善亲子关系、提升孩子学习习惯、或者规划升学方向？' },
    ],
  },
  {
    category: '异议处理',
    scripts: [
      { title: '价格异议', content: '理解您的顾虑。我们的课程是按照课时和专业度来定价的，平均到每节课其实非常划算。而且现在有限时优惠，性价比很高。更重要的是，教育投资是对孩子未来最好的保障。' },
      { title: '时间异议', content: '我们的课程时间安排很灵活，工作日晚间和周末都有班次。而且支持录播回放，即使偶尔有事也不会落下进度。' },
      { title: '考虑一下', content: '完全理解，这是重要决定需要慎重。不过目前这期班名额只剩{N}个了，我可以先帮您预留3天。期间您有任何问题随时问我，好吗？' },
    ],
  },
  {
    category: '促成成交',
    scripts: [
      { title: '限时优惠', content: '告诉您一个好消息，本周是我们的月度优惠周，报名可享{折扣}优惠，还能额外赠送{赠品}。这个活动名额有限，建议您尽快决定。' },
      { title: '从众心理', content: '您这个年龄段孩子的家长，大多数都选择了{课程名}。上期学员中有{百分比}%反馈效果超出预期。我可以分享几个类似案例给您参考。' },
    ],
  },
];
