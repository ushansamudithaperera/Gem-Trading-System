# Dispute Center - Quick Reference

## Endpoints Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/api/v1/disputes` | ✓ | BUYER/SELLER | Open a dispute |
| GET | `/api/v1/disputes` | ✓ | All (filtered) | View disputes |
| PUT | `/api/v1/disputes/:id/resolve` | ✓ | ADMIN | Resolve dispute |

---

## Dispute Status Flow

```
OPEN → UNDER_REVIEW → RESOLVED_BUYER or RESOLVED_SELLER → CLOSED
```

---

## Code Examples

### Open a Dispute (TypeScript/React)

```typescript
const openDispute = async (orderId: string, reason: string) => {
  const response = await fetch('/api/v1/disputes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId,
      reason: 'NOT_RECEIVED',
      description: 'Detailed explanation of the issue...',
      evidenceUrls: ['https://cloudinary.com/evidence.jpg']
    })
  });

  const { data } = await response.json();
  console.log('Dispute opened:', data._id);
};
```

### Get My Disputes

```typescript
const getMyDisputes = async () => {
  const response = await fetch('/api/v1/disputes', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const { data } = await response.json();
  console.log('My disputes:', data.disputes);
  console.log('Summary:', data.summary);
};

// Filter by status
const getOpenDisputes = async () => {
  const response = await fetch('/api/v1/disputes?status=OPEN', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const { data } = await response.json();
  return data.disputes;
};
```

### Resolve a Dispute (Admin)

```typescript
const resolveDispute = async (disputeId: string, decision: 'BUYER' | 'SELLER') => {
  const response = await fetch(`/api/v1/disputes/${disputeId}/resolve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      decision,
      resolution: 'Admin resolution notes...'
    })
  });

  const { data } = await response.json();
  console.log('Dispute resolved:', data.status);
};
```

---

## Reason Values

```typescript
'NOT_RECEIVED'       // Gem not received
'ITEM_MISMATCH'      // Doesn't match description
'DAMAGED'            // Arrived damaged
'CUTTING_QUALITY'    // Cutting service issue
'OTHER'              // Other reason
```

---

## Response Structure

### Success Response
```json
{
  "statusCode": 201,
  "data": { /* dispute object */ },
  "message": "Dispute opened successfully..."
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 201 | Dispute created |
| 200 | Success (GET/PUT) |
| 400 | Bad request (validation) |
| 401 | Unauthorized (missing token) |
| 403 | Forbidden (not allowed) |
| 404 | Not found (resource) |

---

## Field Validation

| Field | Constraints |
|-------|------------|
| `orderId` | Valid ObjectId, must exist |
| `reason` | Must be valid enum value |
| `description` | 10-2000 characters |
| `evidenceUrls` | Max 10 URLs |
| `decision` | Must be "BUYER" or "SELLER" |
| `resolution` | Max 2000 characters |

---

## Escrow State Changes

### When Dispute Opens
```
Before: Order.escrowStatus = HELD (released or about to release)
After:  Order.escrowStatus = HELD (frozen - cannot release)
```

### When BUYER Wins
```
Order.status = CANCELLED
Order.escrowStatus = REFUNDED
→ Funds returned to buyer
```

### When SELLER Wins
```
Order.status = COMPLETED
Order.escrowStatus = RELEASED
→ Funds released to seller
```

---

## curl Commands

### Open Dispute
```bash
curl -X POST http://localhost:5000/api/v1/disputes \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "67890abc...",
    "reason": "NOT_RECEIVED",
    "description": "Never received the gem",
    "evidenceUrls": ["https://cloudinary.com/evidence.jpg"]
  }'
```

### Get All Disputes (Admin)
```bash
curl -X GET http://localhost:5000/api/v1/disputes \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Open Disputes Only
```bash
curl -X GET "http://localhost:5000/api/v1/disputes?status=OPEN" \
  -H "Authorization: Bearer $TOKEN"
```

### Resolve Dispute
```bash
curl -X PUT http://localhost:5000/api/v1/disputes/dispute123/resolve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "BUYER",
    "resolution": "Evidence confirms no delivery received"
  }'
```

---

## Database Queries

### Find Open Disputes
```javascript
db.disputes.find({ status: 'OPEN' });
```

### Find Disputes by User
```javascript
db.disputes.find({ raisedBy: ObjectId('...') });
```

### Find Disputes for Order
```javascript
db.disputes.find({ orderId: ObjectId('...') });
```

### Find Resolved Disputes (stats)
```javascript
db.disputes.aggregate([
  { $match: { status: { $in: ['RESOLVED_BUYER', 'RESOLVED_SELLER'] } } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

---

## Error Codes & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid reason | Wrong enum value | Use valid reason from list |
| Not involved in order | Not buyer/seller | Only order participants can dispute |
| Dispute already exists | Active dispute on order | Wait for resolution |
| Admin only | Non-admin trying to resolve | Only admins can resolve |
| Order not found | Invalid orderId | Verify order exists |

---

## Dispute Workflow Timeline

```
t=0:      Buyer opens dispute
          → Order status: DISPUTED
          → Escrow status: HELD (frozen)

t=0-4h:   Admin notified, begins review

t=4-48h:  Admin reviews evidence
          → May request more info
          → Documents findings

t=48h:    Admin resolves dispute
          → Updates to RESOLVED_BUYER/SELLER
          → Escrow released or refunded
          → Buyer/Seller notified

t=48h+:   Dispute closed (archived)
```

---

## Performance Tips

1. **Indexes are optimized** for:
   - Finding by status
   - Finding by user
   - Finding by order
   - Sorting by creation/resolution time

2. **Pagination** (when implemented):
   ```typescript
   GET /api/v1/disputes?limit=20&skip=0
   ```

3. **Filtering** options:
   ```typescript
   GET /api/v1/disputes?status=OPEN&sortBy=createdAt&order=desc
   ```

---

## Testing

### Happy Path Test
```javascript
1. Buyer opens dispute ✓
2. Check order status = DISPUTED ✓
3. Check escrow = HELD ✓
4. Admin resolves as BUYER ✓
5. Check order status = CANCELLED ✓
6. Check escrow = REFUNDED ✓
```

### Authorization Test
```javascript
1. Non-involved user tries to open ✗
2. Non-admin tries to resolve ✗
3. Only valid users can access ✓
```

### Validation Test
```javascript
1. Invalid reason rejected ✗
2. Short description rejected ✗
3. Too many evidence files rejected ✗
```

---

## Integration with Order System

When dispute resolves as **BUYER**:
```
Dispute → RESOLVED_BUYER
Order → CANCELLED
Escrow → REFUNDED
Payment → Stripe refund issued
Notification → Buyer refunded, Seller notified
```

When dispute resolves as **SELLER**:
```
Dispute → RESOLVED_SELLER
Order → COMPLETED
Escrow → RELEASED
Payment → Stripe payout issued
Notification → Seller paid, Buyer notified
```

---

## Troubleshooting

**Q: Why can't I open another dispute?**
A: Only one active dispute per order. Wait for previous resolution.

**Q: Why is escrow frozen?**
A: Disputes lock escrow to prevent unauthorized release during resolution.

**Q: Can I appeal a decision?**
A: Not in current version. Contact support for concerns.

**Q: How long does resolution take?**
A: Typically 24-48 hours depending on complexity.

**Q: What evidence should I provide?**
A: Tracking screenshots, photos, communication logs, anything relevant.

---

## Related Files

- Model: `backend/src/models/Dispute.model.ts`
- Controller: `backend/src/controllers/dispute.controller.ts`
- Routes: `backend/src/routes/v1/dispute.routes.ts`
- Full Guide: `backend/DISPUTE_CENTER_GUIDE.md`
