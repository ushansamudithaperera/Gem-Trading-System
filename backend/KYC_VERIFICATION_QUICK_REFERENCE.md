# KYC Verification - Quick Reference

## Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| PUT | `/api/v1/users/kyc/submit` | All | Submit KYC documents |
| GET | `/api/v1/users/kyc/pending` | ADMIN | Get pending reviews |
| PUT | `/api/v1/users/:userId/kyc/approve` | ADMIN | Approve/reject KYC |

---

## Code Examples

### TypeScript (API Client)

```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 1. Submit KYC Documents
async function submitKYC(documentUrls: string[]) {
  const response = await API.put('/users/kyc/submit', {
    documentUrls,
  });
  return response.data;
}

// 2. Get Pending KYC (Admin)
async function getPendingKYC() {
  const response = await API.get('/users/kyc/pending');
  return response.data;
}

// 3. Approve KYC (Admin)
async function approveKYC(userId: string, approved: boolean, rejectionReason?: string) {
  const response = await API.put(`/users/${userId}/kyc/approve`, {
    approved,
    rejectionReason,
  });
  return response.data;
}
```

### cURL Commands

```bash
# 1. Submit KYC
curl -X PUT http://localhost:5000/api/v1/users/kyc/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrls": [
      "https://s3.amazonaws.com/kyc-docs/business-reg.pdf",
      "https://s3.amazonaws.com/kyc-docs/id.jpg"
    ]
  }'

# 2. Get Pending KYC (sorted by submission date, ascending)
curl -X GET http://localhost:5000/api/v1/users/kyc/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Get Pending KYC (sorted by email, descending)
curl -X GET "http://localhost:5000/api/v1/users/kyc/pending?sortBy=email&order=desc" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 4. Approve KYC
curl -X PUT http://localhost:5000/api/v1/users/USER_ID/kyc/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# 5. Reject KYC
curl -X PUT http://localhost:5000/api/v1/users/USER_ID/kyc/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "rejectionReason": "Expired documents. Please resubmit current credentials."
  }'
```

---

## Field Validation Rules

### submitKYC Request

```typescript
{
  documentUrls: string[]  // Required, non-empty, max 10 items, valid URLs
}
```

| Field | Type | Required | Min | Max | Error Messages |
|-------|------|----------|-----|-----|----------------|
| `documentUrls` | String[] | ✓ | 1 | 10 | Must be array of valid strings |

### approveKYC Request

```typescript
{
  approved: boolean              // Required
  rejectionReason?: string       // Required if approved=false
}
```

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|------------|-----------|
| `approved` | Boolean | ✓ | N/A | Must be true or false |
| `rejectionReason` | String | Conditional | 500 | Required when approved=false |

---

## KYC Status Values

```typescript
enum KYCStatus {
  UNVERIFIED = 'unverified',   // Initial state
  PENDING = 'pending',          // Awaiting admin review
  VERIFIED = 'verified',        // Approved by admin
  REJECTED = 'rejected',        // Rejected by admin
}
```

**Transitions:**
- `unverified` → `pending` (on submit)
- `pending` → `verified` (on admin approve)
- `pending` → `rejected` (on admin reject)
- `rejected` → `pending` (on resubmit)

---

## HTTP Status Codes

### Success Responses

| Code | Endpoint | Meaning |
|------|----------|---------|
| 200 | PUT /kyc/submit | Documents submitted, status→pending |
| 200 | GET /kyc/pending | Pending list returned |
| 200 | PUT /:userId/kyc/approve | KYC approved/rejected |

### Error Responses

| Code | Scenario |
|------|----------|
| 400 | Empty documentUrls array, Invalid URLs, >10 documents, Missing approved field, Missing rejectionReason, Rejection reason >500 chars, Non-boolean approved |
| 403 | User not authenticated, User lacks ADMIN role |
| 404 | User not found |

---

## Response Structure

### Success Response Template

```json
{
  "statusCode": 200,
  "data": { /* User object with KYC data */ },
  "message": "Success message"
}
```

### Error Response Template

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": { /* Details */ }
}
```

---

## User Object with KYC

```typescript
{
  _id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  businessName?: string;
  kyc: {
    documentUrls: string[];
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
  };
  rating: number;
  totalTransactions: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Database Queries

### Find pending KYC users

```typescript
// Quick query
const pending = await User.find({ 'kyc.status': 'pending' });

// With sorting
const pending = await User.find({ 'kyc.status': 'pending' })
  .sort({ 'kyc.submittedAt': 1 }); // Oldest first

const pending = await User.find({ 'kyc.status': 'pending' })
  .sort({ 'kyc.submittedAt': -1 }); // Newest first

// With role filter
const pendingSellers = await User.find({
  'kyc.status': 'pending',
  roles: 'SELLER'
});

// With pagination
const pending = await User.find({ 'kyc.status': 'pending' })
  .sort({ 'kyc.submittedAt': 1 })
  .skip(10)
  .limit(20);
```

### Find verified users

```typescript
const verified = await User.find({ 'kyc.status': 'verified' });
```

### Find rejected users

```typescript
const rejected = await User.find({ 'kyc.status': 'rejected' });
```

### Check single user KYC status

```typescript
const user = await User.findById(userId);
console.log(user.kyc.status); // 'unverified' | 'pending' | etc
```

---

## Common Patterns

### Frontend: Submit KYC Form

```typescript
const [documentUrls, setDocumentUrls] = useState<string[]>([]);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleSubmit() {
  if (!documentUrls.length) {
    setError('Please upload at least one document');
    return;
  }

  setSubmitting(true);
  try {
    const response = await API.put('/users/kyc/submit', { documentUrls });
    // Show success message
    showNotification('KYC submitted successfully! Awaiting admin review.');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to submit KYC');
  } finally {
    setSubmitting(false);
  }
}
```

### Frontend: Admin Review Queue

```typescript
const [pending, setPending] = useState([]);
const [loading, setLoading] = useState(true);

async function loadPendingKYC() {
  setLoading(true);
  try {
    const response = await API.get('/users/kyc/pending');
    setPending(response.data.data.users);
  } catch (err) {
    console.error('Failed to load pending KYC:', err);
  } finally {
    setLoading(false);
  }
}

async function approveUser(userId: string) {
  try {
    await API.put(`/users/${userId}/kyc/approve`, { approved: true });
    // Refresh list
    loadPendingKYC();
  } catch (err) {
    console.error('Failed to approve:', err);
  }
}

async function rejectUser(userId: string, reason: string) {
  try {
    await API.put(`/users/${userId}/kyc/approve`, {
      approved: false,
      rejectionReason: reason,
    });
    // Refresh list
    loadPendingKYC();
  } catch (err) {
    console.error('Failed to reject:', err);
  }
}
```

---

## Logging & Monitoring

### Events Logged

```typescript
// User submits KYC
logger.info(`KYC submitted by user ${userId}`, {
  userId,
  documentCount,
  submittedAt,
});

// Admin approves KYC
logger.info(`KYC approved for user ${userId}`, {
  userId,
  approvedBy: adminId,
  timestamp,
});

// Admin rejects KYC
logger.info(`KYC rejected for user ${userId}`, {
  userId,
  rejectedBy: adminId,
  reason,
  timestamp,
});
```

### Metrics to Track

- Number of pending KYC requests
- Average review time
- Approval vs rejection ratio
- Most common rejection reasons
- Time from submission to approval

---

## Troubleshooting

### "Document URLs are required"
- Ensure documentUrls array is provided
- Check that array is not empty

### "Maximum 10 documents allowed"
- Reduce number of documents to ≤10
- Remove duplicate URLs

### "All document URLs must be valid strings"
- Verify all items in documentUrls array are strings
- Check for null or undefined values

### "Access denied. Only administrators can..."
- Verify user has ADMIN role
- Check JWT token is valid
- Ensure Authorization header is present

### "Cannot review KYC with status: verified"
- Cannot review already-verified KYC
- Check user's kyc.status in database

### "Rejection reason is required when rejecting"
- When approved=false, must provide rejectionReason
- Must be non-empty string ≤500 chars

---

## Integration Points

### With Order System
- **Check before sale:** Verify seller kyc.status = 'verified'
- **Transaction limits:** Apply limits based on kyc.status

### With Stripe Connect
- **Payout:** Only verified sellers can receive payouts
- **Cross-check:** Stripe may require additional KYC

### With Notifications (Ready for)
- **Approval:** Send email to user when approved
- **Rejection:** Send email with rejection reason
- **Reminders:** Remind users to submit KYC

---

## Performance Considerations

**Indexes Created:**
```typescript
{ 'kyc.status': 1, 'kyc.submittedAt': -1 }    // Fast pending queries
{ roles: 1, 'kyc.status': 1 }                  // Role-based filtering
```

**Query Performance:**
- Finding pending KYC: O(log n) - indexed
- Sorting by submission: O(n log n) - index ordered
- Role filtering: O(log n) - compound index

---

## Security Checklist

- ✓ Admin-only routes properly protected with `isAdmin` middleware
- ✓ JWT token required on all endpoints
- ✓ Document URLs validated
- ✓ Input validation on all fields
- ✓ User cannot modify other users' KYC
- ✓ Rejection reasons logged for audit
- ✓ No sensitive data in responses

---

## Testing Commands

```bash
# 1. Create test documents in S3
# (Use AWS CLI or S3 console)

# 2. Submit KYC with test documents
curl -X PUT http://localhost:5000/api/v1/users/kyc/submit \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentUrls": ["https://s3.amazonaws.com/test.pdf"]}'

# 3. Verify status changed to pending
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer USER_TOKEN"

# 4. View pending as admin
curl -X GET http://localhost:5000/api/v1/users/kyc/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 5. Approve KYC
curl -X PUT http://localhost:5000/api/v1/users/USER_ID/kyc/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# 6. Verify status changed to verified
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## FAQ

**Q: Can users resubmit KYC if rejected?**  
A: Yes. They can call PUT /kyc/submit again anytime, even if status is 'rejected'.

**Q: How long do documents stay pending?**  
A: There's no automatic timeout. Admin should review within 24-48 hours per SLA.

**Q: Can admins batch approve/reject?**  
A: Current API requires individual approvals. Batch endpoint could be added if needed.

**Q: Where are documents stored?**  
A: S3 or Cloudinary. Only URLs are stored in database, not documents themselves.

**Q: Can users edit submitted KYC?**  
A: Not directly. They must resubmit via PUT /kyc/submit, which overwrites previous submission.

**Q: What if a user is both SELLER and CUTTER?**  
A: Single KYC verification covers all roles for that user.

**Q: Is KYC required before first transaction?**  
A: Should be checked in Order model. Users with kyc.status != 'verified' should be restricted.

**Q: Can admins see rejection reasons?**  
A: Yes, in the user object under kyc.rejectionReason.

---

## Related Files

- `backend/src/models/User.model.ts` - KYC schema definition
- `backend/src/controllers/user.controller.ts` - KYC controller functions
- `backend/src/routes/v1/user.routes.ts` - KYC routes
- `backend/src/middleware/auth.middleware.ts` - JWT authentication
- `backend/src/middleware/role.middleware.ts` - Role authorization
