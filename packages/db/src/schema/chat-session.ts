import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, uuid, index, jsonb } from "drizzle-orm/pg-core";

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    externalUserId: text("external_user_id"),
    visitorId: text("visitor_id").notNull(),
    active: boolean("active").default(true).notNull(),
    title: text("title").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("chat_sessions_externalUserId_idx").on(table.externalUserId),
    index("chat_sessions_visitorId_idx").on(table.visitorId),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    parts: jsonb("parts")
      .notNull()
      .default(sql`'[]'::jsonb`),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_messages_sessionId_idx").on(table.sessionId),
    index("chat_messages_createdAt_idx").on(table.createdAt),
  ],
);

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
