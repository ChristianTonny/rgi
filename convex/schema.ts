import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.string(),
    ministry: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("email", ["email"]).index("role", ["role"]).index("ministry", ["ministry"]),

  ministries: defineTable({
    name: v.string(),
    code: v.string(),
    budgetAllocation: v.number(),
  }).index("code", ["code"]),

  projects: defineTable({
    name: v.string(),
    ministryId: v.id("ministries"),
    status: v.string(),
    riskLevel: v.string(),
    budgetAllocated: v.number(),
    budgetSpent: v.number(),
    beneficiaries: v.number(),
  }).index("by_ministry", ["ministryId"]).index("by_status", ["status"]).index("by_risk", ["riskLevel"]),

  opportunities: defineTable({
    title: v.string(),
    sector: v.string(),
    location: v.string(),
    investmentMin: v.optional(v.number()),
    investmentMax: v.optional(v.number()),
    marketSize: v.optional(v.number()),
    competitionLevel: v.optional(v.string()),
    riskOverall: v.optional(v.string()),
  }).index("by_sector", ["sector"]).index("by_location", ["location"]),

  insights: defineTable({
    type: v.string(),
    title: v.string(),
    description: v.string(),
    confidence: v.number(),
    impact: v.string(),
    actionRequired: v.boolean(),
    ministryId: v.optional(v.id("ministries")),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
  }).index("by_ministry", ["ministryId"]).index("by_project", ["projectId"]).index("by_createdAt", ["createdAt"]),

  activity_log: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    context: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_createdAt", ["createdAt"]),
});

