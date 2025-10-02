# NISR Datasets Directory

This folder will contain CSV files downloaded from NISR Microdata portal.

## Expected Files

1. **poverty.csv** - EICV poverty indicators
   - Columns: Province, District, PovertyRate, ExtremePovertyRate, Year, Source

2. **labor.csv** - Labour Force Survey data
   - Columns: Province, EmploymentRate, UnemploymentRate, YouthUnemployment, Sector, Year, Source

3. **gdp.csv** - National Accounts GDP data
   - Columns: Sector, GDPContribution, GrowthRate, Year, Quarter, Source

4. **demographics.csv** - Population statistics
   - Columns: Province, District, Population, Year, Source

## Instructions

1. Register at NISR Microdata portal: https://microdata.statistics.gov.rw
2. Request access to datasets listed above
3. Download Excel files once approved
4. Convert Excel → CSV using Excel 'Save As' or online converter
5. Place CSV files in this directory
6. Restart Express server to load new data

## Data Sources

- EICV (Integrated Household Living Conditions Survey)
- Labour Force Survey (LFS)
- National Accounts
- Population Projections

All data sourced from National Institute of Statistics of Rwanda (NISR).

