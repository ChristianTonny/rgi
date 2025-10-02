const crypto = require('crypto');
const db = require('../database/connection');

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Audit logging middleware
const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();
    
    // Capture request data
    const auditData = {
      user_id: req.user?.userId || null,
      action: action || `${req.method} ${req.route?.path || req.path}`,
      resource_type: req.route?.path?.split('/')[1] || 'unknown',
      resource_id: req.params.id || null,
      ip_address: req.ip || req.connection?.remoteAddress,
      user_agent: req.get('User-Agent'),
      request_method: req.method,
      request_url: req.originalUrl,
      request_body: req.method !== 'GET' ? JSON.stringify(req.body) : null
    };

    // Override res.send to capture response
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log the audit entry
      const finalAuditData = {
        ...auditData,
        response_status: res.statusCode,
        response_time: responseTime,
        success: res.statusCode < 400
      };

      // Async audit log (don't block the response)
      setImmediate(async () => {
        try {
          await db.create('audit_logs', {
            user_id: finalAuditData.user_id,
            action: finalAuditData.action,
            resource_type: finalAuditData.resource_type,
            resource_id: finalAuditData.resource_id,
            old_values: null, // Could be populated for UPDATE operations
            new_values: finalAuditData.request_body ? JSON.parse(finalAuditData.request_body) : null,
            ip_address: finalAuditData.ip_address,
            user_agent: finalAuditData.user_agent
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.set({
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential XSS characters
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Rate limiting by user
const userRateLimit = new Map();

const advancedRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.user?.userId || req.ip
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    if (!userRateLimit.has(key)) {
      userRateLimit.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRateLimit.get(key);
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    
    if (!skipSuccessfulRequests || res.statusCode >= 400) {
      // Only increment on errors if skipSuccessfulRequests is true
    }

    next();
  };
};

// Data masking for sensitive information
const maskSensitiveData = (data, sensitiveFields = ['password', 'ssn', 'email']) => {
  if (typeof data !== 'object' || data === null) return data;
  
  const masked = { ...data };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      if (typeof masked[field] === 'string') {
        masked[field] = '*'.repeat(masked[field].length);
      }
    }
  });
  
  return masked;
};

// Monitoring and alerting
const securityMonitor = {
  alerts: new Map(),
  
  async logSecurityEvent(event) {
    try {
      await db.create('system_logs', {
        level: 'WARN',
        message: `Security Event: ${event.type}`,
        component: 'security-monitor',
        metadata: event
      });

      // Check for patterns that might indicate an attack
      if (this.shouldAlert(event)) {
        await this.sendAlert(event);
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  },

  shouldAlert(event) {
    const key = `${event.type}_${event.source}`;
    const now = Date.now();
    
    if (!this.alerts.has(key)) {
      this.alerts.set(key, { count: 1, firstSeen: now });
      return false;
    }

    const alert = this.alerts.get(key);
    alert.count++;

    // Alert if we see 5+ similar events in 10 minutes
    if (alert.count >= 5 && (now - alert.firstSeen) < 10 * 60 * 1000) {
      return true;
    }

    return false;
  },

  async sendAlert(event) {
    console.error('🚨 SECURITY ALERT:', {
      type: event.type,
      source: event.source,
      details: event.details,
      timestamp: new Date()
    });

    // In production, integrate with alerting systems like PagerDuty, Slack, etc.
    try {
      await db.create('system_logs', {
        level: 'ERROR',
        message: `SECURITY ALERT: ${event.type}`,
        component: 'security-monitor',
        metadata: { ...event, alertSent: true }
      });
    } catch (error) {
      console.error('Failed to log security alert:', error);
    }
  }
};

// Security validation middleware
const validateSecurityRules = (req, res, next) => {
  const securityChecks = [
    {
      name: 'suspicious_patterns',
      check: (req) => {
        const suspiciousPatterns = [
          /\.\.\//g,  // Path traversal
          /<script/gi, // XSS
          /union\s+select/gi, // SQL injection
          /exec\s*\(/gi // Command injection
        ];
        
        const checkString = JSON.stringify({ 
          ...req.query, 
          ...req.body, 
          ...req.params 
        });
        
        return suspiciousPatterns.some(pattern => pattern.test(checkString));
      }
    },
    {
      name: 'unusual_size',
      check: (req) => {
        const maxSize = 1024 * 1024; // 1MB
        const contentLength = parseInt(req.get('content-length') || '0');
        return contentLength > maxSize;
      }
    },
    {
      name: 'invalid_content_type',
      check: (req) => {
        if (req.method === 'POST' || req.method === 'PUT') {
          const contentType = req.get('content-type') || '';
          const validTypes = ['application/json', 'application/x-www-form-urlencoded'];
          return !validTypes.some(type => contentType.includes(type));
        }
        return false;
      }
    }
  ];

  for (const check of securityChecks) {
    if (check.check(req)) {
      securityMonitor.logSecurityEvent({
        type: check.name,
        source: req.ip,
        details: {
          url: req.originalUrl,
          userAgent: req.get('User-Agent'),
          userId: req.user?.userId
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Security validation failed',
        code: 'SECURITY_VIOLATION'
      });
    }
  }

  next();
};

module.exports = {
  encrypt,
  decrypt,
  auditLogger,
  securityHeaders,
  sanitizeInput,
  advancedRateLimit,
  maskSensitiveData,
  securityMonitor,
  validateSecurityRules
};