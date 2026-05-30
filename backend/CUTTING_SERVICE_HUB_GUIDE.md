# Service Hub - Cutting Job Management System

## Overview

The Service Hub is a marketplace system that connects **Buyers** (gem traders) with **Cutters** (gem cutting specialists). Buyers can request gem cutting services, and Cutters can manage their job queue with granular status tracking.

## Architecture

### Job Status Workflow

Cutting jobs progress through 7 distinct stages, providing detailed visibility into the cutting process:

```
pending_acceptance → stone_received → pre_forming → faceting → polished → ready_to_ship → completed
```

| Status | Description | Actor |
|--------|-------------|-------|
| `pending_acceptance` | Buyer has requested cutter; awaiting cutter's decision | Buyer, Cutter |
| `stone_received` | Cutter accepted job and received the rough stone | Cutter |
| `pre_forming` | Initial shaping and planning stage | Cutter |
| `faceting` | Creating facets on the stone | Cutter |
| `polished` | Final polishing stage | Cutter |
| `ready_to_ship` | Cutting complete, ready for shipment | Cutter |
| `completed` | Job closed and order ready for delivery | Cutter, Buyer |

### Enum Definition

```typescript
export enum JobStatus {
  PENDING_ACCEPTANCE = 'pending_acceptance',
  STONE_RECEIVED = 'stone_received',
  PRE_FORMING = 'pre_forming',
  FACETING = 'faceting',
  POLISHED = 'polished',
  READY_TO_SHIP = 'ready_to_ship',
  COMPLETED = 'completed',
}
```

## Data Model

### CuttingJob Schema

```typescript
interface ICuttingJob extends Document {
  orderId: ObjectId;                    // Reference to Order (if from marketplace)
  buyerId: ObjectId;                    // User who requested the cutting
  cutterId: ObjectId;                   // User performing the cutting
  gemId: ObjectId;                      // The gem being cut
  agreedPrice: number;                  // Service fee agreed between parties
  jobStatus: JobStatus;                 // Current job status (new field)
  instructions: string;                 // Cutting instructions from buyer
  expectedWeightCarats?: number;        // Expected final weight
  actualWeightCarats?: number;          // Actual final weight after cutting
  expectedFinishDate: Date;             // Target completion date
  actualFinishDate?: Date;              // Actual completion date
  progressImages: string[];             // Cloudinary URLs of work in progress
  notes?: string;                       // Cutter notes during process
  createdAt: Date;                      // Job creation timestamp
  updatedAt: Date;                      // Last update timestamp
}
```

### Database Indexes

```typescript
// Fast lookups for cutter's job queue
CuttingJobSchema.index({ cutterId: 1, jobStatus: 1, createdAt: -1 });

// Fast lookups for buyer's requested jobs
CuttingJobSchema.index({ buyerId: 1, jobStatus: 1, createdAt: -1 });

// For deadline tracking and auto-notifications
CuttingJobSchema.index({ expectedFinishDate: 1 });
CuttingJobSchema.index({ jobStatus: 1, expectedFinishDate: 1 });
```

## API Endpoints

### 1. Request a Cutter (Create Cutting Job)

**Endpoint:** `POST /api/v1/cutting-jobs`

**Authentication:** Required (Bearer token)

**Authorization:** Only BUYER role

**Request Body:**

```json
{
  "cutterId": "67890abc123456789012345a",
  "gemId": "67890abc123456789012345b",
  "instructions": "Create brilliant cut, aim for 0.5ct, standard polish",
  "expectedFinishDate": "2024-02-15T00:00:00Z",
  "agreedPrice": 250.00
}
```

**Request Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `cutterId` | ObjectId | Yes | Must be valid user with CUTTER role |
| `gemId` | ObjectId | Yes | Must belong to authenticated buyer |
| `instructions` | String | Yes | Min 10 chars, max 1000 chars (recommended) |
| `expectedFinishDate` | ISO Date | Yes | Must be future date |
| `agreedPrice` | Number | Yes | Must be ≥ 0 |

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "678f0abc123456789012345c",
    "buyerId": {
      "_id": "67890abc123456789012345d",
      "firstName": "John",
      "lastName": "Trader",
      "email": "john@example.com"
    },
    "cutterId": {
      "_id": "67890abc123456789012345a",
      "firstName": "Jane",
      "lastName": "Cutter",
      "email": "jane@example.com"
    },
    "gemId": "67890abc123456789012345b",
    "agreedPrice": 250.00,
    "jobStatus": "pending_acceptance",
    "instructions": "Create brilliant cut...",
    "expectedFinishDate": "2024-02-15T00:00:00Z",
    "progressImages": [],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  },
  "message": "Cutting job request sent to cutter"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | Bad Request | Missing required fields |
| 400 | Bad Request | Agreed price cannot be negative |
| 404 | Not Found | Gem not found |
| 403 | Forbidden | You can only request cutting for gems you own |
| 404 | Not Found | Cutter not found |
| 400 | Bad Request | Selected user is not a cutter |
| 400 | Bad Request | Expected finish date must be in the future |

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/v1/cutting-jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cutterId": "67890abc123456789012345a",
    "gemId": "67890abc123456789012345b",
    "instructions": "Create brilliant cut, aim for 0.5ct",
    "expectedFinishDate": "2024-02-15T00:00:00Z",
    "agreedPrice": 250.00
  }'
```

---

### 2. Get My Cutting Jobs (Role-Based)

**Endpoint:** `GET /api/v1/cutting-jobs/my-jobs`

**Authentication:** Required (Bearer token)

**Authorization:** Required role (CUTTER, BUYER, or ADMIN)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Filter by jobStatus (optional) |
| `sortBy` | String | Sort field: `createdAt`, `expectedFinishDate` (default: `createdAt`) |
| `order` | String | Sort order: `asc` or `desc` (default: `desc`) |

**Response Behavior:**

- **Cutter:** Returns jobs assigned to them (their job queue)
- **Buyer:** Returns jobs they requested
- **Admin:** Returns all jobs in the system

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "jobs": [
      {
        "_id": "678f0abc123456789012345c",
        "buyerId": {
          "_id": "67890abc123456789012345d",
          "firstName": "John",
          "lastName": "Trader",
          "email": "john@example.com"
        },
        "cutterId": {
          "_id": "67890abc123456789012345a",
          "firstName": "Jane",
          "lastName": "Cutter",
          "email": "jane@example.com",
          "rating": 4.8,
          "totalTransactions": 145
        },
        "gemId": {
          "_id": "67890abc123456789012345b",
          "name": "Ruby",
          "caratWeight": 1.5,
          "quality": "VVS",
          "color": "Red"
        },
        "agreedPrice": 250.00,
        "jobStatus": "faceting",
        "instructions": "Create brilliant cut...",
        "expectedFinishDate": "2024-02-15T00:00:00Z",
        "progressImages": [
          "https://cloudinary.com/image1.jpg",
          "https://cloudinary.com/image2.jpg"
        ],
        "notes": "Making good progress, stone is excellent quality",
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-25T15:45:00Z"
      }
    ],
    "summary": {
      "total": 5,
      "byStatus": {
        "pending_acceptance": 1,
        "stone_received": 0,
        "pre_forming": 1,
        "faceting": 2,
        "polished": 1,
        "ready_to_ship": 0,
        "completed": 0
      }
    }
  },
  "message": "Cutting jobs fetched successfully"
}
```

**cURL Examples:**

```bash
# Cutter viewing their job queue
curl -X GET "http://localhost:5000/api/v1/cutting-jobs/my-jobs" \
  -H "Authorization: Bearer CUTTER_JWT_TOKEN"

# Buyer viewing requested jobs, sorted by expected finish date (ascending)
curl -X GET "http://localhost:5000/api/v1/cutting-jobs/my-jobs?sortBy=expectedFinishDate&order=asc" \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/cutting-jobs/my-jobs?status=faceting" \
  -H "Authorization: Bearer CUTTER_JWT_TOKEN"
```

---

### 3. Update Job Status and Progress

**Endpoint:** `PUT /api/v1/cutting-jobs/:id/status`

**Authentication:** Required (Bearer token)

**Authorization:** Only assigned CUTTER or ADMIN

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Cutting job ID |

**Request Body:**

```json
{
  "jobStatus": "faceting",
  "actualWeightCarats": 1.45,
  "progressImages": [
    "https://cloudinary.com/progress1.jpg",
    "https://cloudinary.com/progress2.jpg"
  ],
  "notes": "Faceting in progress, stone quality excellent"
}
```

**Field Descriptions:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `jobStatus` | String | No | Must be valid JobStatus enum value; must be same or next in progression |
| `actualWeightCarats` | Number | No | Must be ≥ 0 |
| `progressImages` | String[] | No | Array of Cloudinary URLs |
| `notes` | String | No | Cutter's progress notes (max 1000 chars) |

**Status Progression Rules:**

- Status can only move forward or stay the same
- Cannot skip statuses (e.g., cannot jump from `pre_forming` to `polished`)
- Once `completed`, no further updates allowed

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "678f0abc123456789012345c",
    "jobStatus": "faceting",
    "actualWeightCarats": 1.45,
    "progressImages": [
      "https://cloudinary.com/progress1.jpg",
      "https://cloudinary.com/progress2.jpg"
    ],
    "notes": "Faceting in progress, stone quality excellent",
    "updatedAt": "2024-01-25T15:45:00Z"
  },
  "message": "Job status updated to faceting"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 404 | Not Found | Cutting job not found |
| 403 | Forbidden | You can only update jobs assigned to you |
| 400 | Bad Request | Invalid job status |
| 400 | Bad Request | Cannot skip statuses |
| 400 | Bad Request | Cannot update a completed job |
| 400 | Bad Request | Actual weight carats cannot be negative |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/v1/cutting-jobs/678f0abc123456789012345c/status \
  -H "Authorization: Bearer CUTTER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobStatus": "faceting",
    "actualWeightCarats": 1.45,
    "progressImages": ["https://cloudinary.com/progress1.jpg"],
    "notes": "Faceting in progress, excellent stone quality"
  }'
```

---

### 4. Accept a Cutting Job

**Endpoint:** `PUT /api/v1/cutting-jobs/:id/accept`

**Authentication:** Required (Bearer token)

**Authorization:** Only assigned CUTTER or ADMIN

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Cutting job ID |

**Request Body:** Empty (no body required)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "678f0abc123456789012345c",
    "jobStatus": "stone_received",
    "buyerId": { /* ... */ },
    "cutterId": { /* ... */ },
    "updatedAt": "2024-01-20T11:00:00Z"
  },
  "message": "Cutting job accepted"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 404 | Not Found | Cutting job not found |
| 403 | Forbidden | Only the assigned cutter can accept this job |
| 400 | Bad Request | Job is in status: X. Cannot accept job already accepted |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/v1/cutting-jobs/678f0abc123456789012345c/accept \
  -H "Authorization: Bearer CUTTER_JWT_TOKEN"
```

---

### 5. Get Job Details

**Endpoint:** `GET /api/v1/cutting-jobs/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Job participants (buyer/cutter) or ADMIN

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Cutting job ID |

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "678f0abc123456789012345c",
    "buyerId": {
      "_id": "67890abc123456789012345d",
      "firstName": "John",
      "lastName": "Trader",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "businessName": "Gem Traders Inc"
    },
    "cutterId": {
      "_id": "67890abc123456789012345a",
      "firstName": "Jane",
      "lastName": "Cutter",
      "email": "jane@example.com",
      "rating": 4.8,
      "totalTransactions": 145
    },
    "gemId": {
      "_id": "67890abc123456789012345b",
      "name": "Ruby",
      "caratWeight": 1.5,
      "quality": "VVS"
    },
    "agreedPrice": 250.00,
    "jobStatus": "faceting",
    "instructions": "Create brilliant cut...",
    "expectedFinishDate": "2024-02-15T00:00:00Z",
    "actualFinishDate": null,
    "progressImages": ["https://cloudinary.com/image1.jpg"],
    "notes": "Making good progress",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-25T15:45:00Z"
  },
  "message": "Job details fetched"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 404 | Not Found | Cutting job not found |
| 403 | Forbidden | You do not have access to this cutting job |

---

## Workflow Examples

### Scenario 1: Complete Cutting Job Lifecycle

**Day 1: Buyer Requests Cutter**
```
POST /api/v1/cutting-jobs
→ Job created with status: pending_acceptance
```

**Day 1: Cutter Accepts Job**
```
PUT /api/v1/cutting-jobs/:id/accept
→ Job status: stone_received
```

**Days 2-6: Cutter Updates Progress**
```
PUT /api/v1/cutting-jobs/:id/status
→ Job status: pre_forming (Day 2)
→ Job status: faceting (Day 3-5)
→ Job status: polished (Day 6)
→ Job status: ready_to_ship (Day 7)
```

**Day 7: Job Complete**
```
PUT /api/v1/cutting-jobs/:id/status (jobStatus: completed)
→ actualFinishDate recorded
→ Linked Order status → PENDING_DISPATCH
```

### Scenario 2: Cutter Views Job Queue

```
GET /api/v1/cutting-jobs/my-jobs
→ Returns all jobs where cutterId = current user
→ Grouped by status with summary counts
→ Ordered by createdAt (newest first)
```

### Scenario 3: Buyer Monitors Requests

```
GET /api/v1/cutting-jobs/my-jobs
→ Returns all jobs where buyerId = current user
→ Can filter by status (pending_acceptance, in_progress, completed)
→ Can view progress images and cutter notes
```

## Error Handling

### Common Error Scenarios

**Scenario:** Cutter tries to skip statuses
```
Request: PUT /api/v1/cutting-jobs/:id/status
Body: { "jobStatus": "polished" } # Currently at "pre_forming"

Response (400):
{
  "statusCode": 400,
  "message": "Cannot skip statuses. Current: pre_forming, requested: polished"
}
```

**Scenario:** Buyer tries to update their own job status
```
Request: PUT /api/v1/cutting-jobs/:id/status (as buyer)
Body: { "jobStatus": "faceting" }

Response (403):
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource"
}
```

**Scenario:** Invalid expected finish date
```
Request: POST /api/v1/cutting-jobs
Body: { ..., "expectedFinishDate": "2020-01-01T00:00:00Z" }

Response (400):
{
  "statusCode": 400,
  "message": "Expected finish date must be in the future"
}
```

## Integration with Order System

When a cutting job reaches `completed` status:

1. **Auto-Update Order Status**
   - Order.status changes to `PENDING_DISPATCH`
   - Seller (cutter) can now ship the finished gem

2. **Trigger Notification**
   - Buyer notified: "Your cutting job is complete!"
   - Email notification with job details

3. **Payment Processing**
   - Cutter payment released (if escrow was held)
   - Transaction counts updated for both parties

## Rate Limiting & Quotas

- **Job Creation:** 100 requests/hour per user
- **Status Updates:** Unlimited (per assigned cutter)
- **Query Limit:** 1000 jobs per request

## Best Practices

### For Buyers

1. **Clear Instructions**
   - Provide detailed cutting specifications
   - Include reference images if possible
   - Specify desired final weight/carat

2. **Realistic Timeline**
   - Set expectedFinishDate with buffer time
   - Consider seasonal demand

3. **Communication**
   - Monitor job progress regularly
   - Review progress images
   - Provide feedback to cutter

### For Cutters

1. **Prompt Acceptance**
   - Review job details thoroughly
   - Accept/decline within 24 hours

2. **Regular Updates**
   - Update status at each workflow stage
   - Upload progress photos
   - Add notes on challenges/observations

3. **Quality Commitment**
   - Meet weight targets when possible
   - Document any issues early
   - Request clarification if needed

## Troubleshooting

### Issue: Cutter cannot see their job queue
**Solution:** Verify user has CUTTER role in database
```
User.findByIdAndUpdate(userId, { roles: ['CUTTER', 'BUYER'] })
```

### Issue: Status update rejected as "cannot skip statuses"
**Solution:** Update to next status in sequence, not target status
```
Current: pre_forming
Update to: faceting (next step, not polished)
```

### Issue: Gem not found error when requesting cutter
**Solution:** Verify gemId exists and belongs to buyer
```
GET /api/v1/gems/:gemId
```

## Security & Authorization

- All endpoints enforce JWT authentication
- Cutters can only update their own jobs
- Buyers can only view their requested jobs
- Admins have full access to all jobs
- No cross-role data visibility
