import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all projects with optional filters
export const getProjects = query({
  args: {
    status: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    ministryId: v.optional(v.id("ministries")),
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();

    // Apply filters
    if (args.status) {
      projects = projects.filter((p) => p.status === args.status);
    }
    if (args.riskLevel) {
      projects = projects.filter((p) => p.riskLevel === args.riskLevel);
    }
    if (args.ministryId) {
      projects = projects.filter((p) => p.ministryId === args.ministryId);
    }

    // Enrich with ministry data
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const ministry = await ctx.db.get(project.ministryId);
        return {
          ...project,
          ministry: ministry ? { id: ministry._id, name: ministry.name, code: ministry.code } : null,
        };
      })
    );

    return enriched;
  },
});

// Get single project by ID
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const ministry = await ctx.db.get(project.ministryId);
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    return {
      ...project,
      ministry: ministry ? { id: ministry._id, name: ministry.name, code: ministry.code } : null,
      insights,
    };
  },
});

// Get all opportunities with optional filters
export const getOpportunities = query({
  args: {
    sector: v.optional(v.string()),
    location: v.optional(v.string()),
    minInvestment: v.optional(v.number()),
    maxInvestment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let opportunities = await ctx.db.query("opportunities").collect();

    // Apply filters
    if (args.sector) {
      opportunities = opportunities.filter((o) => o.sector === args.sector);
    }
    if (args.location) {
      opportunities = opportunities.filter((o) => o.location === args.location);
    }
    if (args.minInvestment !== undefined) {
      opportunities = opportunities.filter(
        (o) => (o.investmentMin ?? 0) >= args.minInvestment!
      );
    }
    if (args.maxInvestment !== undefined) {
      opportunities = opportunities.filter(
        (o) => (o.investmentMax ?? Infinity) <= args.maxInvestment!
      );
    }

    return opportunities;
  },
});

// Get single opportunity by ID
export const getOpportunity = query({
  args: { id: v.id("opportunities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all ministries
export const getMinistries = query({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();

    // Enrich with project counts and budget utilization
    const enriched = await Promise.all(
      ministries.map(async (ministry) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_ministry", (q) => q.eq("ministryId", ministry._id))
          .collect();

        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
        const atRiskProjects = projects.filter((p) =>
          ["HIGH", "CRITICAL"].includes(p.riskLevel)
        ).length;

        const totalAllocated = projects.reduce((sum, p) => sum + p.budgetAllocated, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
        const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

        return {
          ...ministry,
          stats: {
            totalProjects,
            activeProjects,
            atRiskProjects,
            totalAllocated,
            totalSpent,
            budgetUtilization,
          },
        };
      })
    );

    return enriched;
  },
});

// Get single ministry by ID or code
export const getMinistry = query({
  args: {
    id: v.optional(v.id("ministries")),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let ministry;

    if (args.id) {
      ministry = await ctx.db.get(args.id);
    } else if (args.code) {
      ministry = await ctx.db
        .query("ministries")
        .withIndex("code", (q) => q.eq("code", args.code!))
        .first();
    }

    if (!ministry) return null;

    // Get projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_ministry", (q) => q.eq("ministryId", ministry._id))
      .collect();

    // Get insights
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_ministry", (q) => q.eq("ministryId", ministry._id))
      .collect();

    return {
      ...ministry,
      projects,
      insights,
    };
  },
});

// Get all insights with optional filters
export const getInsights = query({
  args: {
    type: v.optional(v.string()),
    impact: v.optional(v.string()),
    actionRequired: v.optional(v.boolean()),
    ministryId: v.optional(v.id("ministries")),
  },
  handler: async (ctx, args) => {
    let insights = await ctx.db
      .query("insights")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    // Apply filters
    if (args.type) {
      insights = insights.filter((i) => i.type === args.type);
    }
    if (args.impact) {
      insights = insights.filter((i) => i.impact === args.impact);
    }
    if (args.actionRequired !== undefined) {
      insights = insights.filter((i) => i.actionRequired === args.actionRequired);
    }
    if (args.ministryId) {
      insights = insights.filter((i) => i.ministryId === args.ministryId);
    }

    // Enrich with ministry and project data
    const enriched = await Promise.all(
      insights.map(async (insight) => {
        const ministry = insight.ministryId ? await ctx.db.get(insight.ministryId) : null;
        const project = insight.projectId ? await ctx.db.get(insight.projectId) : null;

        return {
          ...insight,
          ministry: ministry ? { id: ministry._id, name: ministry.name } : null,
          project: project ? { id: project._id, name: project.name } : null,
        };
      })
    );

    return enriched;
  },
});

// Get users with optional role filter
export const getUsers = query({
  args: {
    role: v.optional(v.string()),
    ministry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }
    if (args.ministry) {
      users = users.filter((u) => u.ministry === args.ministry);
    }

    return users;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get platform statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();
    const projects = await ctx.db.query("projects").collect();
    const opportunities = await ctx.db.query("opportunities").collect();
    const insights = await ctx.db.query("insights").collect();
    const users = await ctx.db.query("users").collect();

    const totalBudget = projects.reduce((sum, p) => sum + p.budgetAllocated, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
    const atRiskProjects = projects.filter((p) =>
      ["HIGH", "CRITICAL"].includes(p.riskLevel)
    ).length;

    const criticalInsights = insights.filter(
      (i) => i.impact === "CRITICAL" && i.actionRequired
    ).length;

    return {
      ministries: ministries.length,
      projects: projects.length,
      activeProjects,
      atRiskProjects,
      opportunities: opportunities.length,
      insights: insights.length,
      criticalInsights,
      users: users.length,
      totalBudget,
      totalSpent,
      budgetUtilization,
    };
  },
});
