import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({
      id: emailLogs.id,
      subject: emailLogs.subject,
      body: emailLogs.body,
      fromEmail: emailLogs.fromEmail,
      toEmail: emailLogs.toEmail,
      status: emailLogs.status,
      sentAt: emailLogs.sentAt,
      leadId: emailLogs.leadId,
      customerId: emailLogs.customerId,
      dealId: emailLogs.dealId,
      sentBy: emailLogs.sentBy,
      senderName: users.name,
    })
    .from(emailLogs)
    .leftJoin(users, eq(emailLogs.sentBy, users.id))
    .orderBy(sql`${emailLogs.sentAt} desc`)
    .limit(50);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [log] = await db
    .insert(emailLogs)
    .values({
      subject: body.subject,
      body: body.body,
      fromEmail: user.email,
      toEmail: body.toEmail,
      leadId: body.leadId ? Number(body.leadId) : null,
      customerId: body.customerId ? Number(body.customerId) : null,
      dealId: body.dealId ? Number(body.dealId) : null,
      sentBy: user.id,
      status: "sent",
    })
    .returning();

  return NextResponse.json(log, { status: 201 });
}
