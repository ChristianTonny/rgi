# Seed Convex Database

After running `npx convex dev`, you need to seed the database with initial data.

## Steps:

### 1. Open Convex Dashboard
The `npx convex dev` command should have opened your browser to the Convex dashboard.
If not, go to: https://dashboard.convex.dev

### 2. Go to Functions Tab
Click on "Functions" in the left sidebar

### 3. Run Seed Functions (in order)

Run these mutations in the **exact order**:

1. **seed:seedAllNISRData** - Seeds NISR poverty, labor, GDP, demographics data
   - Click on `seed` → `seedAllNISRData`
   - Click "Run" (no arguments needed)
   - Wait for success message

2. **seed:seedAll** - Seeds ministries, users, projects, opportunities, insights
   - Click on `seed` → `seedAll`
   - Click "Run" (no arguments needed)
   - Wait for success message

### 4. Verify Data
Go to "Data" tab and check that tables are populated:
- ministries (should have ~8 records)
- projects (should have ~8 records)
- opportunities (should have ~8 records)
- insights (should have ~5 records)
- users (should have ~4 records)
- nisr_poverty (should have ~12 records)
- nisr_labor (should have ~6 records)
- nisr_gdp (should have ~9 records)
- nisr_demographics (should have ~8 records)

## Done!
Your Convex database is now seeded with real data.
