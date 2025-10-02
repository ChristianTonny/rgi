-- Rwanda Government Intelligence Platform Database Schema
-- This schema supports government data, projects, users, and institutional memory

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Management Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('MINISTER', 'PERMANENT_SECRETARY', 'POLICY_DIRECTOR', 'DEVELOPMENT_COORDINATOR', 'ENTREPRENEUR', 'INVESTOR', 'ADMIN')),
    ministry VARCHAR(100),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource, action)
);

-- Government Structure Tables
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    minister_user_id UUID REFERENCES users(id),
    ps_user_id UUID REFERENCES users(id),
    budget_allocation BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_user_id UUID REFERENCES users(id),
    budget_allocation BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Management Tables
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ministry_id UUID REFERENCES ministries(id),
    department_id UUID REFERENCES departments(id),
    project_manager_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'DELAYED', 'COMPLETED', 'CANCELLED')),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    budget_allocated BIGINT NOT NULL,
    budget_spent BIGINT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    beneficiaries INTEGER DEFAULT 0,
    location JSONB, -- Array of locations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    indicator VARCHAR(255) NOT NULL,
    target_value DECIMAL NOT NULL,
    achieved_value DECIMAL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    last_measured TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES users(id),
    status_change VARCHAR(50),
    budget_change BIGINT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics Tables
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    ministry_id UUID REFERENCES ministries(id),
    project_id UUID REFERENCES projects(id),
    current_value DECIMAL NOT NULL,
    target_value DECIMAL,
    previous_value DECIMAL,
    unit VARCHAR(50) NOT NULL,
    trend VARCHAR(20) CHECK (trend IN ('IMPROVING', 'DECLINING', 'STABLE')),
    measurement_date DATE NOT NULL,
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Economic Indicators Tables
CREATE TABLE economic_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('GDP', 'INFLATION', 'EMPLOYMENT', 'TRADE', 'FISCAL')),
    current_value DECIMAL NOT NULL,
    previous_value DECIMAL,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    measurement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investment Opportunities Tables
CREATE TABLE investment_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sector VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    investment_min BIGINT,
    investment_max BIGINT,
    estimated_roi DECIMAL,
    roi_timeframe VARCHAR(50),
    market_size BIGINT,
    competition_level VARCHAR(20) CHECK (competition_level IN ('LOW', 'MEDIUM', 'HIGH')),
    regulatory_complexity VARCHAR(20) CHECK (regulatory_complexity IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_overall VARCHAR(20) CHECK (risk_overall IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_regulatory VARCHAR(20) CHECK (risk_regulatory IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_market VARCHAR(20) CHECK (risk_market IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_financial VARCHAR(20) CHECK (risk_financial IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_operational VARCHAR(20) CHECK (risk_operational IN ('LOW', 'MEDIUM', 'HIGH')),
    requirements JSONB, -- Array of requirements
    incentives JSONB, -- Array of incentives
    mitigation_strategies JSONB, -- Array of mitigation strategies
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence and AI Tables
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    context JSONB, -- Store conversation context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    sources JSONB, -- Array of data sources referenced
    insights JSONB, -- Array of insights generated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search and Data Integration Tables
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MINISTRY', 'STATISTICS', 'ECONOMIC', 'PROJECT', 'EXTERNAL')),
    url TEXT,
    api_endpoint TEXT,
    reliability_score INTEGER DEFAULT 100 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    last_updated TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    query_text TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Institutional Memory Tables
CREATE TABLE policy_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ministry_id UUID REFERENCES ministries(id),
    decision_maker_id UUID REFERENCES users(id),
    category VARCHAR(100),
    rationale TEXT,
    expected_outcomes JSONB,
    actual_outcomes JSONB,
    lessons_learned TEXT,
    success_factors JSONB,
    failure_factors JSONB,
    decision_date DATE NOT NULL,
    review_date DATE,
    is_successful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historical_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_type VARCHAR(100) NOT NULL,
    context JSONB NOT NULL, -- Conditions that led to the pattern
    outcomes JSONB NOT NULL, -- Results of the pattern
    confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    supporting_evidence JSONB, -- References to decisions, projects, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence Insights Tables
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ALERT', 'RECOMMENDATION', 'TREND', 'OPPORTUNITY')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    impact VARCHAR(20) CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
    priority VARCHAR(20) CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    action_required BOOLEAN DEFAULT FALSE,
    related_data JSONB, -- References to source data
    generated_by VARCHAR(50), -- 'AI' or user_id
    ministry_id UUID REFERENCES ministries(id),
    project_id UUID REFERENCES projects(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
    action_taken TEXT,
    action_taken_by UUID REFERENCES users(id),
    action_taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit and Security Tables
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('ERROR', 'WARN', 'INFO', 'DEBUG')),
    message TEXT NOT NULL,
    component VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ministry ON users(ministry);
CREATE INDEX idx_projects_ministry ON projects(ministry_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_risk_level ON projects(risk_level);
CREATE INDEX idx_performance_metrics_ministry ON performance_metrics(ministry_id);
CREATE INDEX idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(measurement_date);
CREATE INDEX idx_economic_indicators_category ON economic_indicators(category);
CREATE INDEX idx_economic_indicators_date ON economic_indicators(measurement_date);
CREATE INDEX idx_investment_opportunities_sector ON investment_opportunities(sector);
CREATE INDEX idx_investment_opportunities_location ON investment_opportunities(location);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_ministry ON insights(ministry_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Views for Common Queries
CREATE VIEW ministry_performance AS
SELECT 
    m.id,
    m.name,
    m.code,
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed_projects,
    COUNT(CASE WHEN p.status = 'DELAYED' THEN 1 END) as delayed_projects,
    COUNT(CASE WHEN p.risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) as high_risk_projects,
    SUM(p.budget_allocated) as total_budget_allocated,
    SUM(p.budget_spent) as total_budget_spent,
    CASE 
        WHEN SUM(p.budget_allocated) > 0 
        THEN (SUM(p.budget_spent)::DECIMAL / SUM(p.budget_allocated)) * 100 
        ELSE 0 
    END as budget_execution_rate
FROM ministries m
LEFT JOIN projects p ON m.id = p.ministry_id
GROUP BY m.id, m.name, m.code;

CREATE VIEW project_risk_summary AS
SELECT 
    p.id,
    p.name,
    p.ministry_id,
    p.status,
    p.risk_level,
    p.budget_allocated,
    p.budget_spent,
    CASE 
        WHEN p.budget_allocated > 0 
        THEN (p.budget_spent::DECIMAL / p.budget_allocated) * 100 
        ELSE 0 
    END as budget_utilization,
    CASE 
        WHEN p.end_date < CURRENT_DATE AND p.status != 'COMPLETED' 
        THEN TRUE 
        ELSE FALSE 
    END as is_overdue,
    m.name as ministry_name
FROM projects p
JOIN ministries m ON p.ministry_id = m.id;

-- Sample Data (for development/testing)
-- Insert sample ministries
INSERT INTO ministries (name, code, description, budget_allocation) VALUES 
('Ministry of ICT and Innovation', 'ICT', 'Information and Communication Technology', 200000000),
('Ministry of Finance and Economic Planning', 'FINANCE', 'Budget and Economic Policy', 500000000),
('Ministry of Health', 'HEALTH', 'Healthcare Services', 600000000),
('Ministry of Education', 'EDUCATION', 'Education Services', 700000000),
('Ministry of Infrastructure', 'INFRA', 'Infrastructure Development', 450000000);

-- Insert sample economic indicators
INSERT INTO economic_indicators (name, category, current_value, previous_value, unit, source, measurement_date) VALUES
('GDP Growth Rate', 'GDP', 8.2, 7.8, '%', 'National Institute of Statistics Rwanda', '2024-09-01'),
('Inflation Rate', 'INFLATION', 5.1, 4.8, '%', 'National Bank of Rwanda', '2024-09-01'),
('Unemployment Rate', 'EMPLOYMENT', 16.5, 17.2, '%', 'National Institute of Statistics Rwanda', '2024-06-30'),
('Export Growth', 'TRADE', 12.3, 10.1, '%', 'Rwanda Development Board', '2024-08-31'),
('Government Debt to GDP', 'FISCAL', 73.2, 71.8, '%', 'Ministry of Finance', '2024-06-30');