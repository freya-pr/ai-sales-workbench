import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================
// 1. 销售人员表 (关联 Supabase Auth)
// ============================================================
export const salesUsers = pgTable(
  "sales_users",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    auth_id: uuid("auth_id").notNull().unique(), // Supabase Auth user id
    name: varchar("name", { length: 64 }).notNull(),
    avatar_url: varchar("avatar_url", { length: 512 }),
    role: varchar("role", { length: 20 }).notNull().default("sales"), // sales | manager | admin
    team: varchar("team", { length: 64 }).notNull().default("default"),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("sales_users_auth_id_idx").on(table.auth_id),
    index("sales_users_team_idx").on(table.team),
    index("sales_users_role_idx").on(table.role),
  ]
);

// ============================================================
// 2. 客户表 (家长信息)
// ============================================================
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 64 }).notNull(),
    avatar_url: varchar("avatar_url", { length: 512 }),
    phone: varchar("phone", { length: 20 }),
    wechat_id: varchar("wechat_id", { length: 64 }),
    source: varchar("source", { length: 32 }).notNull().default("unknown"), // wechat | douyin | referral | ads | official
    // 意向等级 S > A > B
    intent_level: varchar("intent_level", { length: 2 }).notNull().default("B"), // S | A | B
    // 跟进状态
    follow_up_status: varchar("follow_up_status", { length: 32 }).notNull().default("pending"), // pending | in_progress | confirmed | converted | lost
    // 是否由 AI 接待
    ai_mode: boolean("ai_mode").default(true).notNull(),
    // 未读消息数
    unread_count: integer("unread_count").default(0).notNull(),
    // 最后消息时间
    last_message_at: timestamp("last_message_at", { withTimezone: true }),
    // 最后消息预览
    last_message_preview: varchar("last_message_preview", { length: 200 }),
    // 紧急程度 1-5
    urgency: integer("urgency").default(3).notNull(),
    // 分配给哪个销售
    assigned_to: uuid("assigned_to").references(() => salesUsers.id, { onDelete: "set null" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("customers_assigned_to_idx").on(table.assigned_to),
    index("customers_intent_level_idx").on(table.intent_level),
    index("customers_follow_up_status_idx").on(table.follow_up_status),
    index("customers_last_message_at_idx").on(table.last_message_at),
    index("customers_urgency_idx").on(table.urgency),
  ]
);

// ============================================================
// 3. 客户标签表 (AI 自动提取 + 手动编辑)
// ============================================================
export const customerTags = pgTable(
  "customer_tags",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    // 标签类型: intent_level | budget_range | preferred_course | child_age | decision_maker | urgency
    tag_type: varchar("tag_type", { length: 32 }).notNull(),
    // 标签值
    tag_value: varchar("tag_value", { length: 128 }).notNull(),
    // 置信度 0-100
    confidence: integer("confidence").default(80).notNull(),
    // 来源: ai | manual
    source: varchar("source", { length: 10 }).notNull().default("ai"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("customer_tags_customer_id_idx").on(table.customer_id),
    index("customer_tags_type_idx").on(table.tag_type),
    index("customer_tags_customer_type_idx").on(table.customer_id, table.tag_type),
  ]
);

// ============================================================
// 4. 会话表 (一个客户可能有多次会话周期)
// ============================================================
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    // 会话状态
    status: varchar("status", { length: 20 }).notNull().default("active"), // active | closed
    // 会话标题/摘要
    title: varchar("title", { length: 200 }),
    // AI 参与度
    ai_participation: varchar("ai_participation", { length: 20 }).notNull().default("full"), // full | partial | none
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("conversations_customer_id_idx").on(table.customer_id),
    index("conversations_status_idx").on(table.status),
  ]
);

// ============================================================
// 5. 消息表 (对话气泡)
// ============================================================
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversation_id: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    // 发送者类型: customer | ai | sales | system
    sender_type: varchar("sender_type", { length: 10 }).notNull(),
    // 发送者名称 (AI 名字/销售名字)
    sender_name: varchar("sender_name", { length: 64 }),
    // 消息类型: text | image | file | system_notice
    message_type: varchar("message_type", { length: 16 }).notNull().default("text"),
    // 消息内容
    content: text("content"),
    // 图片URL (message_type = image 时)
    image_url: varchar("image_url", { length: 512 }),
    // AI 置信度 (sender_type = ai 时)
    ai_confidence: integer("ai_confidence"),
    // AI 来源标注
    ai_source: varchar("ai_source", { length: 128 }),
    // 是否已读
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversation_id),
    index("messages_customer_id_idx").on(table.customer_id),
    index("messages_sender_type_idx").on(table.sender_type),
    index("messages_created_at_idx").on(table.created_at),
    index("messages_conversation_created_idx").on(table.conversation_id, table.created_at),
  ]
);

// ============================================================
// 6. AI 回复建议表
// ============================================================
export const aiSuggestions = pgTable(
  "ai_suggestions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversation_id: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    message_id: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
    // 建议内容
    content: text("content").notNull(),
    // 置信度 0-100
    confidence: integer("confidence").default(80).notNull(),
    // 来源标注
    source_label: varchar("source_label", { length: 128 }).notNull().default("AI分析"),
    // 状态: pending | sent | discarded | replaced
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ai_suggestions_conversation_id_idx").on(table.conversation_id),
    index("ai_suggestions_status_idx").on(table.status),
    index("ai_suggestions_created_at_idx").on(table.created_at),
  ]
);

// ============================================================
// 7. 课程表 (课程目录)
// ============================================================
export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    category: varchar("category", { length: 32 }).notNull(), // focus | logic | english | sensory | art
    age_range: varchar("age_range", { length: 32 }), // 3-6
    price: numeric("price", { precision: 10, scale: 2 }),
    duration: varchar("duration", { length: 32 }), // 4周 | 8周
    description: text("description"),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("courses_category_idx").on(table.category)]
);

// ============================================================
// 8. 课程参与进度表 (Day0-Day3 打卡)
// ============================================================
export const courseProgress = pgTable(
  "course_progress",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    course_id: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    // Day0-Day3 状态: pending | completed | missed
    day0_status: varchar("day0_status", { length: 16 }).notNull().default("completed"),
    day1_status: varchar("day1_status", { length: 16 }).notNull().default("pending"),
    day2_status: varchar("day2_status", { length: 16 }).notNull().default("pending"),
    day3_status: varchar("day3_status", { length: 16 }).notNull().default("pending"),
    // 意向变化记录 JSON
    intent_history: jsonb("intent_history"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("course_progress_customer_id_idx").on(table.customer_id),
    index("course_progress_course_id_idx").on(table.course_id),
  ]
);

// ============================================================
// 9. 每日会话总结表
// ============================================================
export const dailySummaries = pgTable(
  "daily_summaries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    // 总结日期 YYYY-MM-DD
    summary_date: varchar("summary_date", { length: 10 }).notNull(),
    // AI 生成的对话摘要
    summary: text("summary").notNull(),
    // 意向变化
    intent_change: varchar("intent_change", { length: 32 }), // improved | stable | declined
    // 跟进动作清单 (JSON array)
    action_items: jsonb("action_items"),
    // 明日优先跟进建议
    next_day_priority: text("next_day_priority"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("daily_summaries_customer_id_idx").on(table.customer_id),
    index("daily_summaries_date_idx").on(table.summary_date),
    index("daily_summaries_customer_date_idx").on(table.customer_id, table.summary_date),
  ]
);

// ============================================================
// 10. 销售记录表 (成交数据)
// ============================================================
export const salesRecords = pgTable(
  "sales_records",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    sales_user_id: uuid("sales_user_id").references(() => salesUsers.id, { onDelete: "set null" }),
    course_id: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    // 成交金额
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    // 状态: trial | converted | cancelled
    status: varchar("status", { length: 16 }).notNull().default("trial"),
    // 成交日期
    deal_date: timestamp("deal_date", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("sales_records_customer_id_idx").on(table.customer_id),
    index("sales_records_sales_user_id_idx").on(table.sales_user_id),
    index("sales_records_status_idx").on(table.status),
    index("sales_records_deal_date_idx").on(table.deal_date),
  ]
);

// ============================================================
// 11. 话术库表
// ============================================================
export const callScripts = pgTable(
  "call_scripts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    // 场景类型: first_contact | need_discovery | objection_handling | closing
    category: varchar("category", { length: 32 }).notNull(),
    title: varchar("title", { length: 128 }).notNull(),
    content: text("content").notNull(),
    // 使用次数
    usage_count: integer("usage_count").default(0).notNull(),
    // 效果评分 1-5
    effectiveness: integer("effectiveness").default(4),
    // 是否由 AI 生成
    is_ai_generated: boolean("is_ai_generated").default(false).notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("call_scripts_category_idx").on(table.category),
    index("call_scripts_active_idx").on(table.is_active),
  ]
);

// ============================================================
// 12. 跟进记录表 (时间轴)
// ============================================================
export const followUpLogs = pgTable(
  "follow_up_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    sales_user_id: uuid("sales_user_id").references(() => salesUsers.id, { onDelete: "set null" }),
    // 跟进方式: call | wechat | visit | message
    method: varchar("method", { length: 16 }).notNull().default("wechat"),
    // 跟进内容
    content: text("content").notNull(),
    // 意向变化
    intent_before: varchar("intent_before", { length: 2 }),
    intent_after: varchar("intent_after", { length: 2 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("follow_up_logs_customer_id_idx").on(table.customer_id),
    index("follow_up_logs_sales_user_id_idx").on(table.sales_user_id),
    index("follow_up_logs_created_at_idx").on(table.created_at),
  ]
);

// ============================================================
// 13. 通知表 (顶部通知铃铛)
// ============================================================
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sales_user_id: uuid("sales_user_id").references(() => salesUsers.id, { onDelete: "cascade" }),
    // 通知类型: new_message | intent_change | follow_up_reminder | ai_alert
    type: varchar("type", { length: 32 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content"),
    // 关联客户
    customer_id: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_sales_user_id_idx").on(table.sales_user_id),
    index("notifications_is_read_idx").on(table.is_read),
    index("notifications_created_at_idx").on(table.created_at),
  ]
);

// ============================================================
// 系统表 (禁止删除)
// ============================================================
export const healthCheck = pgTable("health_check", {
  id: integer("id").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
});
