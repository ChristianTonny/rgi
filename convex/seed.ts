import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed initial ministries
export const seedMinistries = mutation({
  args: {},
  handler: async (ctx) => {
    const ministries = [
      { name: "Ministry of Finance and Economic Planning", code: "MINECOFIN", budgetAllocation: 150000000000 },
      { name: "Ministry of Education", code: "MINEDUC", budgetAllocation: 120000000000 },
      { name: "Ministry of Health", code: "MOH", budgetAllocation: 180000000000 },
      { name: "Ministry of Infrastructure", code: "MININFRA", budgetAllocation: 200000000000 },
      { name: "Ministry of Agriculture and Animal Resources", code: "MINAGRI", budgetAllocation: 130000000000 },
      { name: "Ministry of Local Government", code: "MINALOC", budgetAllocation: 90000000000 },
      { name: "Ministry of Trade and Industry", code: "MINICOM", budgetAllocation: 85000000000 },
      { name: "Ministry of ICT and Innovation", code: "MINICT", budgetAllocation: 75000000000 },
    ];

    const insertedIds = [];
    for (const ministry of ministries) {
      const existing = await ctx.db
        .query("ministries")
        .withIndex("code", (q) => q.eq("code", ministry.code))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("ministries", ministry);
        insertedIds.push(id);
      }
    }

    return { message: `Seeded ${insertedIds.length} ministries`, ids: insertedIds };
  },
});

// Seed sample projects
export const seedProjects = mutation({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();
    if (ministries.length === 0) {
      throw new Error("Please seed ministries first");
    }

    const projects = [
      {
        name: "National Digital Infrastructure Expansion",
        ministryId: ministries.find(m => m.code === "MINICT")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "MEDIUM",
        budgetAllocated: 25000000000,
        budgetSpent: 18500000000,
        beneficiaries: 5000000,
      },
      {
        name: "Eastern Province Rural Electrification",
        ministryId: ministries.find(m => m.code === "MININFRA")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "LOW",
        budgetAllocated: 45000000000,
        budgetSpent: 32000000000,
        beneficiaries: 850000,
      },
      {
        name: "Youth Employment Skills Program",
        ministryId: ministries.find(m => m.code === "MINEDUC")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "MEDIUM",
        budgetAllocated: 15000000000,
        budgetSpent: 9500000000,
        beneficiaries: 125000,
      },
      {
        name: "Community Health Insurance Expansion",
        ministryId: ministries.find(m => m.code === "MOH")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "LOW",
        budgetAllocated: 28000000000,
        budgetSpent: 22000000000,
        beneficiaries: 3200000,
      },
      {
        name: "Agricultural Irrigation Systems (Southern Province)",
        ministryId: ministries.find(m => m.code === "MINAGRI")?._id || ministries[0]._id,
        status: "DELAYED",
        riskLevel: "HIGH",
        budgetAllocated: 35000000000,
        budgetSpent: 18000000000,
        beneficiaries: 450000,
      },
      {
        name: "Kigali Mass Transit System Phase 2",
        ministryId: ministries.find(m => m.code === "MININFRA")?._id || ministries[0]._id,
        status: "PLANNING",
        riskLevel: "MEDIUM",
        budgetAllocated: 120000000000,
        budgetSpent: 15000000000,
        beneficiaries: 2000000,
      },
      {
        name: "SME Digital Transformation Grant Program",
        ministryId: ministries.find(m => m.code === "MINICOM")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "LOW",
        budgetAllocated: 8000000000,
        budgetSpent: 5200000000,
        beneficiaries: 35000,
      },
      {
        name: "National Food Security Initiative",
        ministryId: ministries.find(m => m.code === "MINAGRI")?._id || ministries[0]._id,
        status: "ACTIVE",
        riskLevel: "CRITICAL",
        budgetAllocated: 52000000000,
        budgetSpent: 48000000000,
        beneficiaries: 1800000,
      },
    ];

    const insertedIds = [];
    for (const project of projects) {
      const id = await ctx.db.insert("projects", project);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} projects`, ids: insertedIds };
  },
});

// Seed investment opportunities
export const seedOpportunities = mutation({
  args: {},
  handler: async (ctx) => {
    const opportunities = [
      {
        title: "Kigali Green Technology Park",
        sector: "Technology",
        location: "Kigali",
        investmentMin: 5000000,
        investmentMax: 50000000,
        marketSize: 250000000,
        competitionLevel: "MEDIUM",
        riskOverall: "LOW",
      },
      {
        title: "Eastern Province Agro-Processing Hub",
        sector: "Agriculture",
        location: "Eastern Province",
        investmentMin: 2000000,
        investmentMax: 15000000,
        marketSize: 120000000,
        competitionLevel: "LOW",
        riskOverall: "MEDIUM",
      },
      {
        title: "Renewable Energy Solar Farms",
        sector: "Energy",
        location: "National",
        investmentMin: 10000000,
        investmentMax: 100000000,
        marketSize: 500000000,
        competitionLevel: "HIGH",
        riskOverall: "LOW",
      },
      {
        title: "Tourism Eco-Lodges Network",
        sector: "Tourism",
        location: "Western Province",
        investmentMin: 1000000,
        investmentMax: 8000000,
        marketSize: 45000000,
        competitionLevel: "MEDIUM",
        riskOverall: "MEDIUM",
      },
      {
        title: "Fintech Digital Banking Platform",
        sector: "Financial Services",
        location: "Kigali",
        investmentMin: 3000000,
        investmentMax: 25000000,
        marketSize: 180000000,
        competitionLevel: "HIGH",
        riskOverall: "MEDIUM",
      },
      {
        title: "Manufacturing: Textile Production Facility",
        sector: "Manufacturing",
        location: "Southern Province",
        investmentMin: 8000000,
        investmentMax: 40000000,
        marketSize: 220000000,
        competitionLevel: "MEDIUM",
        riskOverall: "MEDIUM",
      },
      {
        title: "Healthcare: Private Hospital Chain",
        sector: "Healthcare",
        location: "Kigali",
        investmentMin: 15000000,
        investmentMax: 80000000,
        marketSize: 350000000,
        competitionLevel: "MEDIUM",
        riskOverall: "LOW",
      },
      {
        title: "Logistics: E-commerce Warehousing",
        sector: "Logistics",
        location: "Kigali",
        investmentMin: 4000000,
        investmentMax: 20000000,
        marketSize: 95000000,
        competitionLevel: "LOW",
        riskOverall: "LOW",
      },
    ];

    const insertedIds = [];
    for (const opportunity of opportunities) {
      const id = await ctx.db.insert("opportunities", opportunity);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} opportunities`, ids: insertedIds };
  },
});

// Seed insights based on NISR data
export const seedInsights = mutation({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();
    const projects = await ctx.db.query("projects").collect();

    const insights = [
      {
        type: "RISK",
        title: "Food Security Project Budget Overrun Alert",
        description: "National Food Security Initiative has spent 92% of allocated budget with Q4 remaining. Risk of underfunding critical food distribution in Eastern Province (poverty rate 42.1% per NISR EICV7).",
        confidence: 94,
        impact: "CRITICAL",
        actionRequired: true,
        ministryId: ministries.find(m => m.code === "MINAGRI")?._id,
        projectId: projects.find(p => p.name.includes("Food Security"))?._id,
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        type: "OPPORTUNITY",
        title: "Youth Employment Gap in Kigali",
        description: "NISR Labour Force Survey 2024 shows youth unemployment at 26.3% in Kigali. Opportunity to expand Youth Employment Skills Program to urban centers with ICT/services focus (sectors growing at 12.5% per NISR National Accounts).",
        confidence: 88,
        impact: "HIGH",
        actionRequired: true,
        ministryId: ministries.find(m => m.code === "MINEDUC")?._id,
        projectId: projects.find(p => p.name.includes("Youth Employment"))?._id,
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        type: "TREND",
        title: "Services Sector Dominates GDP Growth",
        description: "Services sector now contributes 48.2% of GDP with 7.8% growth rate (NISR National Accounts Q2 2024). ICT subsector leads at 12.5% growth. Suggests prioritization of digital infrastructure investments.",
        confidence: 96,
        impact: "HIGH",
        actionRequired: false,
        ministryId: ministries.find(m => m.code === "MINICT")?._id,
        createdAt: Date.now() - 86400000 * 7,
      },
      {
        type: "RISK",
        title: "Agricultural Irrigation Project Delay Risk",
        description: "Southern Province irrigation project 51% spent but behind schedule. District poverty rates in target area remain high (Gisagara 42.1%, Nyamagabe 48.3% per NISR EICV7). Delay impacts 450K beneficiaries.",
        confidence: 91,
        impact: "HIGH",
        actionRequired: true,
        ministryId: ministries.find(m => m.code === "MINAGRI")?._id,
        projectId: projects.find(p => p.name.includes("Irrigation"))?._id,
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        type: "OPPORTUNITY",
        title: "Eastern Province Rural Electrification Success",
        description: "Electrification project 71% complete, on schedule, low risk. Eastern Province has highest employment rate (80.1% per NISR RLFS). Electricity access can further boost productivity and attract investment.",
        confidence: 93,
        impact: "MEDIUM",
        actionRequired: false,
        ministryId: ministries.find(m => m.code === "MININFRA")?._id,
        projectId: projects.find(p => p.name.includes("Electrification"))?._id,
        createdAt: Date.now() - 86400000 * 10,
      },
    ];

    const insertedIds = [];
    for (const insight of insights) {
      const id = await ctx.db.insert("insights", insight);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} insights`, ids: insertedIds };
  },
});

// Seed demo users
export const seedUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();

    const users = [
      {
        email: "minister@gov.rw",
        name: "Hon. Minister of Finance",
        role: "MINISTER",
        ministry: ministries.find(m => m.code === "MINECOFIN")?.name || "Ministry of Finance",
        isActive: true,
      },
      {
        email: "ps@gov.rw",
        name: "Dr. Permanent Secretary",
        role: "PERMANENT_SECRETARY",
        ministry: ministries.find(m => m.code === "MINEDUC")?.name || "Ministry of Education",
        isActive: true,
      },
      {
        email: "director@gov.rw",
        name: "Policy Director",
        role: "POLICY_DIRECTOR",
        ministry: ministries.find(m => m.code === "MOH")?.name || "Ministry of Health",
        isActive: true,
      },
      {
        email: "investor@example.com",
        name: "Investment Partner",
        role: "INVESTOR",
        isActive: true,
      },
    ];

    const insertedIds = [];
    for (const user of users) {
      const existing = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", user.email))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("users", user);
        insertedIds.push(id);
      }
    }

    return { message: `Seeded ${insertedIds.length} users`, ids: insertedIds };
  },
});

// Master seed function to seed everything
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      ministries: { message: "", ids: [] as any[] },
      users: { message: "", ids: [] as any[] },
      projects: { message: "", ids: [] as any[] },
      opportunities: { message: "", ids: [] as any[] },
      insights: { message: "", ids: [] as any[] },
    };

    // Seed in order (ministries first for foreign keys)
    results.ministries = await ctx.runMutation(api.seed.seedMinistries, {});
    results.users = await ctx.runMutation(api.seed.seedUsers, {});
    results.projects = await ctx.runMutation(api.seed.seedProjects, {});
    results.opportunities = await ctx.runMutation(api.seed.seedOpportunities, {});
    results.insights = await ctx.runMutation(api.seed.seedInsights, {});

    return {
      message: "Successfully seeded all data",
      results,
    };
  },
});

// Import api
import { api } from "./_generated/api";
