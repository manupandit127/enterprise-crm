import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "sales_rep",
  "viewer",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
]);
export const dealStageEnum = pgEnum("deal_stage", [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);
export const activityTypeEnum = pgEnum("activity_type", [
  "email",
  "call",
  "meeting",
  "note",
  "task",
]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("sales_rep"),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  country: varchar("country", { length: 100 }),
  assignedTo: integer("assigned_to").references(() => users.id),
  tags: text("tags"),
  notes: text("notes"),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 100 }),
  source: varchar("source", { length: 100 }),
  status: leadStatusEnum("status").notNull().default("new"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  customerId: integer("customer_id").references(() => customers.id),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  stage: dealStageEnum("stage").notNull().default("prospecting"),
  value: decimal("value", { precision: 12, scale: 2 }).notNull().default("0"),
  probability: integer("probability").default(0),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  description: text("description"),
  tags: text("tags"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body"),
  leadId: integer("lead_id").references(() => leads.id),
  dealId: integer("deal_id").references(() => deals.id),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  isDone: boolean("is_done").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email logs table
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  leadId: integer("lead_id").references(() => leads.id),
  customerId: integer("customer_id").references(() => customers.id),
  dealId: integer("deal_id").references(() => deals.id),
  sentBy: integer("sent_by").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("sent"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});
