import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals, users, customers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const stage = searchParams.get("stage") ?? "";

  let query = db
    .select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      value: deals.value,
      probability: deals.probability,
      expectedCloseDate: deals.expectedCloseDate,
      actualCloseDate: deals.actualCloseDate,
      description: deals.description,
      tags: deals.tags,
      isActive: deals.isActive,
      customerId: deals.customerId,
      leadId: deals.leadId,
      assignedTo: deals.assignedTo,
      assigneeName: users.name,
      customerName: customers.name,
      customerCompany: customers.company,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
    })
    .from(deals)
    .leftJoin(users, eq(deals.assignedTo, users.id))
    .leftJoin(customers, eq(deals.customerId, customers.id))
    .$dynamic();

  const conditions = [];
  if (search) {
    conditions.push(ilike(deals.title, `%${search}%`));
  }
  if (stage) {
    conditions.push(
      eq(
        deals.stage,
        stage as
          | "prospecting"
          | "qualification"
          | "proposal"
          | "negotiation"
          | "closed_won"
          | "closed_lost"
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(
      conditions.length === 1
        ? conditions[0]
        : sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    );
  }

  const result = await query.orderBy(sql`${deals.createdAt} desc`);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [deal] = await db
    .insert(deals)
    .values({
      title: body.title,
      customerId: body.customerId ? Number(body.customerId) : null,
      leadId: body.leadId ? Number(body.leadId) : null,
      assignedTo: body.assignedTo ? Number(body.assignedTo) : null,
      stage: body.stage ?? "prospecting",
      value: body.value ?? "0",
      probability: body.probability ?? 0,
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
      description: body.description,
      tags: body.tags,
    })
    .returning();

  return NextResponse.json(deal, { status: 201 });
}
