# Service Hub API - Quick Reference

## Endpoints at a Glance

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/api/v1/cutting-jobs` | ✓ | BUYER | Request a cutter |
| GET | `/api/v1/cutting-jobs/my-jobs` | ✓ | BUYER/CUTTER/ADMIN | View job queue |
| GET | `/api/v1/cutting-jobs/:id` | ✓ | Participant/ADMIN | Get job details |
| PUT | `/api/v1/cutting-jobs/:id/status` | ✓ | CUTTER/ADMIN | Update progress |
| PUT | `/api/v1/cutting-jobs/:id/accept` | ✓ | CUTTER/ADMIN | Accept job |

## Job Status Progression

```
pending_acceptance → stone_received → pre_forming → faceting → polished → ready_to_ship → completed
```

## Code Examples

### Request a Cutter (Buyer)

```typescript
// Frontend
const response = await fetch('/api/v1/cutting-jobs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cutterId: '67890abc123456789012345a',
    gemId: '67890abc123456789012345b',
    instructions: 'Create brilliant cut, aim for 0.5ct',
    expectedFinishDate: '2024-02-15T00:00:00Z',
    agreedPrice: 250.00
  })
});

const { data } = await response.json();
console.log(data); // Cutting job created
```

### Get My Jobs (Role-Based)

```typescript
// Cutter views their job queue
const response = await fetch('/api/v1/cutting-jobs/my-jobs', {
  headers: {
    'Authorization': `Bearer ${cutterToken}`
  }
});

const { data } = await response.json();
console.log(data.jobs); // Jobs assigned to cutter
console.log(data.summary); // Job count by status

// Buyer views their requested jobs
const buyerResponse = await fetch('/api/v1/cutting-jobs/my-jobs', {
  headers: {
    'Authorization': `Bearer ${buyerToken}`
  }
});

const { data: buyerData } = await buyerResponse.json();
console.log(buyerData.jobs); // Jobs requested by buyer
```

### Accept a Job (Cutter)

```typescript
const response = await fetch('/api/v1/cutting-jobs/678f0abc123456789012345c/accept', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${cutterToken}`
  }
});

const { data } = await response.json();
console.log(data.jobStatus); // "stone_received"
```

### Update Job Status (Cutter)

```typescript
const response = await fetch('/api/v1/cutting-jobs/678f0abc123456789012345c/status', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${cutterToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobStatus: 'faceting',
    actualWeightCarats: 1.45,
    progressImages: ['https://cloudinary.com/img1.jpg'],
    notes: 'Making good progress'
  })
});

const { data } = await response.json();
console.log(data.jobStatus); // "faceting"
```

## Error Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, missing fields |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal issue |

## Database Operations

### Create Cutting Job

```typescript
// Controller handles validation and creation
const job = await CuttingJob.create({
  buyerId,
  cutterId,
  gemId,
  instructions,
  expectedFinishDate,
  agreedPrice,
  jobStatus: JobStatus.PENDING_ACCEPTANCE,
});
```

### Update Job Status

```typescript
// Validate status progression
const statusProgression = [
  'pending_acceptance',
  'stone_received',
  'pre_forming',
  'faceting',
  'polished',
  'ready_to_ship',
  'completed'
];

// Update job
job.jobStatus = newStatus;
if (newStatus === JobStatus.COMPLETED) {
  job.actualFinishDate = new Date();
}
await job.save();
```

### Query Jobs by Role

```typescript
// Cutter's jobs
const cutterJobs = await CuttingJob.find({
  cutterId: userId,
  jobStatus: { $ne: 'completed' }
}).sort({ createdAt: -1 });

// Buyer's jobs
const buyerJobs = await CuttingJob.find({
  buyerId: userId
}).sort({ expectedFinishDate: 1 });
```

## Field Validation Rules

| Field | Type | Rules |
|-------|------|-------|
| `cutterId` | ObjectId | Must exist, must have CUTTER role |
| `gemId` | ObjectId | Must exist, must belong to buyer |
| `instructions` | String | 10-1000 characters |
| `expectedFinishDate` | Date | Must be future date |
| `agreedPrice` | Number | ≥ 0 |
| `jobStatus` | Enum | Must be valid value, forward-only progression |
| `actualWeightCarats` | Number | ≥ 0 |
| `progressImages` | Array | Cloudinary URLs |

## Testing Checklist

- [ ] Buyer can request cutter
- [ ] Cutter can view job queue
- [ ] Cutter can accept job (status changes to stone_received)
- [ ] Cutter can update status (validates progression)
- [ ] Cannot skip statuses (e.g., pre_forming → polished)
- [ ] Cannot update completed jobs
- [ ] Buyer can only view own requested jobs
- [ ] Cutter can only update own jobs
- [ ] Admin can view all jobs
- [ ] Job completion updates order status

## Middleware Chain

```
Request
  ↓
authMiddleware (verify JWT)
  ↓
isBuyer/isCutter (check role)
  ↓
Controller (business logic & authorization)
  ↓
Response
```

## Integration Points

### With Order System
- When job `completed` → Order status → `PENDING_DISPATCH`
- Auto-release date set when job created
- Cutter fee transferred when escrow released

### With Notification System
- Job request notification to cutter
- Job accepted notification to buyer
- Status update notifications (optional)
- Job completed notification

### With Payment System
- Stripe charge created when job started (optional)
- Payment held in escrow
- Released when job completed

## Performance Tips

1. **Indexing:** Database has indexes for:
   - `cutterId + jobStatus + createdAt`
   - `buyerId + jobStatus + createdAt`
   - `expectedFinishDate`

2. **Query Optimization:**
   ```typescript
   // Good: Indexed query
   CuttingJob.find({ cutterId, jobStatus }).sort({ createdAt: -1 });
   
   // Avoid: Non-indexed field
   CuttingJob.find({ notes: 'specific text' });
   ```

3. **Pagination:** Use limit/skip for large result sets
   ```typescript
   const jobs = await CuttingJob.find({...})
     .skip((page - 1) * 20)
     .limit(20);
   ```

## Frequently Asked Questions

**Q: Can a cutter decline a job?**
A: Not in current implementation. Cutter doesn't accept = job stays pending_acceptance.

**Q: Can a job status be reverted?**
A: No. Status progression is forward-only for audit trail.

**Q: What happens if cutter misses deadline?**
A: No auto-penalty. Buyer and cutter should communicate. Admin can manually adjust if needed.

**Q: Can multiple cutters bid on same job?**
A: No. One job → one cutter. For multiple bids, create separate jobs.

**Q: Are progress images required?**
A: No, but highly recommended for buyer confidence.

**Q: How long are jobs retained?**
A: No automatic purge. Admin maintains data retention policy.

## Related Documentation

- [Full Service Hub Guide](./CUTTING_SERVICE_HUB_GUIDE.md)
- [Order System Guide](./ORDER_ESCROW_GUIDE.md)
- [Payment Integration](./PAYMENT_INTEGRATION.md)
- [API Error Handling](./API_ERROR_HANDLING.md)
