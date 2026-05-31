# KYC (Know Your Customer) Verification System

## Overview

The KYC system enables secure business identity verification for users on the platform. Buyers, sellers, and cutters must submit official business documents (e.g., business registration, national ID, passport) for verification before conducting high-value transactions. Admins review submissions and approve or reject based on document authenticity and completeness.

---

## System Architecture

### KYC Status Lifecycle

```
User Registration
     ↓
Status: unverified
     ↓
[User submits documents]
     ↓
Status: pending
Awaiting admin review
     ↓
[ADMIN reviews documents]
     ↓
    ↙        ↘
  APPROVED   REJECTED
   ↓          ↓
verified    rejected
(Verified)  (Record reason)
```

### Key Features

✅ **Document Storage** - S3/Cloudinary URLs for verification documents  
✅ **Status Tracking** - Clear progression through verification stages  
✅ **Admin Review Queue** - Fetch all pending KYC submissions for review  
✅ **Rejection Tracking** - Record reasons for rejected submissions  
✅ **Audit Trail** - Track submission timestamps and review dates  
✅ **Secure Access** - Only document owners and admins can view/modify  

---

## Data Model

### KYC Schema

```typescript
interface IKYC {
  documentUrls: string[];      // S3/Cloudinary URLs (max 10)
  status: KYCStatus;           // unverified, pending, verified, rejected
  submittedAt?: Date;          // When documents were submitted
  reviewedAt?: Date;           // When admin reviewed
  rejectionReason?: string;    // Reason if rejected (max 500 chars)
}

enum KYCStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
```

### User Schema Integration

```typescript
interface IUser {
  // ... existing fields ...
  kyc: {
    documentUrls: string[];     // Array of document URLs
    status: KYCStatus;          // Current KYC status
    submittedAt?: Date;         // Submission timestamp
    reviewedAt?: Date;          // Review timestamp
    rejectionReason?: string;   // Rejection reason if applicable
  }
}
```

### Database Indexes

```typescript
// Fast queries for pending KYC reviews
UserSchema.index({ 'kyc.status': 1, 'kyc.submittedAt': -1 });

// Role-based KYC filtering
UserSchema.index({ roles: 1, 'kyc.status': 1 });
```

---

## API Endpoints

### 1. Submit KYC Documents

**Endpoint:** `PUT /api/v1/users/kyc/submit`

**Authentication:** Required (Bearer token)

**Authorization:** Logged-in user (any role)

**Request Body:**

```json
{
  "documentUrls": [
    "https://s3.amazonaws.com/kyc-docs/business-registration.pdf",
    "https://s3.amazonaws.com/kyc-docs/national-id.jpg",
    "https://s3.amazonaws.com/kyc-docs/passport.jpg"
  ]
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `documentUrls` | String[] | Yes | Non-empty array, max 10 items |
| Each URL | String | Yes | Valid S3/Cloudinary URL |

**Supported Document Types:**
- PDF documents (business registration, certificates)
- Images (JPG, PNG) (national ID, passport, license)
- Scanned documents

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "67890abc123456789012345a",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Seller",
    "kyc": {
      "documentUrls": [
        "https://s3.amazonaws.com/kyc-docs/business-registration.pdf",
        "https://s3.amazonaws.com/kyc-docs/national-id.jpg"
      ],
      "status": "pending",
      "submittedAt": "2024-01-20T14:30:00Z"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T14:30:00Z"
  },
  "message": "KYC documents submitted successfully. Status changed to pending."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | Bad Request | Document URLs are required and must be a non-empty array |
| 400 | Bad Request | Maximum 10 documents allowed for KYC submission |
| 400 | Bad Request | All document URLs must be valid strings |
| 404 | Not Found | User not found |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/v1/users/kyc/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrls": [
      "https://s3.amazonaws.com/kyc-docs/business-registration.pdf",
      "https://s3.amazonaws.com/kyc-docs/national-id.jpg"
    ]
  }'
```

---

### 2. Get Pending KYC Requests

**Endpoint:** `GET /api/v1/users/kyc/pending`

**Authentication:** Required (Bearer token)

**Authorization:** ADMIN ONLY

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sortBy` | String | `submittedAt` | Sort field: `submittedAt`, `email`, `firstName` |
| `order` | String | `asc` | Sort order: `asc` or `desc` |

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "users": [
      {
        "_id": "67890abc123456789012345a",
        "email": "seller1@example.com",
        "firstName": "John",
        "lastName": "Seller",
        "roles": ["SELLER"],
        "businessName": "Gem Traders Inc",
        "kyc": {
          "documentUrls": [
            "https://s3.amazonaws.com/kyc-docs/business-registration.pdf",
            "https://s3.amazonaws.com/kyc-docs/national-id.jpg"
          ],
          "status": "pending",
          "submittedAt": "2024-01-18T10:30:00Z"
        }
      },
      {
        "_id": "67890abc123456789012345b",
        "email": "cutter@example.com",
        "firstName": "Jane",
        "lastName": "Cutter",
        "roles": ["CUTTER"],
        "businessName": "Premium Cutting Services",
        "kyc": {
          "documentUrls": [
            "https://s3.amazonaws.com/kyc-docs/cutter-cert.pdf"
          ],
          "status": "pending",
          "submittedAt": "2024-01-19T14:00:00Z"
        }
      }
    ],
    "summary": {
      "total": 2,
      "byRole": {
        "BUYER": 0,
        "SELLER": 1,
        "CUTTER": 1
      }
    }
  },
  "message": "Pending KYC requests fetched"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 403 | Forbidden | Access denied. Only administrators can view pending KYC requests |
| 400 | Bad Request | Invalid sortBy field |

**cURL Example:**

```bash
# Get all pending KYC (default sort by submission date ascending)
curl -X GET http://localhost:5000/api/v1/users/kyc/pending \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Sort by email descending
curl -X GET "http://localhost:5000/api/v1/users/kyc/pending?sortBy=email&order=desc" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 3. Approve/Reject KYC

**Endpoint:** `PUT /api/v1/users/:userId/kyc/approve`

**Authentication:** Required (Bearer token)

**Authorization:** ADMIN ONLY

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | ObjectId | User ID whose KYC is being reviewed |

**Request Body (Approve):**

```json
{
  "approved": true
}
```

**Request Body (Reject):**

```json
{
  "approved": false,
  "rejectionReason": "Business registration document appears to be expired. Please resubmit with current documents."
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `approved` | Boolean | Yes | Must be `true` or `false` |
| `rejectionReason` | String | Conditional | Required if `approved=false`, max 500 chars |

**Response (200 OK - Approved):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "67890abc123456789012345a",
    "email": "seller@example.com",
    "firstName": "John",
    "lastName": "Seller",
    "kyc": {
      "documentUrls": [
        "https://s3.amazonaws.com/kyc-docs/business-registration.pdf",
        "https://s3.amazonaws.com/kyc-docs/national-id.jpg"
      ],
      "status": "verified",
      "submittedAt": "2024-01-18T10:30:00Z",
      "reviewedAt": "2024-01-20T15:00:00Z"
    }
  },
  "message": "KYC approved successfully"
}
```

**Response (200 OK - Rejected):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "67890abc123456789012345b",
    "email": "cutter@example.com",
    "firstName": "Jane",
    "lastName": "Cutter",
    "kyc": {
      "documentUrls": [
        "https://s3.amazonaws.com/kyc-docs/cutter-cert.pdf"
      ],
      "status": "rejected",
      "submittedAt": "2024-01-19T14:00:00Z",
      "reviewedAt": "2024-01-20T15:00:00Z",
      "rejectionReason": "Certification document not recognized. Please submit valid credentials."
    }
  },
  "message": "KYC rejected successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 403 | Forbidden | Access denied. Only administrators can approve KYC requests |
| 400 | Bad Request | Approved field is required and must be a boolean |
| 400 | Bad Request | Rejection reason is required when rejecting KYC |
| 400 | Bad Request | Rejection reason must not exceed 500 characters |
| 404 | Not Found | User not found |
| 400 | Bad Request | Cannot review KYC with status: ... |

**cURL Examples:**

```bash
# Approve KYC
curl -X PUT http://localhost:5000/api/v1/users/67890abc123456789012345a/kyc/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true
  }'

# Reject KYC with reason
curl -X PUT http://localhost:5000/api/v1/users/67890abc123456789012345b/kyc/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "rejectionReason": "Documents appear to be expired. Please resubmit current credentials."
  }'
```

---

## Workflow Examples

### Scenario 1: Seller Submits KYC and Gets Approved

```
1. New seller registers
   kyc.status = unverified

2. Seller uploads business documents
   PUT /api/v1/users/kyc/submit {
     documentUrls: [
       "https://s3.amazonaws.com/business-reg.pdf",
       "https://s3.amazonaws.com/national-id.jpg"
     ]
   }
   
   Result:
   ✓ kyc.status = pending
   ✓ kyc.submittedAt = now

3. Admin reviews and approves
   PUT /api/v1/users/:id/kyc/approve {
     approved: true
   }
   
   Result:
   ✓ kyc.status = verified
   ✓ kyc.reviewedAt = now
   ✓ Seller can now conduct high-value transactions

4. Seller can now:
   ✓ List gems for sale
   ✓ Access higher transaction limits
   ✓ Receive payments via Stripe Connect
```

### Scenario 2: Cutter Submits Invalid Documents and Gets Rejected

```
1. Cutter submits KYC
   PUT /api/v1/users/kyc/submit {
     documentUrls: ["https://s3.amazonaws.com/expired-cert.pdf"]
   }
   
   Result:
   ✓ kyc.status = pending

2. Admin reviews, finds certification is expired
   PUT /api/v1/users/:id/kyc/approve {
     approved: false,
     rejectionReason: "Certification expired. Valid until 2025-12-31."
   }
   
   Result:
   ✓ kyc.status = rejected
   ✓ kyc.rejectionReason = "Certification expired..."
   ✓ kyc.reviewedAt = now

3. Cutter is notified and can resubmit
   PUT /api/v1/users/kyc/submit {
     documentUrls: ["https://s3.amazonaws.com/renewed-cert.pdf"]
   }
   
   Result:
   ✓ kyc.status = pending (back to pending)
   ✓ kyc.submittedAt = updated to now
```

### Scenario 3: Admin Batch Reviews Pending KYC

```
Admin logs in and checks queue:
GET /api/v1/users/kyc/pending

Response:
- Shows 5 pending submissions
- Sorted by submission date
- Admin reviews each one
- Approves valid merchants
- Rejects fraudulent or incomplete submissions

Admin dashboard shows:
- 5 pending (2 sellers, 2 cutters, 1 buyer)
- Can click to review full documents
- Can approve/reject with one click
```

---

## Security & Authorization

### Role-Based Access Control

```typescript
// Submit KYC
- Required: Authenticated + JWT token
- Allowed: All authenticated users
- Restriction: Can only submit for own account

// Get Pending KYC
- Required: Authenticated + JWT token + ADMIN role
- Allowed: Admin users only
- Denies: Buyers, sellers, cutters, non-admins

// Approve KYC
- Required: Authenticated + JWT token + ADMIN role
- Allowed: Admin users only
- Denies: Buyers, sellers, cutters, non-admins
```

### Validation Rules

✅ Document URLs must be valid strings  
✅ Maximum 10 documents per submission  
✅ Cannot review KYC that's already verified/rejected  
✅ Rejection reason required when rejecting  
✅ Only admins can approve/reject  
✅ Users can resubmit if rejected  

---

## KYC Status Reference

| Status | Description | Can Resubmit? | User Can Trade? |
|--------|-------------|---------------|-----------------|
| `unverified` | Initial state on registration | Yes | Limited |
| `pending` | Awaiting admin review | No (wait) | Limited |
| `verified` | Approved by admin | N/A | Full access |
| `rejected` | Rejected by admin | Yes | Limited |

---

## Document Requirements by User Type

### Seller Requirements
- Business registration certificate
- National ID or Passport
- Proof of address (utility bill or lease)
- Business bank account details

### Cutter Requirements
- Certification or qualifications
- National ID or Passport
- Portfolio or references

### Buyer Requirements
- National ID or Passport (if high-value transactions)
- Proof of address (if applicable)

---

## Integration with Other Systems

### With Order System
- Unverified users: Cannot sell gems
- Pending users: Limited transaction amounts
- Verified users: Full access to all features
- Rejected users: Can resubmit or contact support

### With Payment System
- Only verified sellers can receive Stripe Connect payouts
- Stripe KYC may have additional requirements
- Transaction limits based on KYC status

### With Notification System (Ready for)
- Notification when KYC is approved
- Notification when KYC is rejected with reason
- Reminder to submit KYC if not done
- Admin alerts for pending reviews

---

## Admin Dashboard Information

Admins should track:
- Number of pending KYC requests
- Average review time
- Approval vs rejection ratio
- Most common rejection reasons
- Users pending longest

**Example Metrics:**
```
Pending KYC: 12
- Sellers: 7
- Cutters: 4
- Buyers: 1

Average Days Pending: 2.5
Approval Rate: 85%
Most Common Rejection: Expired documents (45%)
```

---

## Troubleshooting

### Issue: User cannot submit KYC
**Solution:** Ensure user is authenticated. Check token validity.

### Issue: Rejection reason not saved
**Solution:** Must provide rejectionReason when approved=false.

### Issue: Admin cannot see pending KYC
**Solution:** Ensure user has ADMIN role. Check privileges.

### Issue: User cannot resubmit after rejection
**Solution:** Verify kyc.status is 'rejected'. User can resubmit anytime.

### Issue: Documents not loading
**Solution:** Verify S3/Cloudinary URLs are valid and accessible.

---

## Best Practices

### For Users (Submitting KYC)
1. **Prepare documents** - Ensure all files are readable and current
2. **Use clear images** - JPGs should be well-lit and in focus
3. **Upload to S3/Cloudinary first** - Get reliable URLs before submitting
4. **Keep records** - Save proof of submission
5. **Respond quickly** - If rejected, resubmit with corrected documents

### For Admins (Reviewing KYC)
1. **Review promptly** - Target 24-48 hour review window
2. **Be thorough** - Check document authenticity
3. **Document decisions** - Clear rejection reasons help users
4. **Follow policy** - Consistent standards for approval
5. **Flag suspicious** - Report fraudulent submissions

### For Developers
1. Use HTTPS for document URLs only
2. Validate S3/Cloudinary URLs
3. Implement retry logic for failed submissions
4. Monitor KYC queue length
5. Alert admins on high volumes

---

## Testing Checklist

- [ ] User can submit KYC documents
- [ ] Status changes to 'pending' on submission
- [ ] Submit timestamp recorded
- [ ] Admin can view all pending KYC
- [ ] Sorting by submittedAt works
- [ ] Sorting by email works
- [ ] Non-admin cannot view pending KYC
- [ ] Admin can approve KYC
- [ ] Status changes to 'verified' on approval
- [ ] Review timestamp recorded
- [ ] Admin can reject KYC
- [ ] Status changes to 'rejected' on rejection
- [ ] Rejection reason saved
- [ ] User can resubmit after rejection
- [ ] Cannot review already-verified KYC
- [ ] Max 10 documents enforced
- [ ] Document URLs validated

---

## Integration Checklist

- [x] KYC model fields added to User schema
- [x] Submit KYC endpoint created (PUT /kyc/submit)
- [x] Get pending KYC endpoint created (GET /kyc/pending)
- [x] Approve KYC endpoint created (PUT /:userId/kyc/approve)
- [x] Admin authorization enforced
- [x] Full validation implemented
- [x] Logging added for audit trail
- [ ] Frontend components (next step)
- [ ] Notifications (next step)
- [ ] Admin dashboard (next step)
- [ ] Scheduled review reminders (future)
- [ ] Document OCR verification (future)

---

## Related Documentation

- [User Model](../src/models/User.model.ts)
- [User Controller](../src/controllers/user.controller.ts)
- [User Routes](../src/routes/v1/user.routes.ts)
- [Authentication](../src/middleware/auth.middleware.ts)
- [Role-Based Access](../src/middleware/role.middleware.ts)
