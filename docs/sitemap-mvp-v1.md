# Kora Compliance Platform - MVP Sitemap v1.0

**Date:** 30 November 2025  
**Scope:** Phase 1 MVP (6 weeks)  
**Status:** Navigation structure for development

---

## 🔐 PUBLIC ROUTES (No Authentication)
```
/
├── /login                          [Email + password login]
│
└── /share/[token]                  [RP View - Public access via share link]
    ├── Overview                    [AP compliance summary - US-009]
    │   ├── Organisation credentials (insurance, registration)
    │   ├── Worker list with compliance status
    │   ├── Traffic light breakdown
    │   └── Filters: All | Compliant | Expiring | Non-compliant
    │
    └── /share/[token]/worker/[id]  [Worker detail - US-010]
        ├── Worker header (name, role, status)
        ├── Credentials by category (screening, quals, training)
        ├── View/download evidence
        └── [Back to AP Summary]
```

---

## 🔒 AUTHENTICATED ROUTES (AP Admin Only)
```
/
├── /dashboard                      [AP Control Center - US-001]
│   ├── Organisation compliance section
│   │   ├── Insurance status (Prof. Indemnity, Public Liability)
│   │   └── Business registration
│   │
│   ├── Workforce compliance section
│   │   ├── Overall stats (8/10 compliant)
│   │   ├── Traffic light breakdown (🟢🟡🔴)
│   │   └── Expiry alerts (30/60/90 days)
│   │
│   ├── Worker list with "Shared with X RPs" badges
│   │   └── Priority sorting by blast radius
│   │
│   └── Quick actions
│       ├── [Add Worker] → /workers/add
│       ├── [Share with RP] → Share link modal
│       └── [Manage Organisation Docs] → /settings
│
├── /workers                        [Workers List - Issue #10]
│   ├── Table: Name | Role | Compliance % | Actions
│   ├── Filter by: All | Compliant | At Risk | Non-compliant
│   ├── [Add Worker] → /workers/add
│   └── [Worker Name] → /workers/[id]
│
├── /workers/add                    [Add Worker Form - US-002]
│   ├── Form: Name, Role, Email, Phone
│   ├── [Save] → /workers/[id]
│   └── [Cancel] → /workers
│
├── /workers/[id]                   [Worker Detail - US-004]
│   ├── Worker header (name, role, status, "Shared with X RPs")
│   │
│   ├── Compliance checklist (grouped by category)
│   │   ├── SCREENING (Police/NDIS, International Crim History, etc.)
│   │   ├── QUALIFICATIONS (Cert III, AHPRA, etc.)
│   │   ├── TRAINING (CPR, SIRS, Infection Control, etc.)
│   │   └── CORE COMPETENCIES (4 training areas)
│   │
│   ├── Actions
│   │   ├── [Add Credential] → Credential upload modal - US-003
│   │   ├── [🤖 Check Compliance with AI] → AI summary (Issue #18)
│   │   ├── [Share with RP] → Share link modal
│   │   └── [Back to Workers] → /workers
│   │
│   └── MODALS
│       ├── Add Credential Modal - US-003
│       │   ├── Credential type dropdown
│       │   ├── Issue date picker
│       │   ├── Expiry date picker
│       │   ├── File upload (PDF/image, max 5MB)
│       │   └── [Upload] → Updates checklist
│       │
│       └── Share Link Modal - US-008
│           ├── Shows existing link or "Generate New Link"
│           ├── [Copy to Clipboard]
│           └── Link preview
│
└── /settings                       [Organisation Settings - US-015]
    ├── Organisation details
    │   ├── Name (editable)
    │   └── ABN (editable)
    │
    ├── Organisation Documents
    │   ├── Professional Indemnity Insurance
    │   │   ├── Upload certificate
    │   │   ├── Coverage amount, Policy #, Expiry
    │   │   └── Status: 🟢🟡🔴⚪
    │   │
    │   ├── Public Liability Insurance
    │   │   └── (same fields)
    │   │
    │   ├── Workers Compensation Insurance
    │   │   └── (same fields)
    │   │
    │   └── Business Registration
    │       ├── ABN verification document
    │       └── No expiry
    │
    └── [Back to Dashboard] → /dashboard
```

---

## 🚫 OUT OF SCOPE (Phase 2+)
```
NOT BUILDING FOR MVP:
├── /settings/users                 [User management - Phase 2]
├── /settings/billing               [Subscription management - Phase 3]
├── /reports                        [Analytics dashboard - Phase 3]
├── /directory                      [AP Directory search - Phase 2]
└── /rp/dashboard                   [RP Multi-AP dashboard - Phase 2]
```

---

## 📊 USER FLOWS (Key Paths)

### **Flow 1: AP Onboards New Worker**
```
/dashboard 
  → [Add Worker] 
  → /workers/add (fill form)
  → [Save] 
  → /workers/[id] (see empty checklist)
  → [Add Credential] (modal)
  → Upload credential
  → Checklist updates (🟢/🟡/🔴/⚪)
  → Repeat for all 11 mandatory credentials
```

### **Flow 2: AP Shares with RP**
```
/dashboard 
  → [Share with RP] 
  → Share Link Modal
  → [Generate Link / Copy Link]
  → Email/message link to RP
```

### **Flow 3: RP Verifies AP Compliance**
```
Receive link via email
  → /share/[token] (no login required)
  → View org credentials (insurance, registration)
  → View worker list (compliance %)
  → Click worker name
  → /share/[token]/worker/[id]
  → View credentials & evidence
  → [Download Certificate]
  → [Back to AP Summary]
```

### **Flow 4: AP Uploads Organisation Credentials**
```
/dashboard 
  → [Manage Organisation Docs] 
  → /settings
  → Upload insurance certificates
  → Fill coverage amount, expiry
  → [Save]
  → Returns to dashboard (org status now 🟢)
```

### **Flow 5: AP Monitors Expiring Credentials (Blast Radius)**
```
/dashboard
  → See alert: "⚠️ Jane's CPR expires in 45 days - affects 3 RPs"
  → Click Jane's name
  → /workers/[id]
  → [Add Credential] (upload renewed CPR)
  → Checklist updates
  → All 3 RPs see update via share link
```

---

## 🗂️ FILE STRUCTURE MAPPING
```
app/
├── login/
│   └── page.tsx                    → /login
│
├── dashboard/
│   └── page.tsx                    → /dashboard (US-001)
│
├── workers/
│   ├── page.tsx                    → /workers (list)
│   ├── add/
│   │   └── page.tsx                → /workers/add (US-002)
│   └── [id]/
│       └── page.tsx                → /workers/[id] (US-004)
│
├── settings/
│   └── page.tsx                    → /settings (US-015)
│
├── share/
│   └── [token]/
│       ├── page.tsx                → /share/[token] (US-009)
│       └── worker/
│           └── [id]/
│               └── page.tsx        → /share/[token]/worker/[id] (US-010)
│
└── api/
    ├── analyse-worker/
    │   └── route.ts                → AI compliance check (Issue #18)
    └── (other API routes as needed)
```

---

## 📝 NAVIGATION COMPONENTS

### **AP Navigation (Authenticated)**
```
Header:
├── Logo → /dashboard
├── Workers → /workers
├── Settings → /settings
└── Logout
```

### **RP Navigation (Public)**
```
Header (minimal):
├── AP Name (static)
└── "Powered by Kora Compliance"
```

---

## 🔄 STATE MANAGEMENT

**Key app states:**
- Current user (AP admin)
- Current organisation
- Current worker (when viewing worker detail)
- Share link token (when RP viewing)
- Loading states
- Error states

**No global state management needed for MVP** - use Next.js server components and server actions.

---

## 🎯 NAVIGATION PRINCIPLES

1. **Maximum 3 clicks** to any destination
2. **Always show "Back" links** for drilldowns
3. **Breadcrumbs not needed** (shallow hierarchy)
4. **Mobile-first** navigation (hamburger menu if needed)
5. **RP views have no navigation** (single-purpose pages)

---

## ✅ DEFINITION OF DONE

This sitemap is complete when:
- [x] All P1 user story pages mapped
- [x] User flows documented (5 key paths)
- [x] File structure alignment shown
- [x] Phase 2 scope clearly separated
- [x] Committed to repo

---

**Ready for development!** 🚀