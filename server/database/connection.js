const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rwanda_gov_intelligence',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Database time:', result.rows[0].current_time);
    
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.log('🐌 Slow query detected:', {
        text: text.substring(0, 100) + '...',
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      text: text.substring(0, 100) + '...',
      error: error.message,
      params: params
    });
    throw error;
  }
};

// Transaction helper function
const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database (create tables if they don't exist)
const initializeDatabase = async () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Split the schema into individual statements
      const statements = schemaSql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        try {
          await pool.query(statement + ';');
        } catch (error) {
          // Ignore errors for things that already exist
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate key value')) {
            console.error('Schema execution error:', error.message);
          }
        }
      }
      
      console.log('✅ Database schema initialized');
    } else {
      console.log('⚠️ Schema file not found, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// Common database operations
const db = {
  // Connection pool
  pool,
  
  // Query functions
  query,
  transaction,
  
  // Utility functions
  testConnection,
  initializeDatabase,
  
  // Common CRUD operations
  async findById(table, id) {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0];
  },
  
  async findAll(table, conditions = '', params = []) {
    const sql = `SELECT * FROM ${table} ${conditions}`;
    const result = await query(sql, params);
    return result.rows;
  },
  
  async create(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
  },
  
  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`);
    
    const sql = `
      UPDATE ${table}
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id, ...values]);
    return result.rows[0];
  },
  
  async delete(table, id) {
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await query(sql, [id]);
    return result.rows[0];
  },
  
  // Government-specific operations
  async getMinistryPerformance() {
    const result = await query('SELECT * FROM ministry_performance ORDER BY name');
    return result.rows;
  },
  
  async getProjectRiskSummary() {
    const result = await query(`
      SELECT * FROM project_risk_summary 
      WHERE risk_level IN ('HIGH', 'CRITICAL') OR is_overdue = true
      ORDER BY risk_level DESC, budget_allocated DESC
    `);
    return result.rows;
  },
  
  async getEconomicIndicators(category = null) {
    const sql = category 
      ? 'SELECT * FROM economic_indicators WHERE category = $1 ORDER BY measurement_date DESC'
      : 'SELECT * FROM economic_indicators ORDER BY category, measurement_date DESC';
    
    const params = category ? [category] : [];
    const result = await query(sql, params);
    return result.rows;
  },
  
  async getUserWithPermissions(userId) {
    const result = await query(`
      SELECT 
        u.*,
        json_agg(
          json_build_object('resource', up.resource, 'action', up.action)
        ) FILTER (WHERE up.id IS NOT NULL) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
    
    return result.rows[0];
  }
};

module.exports = db;