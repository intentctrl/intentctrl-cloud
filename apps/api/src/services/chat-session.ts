import { type SQL, eq, and, ilike, desc, asc, count } from "drizzle-orm";
import { chatSessions, chatMessages } from "@intentctrl-cloud/db";
import type { DB } from "@intentctrl-cloud/db";
import type { CreateChatSessionRequest, SortItem, FilterItem } from "@intentctrl-cloud/types";
import type { UIMessage } from "ai";

export async function upsertMessage(db: DB, sessionId: string, message: UIMessage): Promise<UIMessage[]> {
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);

  if (!session?.id) {
    throw new Error(`Session ${sessionId} not found — create it first`);
  }
  const s = session.id;

  const [existing] = await db
    .select({ id: chatMessages.id })
    .from(chatMessages)
    .where(and(eq(chatMessages.id, message.id), eq(chatMessages.sessionId, s)))
    .limit(1);

  if (existing) {
    await db
      .update(chatMessages)
      .set({ role: message.role, parts: message.parts as unknown as unknown[] })
      .where(eq(chatMessages.id, message.id));
  } else {
    await db.insert(chatMessages).values({
      id: message.id,
      sessionId: s,
      role: message.role,
      parts: message.parts as unknown as unknown[],
    });
  }

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, s))
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);

  return rows.reverse().map((r) => ({
    id: r.id,
    role: r.role,
    parts: r.parts as UIMessage["parts"],
    metadata: r.metadata ?? undefined,
  })) as UIMessage[];
}

const SORTABLE_COLUMNS: Record<string, unknown> = {
  visitorId: chatSessions.visitorId,
  externalUserId: chatSessions.externalUserId,
  active: chatSessions.active,
  createdAt: chatSessions.createdAt,
  updatedAt: chatSessions.updatedAt,
};

function getFilterCondition(columnId: string, value: unknown): SQL | undefined {
  switch (columnId) {
    case "visitorId":
    case "externalUserId":
      return ilike(chatSessions[columnId], `%${String(value)}%`);
    case "active":
      return eq(chatSessions.active, value === "true" || value === true);
    default:
      return undefined;
  }
}

export async function findSessionById(db: DB, id: string) {
  const [row] = await db
    .select({
      id: chatSessions.id,
      externalUserId: chatSessions.externalUserId,
      visitorId: chatSessions.visitorId,
      active: chatSessions.active,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(eq(chatSessions.id, id))
    .limit(1);

  if (!row) return null;

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, id))
    .orderBy(asc(chatMessages.createdAt));

  return { session: row, messages };
}

export async function createSession(db: DB, data: CreateChatSessionRequest) {
  const [session] = await db
    .insert(chatSessions)
    .values({
      visitorId: data.visitorId,
      externalUserId: data.externalUserId ?? null,
    })
    .returning();
  return session;
}

export async function deleteSession(db: DB, id: string) {
  await db.delete(chatSessions).where(eq(chatSessions.id, id));
}

export async function getPaginatedSessions(
  db: DB,
  options: {
    pageIndex: number;
    pageSize: number;
    sorting: SortItem[];
    columnFilters: FilterItem[];
  },
) {
  const { pageIndex, pageSize, sorting, columnFilters } = options;

  let orderBy = desc(chatSessions.createdAt);
  if (sorting.length > 0) {
    const s = sorting[0]!;
    const col = SORTABLE_COLUMNS[s.id];
    if (col) {
      orderBy = s.desc ? desc(col as any) : asc(col as any);
    }
  }

  const conditions: SQL[] = [];

  for (const f of columnFilters) {
    if (f.value === "" || f.value === null || f.value === undefined) continue;
    const cond = getFilterCondition(f.id, f.value);
    if (cond) conditions.push(cond);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ value: count() }).from(chatSessions).where(where);

  const rowCount = Number(countResult?.value ?? 0);
  const pageCount = rowCount > 0 ? Math.ceil(rowCount / pageSize) : 1;

  const items = await db
    .select({
      id: chatSessions.id,
      externalUserId: chatSessions.externalUserId,
      visitorId: chatSessions.visitorId,
      active: chatSessions.active,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(pageIndex * pageSize);

  return { items, rowCount, pageCount, pageIndex, pageSize };
}
