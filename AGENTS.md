# AGENTS.md

## 项目概览
AI 销售工作台 - 面向家庭教育规划课程行业的 SaaS 工作台应用。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- pnpm 包管理

## 目录结构
```
src/
├── app/
│   ├── page.tsx              # 主页面（顶部标签导航 + 内容区）
│   ├── layout.tsx            # 根布局
│   ├── globals.css           # 全局样式 + 动画
│   ├── workspace-view.tsx    # 工作台视图（三栏布局）
│   └── tabs/
│       ├── ai-insights.tsx       # AI 洞察页
│       ├── customer-management.tsx # 客户画像管理页
│       ├── ai-copilot.tsx        # AI 副驾页
│       └── sales-dashboard.tsx   # 销售看板页
├── components/
│   ├── conversation-list.tsx # 左侧会话列表
│   ├── chat-area.tsx         # 中间对话界面
│   ├── customer-profile.tsx  # 右侧客户画像
│   ├── daily-summary.tsx     # 底部每日总结
│   └── ui/                   # shadcn/ui 组件库
└── lib/
    ├── utils.ts              # cn() 工具函数
    └── mock-data.ts          # 模拟数据（客户、对话、AI建议等）
```

## 开发命令
- `pnpm dev` - 启动开发服务
- `pnpm build` - 构建生产版本
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查

## 设计规范
- 主色调：`#0891b2`（青色）
- AI 标识色：`#8b5cf6`（紫色）
- 意向度：S级红色、A级琥珀色、B级绿色
- 白色背景 + 圆角卡片 + 轻阴影

## 关键功能模块
1. **工作台**：三栏布局（会话列表 / 对话界面 / 客户画像）+ 底部每日总结
2. **AI 洞察**：团队分析、常见问题 Top10、意向分布
3. **客户画像管理**：客户列表 + AI 标签编辑
4. **AI 副驾**：话术库 + 沟通策略
5. **销售看板**：转化漏斗 + 人效统计 + 排行
