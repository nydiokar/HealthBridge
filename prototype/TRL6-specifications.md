# AI GP Support System - TRL 6 Specifications

**Target**: Operational pilot deployment in 9 villages of Devetaki Plateau
**Timeline**: 9 months (Months 3-9 of SMART ERA programme)
**Users**: ≥3 GPs, 50+ residents, 3 municipalities

## 🎯 TRL 6 Definition

**"Technology demonstrated in relevant environment"**
- Real users in actual rural healthcare setting
- Integration with existing GP workflows
- Municipality-hosted infrastructure
- GDPR-compliant data handling
- Multi-language support (Bulgarian/English)
- Offline-capable for low connectivity areas

---

## 🏗️ System Architecture (Production)

### **Infrastructure Stack**

**Hosting & Deployment:**
- **Cloud Provider**: DigitalOcean (EU region - GDPR compliance)
- **Container Platform**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **SSL Certificates**: Let's Encrypt (automated renewal)
- **Backup Strategy**: Automated daily backups to separate region
- **Monitoring**: Prometheus + Grafana + AlertManager

**Database:**
- **Primary**: PostgreSQL 15+ (ACID compliance, better concurrency)
- **Session Store**: Redis (session management, caching)
- **Backup**: pg_dump + WAL archiving
- **Connection Pooling**: pgBouncer

**Security:**
- **Authentication**: Auth0 or custom JWT + refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Audit Logging**: All user actions logged
- **Vulnerability Scanning**: Snyk integrated in CI/CD

---

## 🎨 Frontend Architecture

### **Technology Stack**

**Framework & Build:**
```typescript
// Core Framework
- Next.js 14+ (React 18+)
- TypeScript 5+
- TailwindCSS + HeadlessUI
- React Hook Form + Zod validation
- React Query (TanStack Query v4)

// State Management
- Zustand (lightweight, TypeScript-first)
- React Context for auth state

// Internationalization
- next-i18next
- Bulgarian + English translations

// Offline Capabilities
- Service Workers (Workbox)
- IndexedDB for local storage
- Background sync for submissions
```

**UI Components:**
```typescript
// Component Library
- Radix UI primitives
- Custom design system components
- Accessibility-first (WCAG 2.1 AA)

// Icons & Assets
- Heroicons
- Custom medical iconography
- Optimized images (Next.js Image)

// Form Handling
- React Hook Form (performance)
- Zod schemas (validation)
- Error boundaries
```

**Progressive Web App (PWA):**
- Offline form completion
- Background sync when connection restored
- App-like experience on tablets
- Push notifications for GPs

### **Component Architecture**

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components with validation
│   ├── dashboard/       # GP dashboard components
│   └── layout/          # Layout and navigation
├── pages/              # Next.js pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── locales/            # Translation files
```

---

## 🔧 Backend Architecture

### **Technology Stack**

**Core Framework:**
```typescript
// API Framework
- Node.js 20 LTS
- TypeScript 5+
- Express.js + express-validator
- Helmet.js (security headers)
- Rate limiting (express-rate-limit)

// Database & ORM
- Prisma ORM (type-safe database access)
- PostgreSQL 15+
- Redis for caching/sessions

// Authentication & Authorization
- Passport.js strategies
- JWT tokens with refresh mechanism
- bcrypt for password hashing
- Role-based permissions

// File Handling
- Multer (file uploads)
- Sharp (image processing)
- AWS S3 (have free tier per project) or DigitalOcean Spaces
```

**API Architecture:**
```typescript
// RESTful API Design
- OpenAPI 3.0 specification
- Swagger documentation
- JSON API standard responses
- Comprehensive error handling

// Middleware Stack
- CORS configuration
- Request logging (Morgan)
- Compression (gzip)
- Request validation
- Authentication middleware
- Rate limiting per endpoint
```

### **Database Schema (Prisma)**

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  role      UserRole
  profile   Profile?
  cases     Case[]   @relation("SubmittedBy")
  reviews   Case[]   @relation("ReviewedBy")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Profile {
  id           String  @id @default(cuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
  firstName    String
  lastName     String
  phone        String?
  village      String?
  municipality String?
  language     String  @default("bg")

  @@map("profiles")
}

model Case {
  id             String      @id @default(cuid())
  caseId         String      @unique
  patientId      String
  symptoms       String
  duration       String
  fever          Boolean     @default(false)
  temperature    Float?
  painLevel      Int?
  allergies      String?
  triageLevel    TriageLevel
  triageReason   String
  status         CaseStatus  @default(PENDING)
  submittedBy    User        @relation("SubmittedBy", fields: [submittedById], references: [id])
  submittedById  String
  reviewedBy     User?       @relation("ReviewedBy", fields: [reviewedById], references: [id])
  reviewedById   String?
  notes          String?
  attachments    Attachment[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@map("cases")
}

model Attachment {
  id       String @id @default(cuid())
  caseId   String
  case     Case   @relation(fields: [caseId], references: [id])
  filename String
  url      String
  type     String
  size     Int

  @@map("attachments")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  resource  String
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("audit_logs")
}

enum UserRole {
  CITIZEN
  GP
  ADMIN
  MUNICIPALITY
}

enum TriageLevel {
  RED
  YELLOW
  GREEN
}

enum CaseStatus {
  PENDING
  REVIEWED
  IN_PROGRESS
  RESOLVED
  CANCELLED
}
```

---

## 🧠 AI/ML Triage Engine

### **Technology Stack**

**ML Framework:**
```python
# Core ML Stack
- Python 3.11+
- scikit-learn 1.3+ (classification models)
- pandas + numpy (data processing)
- NLTK/spaCy (text processing, Bulgarian support)
- FastAPI (ML API server)
- Pydantic (data validation)

# Model Training & Deployment
- MLflow (experiment tracking)
- Docker containers
- Model versioning
- A/B testing framework
```

**Classification Pipeline:**
```typescript
// Feature Engineering
- Text preprocessing (Bulgarian stemming)
- Symptom categorization
- Temporal features (duration encoding)
- Severity scoring algorithms
- Medical keyword extraction

// Model Ensemble
- Random Forest (baseline)
- Gradient Boosting (XGBoost)
- Logistic Regression (interpretability)
- Ensemble voting classifier

// Real-time API
- FastAPI endpoint
- Input validation
- Model prediction
- Confidence scoring
- Fallback to rule-based system
```

**Integration Architecture:**
```typescript
// Node.js ↔ Python Communication
- HTTP API calls to ML service
- Async/await pattern
- Error handling & fallbacks
- Performance monitoring
- Model accuracy tracking
```

---

## 📱 Mobile & Offline Capabilities

### **Progressive Web App Features**

```typescript
// Service Worker Configuration
- Cache-first strategy for static assets
- Network-first for dynamic data
- Background sync for form submissions
- Offline queue management
- Automatic updates

// Local Storage Strategy
- IndexedDB for form drafts
- Encrypted local case storage
- Sync conflict resolution
- Data compression
```

**Offline Functionality:**
- Complete form filling without internet
- Local validation and triage estimation
- Queue submissions for sync
- Offline GP case review (cached data)
- Sync indicators and conflict resolution

---

## 🌍 Internationalization (i18n)

### **Language Support**

**Bulgarian (Primary):**
```typescript
// Medical terminology
- Symptom translations
- Triage level descriptions
- Medical instructions
- Emergency guidance

// UI translations
- Form labels and validation
- Dashboard interface
- Error messages
- Help documentation
```

**English (Secondary):**
- Complete interface translation
- Medical terminology
- Administrator interface
- Technical documentation

**Implementation:**
```typescript
// Next.js i18n configuration
export default {
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    domains: [
      {
        domain: 'aigp.sevlievo.bg',
        defaultLocale: 'bg',
      }
    ]
  }
}
```

---

## 🔒 Security & Compliance

### **GDPR Compliance**

**Data Protection:**
```typescript
// Privacy by Design
- Minimal data collection
- Purpose limitation
- Data minimization
- Storage limitation
- Pseudonymization

// User Rights Implementation
- Right to access (data export)
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to portability
- Consent management
```

**Security Measures:**
```typescript
// Authentication Security
- Multi-factor authentication (optional)
- Password complexity requirements
- Account lockout policies
- Session timeout management
- Secure password reset

// Data Security
- End-to-end encryption for sensitive data
- Database encryption at rest
- Encrypted backups
- Secure file upload validation
- Input sanitization and validation

// Infrastructure Security
- VPN access for administrators
- Firewall rules and network segmentation
- Regular security updates
- Vulnerability scanning
- Intrusion detection
```

### **Medical Data Compliance**

**Healthcare Standards:**
- ISO 27001 alignment
- Medical device software guidelines
- Clinical governance frameworks
- Audit trails for all medical data access

---

## 🚀 DevOps & Deployment

### **CI/CD Pipeline**

```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:coverage
      - name: Security audit
        run: npm audit --audit-level high
      - name: Type checking
        run: npm run type-check
      - name: Linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

### **Infrastructure as Code**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.aigp.sevlievo.bg

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

---

## 📊 Monitoring & Analytics

### **Application Monitoring**

```typescript
// Performance Monitoring
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Performance metrics
- User experience monitoring
- Database query performance

// Health Checks
- System health endpoints
- Database connectivity
- External service status
- ML model availability
- Cache system status
```

### **Business Analytics** - 

```typescript
// Usage Analytics
- Case submission patterns
- Triage accuracy metrics
- GP response times
- User engagement metrics
- System performance KPIs

// Medical Analytics
- Symptom trend analysis
- Geographic health patterns
- Seasonal illness tracking
- Resource utilization
- Outcome measurements
```

---

## 🧪 Testing Strategy

### **Test Pyramid**

```typescript
// Unit Tests (70%)
- Component testing (React Testing Library)
- API endpoint testing (Jest + Supertest)
- Utility function testing
- Database model testing

// Integration Tests (20%)
- API integration tests
- Database integration
- External service mocking
- End-to-end workflows

// E2E Tests (10%)
- Critical user journeys
- Cross-browser testing
- Mobile device testing
- Performance testing
```

### **Test Tools**

```typescript
// Frontend Testing
- Jest (unit testing)
- React Testing Library
- Cypress (E2E testing)
- Storybook (component testing)
- Playwright (cross-browser)

// Backend Testing
- Jest (unit/integration)
- Supertest (API testing)
- TestContainers (database testing)
- Artillery (load testing)

// Quality Assurance
- ESLint + Prettier
- TypeScript strict mode
- SonarQube (code quality)
- Lighthouse (performance)
```

---

## 📈 Migration Strategy (  → TRL 6)

### **Phase 1: Infrastructure Setup (Month 3)**

1. **Environment Preparation**
   - Production server setup
   - Domain configuration (aigp.sevlievo.bg)
   - SSL certificate installation
   - Database migration from SQLite to PostgreSQL

2. **Security Implementation**
   - GDPR compliance audit
   - Security penetration testing
   - Data encryption implementation
   - Backup strategy deployment

### **Phase 2: Feature Enhancement (Months 4-5)**

1. **ML Triage Engine**
   - Data collection from prototype
   - Model training and validation
   - Integration with existing system
   - A/B testing setup

2. **Internationalization**
   - Bulgarian translation completion
   - Medical terminology validation
   - Cultural adaptation for rural users
   - Accessibility improvements

### **Phase 3: Pilot Deployment (Months 6-7)**

1. **Gradual Rollout**
   - Single village pilot
   - GP training and onboarding
   - Citizen education program
   - Feedback collection system

2. **Integration Testing**
   - Real-world usage testing
   - Performance optimization
   - Bug fixes and improvements
   - Documentation updates

### **Phase 4: Full Deployment (Months 8-9)**

1. **Scale to All Villages**
   - 9-village deployment
   - Multi-municipality coordination
   - 24/7 monitoring setup
   - Support team training

2. **Evaluation & Documentation**
   - KPI measurement
   - User satisfaction surveys
   - Technical documentation
   - Replication kit preparation


## 🎯 Success Metrics (KPIs)

### **Technical KPIs**
- System uptime: >99.5%
- Response time: <2 seconds
- Mobile compatibility: 100%
- Offline capability: 95% functionality
- Security incidents: 0

### **User Experience KPIs**
- User satisfaction: >4.5/5
- Task completion rate: >90%
- Error rate: <5%
- Training time: <2 hours per user
- Support tickets: <10 per month

### **Medical KPIs**
- Triage accuracy: >85%
- GP efficiency improvement: >30%
- Case processing time reduction: >50%
- Patient satisfaction: >4.0/5
- Emergency case detection: 100%

---

## 📚 Documentation Deliverables

### **Technical Documentation**
1. **System Architecture Document**
2. **API Documentation (OpenAPI)**
3. **Database Schema Documentation**
4. **Deployment Guide**
5. **Security & GDPR Compliance Report**

### **User Documentation**
1. **Citizen User Manual (Bulgarian)**
2. **GP User Manual (Bulgarian/English)**
3. **Administrator Guide**
4. **Training Materials**
5. **Troubleshooting Guide**

### **Replication Kit**
1. **Installation Scripts**
2. **Configuration Templates**
3. **Data Migration Tools**
4. **Testing Procedures**
5. **Scaling Guidelines**

---

## 🔄 Post-TRL 6 Roadmap

### **TRL 7-8: System Integration**
- Integration with national health systems
- Electronic Health Record (EHR) connectivity
- Telemedicine platform integration
- Multi-region deployment

### **TRL 9: Commercial Deployment**
- SaaS platform development
- White-label solutions
- International market expansion
- Enterprise features

---

This comprehensive TRL 6 specification provides a complete roadmap for transforming the working prototype into a production-ready system suitable for real-world deployment in the Devetaki Plateau pilot program.