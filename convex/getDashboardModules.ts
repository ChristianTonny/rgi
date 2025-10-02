import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardModules = query({
  args: { ministryCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { ministryCode } = args

    // Ministry filter (optional)
    let ministry = null as any
    if (ministryCode) {
      ministry = await ctx.db
        .query("ministries")
        .withIndex("code", q => q.eq("code", ministryCode))
        .first()
    }

    // Aggregations
    const ministries = await ctx.db.query("ministries").collect()
    const projects = await ctx.db.query("projects").collect()
    const opportunities = await ctx.db.query("opportunities").collect()
    const risks = await ctx.db
      .query("insights")
      .withIndex("by_createdAt")
      .collect()

    const filteredProjects = ministry
      ? projects.filter(p => p.ministryId === ministry._id)
      : projects

    // Resource Allocation
    const totalBudget = filteredProjects.reduce((s, p) => s + p.budgetAllocated, 0)
    const spent = filteredProjects.reduce((s, p) => s + p.budgetSpent, 0)
    const available = Math.max(totalBudget - spent, 0)
    const efficiency = totalBudget > 0 ? (spent / totalBudget) * 100 : 0

    // Opportunity Radar (simple counts)
    const totalOpportunities = opportunities.length
    const highPriority = Math.round(totalOpportunities * 0.18) // placeholder until scoring
    const estimatedValue = opportunities.reduce((s, o) => s + (o.marketSize ?? 0), 0)

    // Performance Monitor
    const projectsAtRisk = filteredProjects.filter(p => ["HIGH", "CRITICAL"].includes(p.riskLevel)).length
    const totalProjects = filteredProjects.length
    const onTimeDelivery = 78.5 // placeholder until milestones exist
    const qualityScore = 87.1 // placeholder until audits exist

    return [
      {
        id: "resource-allocation",
        title: "Resource Allocation",
        type: "resource-allocation",
        priority: "HIGH",
        lastUpdated: Date.now(),
        data: { totalBudget, spent, available, efficiency },
        insights: [],
      },
      {
        id: "opportunity-radar",
        title: "Opportunity Radar",
        type: "opportunity-radar",
        priority: "HIGH",
        lastUpdated: Date.now(),
        data: { totalOpportunities, highPriorityOpportunities: highPriority, estimatedValue },
        insights: [],
      },
      {
        id: "performance-monitor",
        title: "Performance Monitor",
        type: "performance-monitor",
        priority: "MEDIUM",
        lastUpdated: Date.now(),
        data: { projectsAtRisk, totalProjects, onTimeDelivery, qualityScore },
        insights: [],
      },
    ]
  }
})
