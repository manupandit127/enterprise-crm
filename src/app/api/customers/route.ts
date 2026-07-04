import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  let query = db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      company: customers.company,
      industry: customers.industry,
      website: customers.website,
      country: customers.country,
      totalRevenue: customers.totalRevenue,
      tags: customers.tags,
      notes: customers.notes,
      isActive: customers.isActive,
      assignedTo: customers.assignedTo,
      assigneeName: users.name,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .leftJoin(users, eq(customers.assignedTo, users.id))
    .$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.company, `%${search}%`),
        ilike(customers.email, `%${search}%`)
      )
    );
  }

  const result = await query.orderBy(sql`${customers.createdAt} desc`);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const [customer] = await db
    .insert(customers)
    .values({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      industry: body.industry,
      website: body.website,
      address: body.address,
      country: body.country,
      assignedTo: body.assignedTo ? Number(body.assignedTo) : null,
      tags: body.tags,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(customer, { status: 201 });
}
