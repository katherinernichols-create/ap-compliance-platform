# Compliance Classification Rules v1.0

**Date:** 30 November 2025  
**Status:** Production-Ready  
**Applies to:** MVP - Worker Compliance Status

***

## Credential-Level Status

Individual credentials are classified based on expiry dates:

| Status | Rule | Badge |
|--------|------|-------|
| **Valid** | `expiry_date > NOW() + 90 days` OR `expiry_date IS NULL` (permanent) | 🟢 |
| **Expiring Soon** | `expiry_date BETWEEN NOW() AND NOW() + 90 days` | 🟡 |
| **Expired** | `expiry_date < NOW()` | 🔴 |
| **Missing** | Required credential not present in `credentials` table | ⚪ |

***

## Worker-Level Compliance Status

Workers are classified based on their complete credential portfolio:

### 🟢 COMPLIANT (100%)
**Rule:** ALL mandatory credentials are Valid (green)

**Logic:**
```sql
-- All mandatory credentials exist
COUNT(mandatory credentials in credentials table) = COUNT(mandatory credential_types)
AND
-- None are expired
ALL credentials.expiry_date > NOW() OR expiry_date IS NULL
Example: Jane has all 9 mandatory credentials, all valid until 2026+

🟡 AT RISK (50-99%)
Rule: Has some mandatory credentials valid, but ANY of:

At least one mandatory credential expiring within 90 days

Missing optional credentials

Has all mandatory but some are expiring soon
Logic:
(Has all mandatory credentials AND at least one expires < NOW() + 90 days)
OR
(Missing only optional credentials)
Example: Bob has all mandatory credentials, but CPR expires in 45 days

🔴 NON-COMPLIANT (<50%)
Rule: ANY mandatory credential is expired OR missing

Logic:
(Any mandatory credential has expiry_date < NOW())
OR
(Missing any mandatory credential)
xample: Sarah is missing NDIS Clearance (mandatory)

Mandatory Credentials List
Based on credential_types WHERE is_mandatory_for_all = true:

National Police Check (3 years)

NDIS Worker Screening Check (5 years) OR Working with Children Check (5 years)

Current CPR Certification (12 months)

Annual Manual Handling Refresher (12 months)

Infection Control Training (12 months)

Code of Conduct Training (12 months)

SIRS Training (12 months)

Person-centred Care Training (12 months)

Culturally Safe Care Training (12 months)

Dementia Care Training (12 months)

Medical Emergency Response Training (12 months)

Role-Specific Mandatory:
Registered Nurses: AHPRA Registration (12 months)

Care Workers: Certificate III in Individual Support (permanent)
Total Mandatory: 9-11 credentials depending on role

Implementation: Compliance Calculation Function
Database Function (Option 1 - Server-side)
CREATE OR REPLACE FUNCTION calculate_worker_compliance(worker_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    mandatory_count INT;
    valid_mandatory_count INT;
    expiring_soon_count INT;
    expired_count INT;
    missing_count INT;
BEGIN
    -- Count total mandatory credentials for this worker's role
    SELECT COUNT(*)
    INTO mandatory_count
    FROM credential_types
    WHERE is_mandatory_for_all = true
       OR (required_role_tag IS NOT NULL AND required_role_tag = (SELECT role FROM workers WHERE id = worker_uuid));
    
    -- Count valid mandatory credentials (not expired, not expiring soon)
    SELECT COUNT(*)
    INTO valid_mandatory_count
    FROM credentials c
    JOIN credential_types ct ON c.credential_type_id = ct.id
    WHERE c.worker_id = worker_uuid
      AND (ct.is_mandatory_for_all = true OR ct.required_role_tag = (SELECT role FROM workers WHERE id = worker_uuid))
      AND (c.expiry_date > NOW() + INTERVAL '90 days' OR c.expiry_date IS NULL);
    
    -- Count expiring soon (< 90 days)
    SELECT COUNT(*)
    INTO expiring_soon_count
    FROM credentials c
    JOIN credential_types ct ON c.credential_type_id = ct.id
    WHERE c.worker_id = worker_uuid
      AND (ct.is_mandatory_for_all = true OR ct.required_role_tag = (SELECT role FROM workers WHERE id = worker_uuid))
      AND c.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '90 days';
    
    -- Count expired (< NOW)
    SELECT COUNT(*)
    INTO expired_count
    FROM credentials c
    JOIN credential_types ct ON c.credential_type_id = ct.id
    WHERE c.worker_id = worker_uuid
      AND (ct.is_mandatory_for_all = true OR ct.required_role_tag = (SELECT role FROM workers WHERE id = worker_uuid))
      AND c.expiry_date < NOW();
    
    -- Calculate missing
    missing_count := mandatory_count - (valid_mandatory_count + expiring_soon_count + expired_count);
    
    -- Classification logic
    IF expired_count > 0 OR missing_count > 0 THEN
        RETURN 'non_compliant';
    ELSIF expiring_soon_count > 0 THEN
        RETURN 'at_risk';
    ELSE
        RETURN 'compliant';
    END IF;
END;
$$ LANGUAGE plpgsql;
TypeScript Function (Option 2 - Application-side)
// lib/compliance.ts

export type ComplianceStatus = 'compliant' | 'at_risk' | 'non_compliant';

interface Credential {
  id: string;
  credential_type_id: string;
  expiry_date: string | null;
  credential_type: {
    is_mandatory_for_all: boolean;
    required_role_tag: string | null;
  };
}

export function calculateWorkerCompliance(
  workerRole: string,
  credentials: Credential[],
  mandatoryCredentialTypes: { id: string; is_mandatory_for_all: boolean; required_role_tag: string | null }[]
): { status: ComplianceStatus; percentage: number } {
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const mandatoryTypes = mandatoryCredentialTypes.filter(
    ct => ct.is_mandatory_for_all || ct.required_role_tag === workerRole
  );

  let expiredCount = 0;
  let expiringSoonCount = 0;
  let validCount = 0;
  let missingCount = 0;

  mandatoryTypes.forEach(type => {
    const credential = credentials.find(c => c.credential_type_id === type.id);

    if (!credential) {
      missingCount++;
    } else if (credential.expiry_date === null) {
      validCount++;
    } else {
      const expiryDate = new Date(credential.expiry_date);
      if (expiryDate < now) {
        expiredCount++;
      } else if (expiryDate < ninetyDaysFromNow) {
        expiringSoonCount++;
      } else {
        validCount++;
      }
    }
  });

  const totalMandatory = mandatoryTypes.length;
  const percentage = Math.round((validCount / totalMandatory) * 100);

  if (expiredCount > 0 || missingCount > 0) {
    return { status: 'non_compliant', percentage };
  } else if (expiringSoonCount > 0) {
    return { status: 'at_risk', percentage };
  } else {
    return { status: 'compliant', percentage: 100 };
  }
}
Testing Scenarios
Test Case 1: Fully Compliant Worker
Has all 11 mandatory credentials

All expiry dates > 90 days from now

Expected: 🟢 Compliant (100%)

Test Case 2: At Risk Worker
Has all 11 mandatory credentials

CPR expires in 45 days

Expected: 🟡 At Risk (91%)

Test Case 3: Non-Compliant Worker (Expired)
Has 10/11 mandatory credentials

Police Check expired 30 days ago

Expected: 🔴 Non-Compliant (45%)

Test Case 4: Non-Compliant Worker (Missing)
Has 8/11 mandatory credentials

Missing: NDIS, Code of Conduct, SIRS

Expected: 🔴 Non-Compliant (36%)

Integration Points
US-001: Dashboard
Aggregate all workers' compliance status

Show counts: X Compliant, Y At Risk, Z Non-Compliant

Calculate org-level compliance rate

US-004: Worker Detail Page
Display overall worker status badge

Show credential-level status for each requirement

Highlight which credentials are causing non-compliance

US-009: RP View
Show worker compliance status to external RPs

Filter by status

Sort by compliance percentage

Future Enhancements (Post-MVP)
Weighted compliance scores (some credentials more critical than others)

Grace periods for renewals in progress

Organisation-level credentials (insurance, ABN, etc.)

Commission-specific reporting requirements

Automated email alerts at 30/60/90 day thresholds

Document Version: 1.0
Last Updated: 30 November 2025
Owner: Kat (Technical), Anita (Business Rules)
