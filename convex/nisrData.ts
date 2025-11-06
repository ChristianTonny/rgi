import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// NISR Poverty Data Queries
export const getPovertyData = query({
  args: {
    province: v.optional(v.string()),
    district: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db.query("nisr_poverty").collect();

    if (args.province) {
      data = data.filter((d) => d.province === args.province);
    }
    if (args.district) {
      data = data.filter((d) => d.district === args.district);
    }

    return data;
  },
});

// NISR Labor Data Queries
export const getLaborData = query({
  args: {
    province: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db.query("nisr_labor").collect();

    if (args.province) {
      data = data.filter((d) => d.province === args.province);
    }

    return data;
  },
});

// NISR GDP Data Queries
export const getGDPData = query({
  args: {
    sector: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db.query("nisr_gdp").collect();

    if (args.sector) {
      data = data.filter((d) => d.sector === args.sector);
    }

    return data;
  },
});

// NISR Demographics Data Queries
export const getDemographicsData = query({
  args: {
    province: v.optional(v.string()),
    district: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data = await ctx.db.query("nisr_demographics").collect();

    if (args.province) {
      data = data.filter((d) => d.province === args.province);
    }
    if (args.district) {
      data = data.filter((d) => d.district === args.district);
    }

    return data;
  },
});

// Get comprehensive NISR summary for AI assistant
export const getNISRSummary = query({
  args: {},
  handler: async (ctx) => {
    const poverty = await ctx.db.query("nisr_poverty").collect();
    const labor = await ctx.db.query("nisr_labor").collect();
    const gdp = await ctx.db.query("nisr_gdp").collect();
    const demographics = await ctx.db.query("nisr_demographics").collect();

    // Get national-level data
    const nationalPoverty = poverty.find((p) => p.province === "National");
    const nationalLabor = labor.find((l) => l.province === "National");
    const totalPopulation = demographics.find((d) => d.district === "National");

    // Top sectors by GDP contribution
    const topSectors = gdp
      .sort((a, b) => b.gdpContribution - a.gdpContribution)
      .slice(0, 5);

    // Provinces with highest poverty
    const highPovertyProvinces = poverty
      .filter((p) => p.province !== "National")
      .sort((a, b) => b.povertyRate - a.povertyRate)
      .slice(0, 5);

    return {
      poverty: {
        national: nationalPoverty,
        highestByProvince: highPovertyProvinces,
        total: poverty.length,
      },
      labor: {
        national: nationalLabor,
        total: labor.length,
      },
      gdp: {
        topSectors,
        total: gdp.length,
      },
      demographics: {
        totalPopulation,
        total: demographics.length,
      },
    };
  },
});

// Seed NISR Poverty Data
export const seedPovertyData = mutation({
  args: {},
  handler: async (ctx) => {
    // Sample data from CSV - in production, this would load from actual CSV
    const povertyData = [
      { province: "National", district: "National", povertyRate: 38.2, extremePovertyRate: 12.1, year: "2024", source: "NISR EICV7" },
      { province: "Kigali", district: "Gasabo", povertyRate: 16.8, extremePovertyRate: 4.2, year: "2024", source: "NISR EICV7" },
      { province: "Kigali", district: "Kicukiro", povertyRate: 18.5, extremePovertyRate: 4.8, year: "2024", source: "NISR EICV7" },
      { province: "Kigali", district: "Nyarugenge", povertyRate: 19.2, extremePovertyRate: 5.1, year: "2024", source: "NISR EICV7" },
      { province: "Southern", district: "Gisagara", povertyRate: 42.1, extremePovertyRate: 13.8, year: "2024", source: "NISR EICV7" },
      { province: "Southern", district: "Huye", povertyRate: 35.6, extremePovertyRate: 10.9, year: "2024", source: "NISR EICV7" },
      { province: "Southern", district: "Nyamagabe", povertyRate: 48.3, extremePovertyRate: 16.7, year: "2024", source: "NISR EICV7" },
      { province: "Eastern", district: "Kayonza", povertyRate: 40.2, extremePovertyRate: 12.5, year: "2024", source: "NISR EICV7" },
      { province: "Eastern", district: "Ngoma", povertyRate: 38.7, extremePovertyRate: 11.8, year: "2024", source: "NISR EICV7" },
      { province: "Western", district: "Karongi", povertyRate: 39.5, extremePovertyRate: 12.3, year: "2024", source: "NISR EICV7" },
      { province: "Western", district: "Rusizi", povertyRate: 43.1, extremePovertyRate: 14.2, year: "2024", source: "NISR EICV7" },
      { province: "Northern", district: "Musanze", povertyRate: 36.8, extremePovertyRate: 11.2, year: "2024", source: "NISR EICV7" },
    ];

    const insertedIds = [];
    for (const data of povertyData) {
      const id = await ctx.db.insert("nisr_poverty", data);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} poverty data records`, ids: insertedIds };
  },
});

// Seed NISR Labor Data
export const seedLaborData = mutation({
  args: {},
  handler: async (ctx) => {
    const laborData = [
      { province: "National", employmentRate: 78.3, unemploymentRate: 16.7, youthUnemployment: 23.4, sector: "Overall", year: "2024", source: "NISR RLFS" },
      { province: "Kigali", employmentRate: 75.2, unemploymentRate: 18.9, youthUnemployment: 26.3, sector: "Urban", year: "2024", source: "NISR RLFS" },
      { province: "Southern", employmentRate: 79.8, unemploymentRate: 15.2, youthUnemployment: 21.1, sector: "Rural", year: "2024", source: "NISR RLFS" },
      { province: "Western", employmentRate: 78.1, unemploymentRate: 16.4, youthUnemployment: 22.8, sector: "Rural", year: "2024", source: "NISR RLFS" },
      { province: "Northern", employmentRate: 79.5, unemploymentRate: 15.8, youthUnemployment: 21.9, sector: "Rural", year: "2024", source: "NISR RLFS" },
      { province: "Eastern", employmentRate: 80.1, unemploymentRate: 14.9, youthUnemployment: 20.7, sector: "Rural", year: "2024", source: "NISR RLFS" },
    ];

    const insertedIds = [];
    for (const data of laborData) {
      const id = await ctx.db.insert("nisr_labor", data);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} labor data records`, ids: insertedIds };
  },
});

// Seed NISR GDP Data
export const seedGDPData = mutation({
  args: {},
  handler: async (ctx) => {
    const gdpData = [
      { sector: "Agriculture", gdpContribution: 24.5, growthRate: 5.2, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Industry", gdpContribution: 18.3, growthRate: 6.8, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Services", gdpContribution: 48.2, growthRate: 7.8, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Manufacturing", gdpContribution: 9.1, growthRate: 8.2, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Construction", gdpContribution: 7.9, growthRate: 5.9, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Trade", gdpContribution: 12.4, growthRate: 7.1, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "ICT", gdpContribution: 4.8, growthRate: 12.5, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Financial Services", gdpContribution: 8.6, growthRate: 6.4, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
      { sector: "Transport", gdpContribution: 6.2, growthRate: 5.8, year: "2024", quarter: "Q2", source: "NISR National Accounts" },
    ];

    const insertedIds = [];
    for (const data of gdpData) {
      const id = await ctx.db.insert("nisr_gdp", data);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} GDP data records`, ids: insertedIds };
  },
});

// Seed NISR Demographics Data
export const seedDemographicsData = mutation({
  args: {},
  handler: async (ctx) => {
    const demographicsData = [
      { province: "National", district: "National", population: 13200000, year: "2022", source: "NISR RPHC" },
      { province: "Kigali", district: "Gasabo", population: 530000, year: "2022", source: "NISR RPHC" },
      { province: "Kigali", district: "Kicukiro", population: 320000, year: "2022", source: "NISR RPHC" },
      { province: "Kigali", district: "Nyarugenge", population: 290000, year: "2022", source: "NISR RPHC" },
      { province: "Southern", district: "Huye", population: 380000, year: "2022", source: "NISR RPHC" },
      { province: "Eastern", district: "Kayonza", population: 350000, year: "2022", source: "NISR RPHC" },
      { province: "Western", district: "Karongi", population: 340000, year: "2022", source: "NISR RPHC" },
      { province: "Northern", district: "Musanze", population: 370000, year: "2022", source: "NISR RPHC" },
    ];

    const insertedIds = [];
    for (const data of demographicsData) {
      const id = await ctx.db.insert("nisr_demographics", data);
      insertedIds.push(id);
    }

    return { message: `Seeded ${insertedIds.length} demographics data records`, ids: insertedIds };
  },
});

// Seed all NISR data
export const seedAllNISRData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      poverty: await ctx.runMutation(api.nisrData.seedPovertyData, {}),
      labor: await ctx.runMutation(api.nisrData.seedLaborData, {}),
      gdp: await ctx.runMutation(api.nisrData.seedGDPData, {}),
      demographics: await ctx.runMutation(api.nisrData.seedDemographicsData, {}),
    };

    return {
      message: "Successfully seeded all NISR data",
      results,
    };
  },
});

// Import api
import { api } from "./_generated/api";
