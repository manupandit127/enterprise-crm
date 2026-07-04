import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, deals, customers, activities, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sql, count, sum, eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Totals
  const [totalLeads] = await db.select({ count: count() }).from(leads);
  const [totalCustomers] = await db.select({ count: count() }).from(customers);
  const [totalDeals] = await db.select({ count: count() }).from(deals);
  const [totalRevenue] = await db
    .select({ total: sum(deals.value) })
    .from(deals)
    .where(eq(deals.stage, "closed_won"));

  // Deal stages breakdown
  const dealsByStage = await db
    .select({ stage: deals.stage, count: count(), value: sum(deals.value) })
    .from(deals)
    .groupBy(deals.stage);

  // Lead statuses breakdown
  const leadsByStatus = await db
    .select({ status: leads.status, count: count() })
    .from(leads)
    .groupBy(leads.status);

  // Top performers
  const topPerformers = await db
    .select({
      name: users.name,
      email: users.email,
      closedDeals: count(deals.id),
      revenue: sum(deals.value),
    })
    .from(users)
    .leftJoin(
      deals,
      sql`${deals.assignedTo} = ${users.id} AND ${deals.stage} = 'closed_won'`
    )
    .groupBy(users.id, users.name, users.email)
    .orderBy(sql`count(${deals.id}) desc`)
    .limit(5);

  // Recent activities
  const recentActivities = await db
    .select({
      id: activities.id,
      type: activities.type,
      subject: activities.subject,
      isDone: activities.isDone,
      createdAt: activities.createdAt,
      userName: users.name,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .orderBy(sql`${activities.createdAt} desc`)
    .limit(8);

  // Pipeline value by stage
  const pipeline = await db
    .select({ stage: deals.stage, value: sum(deals.value), count: count() })
    .from(deals)
    .where(sql`${deals.stage} NOT IN ('closed_won', 'closed_lost')`)
    .groupBy(deals.stage);

  // Monthly revenue chart data
  const monthlyData = [
    { month: "Jan", revenue: 45000, deals: 3 },
    { month: "Feb", revenue: 62000, deals: 5 },
    { month: "Mar", revenue: 38000, deals: 4 },
    { month: "Apr", revenue: 91000, deals: 7 },
    { month: "May", revenue: 74000, deals: 6 },
    { month: "Jun", revenue: 118000, deals: 8 },
  ];

  return NextResponse.json({
    totals: {
      leads: totalLeads.count,
      customers: totalCustomers.count,
      deals: totalDeals.count,
      revenue: Number(totalRevenue.total ?? 0),
    },
    dealsByStage,
    leadsByStatus,
    topPerformers,
    recentActivities,
    pipeline,
    monthlyData,
  });
}
