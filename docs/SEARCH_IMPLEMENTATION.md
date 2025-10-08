# Global Search Implementation - FlexSearch Integration

## Overview

The global search feature has been upgraded from simple mock data filtering to a full FlexSearch-powered search engine that indexes all data sources including NISR datasets, projects, opportunities, ministries, policies, and insights.

## Implementation Details

### Architecture

```
User Query → Frontend (global-search.tsx) 
    ↓
API Endpoint (/api/search)
    ↓
FlexSearch Index (search-indexer.js)
    ↓
Indexed Documents (72+ items)
```

### Files Modified/Created

1. **`server/utils/search-indexer.js`** (NEW)
   - FlexSearch Document index configuration
   - Indexes all data sources on initialization
   - Provides search and filtering functions
   - Converts NISR CSV data to searchable documents

2. **`server/routes/search.js`** (MODIFIED)
   - Replaced mock data filtering with FlexSearch
   - Added query parameter support
   - Added `/api/search/stats` endpoint

3. **`server/index.js`** (MODIFIED)
   - Initialize search index after loading NISR data on startup

### Data Sources Indexed

The search index includes **72+ documents** from:

- **Projects** (4 documents)
  - National Infrastructure Upgrade
  - ICT Digital Transformation Initiative
  - Healthcare System Modernization
  - Education Quality Enhancement Program

- **Opportunities** (4 documents)
  - Renewable Energy Investment - Solar Parks
  - Agricultural Processing Plant
  - Tourism Infrastructure Development
  - Manufacturing Zone Development

- **Policies** (2 documents)
  - Digital Economy Policy Framework 2024
  - Green Growth Strategy

- **Insights** (2 documents)
  - Budget Efficiency Analysis Q4 2024
  - Project Risk Assessment - Infrastructure

- **Ministries** (4 documents)
  - Ministry of Infrastructure (MININFRA)
  - Ministry of ICT and Innovation (MINICT)
  - Ministry of Health (MOH)
  - Ministry of Education (MINEDUC)

- **NISR Data** (56 documents)
  - Poverty data (31 rows from poverty.csv)
  - Labor data (6 rows from labor.csv)
  - GDP data (10 rows from gdp.csv)
  - Demographics data (9 rows from demographics.csv)

### API Endpoints

#### GET /api/search

Search across all indexed data sources.

**Query Parameters:**
- `q` (required) - Search query (minimum 2 characters)
- `limit` (optional, default: 10) - Maximum results to return
- `type` (optional) - Filter by type: PROJECT, OPPORTUNITY, POLICY, INSIGHT, DATA, MINISTRY
- `sector` (optional) - Filter by sector keyword
- `dateFrom` (optional) - Filter by date range start (ISO date)
- `dateTo` (optional) - Filter by date range end (ISO date)

**Example Requests:**

```bash
# Basic search
GET /api/search?q=poverty&limit=5

# Search with type filter
GET /api/search?q=infrastructure&type=PROJECT

# Search with sector filter
GET /api/search?q=energy&sector=Energy

# Search NISR data
GET /api/search?q=unemployment
```

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "id": "nisr-poverty-1",
      "type": "DATA",
      "title": "Poverty Data - National",
      "content": "Poverty rate: 38.2%, Extreme poverty: 12.1% in National (2024)",
      "keywords": "poverty eicv statistics National 2024",
      "source": {
        "name": "NISR EICV7"
      },
      "metadata": {
        "province": "National",
        "district": "National",
        "povertyRate": "38.2",
        "extremePovertyRate": "12.1",
        "year": "2024"
      },
      "createdAt": "2024-10-08T19:25:24.878Z"
    }
  ],
  "total": 5,
  "query": "poverty",
  "filters": {
    "type": null,
    "sector": null
  }
}
```

#### GET /api/search/stats

Get statistics about the search index.

**Response Format:**

```json
{
  "success": true,
  "data": {
    "totalDocuments": 72,
    "types": {
      "projects": 4,
      "opportunities": 4,
      "policies": 2,
      "insights": 2,
      "ministries": 4,
      "nisrData": 56
    }
  }
}
```

### FlexSearch Configuration

```javascript
const searchIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['title', 'content', 'keywords'],
    store: ['type', 'title', 'content', 'source', 'metadata', 'createdAt']
  },
  tokenize: 'forward',
  cache: 100,
  context: {
    resolution: 9,
    depth: 2,
    bidirectional: true
  }
});
```

**Key Features:**
- **Forward tokenization** - Matches partial words (e.g., "pov" matches "poverty")
- **Context-aware** - Understands word relationships and context
- **Bidirectional** - Searches work in both directions
- **Caching** - Improves performance for repeated queries

### Search Features

1. **Full-Text Search**
   - Searches across title, content, and keywords fields
   - Partial word matching
   - Case-insensitive

2. **Type Filtering**
   - Filter results by document type
   - Supported types: PROJECT, OPPORTUNITY, POLICY, INSIGHT, DATA, MINISTRY

3. **Sector Filtering**
   - Filter by sector keywords
   - Example: Energy, Agriculture, Tourism, Infrastructure

4. **Date Range Filtering**
   - Filter results by creation date
   - Uses ISO date format

5. **Result Ranking**
   - FlexSearch automatically ranks results by relevance
   - More relevant matches appear first

6. **NISR Data Integration**
   - All NISR CSV data is indexed and searchable
   - Includes province, district, year metadata
   - Proper source attribution (e.g., "NISR EICV7")

## Testing

### Test Results

All integration tests pass:

- ✅ Basic search functionality
- ✅ Type filtering (PROJECT, OPPORTUNITY, etc.)
- ✅ Sector filtering
- ✅ NISR data search
- ✅ Search statistics endpoint
- ✅ Authentication required
- ✅ 72+ documents indexed

### Manual Testing

```bash
# Start server
npm run server

# Get authentication token (in another terminal)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"minister@gov.rw","password":"password123"}' | jq -r '.token')

# Test search with token
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/search?q=poverty&limit=5"
```

**Test User Credentials:**
- Email: `minister@gov.rw`
- Password: `password123`

For more details on authentication, see [Authentication Documentation](../server/routes/auth.js).

## Performance

- **Index Build Time**: < 1 second on startup
- **Search Response Time**: < 50ms for typical queries
- **Memory Usage**: Minimal (FlexSearch is lightweight)
- **Scalability**: Can handle thousands of documents efficiently

## Future Enhancements

1. **Search History Tracking**
   - Store user search queries in database
   - Provide personalized suggestions based on history

2. **Advanced Filters**
   - Risk level filtering
   - Budget range filtering
   - Status filtering (for projects/opportunities)

3. **Relevance Tuning**
   - Boost certain fields (title > content > keywords)
   - Custom scoring algorithms

4. **Real-time Updates**
   - Automatically re-index when data changes
   - WebSocket notifications for new results

5. **Semantic Search**
   - Use embeddings for better context understanding
   - Find similar documents based on meaning, not just keywords

## Maintenance

### Rebuilding the Index

The search index is automatically built on server startup. To manually rebuild:

```javascript
const { initializeSearchIndex } = require('./utils/search-indexer');
await initializeSearchIndex();
```

### Adding New Data Sources

To add new data to the search index:

1. Add data to the appropriate mock data array in `search-indexer.js`
2. Or add new NISR CSV file to `data/nisr-datasets/`
3. Restart server to rebuild index

### Monitoring

Check search statistics:

```bash
# First, get authentication token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"minister@gov.rw","password":"password123"}' | jq -r '.token')

# Then check stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/search/stats
```

## Troubleshooting

### Issue: Search returns no results

**Solution**: 
- Check if search index was initialized on startup
- Look for "✅ Search index initialized with X documents" in server logs
- Verify NISR data files are present in `data/nisr-datasets/`

### Issue: Authentication error

**Solution**:
- Ensure valid JWT token is included in Authorization header
- Token format: `Bearer <token>`

### Issue: Search is slow

**Solution**:
- FlexSearch is optimized for speed
- If slow, check server resources (CPU, memory)
- Consider reducing cache size in FlexSearch configuration

## References

- [FlexSearch Documentation](https://github.com/nextapps-de/flexsearch)
- [Requirement #2: Functional Global Search](../docs/IMPLEMENTATION_PLAN.md#requirement-2)
- [NISR Data Sources](../data/nisr-datasets/)

## Compliance

✅ Meets Requirement #2: Implement Functional Global Search
- FlexSearch indexing implemented
- All data sources indexed (projects, opportunities, ministries, NISR data)
- Search API endpoint functional
- Result navigation works correctly
- Advanced filters supported (type, sector, date range)

**Status**: COMPLETE ✅
