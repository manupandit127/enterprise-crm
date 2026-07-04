import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const passwordHash = await bcrypt.hash(body.password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role ?? "sales_rep",
    })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return NextResponse.json(newUser, { status: 201 });
}
