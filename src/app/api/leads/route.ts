import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  let query = db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
      company: leads.company,
      jobTitle: leads.jobTitle,
      source: leads.source,
      status: leads.status,
      priority: leads.priority,
      estimatedValue: leads.estimatedValue,
      notes: leads.notes,
      assignedTo: leads.assignedTo,
      assigneeName: users.name,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .leftJoin(users, eq(leads.assignedTo, users.id))
    .$dynamic();

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(leads.firstName, `%${search}%`),
        ilike(leads.lastName, `%${search}%`),
        ilike(leads.company, `%${search}%`),
        ilike(leads.email, `%${search}%`)
      )
    );
  }
  if (status) {
    conditions.push(eq(leads.status, status as "new" | "contacted" | "qualified" | "unqualified" | "converted"));
  }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`);
  }

  const result = await query.orderBy(sql`${leads.createdAt} desc`);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [lead] = await db
    .insert(leads)
    .values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      jobTitle: body.jobTitle,
      source: body.source,
      status: body.status ?? "new",
      priority: body.priority ?? "medium",
      assignedTo: body.assignedTo ? Number(body.assignedTo) : null,
      estimatedValue: body.estimatedValue,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(lead, { status: 201 });
}
