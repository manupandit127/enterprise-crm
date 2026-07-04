import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
  if (body.expectedCloseDate) {
    updateData.expectedCloseDate = new Date(body.expectedCloseDate);
  }

  const [updated] = await db
    .update(deals)
    .set(updateData)
    .where(eq(deals.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.delete(deals).where(eq(deals.id, Number(id)));
  return NextResponse.json({ success: true });
}
