import { query } from "./_generated/server";

// Get formatted NISR data for AI responses
export const getNISRDataForAI = query({
  args: {},
  handler: async (ctx) => {
    // Get all NISR data
    const poverty = await ctx.db.query("nisr_poverty").collect();
    const labor = await ctx.db.query("nisr_labor").collect();
    const gdp = await ctx.db.query("nisr_gdp").collect();

    // Get national level data
    const nationalPoverty = poverty.find((p) => p.province === "National");
    const nationalLabor = labor.find((l) => l.province === "National");

    // Format poverty response
    const povertyText = nationalPoverty
      ? `National poverty rate is ${nationalPoverty.povertyRate}% with extreme poverty at ${nationalPoverty.extremePovertyRate}% (Source: ${nationalPoverty.source} ${nationalPoverty.year}). ` +
        `Provincial breakdown: Kigali has the lowest poverty rate, while Southern and Eastern provinces have higher rates above 38%. ` +
        `Districts with highest poverty: ` +
        poverty
          .filter((p) => p.province !== "National")
          .sort((a, b) => b.povertyRate - a.povertyRate)
          .slice(0, 3)
          .map((p) => `${p.district} (${p.povertyRate}%)`)
          .join(", ") +
        "."
      : "Poverty data not available.";

    // Format labor response
    const laborText = nationalLabor
      ? `National employment rate is ${nationalLabor.employmentRate}% with unemployment at ${nationalLabor.unemploymentRate}% (Source: ${nationalLabor.source} ${nationalLabor.year}). ` +
        `Youth unemployment (15-24) is ${nationalLabor.youthUnemployment}%, which is significantly higher than general unemployment. ` +
        `Provincial differences: ` +
        labor
          .filter((l) => l.province !== "National")
          .map((l) => `${l.province} (${l.employmentRate}% employment)`)
          .join(", ") +
        "."
      : "Labor data not available.";

    // Format GDP response
    const topSectors = gdp.sort((a, b) => b.gdpContribution - a.gdpContribution).slice(0, 5);
    const gdpText =
      topSectors.length > 0
        ? `Top GDP contributing sectors (Source: NISR National Accounts ${topSectors[0].year} ${topSectors[0].quarter}): ` +
          topSectors
            .map((s) => `${s.sector} (${s.gdpContribution}% contribution, ${s.growthRate}% growth)`)
            .join(", ") +
          `. Fastest growing sectors: ` +
          gdp
            .sort((a, b) => b.growthRate - a.growthRate)
            .slice(0, 3)
            .map((s) => `${s.sector} (${s.growthRate}%)`)
            .join(", ") +
          "."
        : "GDP data not available.";

    return {
      poverty: povertyText,
      labor: laborText,
      gdp: gdpText,
    };
  },
});

// Get project statistics for AI responses
export const getProjectStatsForAI = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const insights = await ctx.db.query("insights").collect();

    const activeProjects = projects.filter((p) => p.status === "ACTIVE");
    const delayedProjects = projects.filter((p) => p.status === "DELAYED");
    const atRiskProjects = projects.filter((p) =>
      ["HIGH", "CRITICAL"].includes(p.riskLevel)
    );

    const totalBudget = projects.reduce((sum, p) => sum + p.budgetAllocated, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Get projects with ministry data
    const projectsWithMinistries = await Promise.all(
      atRiskProjects.slice(0, 3).map(async (project) => {
        const ministry = await ctx.db.get(project.ministryId);
        return {
          name: project.name,
          riskLevel: project.riskLevel,
          ministry: ministry?.name || "Unknown",
          budgetAllocated: project.budgetAllocated,
          budgetSpent: project.budgetSpent,
        };
      })
    );

    const criticalInsights = insights.filter(
      (i) => i.actionRequired && ["CRITICAL", "HIGH"].includes(i.impact)
    );

    const response = `You have ${projects.length} total projects, ${activeProjects.length} active, ${delayedProjects.length} delayed. ` +
      `${atRiskProjects.length} projects are at risk (HIGH or CRITICAL risk level). ` +
      `Overall budget utilization: ${utilization.toFixed(1)}%. ` +
      `Projects requiring attention: ${projectsWithMinistries.map((p) => `${p.name} (${p.riskLevel} risk, ${p.ministry})`).join("; ")}. ` +
      `${criticalInsights.length} critical insights require immediate action.`;

    return response;
  },
});

// Get opportunity statistics for AI responses
export const getOpportunityStatsForAI = query({
  args: {},
  handler: async (ctx) => {
    const opportunities = await ctx.db.query("opportunities").collect();

    const totalValue = opportunities.reduce((sum, o) => sum + (o.marketSize || 0), 0);

    // Group by sector
    const bySector: Record<string, number> = {};
    opportunities.forEach((o) => {
      bySector[o.sector] = (bySector[o.sector] || 0) + 1;
    });

    const topSectors = Object.entries(bySector)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Group by location
    const byLocation: Record<string, number> = {};
    opportunities.forEach((o) => {
      byLocation[o.location] = (byLocation[o.location] || 0) + 1;
    });

    // High priority opportunities (low risk, high market size)
    const highPriority = opportunities
      .filter((o) => o.riskOverall === "LOW" && (o.marketSize || 0) > 100000000)
      .slice(0, 3);

    const response = `${opportunities.length} investment opportunities available with estimated total market value of ${(totalValue / 1000000).toFixed(0)}M RWF. ` +
      `Top sectors: ${topSectors.map(([sector, count]) => `${sector} (${count} opportunities)`).join(", ")}. ` +
      `Top locations: ${Object.entries(byLocation).slice(0, 3).map(([loc, count]) => `${loc} (${count})`).join(", ")}. ` +
      `High priority opportunities: ${highPriority.map((o) => `${o.title} (${o.sector}, ${((o.marketSize || 0) / 1000000).toFixed(0)}M RWF market size)`).join("; ")}.`;

    return response;
  },
});

// Get ministry performance for AI responses
export const getMinistryStatsForAI = query({
  args: {},
  handler: async (ctx) => {
    const ministries = await ctx.db.query("ministries").collect();

    // Calculate performance for each ministry
    const ministryStats = await Promise.all(
      ministries.map(async (ministry) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_ministry", (q) => q.eq("ministryId", ministry._id))
          .collect();

        const totalAllocated = projects.reduce((sum, p) => sum + p.budgetAllocated, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0);
        const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

        const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
        const atRiskProjects = projects.filter((p) =>
          ["HIGH", "CRITICAL"].includes(p.riskLevel)
        ).length;

        return {
          name: ministry.name,
          code: ministry.code,
          utilization,
          activeProjects,
          atRiskProjects,
          totalProjects: projects.length,
        };
      })
    );

    // Sort by utilization
    const topPerformers = ministryStats
      .filter((m) => m.totalProjects > 0)
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);

    const response = `Ministry performance rankings (by budget utilization): ${topPerformers.map((m, i) => `${i + 1}) ${m.code} (${m.utilization.toFixed(1)}% utilization, ${m.activeProjects}/${m.totalProjects} active projects, ${m.atRiskProjects} at risk)`).join(", ")}.`;

    return response;
  },
});
