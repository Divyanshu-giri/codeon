# Phase 4 Implementation Roadmap - Remaining Features

## Overview

This document outlines the planned implementation for the remaining Phase 4 security features:
- Part 2: Rate Limiting
- Part 3: Audit Logging
- Part 4: Data Encryption

---

## Part 2: Rate Limiting

### Purpose
Prevent API abuse and DDoS attacks by limiting the number of requests per user/IP address.

### Implementation Plan

#### 1. Install Dependencies
```bash
npm install express-rate-limit redis ioredis
```

#### 2. Create Rate Limit Middleware (`backend/middleware/rateLimit.js`)

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({ 
  host: 'localhost', 
  port: 6379 
});

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

module.exports = { limiter, authLimiter };
```

#### 3. Apply Middleware in `backend/server.js`

```javascript
const { limiter, authLimiter } = require('./middleware/rateLimit');

// Apply general rate limiting
app.use(limiter);

// Apply strict rate limiting on auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

#### 4. Testing Rate Limit

```bash
# Test endpoint - should work for first 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done

# After 5 attempts: 429 Too Many Requests
```

### Expected Behavior
- ✅ User can make 100 requests per 15 minutes
- ✅ Login attempts limited to 5 per 15 minutes
- ✅ Returns 429 (Too Many Requests) when exceeded
- ✅ Includes `Retry-After` header

---

## Part 3: Audit Logging

### Purpose
Track all user activities for security monitoring and compliance.

### Implementation Plan

#### 1. Create Audit Log Model (`backend/models/AuditLog.js`)

```javascript
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: [
      'LOGIN',
      'REGISTER',
      'LOGOUT',
      'FILE_SAVE',
      'FILE_DELETE',
      'PROJECT_CREATE',
      'PROJECT_DELETE',
      'FILE_OPEN',
      'TERMINAL_EXECUTE',
    ],
    required: true,
  },
  resource: {
    type: String, // File ID, Project ID, etc.
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS',
  },
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
```

#### 2. Create Audit Service (`backend/services/auditService.js`)

```javascript
const AuditLog = require('../models/AuditLog');

class AuditService {
  static async log(userId, action, resource, request, status = 'SUCCESS', details = {}) {
    try {
      const auditLog = new AuditLog({
        userId,
        action,
        resource,
        ipAddress: request.ip,
        userAgent: request.get('user-agent'),
        status,
        details,
      });
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  static async getUserLogs(userId, limit = 50) {
    return AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username email');
  }

  static async getActionLogs(action, limit = 50) {
    return AuditLog.find({ action })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username email');
  }

  static async getSuspiciousActivity(hoursBack = 24) {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return AuditLog.find({
      status: 'FAILURE',
      timestamp: { $gte: since },
    })
      .sort({ timestamp: -1 })
      .populate('userId', 'username email');
  }
}

module.exports = AuditService;
```

#### 3. Update Routes to Log Activities

```javascript
// In backend/routes/auth.js
const AuditService = require('../services/auditService');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      // Log failed attempt
      await AuditService.log(
        null,
        'LOGIN',
        email,
        req,
        'FAILURE',
        { reason: 'Invalid credentials' }
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Log successful login
    user.lastLogin = new Date();
    await user.save();
    
    await AuditService.log(
      user._id,
      'LOGIN',
      user._id.toString(),
      req,
      'SUCCESS'
    );

    // ... return tokens
  } catch (err) {
    await AuditService.log(
      null,
      'LOGIN',
      req.body.email,
      req,
      'FAILURE',
      { error: err.message }
    );
  }
});
```

#### 4. Create Admin Dashboard Endpoint

```javascript
// In backend/routes/admin.js
router.get('/audit-logs/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await AuditService.getUserLogs(req.params.userId, 100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suspicious-activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const suspicious = await AuditService.getSuspiciousActivity(24);
    res.json(suspicious);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Events to Log
- ✅ User registration and login
- ✅ File save/delete operations
- ✅ Project creation/deletion
- ✅ Terminal code execution
- ✅ Failed authentication attempts
- ✅ Access errors (403, 401)
- ✅ Admin actions

---

## Part 4: Data Encryption

### Purpose
Protect sensitive data at rest and in transit.

### Implementation Plan

#### 1. Install Encryption Library
```bash
npm install crypto-js dotenv
```

#### 2. Create Encryption Service (`backend/services/encryptionService.js`)

```javascript
const crypto = require('crypto');

class EncryptionService {
  static encrypt(plaintext, encryptionKey = process.env.ENCRYPTION_KEY) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(ciphertext, encryptionKey = process.env.ENCRYPTION_KEY) {
    const [ivHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = EncryptionService;
```

#### 3. Update File Model to Encrypt Content

```javascript
// backend/models/File.js
const EncryptionService = require('../services/encryptionService');

FileSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.content = EncryptionService.encrypt(this.content);
    this._isEncrypted = true;
  }
  next();
});

FileSchema.post('findOne', function(doc) {
  if (doc && doc.content) {
    doc.content = EncryptionService.decrypt(doc.content);
  }
});
```

#### 4. Update .env with Encryption Key
```env
ENCRYPTION_KEY=your-super-secret-encryption-key-min-16-chars
```

### What Gets Encrypted
- ✅ File contents in database
- ✅ Sensitive user data (optional)
- ✅ Project descriptions (optional)
- ✅ All data encrypted at rest
- ✅ HTTPS for data in transit

---

## Integration Timeline

### Week 1: Rate Limiting
- Install Redis
- Implement rate limit middleware
- Add to auth and API routes
- Test with load testing tools

### Week 2: Audit Logging
- Create audit log schema
- Implement audit service
- Update routes to log activities
- Create admin dashboard

### Week 3: Data Encryption
- Implement encryption service
- Encrypt file contents
- Add encryption key management
- Test encryption/decryption flows

---

## Security Checklist

- [ ] Rate limiting prevents brute force attacks
- [ ] Audit logs record all suspicious activities
- [ ] Data encryption protects against unauthorized access
- [ ] Encryption keys managed securely (not in git)
- [ ] HTTPS enabled for transit encryption
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented
- [ ] Admin dashboard for monitoring

---

## Testing Strategy

### Rate Limiting Tests
```bash
# Simulate 100+ requests
ab -n 150 -c 10 http://localhost:5000/api/health
```

### Audit Logging Tests
```bash
# Monitor logs as you use the app
curl http://localhost:5000/api/admin/audit-logs/USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Encryption Tests
```javascript
// Test encryption/decryption
const EncryptionService = require('./services/encryptionService');
const plaintext = "Hello, World!";
const encrypted = EncryptionService.encrypt(plaintext);
const decrypted = EncryptionService.decrypt(encrypted);
console.assert(plaintext === decrypted, 'Encryption failed');
```

---

## Future Enhancements

- OAuth 2.0 social login integration
- Two-factor authentication (TOTP)
- Email verification workflow
- Password reset via email
- Session management dashboard
- Device tracking and management
- Biometric authentication support
- Security event webhooks

---

## Deployment Production Checklist

- [ ] All JWT secrets changed from defaults
- [ ] Encryption key stored in secure vault (AWS Secrets Manager, etc.)
- [ ] Redis configured with password authentication
- [ ] Database backups automated
- [ ] Monitor rate limiting effectiveness
- [ ] Review audit logs regularly
- [ ] Set up alerts for suspicious activities
- [ ] HTTPS certificates valid and renewed
- [ ] CORS properly configured for production domain
- [ ] All environment variables secured

---

**Last Updated**: February 19, 2026
**Next Review**: After Part 2 (Rate Limiting) completion
