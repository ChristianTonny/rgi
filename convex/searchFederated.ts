import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchFederated = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = args.q.trim().toLowerCase()
    const limit = Math.min(args.limit ?? 10, 50)
    if (!q) return []

    const results: any[] = []

    const projects = await ctx.db.query("projects").collect()
    projects.forEach(p => {
      const text = `${p.name}`.toLowerCase()
      if (text.includes(q)) {
        results.push({
          id: p._id,
          title: p.name,
          type: "PROJECT",
          relevance: 1,
          content: "",
          source: { id: "projects", name: "Projects", type: "PROJECT", lastUpdated: new Date(), reliability: 95 },
          metadata: { status: p.status, riskLevel: p.riskLevel },
          createdAt: new Date()
        })
      }
    })

    const opportunities = await ctx.db.query("opportunities").collect()
    opportunities.forEach(o => {
      const text = `${o.title} ${o.sector} ${o.location}`.toLowerCase()
      if (text.includes(q)) {
        results.push({
          id: o._id,
          title: o.title,
          type: "OPPORTUNITY",
          relevance: 1,
          content: "",
          source: { id: "opportunities", name: "Opportunities", type: "OPPORTUNITY", lastUpdated: new Date(), reliability: 95 },
          metadata: { sector: o.sector, location: o.location },
          createdAt: new Date()
        })
      }
    })

    const policies = await ctx.db.query("insights").collect()
    policies.forEach(i => {
      const text = `${i.title} ${i.description}`.toLowerCase()
      if (text.includes(q)) {
        results.push({
          id: i._id,
          title: i.title,
          type: i.type === 'TREND' ? 'DATA' : 'INSIGHT',
          relevance: 1,
          content: i.description,
          source: { id: "insights", name: "Insights", type: "INSIGHT", lastUpdated: new Date(), reliability: 95 },
          metadata: { impact: i.impact },
          createdAt: new Date()
        })
      }
    })

    return results.slice(0, limit)
  }
})
