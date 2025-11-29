```
# Database Schema & Architecture Notes

**Last Updated:** November 29, 2025  
**Database:** Supabase (PostgreSQL)

## Overview

This document tracks the actual database structure as built, including deviations from the original project plan where Gemini AI improved the architecture.

***

## Tables

### `credentials`
Stores worker compliance credentials with references to both workers and credential types.

**Schema:**
```sql
- id: uuid (PK)
- worker_id: uuid (FK → workers.id)
- credential_type_id: uuid (FK → credential_types.id)
- issue_date: date
- expiry_date: date
- document_url: text
- status: text
- created_at: timestamptz
- updated_at: timestamptz
```

**Row Level Security (RLS):** Enabled  
**Policies:**
- `Authenticated users can view credentials` (SELECT)
- `Authenticated users can insert credentials` (INSERT)
- `Authenticated users can update credentials` (UPDATE)
- `Authenticated users can delete credentials` (DELETE)

***

### `credential_types`
**⚠️ Architecture Enhancement:** This table was added by Gemini AI (not in original plan).

**Why This Is Better:**
- Centralizes credential definitions (prevents typos)
- Enables automated compliance checking
- Built-in renewal tracking and mandatory flags
- Role-specific credential assignment

**Schema:**
```sql
- id: uuid (PK)
- name: text
- category: text (e.g., "Vetting/Clearance", "Certification", "Training Record")
- renewal_frequency_days: int (e.g., 365 for annual, 1825 for 5-year)
- is_mandatory_for_all: boolean
- required_role_tag: text (e.g., "RN", "PCA", null for all roles)
- description: text
```

**Current Credential Types (7 standard aged care credentials):**
1. National Police Check (3-year, mandatory for all)
2. NDIS Worker Screening Check (5-year, mandatory for all)
3. Certificate III in Individual Support (PCA-specific)
4. AHPRA Registration (RN) (annual, RN-specific)
5. Annual Manual Handling Refresher (annual, mandatory)
6. Infection Control Training (annual, mandatory)
7. Current CPR Certification (annual, mandatory)

***

## Original Plan vs. Actual

| Aspect | Original Plan (Claude) | Actual Implementation (Gemini) |
|--------|----------------------|--------------------------------|
| Credential type storage | `credential_type` and `credential_name` as text fields | Normalized `credential_types` lookup table |
| Compliance automation | To be added later (Issues #13, #15, #16) | Built into schema with renewal frequencies and mandatory flags |
| Benefits | Simple, quick to build | Prevents errors, enables automation, scalable |

***

## Impact on Backlog

**Issues Affected by Schema Enhancement:**
- **Issue #7** (Build Credentials Table): ✅ Complete with bonus normalization
- **Issue #13** (Define Minimum Compliance Evidence): Partially addressed via `is_mandatory_for_all` field
- **Issue #15** (Document Credential Types): Table already exists with 7 types defined
- **Issue #16** (Draft Basic Compliance Rules): Renewal logic built into `renewal_frequency_days`

***

## Sample Data

**Workers:**
- Sarah Jones (Nurse/RN) - 5 credentials
- John Smith (Care Worker/PCA) - 5 credentials

All have role-appropriate credentials with realistic issue/expiry dates for testing compliance logic.

***

## Next Steps

- Configure Supabase Storage for credential document uploads (Issue #26)
- Build frontend pages to display and manage credentials (Issues #8-11)
- Implement compliance checking logic using `credential_types` metadata (Issue #28)
```

**The key difference:** The schema sections need the triple backticks and `sql` tag (` ```
