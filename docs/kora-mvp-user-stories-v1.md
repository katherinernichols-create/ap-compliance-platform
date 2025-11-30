# Kora Compliance Platform - MVP User Stories v1.0
## Shared Compliance Infrastructure for Aged Care

**Date:** 30 November 2025  
**Version:** 1.0 (Production-Ready)  
**Status:** Production-Ready for Development  
**Demo Target:** January 2026 (6 weeks part-time, ~60 hours)  
**Demo Audience:** APs, Investors  
**Success Metric:** Prove dual value prop (AP efficiency + RP risk prevention)

***

## 🎯 STRATEGIC CONTEXT

### The Systemic Problem
The aged care sector faces significant infrastructure inefficiencies:
- **APs:** Managing compliance in spreadsheets, uploading same documents to multiple RPs, 15-30 min per request, reactive updates only
- **RPs:** Building duplicate systems to manage AP data ($50K+ each), relying on stat decs instead of evidence, discovering non-compliance AFTER Commission becomes aware
- **The Domino Risk:** Commission identifies AP non-compliance with one RP via GPMS → checks data, sees AP works with multiple RPs → 5 RPs receive enforcement notices simultaneously → RPs were "last to know"
- **The Outcome:** Small APs face unsustainable admin burden, RPs reduce AP engagement due to risk, sector efficiency decreases

### The Solution: Shared Compliance Infrastructure
**Upload once, share forever.** Platform becomes the single source of truth that both APs and RPs (and eventually Commission) can trust.

### Network Effects:
1. More APs → More verified workers → RPs have choice
2. More RPs → APs save more time per upload → Higher compliance ROI
3. Both improve → Sector resilience → Commission sees proactive compliance

***

## 📋 UPDATED DEMO NARRATIVE (12 Minutes)

### Act 1: The Domino Risk (3 min)
**Show:** Commission enforcement letter:
> "During audit of Northern Home Care, we identified non-compliant worker from Sunshine Care AP. GPMS shows Sunshine also services Coastal Residential, Western Aged Services. Provide compliance evidence within 7 days."

**RP's reaction:** "I had no idea Sunshine had expired credentials - they never told us. Are they even properly insured?"

**The gap:** Siloed compliance = RPs blind to worker AND organisation risks

### Act 2: The Infrastructure Solution (7 min)
**Demo flow:**
1. **AP Setup (2 min)**
   - Sunshine Care uploads organisation insurance certificates (Professional Indemnity, Public Liability)
   - Adds 10 workers with complete credential checklists (Police/NDIS, CPR, training records)
   - System shows 8/10 workers fully compliant

2. **Proactive Risk Management (2 min)**
   - Dashboard highlights: "Jane's CPR expires in 45 days - shared with 3 RPs"
   - Upload renewed CPR certificate → Old one marked as superseded
   - All 3 RPs see update instantly (no emails needed)

3. **RP Verification (3 min)**
   - Generate share link, send to Coastal Residential
   - RP clicks link (no login) → sees AP compliance summary
   - Views organisation insurance status ✅
   - Views Jane's worker profile ✅
   - Downloads Police Check PDF for audit file
   - **Total verification time: 2 minutes (vs 2 days)**

### Act 3: The Scale Vision (2 min)
**Show mockup:** RP dashboard managing 10 APs

**Investor hook:**
- "Eliminate duplicate infrastructure costs across the sector"
- "Network effects: Value increases as more participants join"
- "Clear path to Commission integration (become trusted GPMS data source)"
- "Realistic pricing: $10/worker/month × 100K workers = $12M ARR at 10% market penetration"

***

## 🏗️ MVP BUILD SCOPE (6 Weeks, ~60 Hours)

### ✅ MUST BUILD (P1 - Core Demo Features)
**These MUST work in live demo:**
- US-002: Add Worker with Complete Checklist (6h)
- US-003: Upload Credential with Evidence (10h)
- US-004: Worker Detail with Full Compliance View (7h)
- US-015: AP Upload Organisation Credentials (4h) **NEW**
- US-008: Generate Shareable Link (7h)
- US-009: RP View AP Compliance Summary (10h)
- US-010: RP View Worker Details (5h)
- US-001: AP Compliance Dashboard with Blast Radius (8h) **PROMOTED TO P1**

**Total P1:** 57 hours

### 📝 DESCRIBE ONLY (Future Features)
**Mention in demo, don't build:**
- US-014: RP Multi-AP Dashboard (Phase 2 - too complex for MVP)
- US-012: AP Directory Search
- US-013: RP Access Requests
- Worker self-service portal
- Email notifications
- Commission API integration

### 🔧 POLISH TASKS (3 hours buffer)
- Demo data seeding
- Bug fixes
- UI polish
- Security review

***

## 1. AP ADMIN STORIES

### US-001: AP Compliance Dashboard (Control Center) **[UPDATED - PROMOTED TO P1]**
**Priority:** P1 - Must Build Week 5  
**Demo Impact:** HIGH - Shows "blast radius" value prop  
**Build Time:** 8 hours

**As an** AP Admin  
**I want to** see a compliance dashboard showing my workforce status, organisation credentials status, and which workers are shared across multiple RPs  
**So that** I can prioritize credential updates by "blast radius" and prevent domino regulatory action

**Background:**
Current state: Spreadsheet tracking, discover issues when RP asks. New state: Proactive visibility, prioritize by impact (1 worker = 3 RPs at risk).

**Acceptance Criteria:**
- [ ] **Organisation Compliance Section:**
  - Shows organisation name prominently
  - Organisation document status: Professional Indemnity (🟢🟡🔴), Public Liability (🟢🟡🔴), Business Registration (✅❌)
  - Alert if any org credential expired: "⚠️ Professional Indemnity expires in 30 days"
  - "Manage Organisation Documents" link → US-015 page

- [ ] **Workforce Compliance Section:**
  - Total worker count and overall compliance rate (e.g., "8/10 workers fully compliant (80%)")
  - Traffic light breakdown: 🟢 Compliant (100%), 🟡 Expiring Soon (<90 days), 🔴 Non-Compliant
  - Count of credentials expiring in next 30/60/90 days

- [ ] **Blast Radius Awareness (NEW - CRITICAL FOR DEMO):**
  - Worker list shows "Shared with X RPs" badge next to each worker
  - Clicking badge shows tooltip: "Coastal Residential, Northern Home Care, Western Aged Services"
  - Priority sorting: Workers shared with most RPs appear first in "Needing Action" list
  - Priority alerts: "⚠️ Jane's CPR expires in 45 days - affects 3 RPs: Coastal, Northern, Western"

- [ ] **Quick Actions:**
  - "Workers Needing Action" (sorted by blast radius first)
  - "Add Worker" button
  - "Share with RP" button
  - "Manage Organisation Docs" link

- [ ] Performance: Loads in under 2 seconds
- [ ] Mobile-responsive

**Out of Scope (MVP):**
- Historical trends/graphs
- Automated email alerts (describe as Phase 2)
- Exportable PDF reports
- Calendar view of upcoming expiries

**Technical Notes:**
- Query `workers` table filtered by `organisation_id`
- Join `worker_credentials` to calculate status per compliance rules
- Count RPs: Query `sharing_links` table, count distinct tokens (assumes 1 token = 1 RP for MVP)
  - FUTURE (Phase 2): Join to `rp_ap_links` for accurate RP count
- Organisation status: Query `organisation_credentials` table (new - see US-015)
- Status logic:
  - Expired = `expiry_date < NOW()`
  - Expiring = `expiry_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'`
  - Compliant = all mandatory credentials valid
- Blast radius calculation: For each credential expiring/expired, count how many share links exist for that worker

**Demo Script:**
> "I log into Sunshine Care's dashboard. First thing I see: our Professional Indemnity Insurance expires in 60 days - I need to renew that. Below, I see 2 workers need attention. Jane's CPR expires in 45 days, and the system tells me this affects 3 RPs - Coastal, Northern, and Western. If I let this expire, all 3 get flagged by the Commission. I prioritize Jane over Bob who only works with 1 RP. This is the 'blast radius' awareness that prevents domino regulatory action."

***

### US-002: Create New Worker Profile **[UPDATED - COMPLETE CHECKLIST]**
**Priority:** P1 - Must Build Week 1  
**Demo Impact:** MEDIUM - Foundational workflow  
**Build Time:** 6 hours (increased from 5h)

**As an** AP Admin  
**I want to** quickly add a new worker and see their complete mandatory compliance checklist based on their role  
**So that** I can begin tracking credentials immediately and know exactly what evidence I need to collect before they can work

**Background:**
APs onboard 1-5 workers/month. Need fast entry, COMPLETE checklist showing all 17 mandatory requirements from evidence doc v1.0.

**Acceptance Criteria:**
- [ ] "Add Worker" button visible on Dashboard and Workers List
- [ ] Form fields:
  - Name (required, min 2 chars)
  - Role (dropdown: Care Worker, Registered Nurse, Allied Health Professional, Other)
  - Email (optional, email validation)
  - Phone (optional)
  - Status (default: active)

- [ ] **COMPLETE CHECKLIST - Based on Evidence Doc v1.0:**
  After save, redirects to Worker Detail showing:
  
  **SCREENING (Mandatory for All):**
  - ⚪ Police Check (3-year validity) **OR** NDIS Clearance (5-year validity) - *Worker needs ONE of these*
  - ⚪ International Criminal History Declaration *(if worker lived overseas since age 16)*
  - ⚪ Working with Children Check *(if working with minors - state/territory specific)*
  - ⚪ Working with Vulnerable People Card *(if in TAS/ACT)*
  
  **QUALIFICATIONS (Role-Specific):**
  - Care Worker: ⚪ Certificate III in Individual Support (or equivalent)
  - Registered Nurse: ⚪ AHPRA Registration (annual renewal)
  - Allied Health: ⚪ Professional Registration (varies by profession)
  
  **MANDATORY TRAINING (All Roles):**
  - ⚪ Current CPR Certification (12-month validity)
  - ⚪ Code of Conduct Training (annual)
  - ⚪ SIRS Training (annual)
  - ⚪ Infection Control Training (annual)
  - ⚪ Manual Handling Training (annual)
  
  **CORE COMPETENCIES (Quality Standard 2.9.6):**
  - ⚪ Person-centred, rights-based care training
  - ⚪ Culturally safe, trauma-aware care training
  - ⚪ Dementia care training
  - ⚪ Medical emergency response training

- [ ] Each checklist item shows:
  - Credential name
  - Status: ⚪ Missing, 🟢 Valid, 🟡 Expiring Soon, 🔴 Expired
  - "Add" button (links to US-003 with pre-selected type)
  - Validity period in parentheses (e.g., "CPR (12 months)")

- [ ] Success message: "Worker added successfully - complete checklist to enable service delivery"
- [ ] Error handling: Validation errors inline, database failures gracefully handled

**Out of Scope (MVP):**
- Bulk CSV import (Phase 2)
- Photo upload (Phase 3)
- Duplicate detection
- Email notification to worker
- ABN/TFN fields

**Technical Notes:**
- Insert into `workers` table with `organisation_id` from authenticated user
- Default `status` = 'active'
- Checklist generation:
  1. Query ALL `credential_types` WHERE `is_mandatory_for_all` = true
  2. Add role-specific types based on `required_role_tag` matching worker's role
  3. Mark all as "Missing" status initially
- **Mutual Exclusivity Logic:** Police Check and NDIS are alternatives - worker needs ONE, not both
  - UI shows: "Police Check OR NDIS Clearance (choose one)"
  - Both options shown in dropdown but validation ensures only one uploaded
- RLS: User can only add workers to their own organisation

**Demo Script:**
> "I just hired Jane Smith as a Care Worker. I add her in 30 seconds. The system shows me the complete checklist: she needs either a Police Check OR NDIS clearance, plus CPR, Code of Conduct, SIRS, Infection Control, Manual Handling, Cert III qualification, and 4 core competency trainings. That's 11 items total. I can see exactly what to collect before her first shift. No guessing, no missing requirements."

***

### US-003: Upload Credential with Evidence Document **[UPDATED - RENEWAL LOGIC]**
**Priority:** P1 - Must Build Week 1-2  
**Demo Impact:** HIGH - Core "upload once" value prop  
**Build Time:** 10 hours (increased from 8h - includes Storage setup)

**As an** AP Admin  
**I want to** upload a credential certificate (PDF/image) with issue and expiry dates, and replace expired credentials with renewed ones  
**So that** I have verifiable evidence I can share with multiple RPs without re-uploading

**Background:**
Workers provide certificates via email/hardcopy. AP scans and uploads once. Current state: Email same PDF to 5 RPs separately. New state: Upload once, share forever. When credentials renew, update once, all RPs see new version.

**Acceptance Criteria:**
- [ ] **Initial Upload:**
  - Accessible from Worker Detail via "Add Credential" button
  - Credential type dropdown populated from `credential_types` table
  - For "Screening" category, show note: "Police Check OR NDIS - choose one"
  - Issue date picker (required, cannot be future date)
  - Expiry date picker (optional for permanent credentials like Cert III)
  - File upload: Accepts PDF, JPG, PNG, max 5MB
  - Upload progress indicator shown
  - Filename displayed after successful upload

- [ ] **Status Calculation:**
  - Status auto-calculated after upload:
    - 🟢 Valid: `expiry_date > NOW() + 90 days` (or no expiry date)
    - 🟡 Expiring Soon: `expiry_date BETWEEN NOW() AND NOW() + 90 days`
    - 🔴 Expired: `expiry_date < NOW()`
  - Success message: "Credential added successfully - [Status]"

- [ ] **Checklist Integration:**
  - Credential appears immediately in worker's checklist with status badge
  - Evidence document shows "View Evidence" link
  - Clicking opens document in new tab (PDF) or downloads (images)

- [ ] **Police Check OR NDIS Logic:**
  - If worker has Police Check, NDIS dropdown option shows "(Alternative - use if replacing Police Check)"
  - If worker has NDIS, Police Check dropdown shows same note
  - Both can exist, but system prioritizes most recent/longest validity for compliance calculation

**Out of Scope (MVP - Document for Phase 2):**
- ❌ **Renewal/Replacement Workflow:**
  - For MVP: To renew, delete old credential, upload new one
  - Phase 2: "Update/Renew" button that:
    - Marks old credential as `status = 'superseded'`
    - Creates new credential linked to old via `replaces_credential_id`
    - Maintains version history for audits
- ❌ Multiple files per credential (Phase 2)
- ❌ OCR to auto-extract dates from certificates (Phase 3)
- ❌ Drag-and-drop upload (Phase 2)
- ❌ Certificate number field (Phase 2)

**Out of Scope (Different Credential Type):**
- ❌ **Statutory Declarations** (International Criminal History):
  - For MVP: Upload scan of signed declaration as PDF
  - Phase 2: Build form within platform for workers to complete and e-sign
  - Treat as regular credential upload for MVP

**Technical Notes:**
- **PREREQUISITE:** Issue #26 (Supabase Storage) must be completed first
- Insert into `worker_credentials` table:
  - `worker_id` (FK)
  - `credential_type_id` (FK)
  - `issue_date`
  - `expiry_date` (nullable)
  - `evidence_url` (Supabase Storage path)
  - `status` (calculated)
  - `created_at`, `updated_at`

- **Storage Strategy:**
  - Bucket: `worker-credentials` (private)
  - Path: `{org_id}/{worker_id}/{credential_type_id}/{timestamp}-{filename}`
  - Store path in `evidence_url` column
  - Generate signed URLs (24-hour expiry) for downloads

- **RLS Policies:**
  - AP: Full CRUD on own organisation's credentials
  - RP: Read-only access via valid share token
  - Signed URLs: Temporary access for document viewing/downloading

- **Mutual Exclusivity Check:**
  - Before calculating overall compliance, check if worker has EITHER Police Check OR NDIS
  - Use most recent or longest-validity credential for status
  - Both marked as valid → use longest expiry for compliance

**Demo Script:**
> "Jane just gave me her Police Check certificate. I upload the PDF - takes 10 seconds. The system reads the issue date and expiry, calculates it's valid for 2.5 more years, marks it green. Now when I share Jane with 3 RPs, they all see this document. When Jane renews her Police Check in 2027, I'll delete this old one and upload the new one - takes another 10 seconds. All 3 RPs see the update instantly. I never email the same PDF twice."

***

### US-004: View Worker Compliance Detail **[UPDATED - FULL VIEW]**
**Priority:** P1 - Must Build Week 2  
**Demo Impact:** MEDIUM - Shows checklist completeness  
**Build Time:** 7 hours (increased from 6h)

**As an** AP Admin  
**I want to** see a worker's complete compliance checklist with status of each credential, including organisation-level readiness  
**So that** I know exactly what's missing, what's expiring, can show proof to RPs, and ensure my organisation is also compliant

**Background:**
Worker detail page is the "source of truth" for both worker AND organisation compliance. When RP queries eligibility, AP uses this view to verify complete readiness.

**Acceptance Criteria:**
- [ ] **Worker Header:**
  - Shows worker name, role, email, phone
  - Overall worker status badge: 🟢 Fully Compliant, 🟡 Action Needed, 🔴 Non-Compliant
  - "Shared with X RPs" badge (clickable to see which RPs)

- [ ] **Compliance Checklist - Grouped by Category:**
  
  **SCREENING:**
  - Each screening credential with status (🟢🟡🔴⚪)
  - Police Check OR NDIS: Show which one worker has, with note "Alternative: [other option]"
  - International Criminal History Declaration (if applicable)
  - Working with Children Check (if applicable)
  - Working with Vulnerable People (if in TAS/ACT)
  
  **QUALIFICATIONS:**
  - Role-specific qualification (Cert III, AHPRA, etc.)
  - Shows issue date, expiry date (or "No expiry")
  - Evidence icon: 🟢 Uploaded, ⚪ Missing
  
  **TRAINING:**
  - CPR, Code of Conduct, SIRS, Infection Control, Manual Handling
  - Each shows issue, expiry, status, evidence
  
  **CORE COMPETENCIES:**
  - Person-centred care, Culturally safe care, Dementia care, Medical emergency
  - Evidence checkmarks

- [ ] **Missing Credentials Section:**
  - Listed separately with "Add" buttons
  - Shows count: "3 credentials missing"

- [ ] **Actions:**
  - "Add Credential" button (prominent)
  - "Check Compliance with AI" button (Issue #12 - already built)
  - "Share with RP" button (links to US-008)
  - "Back to Workers List" link

- [ ] **Overall Status Calculation:**
  - 🟢 Fully Compliant: All mandatory credentials valid + organisation credentials valid
  - 🟡 Action Needed: Any expiring (<90 days) OR missing optional credentials
  - 🔴 Non-Compliant: Any expired/missing mandatory credentials OR organisation credentials expired

- [ ] **Empty State:**
  - If no credentials: "No credentials uploaded yet. Add Jane's first credential to begin tracking compliance."

**Out of Scope (MVP):**
- Edit worker details (name, email) - Phase 2
- Delete worker - Phase 2
- Archive worker - Phase 2
- Notes/comments - Phase 2
- Activity history - Phase 3

**Technical Notes:**
- Query single worker by `id` with RLS check
- Join `worker_credentials` LEFT JOIN `credential_types`
- Generate complete checklist:
  1. Get all mandatory types (`is_mandatory_for_all = true`)
  2. Add role-specific types
  3. Mark as Missing if not in worker's credentials
- **Police Check OR NDIS Logic:**
  - If worker has both, show both but mark ONE as "Alternative (not required)"
  - Compliance calculation uses whichever is valid/longer validity
- Calculate overall status considering BOTH worker AND organisation credentials
- Count RPs via `sharing_links` table

**Demo Script:**
> "Here's Jane's complete profile. She's 9/11 compliant - missing SIRS training and her CPR expires in 45 days (yellow). I can see our organisation's Professional Indemnity Insurance is also valid (green checkmark at top). I click 'Add Credential', upload her SIRS certificate. Now she's 10/11. Once I schedule her CPR renewal next month, she'll be 11/11 fully compliant. The dashboard shows she's shared with 3 RPs, so keeping her compliant protects all 3."

***

### US-015: AP Upload Organisation Credentials **[NEW - CRITICAL]**
**Priority:** P1 - Must Build Week 2  
**Demo Impact:** HIGH - Shows RP due diligence value  
**Build Time:** 4 hours

**As an** AP Admin  
**I want to** upload my organisation's insurance certificates and business registration documents  
**So that** RPs can verify my business is legitimate, adequately insured, and compliant before engaging my workers

**Background:**
RPs need assurance that the AP itself is a legitimate, insured entity. Current state: RPs request stat decs or manual verification. New state: AP uploads org credentials once, visible to all RPs via share link.

**Acceptance Criteria:**
- [ ] **Organisation Settings Page:**
  - Accessible via link from Dashboard ("Manage Organisation Documents")
  - Shows organisation name (editable)
  - Shows ABN (editable)

- [ ] **Organisation Documents Section:**
  Each document type has:
  - Document name
  - Upload button (PDF/image, max 5MB)
  - Issue date picker
  - Expiry date picker
  - Status badge (🟢🟡🔴⚪)
  - "View Evidence" link if uploaded

- [ ] **Required Documents:**
  - **Professional Indemnity Insurance**
    - Coverage amount field (e.g., "$20 million")
    - Policy number
    - Insurer name
    - Expiry date (required)
  
  - **Public Liability Insurance**
    - Coverage amount field
    - Policy number
    - Insurer name
    - Expiry date (required)
  
  - **Workers Compensation Insurance**
    - State/territory where applicable
    - Policy number
    - Expiry date
  
  - **Business Registration**
    - ABN verification document
    - ACNC registration (if applicable for not-for-profit)
    - No expiry (permanent)

- [ ] **Status Calculation:**
  - Same logic as worker credentials:
    - 🟢 Valid: expiry > 90 days away
    - 🟡 Expiring: expiry within 90 days
    - 🔴 Expired: expiry passed
    - ⚪ Missing: not uploaded

- [ ] **Dashboard Integration:**
  - Organisation document status visible on AP Dashboard (US-001)
  - Alert if any org credential expired: "⚠️ Professional Indemnity Insurance expired - RPs cannot verify your legitimacy"

- [ ] **RP View Integration:**
  - RP share link view (US-009) shows organisation credentials section
  - RP can view/download org insurance certificates
  - RP sees alert if org credentials expired

**Out of Scope (MVP):**
- Multiple documents per type (Phase 2)
- Notification when org credential expiring (Phase 3)
- Verification with insurer APIs (Phase 4)

**Technical Notes:**
- New table: `organisation_credentials`
  - `id` (PK)
  - `organisation_id` (FK to `workers.organisation_id` or new `organisations` table)
  - `credential_type` (enum: 'professional_indemnity', 'public_liability', 'workers_comp', 'business_registration')
  - `coverage_amount` (text, nullable)
  - `policy_number` (text, nullable)
  - `insurer_name` (text, nullable)
  - `issue_date` (date)
  - `expiry_date` (date, nullable)
  - `evidence_url` (text - Supabase Storage path)
  - `status` (calculated)
  - `created_at`, `updated_at`

- Storage: Same bucket as worker credentials, path: `{org_id}/organisation/{credential_type}/{timestamp}-{filename}`
- RLS: AP can CRUD own org, RP can read via share token
- **CRITICAL:** Overall AP compliance = worker compliance AND org compliance

**Demo Script:**
> "Before I share my workers with RPs, I need to prove Sunshine Care itself is legitimate and insured. I upload our Professional Indemnity Insurance certificate - $20 million coverage, expires in 18 months. Upload Public Liability Insurance - same coverage. Upload our ABN verification. Now when Coastal RP views our compliance, they see not just that our workers are qualified, but that we're a properly insured, registered business. This gives them confidence to engage us."

***

### US-008: Generate Shareable RP Link **[UPDATED - CLARIFIED]**
**Priority:** P1 - Must Build Week 3  
**Demo Impact:** HIGH - Key handoff moment  
**Build Time:** 7 hours (increased from 6h)

**As an** AP Admin  
**I want to** generate a secure read-only link to share my workers' AND organisation's compliance with any RP  
**So that** RPs can verify complete eligibility (worker + org) on-demand without me emailing documents repeatedly

**Background:**
Current state: RP emails requests, AP sends multiple attachments. New state: Generate link once, RP sees everything (workers + org credentials), share with unlimited RPs.

**Acceptance Criteria:**
- [ ] **Access Points:**
  - "Share with RP" button on Dashboard
  - "Share with RP" button on Worker Detail page (shares entire org, not just one worker)

- [ ] **Share Link Modal:**
  - Click opens modal: "Share Your Compliance with Registered Providers"
  - Shows current link if one exists: `https://yourapp.com/share/abc123xyz`
  - "No link generated yet" message if first time

- [ ] **Link Generation:**
  - "Generate New Link" button
  - Creates unique cryptographically secure token (UUID v4)
  - Link copied to clipboard automatically
  - Success message: "Link copied! Share this with any Registered Provider."
  - Shows link details:
    - Created: [date]
    - Expires: [90 days from creation]
    - Status: Active

- [ ] **Link Management:**
  - Can regenerate link (invalidates old one) - OPTIONAL for MVP
  - Shows warning if regenerating: "Old link will stop working"

- [ ] **Preview:**
  - Modal shows preview: "RPs will see:
    - Your organisation credentials
    - All X workers' compliance status
    - Individual worker details with evidence
    - Read-only access, no downloads tracked"

- [ ] **No RP Login Required:**
  - Link works without RP authentication
  - Public access via token validation

**Out of Scope (MVP):**
- Granular permissions (share specific workers only) - Phase 2
- Custom expiry dates (fixed 90 days for MVP)
- Password-protected links - Phase 2
- Analytics (track who viewed) - Phase 3
- Revoke link manually - Phase 2 (auto-expires)

**Technical Notes:**
- New table (if not exists): `sharing_links`
  - `id` (PK)
  - `token` (unique, indexed - UUID v4)
  - `organisation_id` (FK)
  - `created_at`
  - `expires_at` (created_at + 90 days)
  - `created_by_user_id` (FK to auth.users)

- Token generation: `crypto.randomUUID()` or equivalent secure random
- Public route: `/share/[token]` (no auth middleware)
- Server-side validation on every request:
  - Query `sharing_links` WHERE `token` = [token] AND `expires_at > NOW()`
  - If valid, get `organisation_id` and proceed
  - If invalid/expired, show error page

- **Security Considerations:**
  - Rate limiting: Max 100 requests/hour per token (prevent scraping)
  - No personal data beyond worker names/credentials
  - HTTPS only
  - CSP headers for iframe prevention

**Demo Script:**
> "Coastal Residential just emailed: 'Can you send proof that Sunshine Care and your workers are compliant?' Instead of finding 15 PDFs across 10 workers plus our insurance certificates, I click 'Share with RP', copy the link, paste in email. Takes 5 seconds. They can view everything - our organisation insurance, all 10 workers, every credential. When Jane renews her CPR next month, they'll see it automatically. I can use this same link for Northern and Western RPs too."

***

## 2. RP VIEWER STORIES

### US-009: RP View AP Compliance Summary **[UPDATED - ORG CREDENTIALS]**
**Priority:** P1 - Must Build Week 4  
**Demo Impact:** HIGH - Shows RP value prop  
**Build Time:** 10 hours (increased from 8h)

**As an** RP Compliance Officer  
**I want to** access an AP's shared link and see their organisation AND workforce compliance summary  
**So that** I can verify complete eligibility (entity + workers) in 2 minutes instead of 2 days

**Background:**
Current state: Email AP, wait for replies, manually verify insurance, check worker certs, update spreadsheets. New state: Click link, see real-time organisation + worker status, done.

**Acceptance Criteria:**
- [ ] **Access:**
  - Accessible via shared link (e.g., `/share/abc123xyz`)
  - No login required
  - Invalid/expired token shows error: "This link has expired or is invalid. Please contact the Associated Provider for a new link."

- [ ] **Page Header:**
  - Shows AP organisation name prominently (e.g., "Sunshine Care - Compliance Dashboard")
  - "Last updated: [timestamp]" (shows data freshness)
  - Overall status badge: 🟢 Fully Compliant, 🟡 Action Needed, 🔴 Non-Compliant

- [ ] **Organisation Credentials Section (NEW):**
  - Heading: "Organisation Compliance"
  - Shows 4 org credential types:
    - Professional Indemnity Insurance
    - Public Liability Insurance
    - Workers Compensation Insurance
    - Business Registration
  - Each shows:
    - Status badge (🟢🟡🔴⚪)
    - Coverage amount (for insurance)
    - Expiry date
    - "View Certificate" link (opens PDF in new tab)
  - Alert if any expired: "⚠️ AP's Professional Indemnity Insurance expired - verify before engaging"

- [ ] **Workforce Compliance Summary:**
  - Overall: "8/10 workers fully compliant (80%)"
  - Traffic light breakdown:
    - 🟢 8 Compliant (all credentials valid)
    - 🟡 1 Expiring Soon (credentials within 90 days)
    - 🔴 1 Non-Compliant (expired/missing credentials)
  - Count: "12 credentials expiring in next 90 days"

- [ ] **Worker List Table:**
  - Columns: Name | Role | Compliance Status | Actions
  - Compliance shown as: "9/11 (82%)" with color-coded badge
  - Filter dropdown: All Workers, Compliant Only, Expiring Soon, Non-Compliant
  - Sort by: Name (A-Z), Compliance (High to Low), Role
  - "View Details" link per worker → US-010

- [ ] **Footer:**
  - "Powered by [Platform Name]"
  - "Want to manage your own AP compliance? Sign up for free"
  - Links to: About, Privacy, Terms

- [ ] **Performance:**
  - Loads in under 3 seconds
  - Mobile-responsive
  - Works on tablets/phones

**Out of Scope (MVP):**
- Export to CSV (Phase 2 - see US-011)
- Print view (Phase 2)
- Request updates from AP (Phase 3)
- Comments on workers (Phase 3)
- Bookmark AP (requires RP account - Phase 2)

**Technical Notes:**
- Public route: `/share/[token]`
- Server-side rendering (SSR) for SEO and performance
- Validation:
  1. Query `sharing_links` WHERE `token` = [token] AND `expires_at > NOW()`
  2. If invalid, return 404 or error page
  3. If valid, extract `organisation_id`
  4. Query `organisation_credentials` for org
  5. Query `workers` + `worker_credentials` for workforce
- Read-only queries only (no mutations possible)
- Cache: 5-minute cache with revalidation (reduces DB load)
- No RLS auth required (public read via valid token)
- **CRITICAL:** Calculate overall AP compliance = org compliance AND worker compliance

**Demo Script:**
> "I'm Coastal Residential's compliance manager. Sunshine Care sent me this link. I click it - no login. In 5 seconds I see:
> - Their organisation: Professional Indemnity ✅ $20M coverage, Public Liability ✅ $20M, both valid until 2026
> - Their workforce: 10 workers, 8 fully compliant, 1 has CPR expiring in 45 days, 1 missing SIRS training
> I click 'View Certificate' on their insurance - downloads PDF for our records. I drill into Jane Smith to verify her Police Check. Total time: 2 minutes. Old way: 2 days of emails."

***

### US-010: RP View Worker Credential Details **[UPDATED]**
**Priority:** P1 - Must Build Week 4  
**Demo Impact:** MEDIUM - Shows evidence transparency  
**Build Time:** 5 hours (increased from 4h)

**As an** RP Compliance Officer  
**I want to** click on a worker and see their complete credential details with downloadable evidence  
**So that** I can verify authenticity and save copies to our audit system

**Background:**
RPs must maintain copies of evidence for audit trail. Current state: Save email attachments. New state: Download from platform on-demand with proper filenames.

**Acceptance Criteria:**
- [ ] **Access:**
  - Click worker name in US-009 table
  - Route: `/share/[token]/worker/[worker_id]`
  - Validates token same as US-009

- [ ] **Worker Header:**
  - Shows worker name, role
  - Overall compliance status badge (🟢🟡🔴)
  - "Back to AP Summary" link

- [ ] **Credentials List - Grouped by Category:**
  
  **SCREENING:**
  - Shows which screening credentials worker has
  - If both Police Check AND NDIS: Shows both, marks one as "Alternative (not required for compliance)"
  - International Criminal History Declaration (if applicable)
  - Working with Children Check (if applicable)
  
  **QUALIFICATIONS:**
  - Role-specific qualification
  - Shows issue date, expiry date (or "No expiry")
  
  **TRAINING:**
  - All mandatory training records
  - Issue/expiry dates visible
  
  **CORE COMPETENCIES:**
  - Completion records

- [ ] **Each Credential Shows:**
  - Type name
  - Status badge (🟢🟡🔴⚪)
  - Issue Date
  - Expiry Date (or "No expiry" or "N/A")
  - Evidence link: "View Evidence" or "Download Certificate"

- [ ] **Evidence Handling:**
  - Click "View Evidence" → Opens PDF in new browser tab
  - Click "Download Certificate" → Downloads file with descriptive filename:
    - Format: `{WorkerName}_{CredentialType}_{IssueDate}.{ext}`
    - Example: `JaneSmith_PoliceCheck_2023-11-05.pdf`
  - If no evidence uploaded: Shows "No evidence uploaded yet"

- [ ] **Missing Credentials:**
  - Listed separately with ⚪ Missing badge
  - Message: "This credential has not been uploaded by the AP"

- [ ] **Mobile-Responsive:**
  - Works on phones/tablets
  - Evidence links easy to tap

**Out of Scope (MVP):**
- Bulk download all credentials as ZIP (Phase 2)
- Watermark documents with RP name/access date (Phase 3)
- Prevent screenshots/printing (Phase 3 - not technically feasible anyway)
- Download audit log (Phase 3)

**Technical Notes:**
- Route: `/share/[token]/worker/[worker_id]`
- Validate token (same as US-009)
- Query `worker_credentials` WHERE `worker_id` = [id]
- Join `credential_types` for names and categories
- Generate signed Supabase Storage URLs:
  - Expiry: 24 hours (renewable via new request)
  - URL params: `download=true` for force download, `inline=true` for PDFs
- Set Content-Disposition header for filename:
  - `attachment; filename="{worker.name}_{credential_type}_{issue_date}.{ext}"`
- MIME type detection:
  - PDF: `inline` (opens in browser)
  - Images: `attachment` (downloads)
- **Police Check OR NDIS handling:**
  - If both exist, show both
  - Mark one as "Alternative credential (not required)" based on which is older/shorter validity
  - RP can view both to choose which to keep for records

**Demo Script:**
> "I click on Jane Smith's name. I see her complete profile: Police Check valid until 2026, CPR expires in 45 days (yellow), Cert III qualification no expiry (green). I click 'View Evidence' on her Police Check - it opens the PDF certificate in a new tab. I click 'Download' - it saves as 'JaneSmith_PoliceCheck_2023-11-05.pdf' to my computer. I can save this to our audit folder. Takes 30 seconds to verify Jane is eligible to work at our facility."

***

### US-014: RP Multi-AP Risk Dashboard **[DESCOPED TO PHASE 2]**
**Priority:** P2 - DESCRIBE ONLY in Demo  
**Demo Impact:** MEDIUM - Future vision  
**Build Time:** 14 hours (NOT building for MVP)

**Status:** ⚠️ **DO NOT BUILD FOR MVP** - Too complex, requires RP authentication system, relationship management

**As an** RP Compliance Manager  
**I want to** see all my connected APs and their compliance status in one dashboard  
**So that** I can spot systemic risks BEFORE the Commission finds them in GPMS

**Why Deferred:**
- Requires full RP user authentication system (5h)
- Requires `rp_users` and `rp_ap_links` tables (2h)
- Requires aggregation logic across multiple APs (3h)
- Requires CSV export functionality (2h)
- Adds complexity to demo (managing RP accounts)
- Single-AP view (US-009) already demonstrates core value prop

**Demo Mention (Show Mockup, Don't Build):**
> "Phase 2: Instead of clicking 10 separate links every week, RPs will log into their own dashboard. They'll see all 10 APs in one view: Sunshine Care 80% compliant, Northern AP 95% compliant, Western 60% compliant. They can drill into any AP, download a consolidated report for Commission audits. If Sunshine has a compliance issue with another RP, all RPs working with Sunshine see the alert at the same time - preventing the 'last to know' scenario. This is the network effect: more APs join, more RPs get visibility, sector-wide risk reduced."

**Show in Demo:**
- Mockup image/Figma of multi-AP dashboard
- Explain value prop
- Mention "Phase 2 - 3 months post-MVP"
- Ask for investor/customer feedback: "Would this solve your cross-AP risk management problem?"

***

## 3. FUTURE FEATURES (Describe Only)

### US-012: AP Directory / Marketplace (Phase 2)
**Status:** ⚠️ DO NOT BUILD - Describe as future vision

**As an** RP Procurement Manager  
**I want to** search a verified directory of APs by region, specialization, compliance rating  
**So that** I can quickly find quality providers instead of word-of-mouth

**Why defer:** Requires critical mass of APs (chicken-egg problem). Build after proving core compliance workflow.

**Demo mention:**
> "Phase 3: RPs will search our directory for 'PCAs, 100% compliant, within 10km of Sunshine Coast' and find 15 verified APs instantly. APs with green compliance ratings get priority in search results. This turns us into the SEEK for aged care staffing - transparent, verified, efficient."

***

### US-013: RP Request Access Workflow (Phase 2)
**Status:** ⚠️ DO NOT BUILD - Describe as future vision

**As an** RP Manager  
**I want to** request access to an AP's compliance through the platform  
**So that** formal relationships are tracked and APs can approve/deny

**Why defer:** Requires AP notification system, approval workflow, too complex for MVP.

**Demo mention:**
> "Phase 2: Instead of emailing 'Send me your compliance docs', RPs click 'Request Access' in our directory. AP gets notification, clicks approve, RP gets instant access. Platform tracks all RP-AP relationships, provides analytics on engagement."

***

## 📊 UPDATED BUILD TIMELINE (6 Weeks, 60 Hours)

### Week 1: Foundation (10 hours)
- ✅ Issue #26: Configure Supabase Storage (2h)
- ✅ Create `organisation_credentials` table (1h)
- ✅ US-002: Add Worker with Complete Checklist (6h)
- ✅ US-003: Upload Credential (Part 1 - basic upload, 1h)

**Milestone:** Can add workers with full checklist visible

### Week 2: Credential Management (10 hours)
- ✅ US-003: Upload Credential (Part 2 - complete with status logic, 9h total, 8h remaining)
- ✅ US-015: AP Organisation Credentials Upload (4h)

**Milestone:** Can upload worker AND organisation credentials

### Week 3: Worker Detail + Sharing (10 hours)
- ✅ US-004: Worker Detail Page (7h)
- ✅ US-008: Generate Share Link (7h total, 3h in Week 3)

**Milestone:** AP workflow complete, can share with RP

### Week 4: RP Views (10 hours)
- ✅ US-008: Complete Share Link (remaining 4h)
- ✅ US-009: RP View AP Summary (10h total, 6h in Week 4)

**Milestone:** Basic RP viewing works

### Week 5: RP Polish + AP Dashboard (10 hours)
- ✅ US-009: Polish RP View (remaining 4h)
- ✅ US-010: RP View Worker Details (5h)
- ✅ US-001: AP Dashboard (8h total, 1h in Week 5)

**Milestone:** End-to-end demo flow functional

### Week 6: Dashboard + Polish (10 hours)
- ✅ US-001: Complete AP Dashboard with Blast Radius (remaining 7h)
- ✅ Demo data seeding (1h)
- ✅ Bug fixes and polish (2h)

**Milestone:** Demo-ready, rehearsed

**Total:** 60 hours

**Buffer:** Built into each week's estimate (realistic padding for debugging)

***

## 🔒 SECURITY REVIEW CHECKPOINT

**Before Week 4 Deployment (Public Share Links):**

- [ ] **Token Security:**
  - Tokens are cryptographically secure (UUID v4 minimum)
  - Tokens are indexed for fast lookup
  - Expiry validation happens on every request

- [ ] **Rate Limiting:**
  - Public routes limited to 100 requests/hour per token
  - Implement Vercel edge config rate limiter or Upstash Redis

- [ ] **Data Exposure:**
  - No personal data beyond names/credentials visible
  - No email addresses, phone numbers, addresses in public view
  - Organisation ABN visible (public information anyway)

- [ ] **RLS Policies:**
  - AP: Can only view/edit own organisation data
  - RP: Can only read via valid token
  - No data leakage across organisations

- [ ] **File Access:**
  - Signed URLs expire after 24 hours
  - Downloads logged (for Phase 2 analytics)
  - No direct Supabase Storage URLs exposed

- [ ] **Headers:**
  - HTTPS only (Vercel enforces)
  - CSP headers prevent iframe embedding
  - X-Frame-Options: DENY

**Sign-off:** Test all security items before making `/share/[token]` routes public

***

## 🧪 DEMO DATA REQUIREMENTS

### Seed Data for Demo:

**Organisation:**
- Name: Sunshine Care
- ABN: 12 345 678 901
- Organisation Credentials:
  - Professional Indemnity: $20M, expires 2026-06-30 (🟢)
  - Public Liability: $20M, expires 2026-06-30 (🟢)
  - Workers Comp: Valid, expires 2025-12-31 (🟡 - expiring in ~1 month)
  - Business Registration: ABN verified (🟢, no expiry)

**Workers (10 total):**

**Fully Compliant (🟢) - 6 workers:**
1. Bob Smith (Care Worker) - All 11 credentials valid, expires furthest: 2027
2. Alice Johnson (RN) - All credentials including AHPRA valid
3. Carlos Martinez (Care Worker) - Mix of credentials, all green
4. Diana Chen (Allied Health) - Physio registration valid
5. Emma Wilson (Care Worker) - All valid
6. Frank Brown (RN) - All valid

**Expiring Soon (🟡) - 3 workers:**
7. **Jane Smith (Care Worker)** - 10/11 compliant
   - ✅ NDIS Clearance (expires 2028)
   - 🟡 CPR expires 2025-01-15 (45 days away) **← DEMO FOCUS**
   - ✅ Code of Conduct (expires 2025-12-01)
   - ✅ SIRS Training (expires 2025-12-01)
   - ✅ Infection Control (expires 2025-12-01)
   - ✅ Manual Handling (expires 2025-12-01)
   - ✅ Cert III (no expiry)
   - ✅ Person-centred care training (expires 2025-12-01)
   - ✅ Culturally safe care (expires 2026-06-01)
   - ✅ Dementia care (expires 2025-12-01)
   - ✅ Medical emergency (expires 2025-12-01)

8. Grace Lee (Care Worker) - Manual Handling expires in 60 days
9. Henry Patel (RN) - AHPRA renewal due in 80 days

**Non-Compliant (🔴) - 1 worker:**
10. **Isaac Thompson (Care Worker)** - 9/11 compliant
    - ✅ Police Check (expires 2027)
    - ❌ SIRS Training (missing - never uploaded) **← DEMO POINT**
    - 🔴 Code of Conduct (expired 2025-10-01)
    - ✅ Others valid

**Share Link:**
- Token: `demo-sunshine-care-2025` (for easy testing)
- Expires: 90 days from demo date
- Shared with 3 RPs (simulated): Coastal Residential, Northern Home Care, Western Aged Services

**Demo Scenario Flow:**
1. Log in as Sunshine Care
2. Dashboard shows: 60% workers compliant, org insurance expiring soon
3. Click Jane Smith → See CPR expiring in 45 days, shows "Shared with 3 RPs"
4. Upload new CPR certificate → Status changes to 🟢
5. Overall compliance improves to 70%
6. Copy share link
7. Open incognito tab, paste share link (simulate RP view)
8. See Sunshine Care compliance: Org ✅, 7/10 workers compliant
9. Click Jane → See updated CPR now green
10. Download her Police Check PDF
11. Back to AP view → Show dashboard alerts for Isaac (missing SIRS)

***

## ✅ DEFINITION OF DONE

**Each User Story is "Done" When:**
- [ ] All acceptance criteria met and manually tested
- [ ] Works on mobile (iPhone/Android) and desktop (Chrome/Safari/Firefox)
- [ ] Error handling implemented with user-friendly messages
- [ ] Loads in under 3 seconds on 3G connection
- [ ] Works with demo seed data
- [ ] No console errors or warnings
- [ ] Committed to main branch with descriptive commit message
- [ ] Deployed to Vercel preview environment
- [ ] Reviewed by one other person (self-review if solo)

**MVP is "Demo-Ready" When:**
- [ ] All P1 stories (US-001, 002, 003, 004, 008, 009, 010, 015) complete
- [ ] Demo script rehearsed and timed (12 minutes maximum)
- [ ] Seed data populated in production database
- [ ] No critical bugs in happy path (can complete full demo flow)
- [ ] Backup plan prepared (screen recording if live demo fails)
- [ ] Security review checkpoint passed
- [ ] Deployed to production (kora-compliance.vercel.app)

***

## 🚀 SUCCESS METRICS (Track After Demo)

### Qualitative Feedback:
- **AP feedback:** "This would save me X hours per week"
- **RP feedback:** "This solves the 'last to know' problem"
- **Investor feedback:** "I see the network effect potential"

### Quantitative (if pilot):
- **Time to verify worker compliance:** Target < 2 minutes (vs 2 days)
- **Number of RPs one AP shares with:** Target 3+ (demonstrates "upload once, share forever")
- **Credential update propagation:** Target instant visibility (no delays)
- **AP credential upload time:** Target < 1 minute per credential
- **RP document download success rate:** Target 95%+

### Business Metrics (post-demo):
- Pilot signups (target: 5 APs, 10 RPs in Month 2)
- Active usage (target: 2+ logins/week)
- Share links created (target: 3+ per AP)
- Credentials uploaded (target: 10+ per AP)

***

## 📝 NEXT STEPS

1. ✅ **Review and approve** this v2.0 user story document
2. ✅ **Create GitHub issues** for each P1 user story
3. ✅ **Set up project board** with Week 1-6 columns
4. ✅ **Start build:** Week 1 tasks
   - Configure Supabase Storage (Issue #26)
   - Create organisation_credentials table
   - US-002: Add Worker form
5. ✅ **Weekly progress check:** 15-min EOD Friday status update
6. ✅ **Security review:** Before Week 4 deployment
7. ✅ **Demo rehearsal:** Week 6

***

## 🎬 FINAL DEMO SCRIPT (12 Minutes)

### Setup (Before Demo):
- Sunshine Care account logged in
- 10 workers seeded with varying compliance
- Share link pre-generated
- Incognito browser tab ready for RP view
- Renewal CPR certificate PDF ready to upload

### Act 1: The Problem (3 min)
"Let me show you the domino risk facing aged care..."
- Show Commission letter scenario
- Explain current state: Siloed compliance, RPs blind to risks
- The gap: Commission sees cross-RP data in GPMS, RPs don't

### Act 2: The Solution (7 min)

**Part A: AP Upload Organisation Credentials (1 min)**
- "First, Sunshine Care proves they're legitimate..."
- Show organisation credentials: Insurance certificates uploaded
- "RPs can verify we're properly insured before engaging us"

**Part B: AP Manage Workers (2 min)**
- Show dashboard: 6/10 compliant, Jane's CPR expiring affects 3 RPs
- Click Jane → See complete checklist (11 items)
- "Jane is 10/11 compliant - only CPR expiring in 45 days"
- Upload renewed CPR certificate
- Status changes to 🟢, overall compliance improves

**Part C: Share with RP (1 min)**
- Click "Share with RP"
- Copy link
- "This link gives RPs instant access to everything - org + workers"

**Part D: RP View (3 min)**
- Switch to incognito tab (simulate RP)
- Paste link
- "I'm Coastal Residential's compliance manager..."
- See org insurance ✅, workforce summary 7/10 compliant
- Click Jane → See updated CPR now green
- Download Police Check PDF
- "Total verification time: 2 minutes vs 2 days"

### Act 3: The Vision (2 min)

**Show Mockups:**
- Multi-AP dashboard (Phase 2)
- AP directory search (Phase 3)
- Commission integration (Phase 4)

**Business Model:**
- "$10/worker/month for APs"
- "100,000 workers in sector × $10 = $12M ARR at 10% market penetration"
- "Network effects: Value grows as more participants join"
- "Improve sector efficiency and reduce regulatory risk"

**Call to Action:**
- "Ready for pilot in February 2026"
- "Seeking 5 APs, 10 RPs for 3-month trial"
- "Investment ask: $500K seed round to scale post-pilot"

**END DEMO**

***

## 📄 VERSION CONTROL

```bash
# Save this document
git add docs/user-stories/kora-mvp-user-stories-v1.md

git commit -m "docs: create Kora MVP user stories v1.0 (production-ready)

Complete user story specification for 6-week MVP build:
- 8 P1 user stories (60 hours total)
- Complete 17-item compliance checklist coverage
- Organisation + worker credentials
- AP admin workflow (US-001, 002, 003, 004, 008, 015)
- RP viewer workflow (US-009, 010)
- Blast radius awareness (prevent domino regulatory risk)
- Realistic timeline with security review checkpoint
- 12-minute demo script with data requirements

Key Features:
✅ Upload once, share forever
✅ Real-time compliance visibility
✅ Organisation credential verification
✅ Evidence document management
✅ Police Check OR NDIS mutual exclusivity
✅ Multi-RP sharing awareness

Descoped for Phase 2:
- Multi-AP dashboard (too complex for MVP)
- AP directory search
- Automated notifications

READY FOR DEVELOPMENT - Issue #14 COMPLETE"

git push origin main
```

***

**🎉 READY TO BUILD!**

This v2.0 document addresses all critical gaps:
✅ Complete compliance checklist
✅ Organisation credentials
✅ Realistic timeline
✅ Clear mutual exclusivity logic
✅ Security considerations
✅ Descoped complexity
✅ Updated demo script

**Next:** Create GitHub issues and start Week 1 build! 🚀