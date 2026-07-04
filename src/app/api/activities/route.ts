import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const customerId = searchParams.get("customerId");
  const dealId = searchParams.get("dealId");

  let query = db
    .select({
      id: activities.id,
      type: activities.type,
      subject: activities.subject,
      body: activities.body,
      isDone: activities.isDone,
      scheduledAt: activities.scheduledAt,
      completedAt: activities.completedAt,
      leadId: activities.leadId,
      dealId: activities.dealId,
      customerId: activities.customerId,
      userId: activities.userId,
      userName: users.name,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .$dynamic();

  if (leadId) query = query.where(eq(activities.leadId, Number(leadId)));
  if (customerId) query = query.where(eq(activities.customerId, Number(customerId)));
  if (dealId) query = query.where(eq(activities.dealId, Number(dealId)));

  const result = await query.orderBy(sql`${activities.createdAt} desc`).limit(50);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [activity] = await db
    .insert(activities)
    .values({
      type: body.type,
      subject: body.subject,
      body: body.body,
      leadId: body.leadId ? Number(body.leadId) : null,
      dealId: body.dealId ? Number(body.dealId) : null,
      customerId: body.customerId ? Number(body.customerId) : null,
      userId: user.id,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      isDone: body.isDone ?? false,
    })
    .returning();

  return NextResponse.json(activity, { status: 201 });
}
