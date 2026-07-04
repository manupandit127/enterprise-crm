import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, customers, leads, deals, activities, emailLogs } from "@/db/schema";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Clear existing data
    await db.delete(emailLogs);
    await db.delete(activities);
    await db.delete(deals);
    await db.delete(leads);
    await db.delete(customers);
    await db.delete(users);

    // Seed users
    const hashedPw = await bcrypt.hash("password123", 10);
    const adminPw = await bcrypt.hash("admin123", 10);

    const insertedUsers = await db
      .insert(users)
      .values([
        { name: "Admin User", email: "admin@crm.com", passwordHash: adminPw, role: "admin" },
        { name: "Sarah Johnson", email: "sarah@crm.com", passwordHash: hashedPw, role: "manager" },
        { name: "Mike Chen", email: "mike@crm.com", passwordHash: hashedPw, role: "sales_rep" },
        { name: "Emily Davis", email: "emily@crm.com", passwordHash: hashedPw, role: "sales_rep" },
        { name: "Tom Wilson", email: "tom@crm.com", passwordHash: hashedPw, role: "viewer" },
      ])
      .returning();

    const adminId = insertedUsers[0].id;
    const managerId = insertedUsers[1].id;
    const rep1Id = insertedUsers[2].id;
    const rep2Id = insertedUsers[3].id;

    // Seed customers
    const insertedCustomers = await db
      .insert(customers)
      .values([
        {
          name: "Alice Thompson",
          email: "alice@techcorp.com",
          phone: "+1-555-0101",
          company: "TechCorp Inc.",
          industry: "Technology",
          website: "https://techcorp.com",
          country: "USA",
          assignedTo: rep1Id,
          totalRevenue: "125000",
          tags: "enterprise,tech",
        },
        {
          name: "Bob Martinez",
          email: "bob@globalretail.com",
          phone: "+1-555-0102",
          company: "Global Retail Co.",
          industry: "Retail",
          website: "https://globalretail.com",
          country: "USA",
          assignedTo: rep1Id,
          totalRevenue: "89000",
          tags: "retail,mid-market",
        },
        {
          name: "Carol White",
          email: "carol@healthplus.com",
          phone: "+1-555-0103",
          company: "HealthPlus Group",
          industry: "Healthcare",
          website: "https://healthplus.com",
          country: "UK",
          assignedTo: rep2Id,
          totalRevenue: "240000",
          tags: "healthcare,enterprise",
        },
        {
          name: "David Kim",
          email: "david@financeai.com",
          phone: "+1-555-0104",
          company: "FinanceAI Solutions",
          industry: "Finance",
          website: "https://financeai.com",
          country: "Canada",
          assignedTo: rep2Id,
          totalRevenue: "310000",
          tags: "finance,AI",
        },
        {
          name: "Eva Brown",
          email: "eva@greenlogistics.com",
          phone: "+1-555-0105",
          company: "Green Logistics Ltd.",
          industry: "Logistics",
          country: "Germany",
          assignedTo: managerId,
          totalRevenue: "56000",
          tags: "logistics,europe",
        },
        {
          name: "Frank Nguyen",
          email: "frank@edutech.com",
          phone: "+1-555-0106",
          company: "EduTech Academy",
          industry: "Education",
          country: "USA",
          assignedTo: rep1Id,
          totalRevenue: "72000",
          tags: "education,saas",
        },
      ])
      .returning();

    // Seed leads
    const insertedLeads = await db
      .insert(leads)
      .values([
        {
          firstName: "James",
          lastName: "Anderson",
          email: "james@startup.io",
          phone: "+1-555-0201",
          company: "StartupIO",
          jobTitle: "CTO",
          source: "Website",
          status: "new",
          priority: "high",
          assignedTo: rep1Id,
          estimatedValue: "45000",
        },
        {
          firstName: "Lisa",
          lastName: "Park",
          email: "lisa@innovate.co",
          phone: "+1-555-0202",
          company: "Innovate Co",
          jobTitle: "CEO",
          source: "Referral",
          status: "contacted",
          priority: "high",
          assignedTo: rep2Id,
          estimatedValue: "120000",
        },
        {
          firstName: "Ryan",
          lastName: "Foster",
          email: "ryan@cloudbase.net",
          phone: "+1-555-0203",
          company: "CloudBase",
          jobTitle: "VP Sales",
          source: "LinkedIn",
          status: "qualified",
          priority: "medium",
          assignedTo: rep1Id,
          estimatedValue: "85000",
        },
        {
          firstName: "Maria",
          lastName: "Garcia",
          email: "maria@medisol.com",
          phone: "+1-555-0204",
          company: "MediSol",
          jobTitle: "Procurement Manager",
          source: "Trade Show",
          status: "qualified",
          priority: "high",
          assignedTo: rep2Id,
          estimatedValue: "200000",
        },
        {
          firstName: "Chris",
          lastName: "Lee",
          email: "chris@retailnext.com",
          phone: "+1-555-0205",
          company: "RetailNext",
          jobTitle: "Director",
          source: "Cold Call",
          status: "contacted",
          priority: "low",
          assignedTo: managerId,
          estimatedValue: "35000",
        },
        {
          firstName: "Nina",
          lastName: "Patel",
          email: "nina@dataworks.ai",
          phone: "+1-555-0206",
          company: "DataWorks AI",
          jobTitle: "Head of Operations",
          source: "Email Campaign",
          status: "unqualified",
          priority: "low",
          assignedTo: rep1Id,
          estimatedValue: "25000",
        },
        {
          firstName: "Omar",
          lastName: "Hassan",
          email: "omar@nextsystems.com",
          phone: "+1-555-0207",
          company: "NextSystems",
          jobTitle: "IT Manager",
          source: "Website",
          status: "converted",
          priority: "medium",
          assignedTo: rep2Id,
          estimatedValue: "95000",
          customerId: insertedCustomers[0].id,
        },
      ])
      .returning();

    // Seed deals
    const now = new Date();
    const futureDate = (days: number) => new Date(now.getTime() + days * 86400000);

    await db.insert(deals).values([
      {
        title: "TechCorp Enterprise License",
        customerId: insertedCustomers[0].id,
        assignedTo: rep1Id,
        stage: "proposal",
        value: "85000",
        probability: 60,
        expectedCloseDate: futureDate(30),
        description: "Annual enterprise software license renewal",
      },
      {
        title: "Global Retail POS Upgrade",
        customerId: insertedCustomers[1].id,
        assignedTo: rep1Id,
        stage: "negotiation",
        value: "42000",
        probability: 80,
        expectedCloseDate: futureDate(14),
        description: "Point of sale system upgrade across 12 stores",
      },
      {
        title: "HealthPlus Cloud Migration",
        customerId: insertedCustomers[2].id,
        assignedTo: rep2Id,
        stage: "qualification",
        value: "150000",
        probability: 40,
        expectedCloseDate: futureDate(60),
        description: "Full cloud infrastructure migration",
      },
      {
        title: "FinanceAI Analytics Suite",
        customerId: insertedCustomers[3].id,
        assignedTo: rep2Id,
        stage: "closed_won",
        value: "310000",
        probability: 100,
        expectedCloseDate: futureDate(-5),
        actualCloseDate: futureDate(-5),
        description: "Enterprise analytics and reporting suite",
      },
      {
        title: "EduTech LMS Platform",
        customerId: insertedCustomers[5].id,
        assignedTo: rep1Id,
        stage: "prospecting",
        value: "28000",
        probability: 20,
        expectedCloseDate: futureDate(90),
        description: "Learning management system implementation",
      },
      {
        title: "Green Logistics Fleet Tracker",
        customerId: insertedCustomers[4].id,
        assignedTo: managerId,
        stage: "closed_lost",
        value: "56000",
        probability: 0,
        expectedCloseDate: futureDate(-20),
        description: "Fleet tracking and optimization solution",
      },
      {
        title: "StartupIO SaaS Integration",
        leadId: insertedLeads[0].id,
        assignedTo: rep1Id,
        stage: "qualification",
        value: "45000",
        probability: 35,
        expectedCloseDate: futureDate(45),
        description: "SaaS integration project for startup",
      },
      {
        title: "Innovate Co Growth Package",
        leadId: insertedLeads[1].id,
        assignedTo: rep2Id,
        stage: "proposal",
        value: "120000",
        probability: 55,
        expectedCloseDate: futureDate(25),
        description: "Complete growth and marketing technology package",
      },
    ]);

    // Seed activities
    await db.insert(activities).values([
      {
        type: "email",
        subject: "Follow-up on proposal",
        body: "Sent detailed proposal PDF and pricing breakdown to Alice at TechCorp.",
        customerId: insertedCustomers[0].id,
        userId: rep1Id,
        isDone: true,
        completedAt: new Date(),
      },
      {
        type: "call",
        subject: "Discovery call with Bob",
        body: "30-minute discovery call. Bob is interested in the POS upgrade. Budget confirmed at $40k-$50k.",
        customerId: insertedCustomers[1].id,
        userId: rep1Id,
        isDone: true,
        completedAt: new Date(),
      },
      {
        type: "meeting",
        subject: "Cloud migration kickoff",
        body: "On-site meeting with HealthPlus IT team to scope cloud migration requirements.",
        customerId: insertedCustomers[2].id,
        userId: rep2Id,
        isDone: false,
        scheduledAt: futureDate(3),
      },
      {
        type: "note",
        subject: "Contract signed!",
        body: "FinanceAI signed the 3-year analytics suite contract. PO received and processed.",
        customerId: insertedCustomers[3].id,
        userId: rep2Id,
        isDone: true,
        completedAt: new Date(),
      },
      {
        type: "task",
        subject: "Prepare technical demo",
        body: "Prepare technical demo for EduTech LMS platform showing student progress tracking.",
        customerId: insertedCustomers[5].id,
        userId: rep1Id,
        isDone: false,
        scheduledAt: futureDate(7),
      },
      {
        type: "email",
        subject: "Introduction email",
        body: "Sent introduction email to James Anderson at StartupIO introducing our integration solutions.",
        leadId: insertedLeads[0].id,
        userId: rep1Id,
        isDone: true,
        completedAt: new Date(),
      },
      {
        type: "call",
        subject: "Qualification call with Lisa",
        body: "Qualified Lisa Park at Innovate Co. Strong interest in full growth package. Executive buy-in confirmed.",
        leadId: insertedLeads[1].id,
        userId: rep2Id,
        isDone: true,
        completedAt: new Date(),
      },
      {
        type: "meeting",
        subject: "Product walkthrough",
        body: "Scheduled product demo with Ryan Foster's team at CloudBase.",
        leadId: insertedLeads[2].id,
        userId: rep1Id,
        isDone: false,
        scheduledAt: futureDate(5),
      },
    ]);

    // Seed email logs
    await db.insert(emailLogs).values([
      {
        subject: "Your Proposal from CRM Solutions",
        body: "Dear Alice, Please find attached our detailed proposal for TechCorp's enterprise license renewal...",
        fromEmail: "mike@crm.com",
        toEmail: "alice@techcorp.com",
        customerId: insertedCustomers[0].id,
        sentBy: rep1Id,
        status: "delivered",
      },
      {
        subject: "Following up on our call",
        body: "Hi Bob, Great speaking with you today! As discussed, I'm sending over our POS upgrade brochure...",
        fromEmail: "mike@crm.com",
        toEmail: "bob@globalretail.com",
        customerId: insertedCustomers[1].id,
        sentBy: rep1Id,
        status: "opened",
      },
      {
        subject: "Cloud Migration Assessment",
        body: "Dear Carol, Thank you for meeting with us. Here is the cloud migration assessment report...",
        fromEmail: "emily@crm.com",
        toEmail: "carol@healthplus.com",
        customerId: insertedCustomers[2].id,
        sentBy: rep2Id,
        status: "delivered",
      },
      {
        subject: "Welcome to the Team!",
        body: "Hi David, We're thrilled to have FinanceAI as our partner. Your account is now active...",
        fromEmail: "emily@crm.com",
        toEmail: "david@financeai.com",
        customerId: insertedCustomers[3].id,
        sentBy: rep2Id,
        status: "opened",
      },
      {
        subject: "Checking in on your interest",
        body: "Hi James, Hope you had a chance to review our integration documentation...",
        fromEmail: "mike@crm.com",
        toEmail: "james@startup.io",
        leadId: insertedLeads[0].id,
        sentBy: rep1Id,
        status: "sent",
      },
    ]);

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
