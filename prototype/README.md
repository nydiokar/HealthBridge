# AI GP Support System - Prototype

A prototype healthcare triage system for rural GP support, demonstrating citizen symptom submission, AI-supported triage, and GP dashboard functionality.

## 🎯   Scope

This prototype demonstrates:
- **Citizen Interface**: Web form for structured symptom capture
- **Triage Engine**: Rule-based classification (RED/YELLOW/GREEN)
- **GP Dashboard**: Case review and management interface
- **Authentication**: Role-based access (citizen/GP)

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Initialize Database

```bash
cd backend
npm run init-db
```

This creates the SQLite database with:
- Sample test cases
- Two test users:
  - `citizen1` / `citizen123` (Citizen role)
  - `gp1` / `gp123` (GP role)

### 3. Start Services

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3001

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```
App runs on http://localhost:3000

## 🔐 Test Users

### Citizen User
- **Username:** `citizen1`
- **Password:** `citizen123`
- **Access:** Symptom submission form

### GP User
- **Username:** `gp1`
- **Password:** `gp123`
- **Access:** Dashboard with case management

## 🧪 Testing Flow

1. **Login as Citizen** → Submit health concerns
2. **Login as GP** → Review triaged cases
3. **Verify triage logic** with different symptom combinations
4. **Test role-based access** (citizens can't access dashboard)

## 📊 Triage Rules (Current)

**RED (Emergency):**
- Fever > 38.5°C
- Pain level ≥ 8/10
- Keywords: chest pain, difficulty breathing, etc.

**YELLOW (Urgent):**
- Fever > 37.5°C
- Pain level 5-7/10
- Symptoms > 7 days
- Keywords: persistent cough, vomiting, etc.

**GREEN (Routine):**
- All other cases

## 🗂️ Project Structure

```
prototype/
├── backend/               # Node.js/Express API
│   ├── app.js            # Main server
│   ├── auth.js           # Authentication
│   ├── triage.js         # Classification logic
│   └── database.js       # SQLite utilities
├── frontend/             # React app
│   ├── src/components/   # React components
│   ├── src/App.js        # Main app
│   └── src/App.css       # Styling
├── database/             # SQLite database
└── docs/screenshots/     # Evidence 
```

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Current user info

### Cases (Citizens)
- `POST /api/submit-case` - Submit new case

### Cases (GPs)
- `GET /api/cases` - List cases (with filters)
- `GET /api/cases/:id` - Get case details
- `PATCH /api/cases/:id` - Update case status
- `GET /api/dashboard/stats` - Dashboard statistics

## 📝 Next Steps (TRL 6)

For operational pilot deployment:
- Replace rule-based triage with ML model
- Add offline synchronization
- Implement full security compliance (GDPR)
- Multi-language support (Bulgarian/English)
- Integration with existing EHR systems
- Production hosting and DevOps

## 🔍 Troubleshooting

**Database Issues:**
```bash
cd backend
rm ../database/prototype.db
npm run init-db
```

**Port Conflicts:**
- Backend: Change PORT in backend/app.js
- Frontend: Change proxy in frontend/package.json

**CORS Issues:**
- Ensure backend is running on port 3001
- Check proxy configuration in frontend/package.json