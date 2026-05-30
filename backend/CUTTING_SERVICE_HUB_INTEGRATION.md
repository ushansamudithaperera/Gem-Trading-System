# Service Hub Implementation & Integration Guide

## Implementation Status

### ✅ Completed Components

1. **Database Model (CuttingJob.model.ts)**
   - [x] New JobStatus enum with 7 granular statuses
   - [x] ICuttingJob interface with agreedPrice field
   - [x] Mongoose schema with all required fields
   - [x] Comprehensive database indexes for performance

2. **API Controller (cutting.controller.ts)**
   - [x] `requestCutter()` - Buyer requests cutter with validation
   - [x] `updateJobStatus()` - Cutter updates progress with status validation
   - [x] `getMyJobs()` - Role-based job queue fetching
   - [x] `getJobDetails()` - Participant-only job detail access
   - [x] `acceptJob()` - Cutter accepts pending job request
   - [x] Backward compatibility functions

3. **API Routes (cutting.routes.ts)**
   - [x] POST `/api/v1/cutting-jobs` - Request cutter
   - [x] GET `/api/v1/cutting-jobs/my-jobs` - View job queue
   - [x] GET `/api/v1/cutting-jobs/:id` - Get job details
   - [x] PUT `/api/v1/cutting-jobs/:id/status` - Update progress
   - [x] PUT `/api/v1/cutting-jobs/:id/accept` - Accept job
   - [x] Legacy routes for backward compatibility

4. **Security & Authorization**
   - [x] Role-based middleware (BUYER, CUTTER, ADMIN)
   - [x] Job ownership validation in controllers
   - [x] JWT authentication on all routes
   - [x] Status progression validation

5. **Documentation**
   - [x] Comprehensive API guide with examples
   - [x] Quick reference sheet
   - [x] Error handling documentation

---

## Integration with Existing Systems

### 1. Integration with Order System

**Current Integration:**
- When cutter completes job → Order.status automatically updated to `PENDING_DISPATCH`
- Order.cutterId populated when job created
- Order.status can transition to `IN_CUTTING_PROCESS` via hireCutter (legacy)

**Required Enhancements:**
```typescript
// In Order.model.ts - verify this relationship exists
interface IOrder {
  cutterId?: ObjectId;  // Should reference CuttingJob creator
  // ... other fields
}

// In order.controller.ts - when releasing escrow
// Include cutter fee calculation if gem went through cutting service
const cutterAmount = calculatedCutterFee; // From CuttingJob.agreedPrice
```

### 2. Integration with Payment System

**Current Situation:**
- PaymentService has stripe methods for escrow holds and transfers
- Cutter payments currently handled via transferToSellerAccount()

**Required Enhancement:**
```typescript
// In PaymentService.transferToSellerAccount()
export const transferToCutterAccount = async (
  stripeConnectAccountId: string,
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) => {
  // Similar to transferToSellerAccount but for cutters
  // Cutters need their own Stripe Connect accounts
}

// In User.model.ts - add field
interface IUser {
  stripeConnectAccountId?: string;  // Already exists
  // Cutters should set this for payout
}
```

### 3. Integration with Notification System

**Notification Events to Implement:**
```typescript
// notification.controller.ts or notification.service.ts

// When job requested
await notificationService.notify(cutterId, {
  type: 'CUTTING_JOB_REQUESTED',
  data: {
    jobId,
    buyerName,
    gemName,
    agreedPrice,
    expectedFinishDate
  }
});

// When job accepted
await notificationService.notify(buyerId, {
  type: 'CUTTING_JOB_ACCEPTED',
  data: { jobId, cutterName }
});

// When job status updated
await notificationService.notify(buyerId, {
  type: 'CUTTING_JOB_PROGRESS_UPDATE',
  data: {
    jobId,
    newStatus,
    notes,
    progressImageCount
  }
});

// When job completed
await notificationService.notify(buyerId, {
  type: 'CUTTING_JOB_COMPLETED',
  data: {
    jobId,
    actualWeightCarats,
    cutterName
  }
});
```

### 4. Integration with Socket Events

**Real-Time Updates (sockets/events.ts):**
```typescript
// Add cutting job events
export const CUTTING_EVENTS = {
  JOB_REQUESTED: 'cutting:job:requested',
  JOB_ACCEPTED: 'cutting:job:accepted',
  JOB_STATUS_UPDATED: 'cutting:job:status_updated',
  JOB_COMPLETED: 'cutting:job:completed',
  PROGRESS_IMAGE_ADDED: 'cutting:progress:image_added',
};

// Usage in controller
io.to(`cutter:${cutterId}`).emit(CUTTING_EVENTS.JOB_REQUESTED, jobData);
io.to(`buyer:${buyerId}`).emit(CUTTING_EVENTS.JOB_ACCEPTED, jobData);
```

---

## Frontend Integration Tasks

### 1. Create CutterDashboard Component

**Location:** `frontend/src/pages/CutterDashboard.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const CutterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch(
        `/api/v1/cutting-jobs/my-jobs?status=${activeTab}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const { data } = await response.json();
      setJobs(data.jobs);
    };

    fetchJobs();
  }, [activeTab]);

  // Render job queue with status tabs
  return (
    <div className="cutter-dashboard">
      {/* Tab navigation by status */}
      {/* Job list showing pending jobs, in-progress jobs, completed jobs */}
    </div>
  );
};
```

### 2. Create BuyerServiceHub Component

**Location:** `frontend/src/pages/ServiceHub.tsx`

```typescript
export const ServiceHub = () => {
  // Browse available cutters
  // Request cutting service for owned gems
  // Track cutting job progress
  // View progress images and notes
};
```

### 3. Update Existing Components

**App.tsx or Router:**
```typescript
import { CutterDashboard } from './pages/CutterDashboard';
import { ServiceHub } from './pages/ServiceHub';

// Add routes
<Route path="/dashboard/cutting" element={<CutterDashboard />} />
<Route path="/service-hub" element={<ServiceHub />} />
```

---

## Database Setup & Migration

### 1. Verify CuttingJob Collection

```javascript
// MongoDB shell commands to verify setup
db.cuttingjobs.getIndexes();
// Should show indexes for:
// - cutterId, jobStatus, createdAt
// - buyerId, jobStatus, createdAt
// - expectedFinishDate
// - jobStatus, expectedFinishDate

// Check if legacy data exists
db.cuttingjobs.findOne({ status: 'PENDING' });
// If yes, migration needed (see below)
```

### 2. Optional: Migrate Legacy Data

```javascript
// If migrating from old CuttingStatus enum to new JobStatus:

db.cuttingjobs.updateMany(
  { status: 'PENDING' },
  {
    $set: { jobStatus: 'pending_acceptance' },
    $unset: { status: 1 }
  }
);

db.cuttingjobs.updateMany(
  { status: 'ACCEPTED' },
  {
    $set: { jobStatus: 'stone_received' },
    $unset: { status: 1 }
  }
);

db.cuttingjobs.updateMany(
  { status: 'IN_PROGRESS' },
  {
    $set: { jobStatus: 'faceting' },
    $unset: { status: 1 }
  }
);

db.cuttingjobs.updateMany(
  { status: 'COMPLETED' },
  {
    $set: { jobStatus: 'completed' },
    $unset: { status: 1 }
  }
);
```

### 3. Verify User Collection

```javascript
// Ensure cutters have CUTTER role
db.users.find({ roles: 'CUTTER' }).count();

// Add CUTTER role if needed
db.users.updateOne(
  { _id: ObjectId('...') },
  { $push: { roles: 'CUTTER' } }
);
```

---

## Testing Requirements

### Unit Tests

```typescript
// tests/unit/services/cutting.service.test.ts

describe('Cutting Service', () => {
  describe('requestCutter()', () => {
    it('should create cutting job with pending_acceptance status');
    it('should validate cutter has CUTTER role');
    it('should validate gem belongs to buyer');
    it('should reject future dates in the past');
    it('should reject negative prices');
  });

  describe('updateJobStatus()', () => {
    it('should validate status progression');
    it('should prevent status regression');
    it('should prevent skipping statuses');
    it('should set actualFinishDate on completion');
    it('should update linked order status on completion');
  });

  describe('getMyJobs()', () => {
    it('should return cutter jobs for CUTTER role');
    it('should return buyer jobs for BUYER role');
    it('should return all jobs for ADMIN role');
    it('should filter by status when provided');
    it('should sort correctly');
  });
});
```

### Integration Tests

```typescript
// tests/integration/cutting.integration.test.ts

describe('Cutting Job Flow', () => {
  it('should handle complete job lifecycle', async () => {
    // 1. Buyer requests cutter
    const jobRes = await request(app)
      .post('/api/v1/cutting-jobs')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ /* job data */ });

    expect(jobRes.body.data.jobStatus).toBe('pending_acceptance');

    // 2. Cutter accepts job
    const acceptRes = await request(app)
      .put(`/api/v1/cutting-jobs/${jobRes.body.data._id}/accept`)
      .set('Authorization', `Bearer ${cutterToken}`);

    expect(acceptRes.body.data.jobStatus).toBe('stone_received');

    // 3. Cutter updates through statuses
    // ... test each status transition

    // 4. Verify order status updated
    const orderRes = await request(app)
      .get(`/api/v1/orders/${orderId}`);

    expect(orderRes.body.data.status).toBe('PENDING_DISPATCH');
  });
});
```

### Manual Testing

```bash
# 1. Test as Buyer - Request Cutter
curl -X POST http://localhost:5000/api/v1/cutting-jobs \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cutterId": "'$CUTTER_ID'",
    "gemId": "'$GEM_ID'",
    "instructions": "Test cutting",
    "expectedFinishDate": "2024-02-15T00:00:00Z",
    "agreedPrice": 250
  }'

# 2. Test as Cutter - View Jobs
curl -X GET "http://localhost:5000/api/v1/cutting-jobs/my-jobs" \
  -H "Authorization: Bearer $CUTTER_TOKEN"

# 3. Test as Cutter - Accept Job
curl -X PUT "http://localhost:5000/api/v1/cutting-jobs/$JOB_ID/accept" \
  -H "Authorization: Bearer $CUTTER_TOKEN"

# 4. Test as Cutter - Update Status
curl -X PUT "http://localhost:5000/api/v1/cutting-jobs/$JOB_ID/status" \
  -H "Authorization: Bearer $CUTTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobStatus": "faceting",
    "progressImages": ["https://cloudinary.com/test.jpg"],
    "notes": "Making progress"
  }'
```

---

## Performance Optimization

### Database Indexes (Already Configured)

```typescript
// ✅ Covered by schema indexes:

// Fast cutter job queue lookups
CuttingJobSchema.index({ cutterId: 1, jobStatus: 1, createdAt: -1 });

// Fast buyer job lookups
CuttingJobSchema.index({ buyerId: 1, jobStatus: 1, createdAt: -1 });

// Deadline tracking
CuttingJobSchema.index({ expectedFinishDate: 1 });
CuttingJobSchema.index({ jobStatus: 1, expectedFinishDate: 1 });
```

### Query Optimization

```typescript
// ✅ Good: Uses indexes
CuttingJob.find({ cutterId, jobStatus }).sort({ createdAt: -1 });

// ✅ Good: Uses partial index
CuttingJob.find({ expectedFinishDate: { $lt: new Date() } });

// ❌ Avoid: Requires full collection scan
CuttingJob.find({ notes: 'specific text' });

// ✅ Better: Use full-text search if needed
CuttingJobSchema.index({ notes: 'text' });
```

### Caching Strategy

```typescript
// Cache frequently accessed cutters
const cutterCache = new Map(); // Or Redis

const getCutterDetails = async (cutterId: string) => {
  if (cutterCache.has(cutterId)) {
    return cutterCache.get(cutterId);
  }

  const cutter = await User.findById(cutterId);
  cutterCache.set(cutterId, cutter);
  
  // Invalidate cache after 1 hour
  setTimeout(() => cutterCache.delete(cutterId), 3600000);
  
  return cutter;
};
```

---

## Monitoring & Logging

### Key Metrics to Track

```typescript
// In logging middleware
logger.info('CUTTING_JOB_CREATED', {
  jobId,
  buyerId,
  cutterId,
  agreedPrice,
  timestamp: new Date()
});

logger.info('CUTTING_JOB_STATUS_CHANGED', {
  jobId,
  fromStatus,
  toStatus,
  cutterId,
  timestamp: new Date()
});

logger.error('CUTTING_JOB_ERROR', {
  jobId,
  error,
  context: req.body
});
```

### Alert Thresholds

- Pending acceptance > 24 hours → Alert cutter
- Job past expectedFinishDate → Alert both parties
- Error rate on cutting endpoints > 5% → Alert team

---

## Deployment Checklist

- [ ] Database indexes created and verified
- [ ] Environment variables configured (no required new ones)
- [ ] Backend tests passing (unit + integration)
- [ ] API endpoints tested manually with curl
- [ ] Frontend components built and tested
- [ ] Routes added to app router
- [ ] Notifications integrated
- [ ] Socket events configured
- [ ] Performance testing completed
- [ ] Error handling tested
- [ ] Documentation reviewed
- [ ] Staging environment validated
- [ ] Production database backed up
- [ ] Rollback plan documented

---

## Rollback Plan

If issues arise after deployment:

```bash
# 1. Keep legacy endpoints working (already in routes)
POST /api/v1/cutting-jobs/hire → hireCutter()
PUT /api/v1/cutting-jobs/:jobId/progress → updateCuttingProgress()

# 2. Database rollback (if needed)
# - CuttingJob schema accepts both status and jobStatus
# - Code handles both enum types
# - No migration script required

# 3. If critical issue found
git revert <commit-hash>
npm run build
npm start
```

---

## Future Enhancements

1. **Cutter Profiles & Ratings**
   - Display cutter specialties
   - Show customer ratings and reviews
   - Filter cutters by rating, price, availability

2. **Batch Jobs**
   - Request multiple gems cut in one job
   - Volume discounts

3. **Dispute Resolution**
   - Quality disputes about finished gem
   - Cutter mistakes refund policy

4. **Insurance & Liability**
   - Gem loss/damage insurance
   - Liability coverage options

5. **Analytics**
   - Cutter utilization rates
   - Average job duration by complexity
   - Customer satisfaction scores

6. **Automated Scheduling**
   - Estimated queue time calculation
   - Automated deadline reminders
   - Queue management optimization

---

## Support & Troubleshooting

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| Cutter not in job queue | Verify CUTTER role assigned |
| Cannot update job status | Check if job is already completed |
| Gem not found error | Verify gem belongs to buyer |
| Status skip validation error | Update to next status in sequence |

For additional support, refer to:
- [Full Service Hub Guide](./CUTTING_SERVICE_HUB_GUIDE.md)
- [Quick Reference](./CUTTING_SERVICE_HUB_QUICK_REFERENCE.md)
- [Code Comments](../src/controllers/cutting.controller.ts)
