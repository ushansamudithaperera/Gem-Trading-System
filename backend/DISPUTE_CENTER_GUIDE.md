# Dispute Center - Escrow Conflict Resolution System

## Overview

The Dispute Center is a comprehensive escrow conflict resolution system that allows buyers and sellers to open disputes for problematic orders. When a dispute is opened, escrow funds are automatically frozen to prevent unauthorized release. Administrators can then review evidence and resolve disputes, triggering appropriate escrow refunds or releases.

---

## System Architecture

### Dispute Lifecycle

```
Order Placed (Escrow HELD)
         ↓
    [BUYER or SELLER opens dispute]
         ↓
Order Status: DISPUTED
Escrow Status: HELD (FROZEN)
Dispute Status: OPEN
         ↓
    [ADMIN reviews evidence]
         ↓
Dispute Status: UNDER_REVIEW
         ↓
    [ADMIN makes decision]
         ↓
IF Buyer Wins:
  - Dispute Status: RESOLVED_BUYER
  - Order Status: CANCELLED
  - Escrow Status: REFUNDED
  ✓ Funds returned to buyer

IF Seller Wins:
  - Dispute Status: RESOLVED_SELLER
  - Order Status: COMPLETED
  - Escrow Status: RELEASED
  ✓ Funds released to seller
```

### Key Features

✅ **Automatic Escrow Freezing** - Prevents fund release during disputes  
✅ **Evidence Management** - Support for multiple evidence URLs (S3/Cloudinary)  
✅ **Role-Based Access** - Buyers/Sellers see own disputes, Admins see all  
✅ **Detailed Audit Trail** - Timestamps, resolution notes, resolver identity  
✅ **Protected Resolution** - Only admins can resolve disputes  

---

## Data Model

### Dispute Schema

```typescript
interface IDispute extends Document {
  orderId: ObjectId;                    // Reference to disputed Order
  raisedBy: ObjectId;                   // User who opened dispute (buyer or seller)
  reason: DisputeReason;                // Category: NOT_RECEIVED, ITEM_MISMATCH, etc.
  description: string;                  // Detailed issue description (10-2000 chars)
  evidenceUrls: string[];               // S3/Cloudinary URLs (max 10 files)
  status: DisputeStatus;                // OPEN, UNDER_REVIEW, RESOLVED_BUYER, RESOLVED_SELLER, CLOSED
  adminResolution?: string;             // Admin's resolution notes (max 2000 chars)
  resolvedBy?: ObjectId;                // Admin user who resolved dispute
  resolvedAt?: Date;                    // When dispute was resolved
  createdAt: Date;                      // Dispute creation timestamp
  updatedAt: Date;                      // Last update timestamp
}
```

### Dispute Reason Enum

```typescript
enum DisputeReason {
  NOT_RECEIVED = 'NOT_RECEIVED',           // Gem never arrived
  ITEM_MISMATCH = 'ITEM_MISMATCH',         // Gem doesn't match description
  DAMAGED = 'DAMAGED',                     // Gem arrived damaged
  CUTTING_QUALITY = 'CUTTING_QUALITY',     // Issue from cutting service
  OTHER = 'OTHER',                         // Other reasons
}
```

### Dispute Status Enum

```typescript
enum DisputeStatus {
  OPEN = 'OPEN',                           // Newly opened, awaiting admin review
  UNDER_REVIEW = 'UNDER_REVIEW',           // Admin actively reviewing
  RESOLVED_BUYER = 'RESOLVED_BUYER',       // Resolved in buyer's favor
  RESOLVED_SELLER = 'RESOLVED_SELLER',     // Resolved in seller's favor
  CLOSED = 'CLOSED',                       // Archived/closed
}
```

### Database Indexes

```typescript
// Fast lookups for common queries
DisputeSchema.index({ status: 1, createdAt: -1 });        // Status filtering
DisputeSchema.index({ orderId: 1, status: 1 });           // Order disputes
DisputeSchema.index({ raisedBy: 1, createdAt: -1 });      // User's disputes
DisputeSchema.index({ resolvedAt: 1 });                   // Resolution tracking
```

---

## API Endpoints

### 1. Open a Dispute

**Endpoint:** `POST /api/v1/disputes`

**Authentication:** Required (Bearer token)

**Authorization:** Buyer or Seller only (must be involved in the order)

**Request Body:**

```json
{
  "orderId": "67890abc123456789012345a",
  "reason": "NOT_RECEIVED",
  "description": "The gem was never received. Tracking shows delivery was attempted but I was not home. Seller is not responding to messages.",
  "evidenceUrls": [
    "https://cloudinary.com/dispute-evidence-1.jpg",
    "https://cloudinary.com/tracking-screenshot.png"
  ]
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `orderId` | ObjectId | Yes | Must be valid order ID |
| `reason` | String | Yes | Must be valid DisputeReason enum value |
| `description` | String | Yes | Min 10 chars, max 2000 chars |
| `evidenceUrls` | String[] | No | Max 10 URLs, S3/Cloudinary links |

**Valid Reason Values:**
- `NOT_RECEIVED` - Item not received/delivery failed
- `ITEM_MISMATCH` - Item doesn't match listing description
- `DAMAGED` - Item arrived damaged
- `CUTTING_QUALITY` - Quality issue from cutting service
- `OTHER` - Other reason

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "678f0abc123456789012345b",
    "orderId": {
      "_id": "67890abc123456789012345a",
      "orderNumber": "ORD-1234567890",
      "amount": 5000
    },
    "raisedBy": {
      "_id": "67890abc123456789012345d",
      "firstName": "John",
      "lastName": "Buyer",
      "email": "john@example.com"
    },
    "reason": "NOT_RECEIVED",
    "description": "The gem was never received...",
    "evidenceUrls": [
      "https://cloudinary.com/dispute-evidence-1.jpg",
      "https://cloudinary.com/tracking-screenshot.png"
    ],
    "status": "OPEN",
    "createdAt": "2024-01-20T14:30:00Z",
    "updatedAt": "2024-01-20T14:30:00Z"
  },
  "message": "Dispute opened successfully. Escrow funds are now frozen."
}
```

**Order Status After Creation:**
- Order.status → `DISPUTED`
- Order.escrowStatus → `HELD` (frozen, cannot be released)

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | Bad Request | Missing required fields |
| 400 | Bad Request | Invalid reason. Must be one of: ... |
| 404 | Not Found | Order not found |
| 403 | Forbidden | You are not involved in this order |
| 400 | Bad Request | An active dispute already exists |
| 400 | Bad Request | Cannot open dispute for completed orders |

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/v1/disputes \
  -H "Authorization: Bearer YOUR_BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "67890abc123456789012345a",
    "reason": "NOT_RECEIVED",
    "description": "The gem was never received. Tracking shows delivery failed.",
    "evidenceUrls": [
      "https://cloudinary.com/evidence-1.jpg",
      "https://cloudinary.com/tracking.png"
    ]
  }'
```

---

### 2. Get Disputes (Role-Based)

**Endpoint:** `GET /api/v1/disputes`

**Authentication:** Required (Bearer token)

**Authorization:** All authenticated users (results filtered by role)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | String | None | Filter by dispute status (optional) |
| `sortBy` | String | `createdAt` | Sort field: `createdAt`, `resolvedAt` |
| `order` | String | `desc` | Sort order: `asc` or `desc` |

**Response Behavior:**

- **ADMIN Role:** Returns all disputes on the platform
- **BUYER/SELLER Role:** Returns only disputes they are involved in
  - Disputes they raised
  - Disputes on orders where they are buyer or seller

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "disputes": [
      {
        "_id": "678f0abc123456789012345b",
        "orderId": {
          "_id": "67890abc123456789012345a",
          "orderNumber": "ORD-1234567890",
          "amount": 5000,
          "status": "DISPUTED"
        },
        "raisedBy": {
          "_id": "67890abc123456789012345d",
          "firstName": "John",
          "lastName": "Buyer",
          "email": "john@example.com"
        },
        "reason": "NOT_RECEIVED",
        "description": "The gem was never received...",
        "evidenceUrls": [
          "https://cloudinary.com/evidence-1.jpg"
        ],
        "status": "OPEN",
        "createdAt": "2024-01-20T14:30:00Z",
        "updatedAt": "2024-01-20T14:30:00Z"
      }
    ],
    "summary": {
      "total": 15,
      "byStatus": {
        "OPEN": 5,
        "UNDER_REVIEW": 3,
        "RESOLVED_BUYER": 4,
        "RESOLVED_SELLER": 2,
        "CLOSED": 1
      }
    }
  },
  "message": "Disputes fetched successfully"
}
```

**cURL Examples:**

```bash
# Get all disputes (ADMIN)
curl -X GET "http://localhost:5000/api/v1/disputes" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get my disputes (BUYER/SELLER)
curl -X GET "http://localhost:5000/api/v1/disputes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/disputes?status=OPEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Sort by resolution date
curl -X GET "http://localhost:5000/api/v1/disputes?sortBy=resolvedAt&order=desc" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 3. Resolve Dispute (Admin Only)

**Endpoint:** `PUT /api/v1/disputes/:id/resolve`

**Authentication:** Required (Bearer token)

**Authorization:** ADMIN ONLY

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Dispute ID to resolve |

**Request Body:**

```json
{
  "decision": "BUYER",
  "resolution": "Evidence shows the buyer did not receive the gem. Tracking confirms failed delivery attempt. Refunding buyer in full."
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `decision` | String | Yes | Must be `BUYER` or `SELLER` |
| `resolution` | String | Yes | Admin's decision notes (max 2000 chars) |

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "678f0abc123456789012345b",
    "orderId": {
      "_id": "67890abc123456789012345a",
      "orderNumber": "ORD-1234567890",
      "amount": 5000,
      "status": "CANCELLED",
      "escrowStatus": "REFUNDED"
    },
    "raisedBy": {
      "_id": "67890abc123456789012345d",
      "firstName": "John",
      "lastName": "Buyer"
    },
    "reason": "NOT_RECEIVED",
    "description": "The gem was never received...",
    "status": "RESOLVED_BUYER",
    "adminResolution": "Evidence shows the buyer did not receive the gem...",
    "resolvedBy": "67890abc123456789012345e",
    "resolvedAt": "2024-01-21T10:00:00Z",
    "createdAt": "2024-01-20T14:30:00Z",
    "updatedAt": "2024-01-21T10:00:00Z"
  },
  "message": "Dispute resolved in favor of BUYER. Escrow released."
}
```

**Escrow Handling by Decision:**

**Decision: BUYER (Buyer Wins)**
- Dispute Status → `RESOLVED_BUYER`
- Order Status → `CANCELLED`
- Escrow Status → `REFUNDED`
- **Result:** Funds returned to buyer

**Decision: SELLER (Seller Wins)**
- Dispute Status → `RESOLVED_SELLER`
- Order Status → `COMPLETED`
- Escrow Status → `RELEASED`
- **Result:** Funds released to seller

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 403 | Forbidden | Access denied. Only admins can resolve disputes |
| 400 | Bad Request | Missing required fields |
| 400 | Bad Request | Decision must be either "BUYER" or "SELLER" |
| 404 | Not Found | Dispute not found |
| 400 | Bad Request | Cannot resolve dispute with status: ... |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/v1/disputes/678f0abc123456789012345b/resolve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "BUYER",
    "resolution": "Evidence confirms buyer did not receive the gem. Refunding in full."
  }'
```

---

## Integration with Order System

### Escrow Freezing Flow

```
1. Buyer/Seller opens dispute
   ↓
2. POST /api/v1/disputes
   ↓
3. Order.status = DISPUTED
   Order.escrowStatus = HELD (frozen)
   ↓
4. Funds cannot be released until dispute resolved
```

### Escrow Release Flow

```
A) BUYER WINS:
   1. PUT /api/v1/disputes/:id/resolve { decision: "BUYER" }
   2. Order.status = CANCELLED
   3. Order.escrowStatus = REFUNDED
   4. Funds returned to buyer

B) SELLER WINS:
   1. PUT /api/v1/disputes/:id/resolve { decision: "SELLER" }
   2. Order.status = COMPLETED
   3. Order.escrowStatus = RELEASED
   4. Funds released to seller
```

---

## Security & Authorization

### Role-Based Access Control

```typescript
// Open Dispute
- Required: Authenticated user
- Allowed: Buyer OR Seller of the order
- Denied: Third parties, admins (unless they're also buyer/seller)

// Get Disputes
- Required: Authenticated user
- Allowed: All roles (results filtered)
- ADMIN: See all disputes
- Others: See only their own

// Resolve Dispute
- Required: Authenticated user
- Allowed: ADMIN ONLY
- Denied: Buyers, sellers, others
```

### Validation Rules

✅ User must be order participant (buyer or seller)  
✅ Cannot open dispute if order already completed  
✅ Cannot have multiple active disputes per order  
✅ Reason must be valid enum value  
✅ Description min 10 chars (prevents spam)  
✅ Max 10 evidence files per dispute  
✅ Only admins can resolve disputes  
✅ Decision must be BUYER or SELLER  

---

## Workflow Examples

### Scenario 1: Buyer Opens Dispute - Gets Refunded

```
1. Buyer places order for $5,000
   Order.escrowStatus = HELD
   
2. Gem never arrives
   Buyer opens dispute:
   POST /api/v1/disputes
   {
     "orderId": "order123",
     "reason": "NOT_RECEIVED",
     "description": "Tracking shows failed delivery",
     "evidenceUrls": ["https://cloudinary.com/tracking.jpg"]
   }
   
   Result:
   Order.status = DISPUTED
   Order.escrowStatus = HELD (frozen)
   
3. Admin reviews evidence
   
4. Admin resolves in buyer's favor:
   PUT /api/v1/disputes/dispute123/resolve
   {
     "decision": "BUYER",
     "resolution": "Confirmed failed delivery. Refunding buyer."
   }
   
   Result:
   Order.status = CANCELLED
   Order.escrowStatus = REFUNDED
   ✓ Buyer receives $5,000 refund
```

### Scenario 2: Seller Opens Dispute - Keeps Funds

```
1. Seller ships gem, buyer claims damage (falsely)
   
2. Buyer opens dispute:
   POST /api/v1/disputes
   {
     "orderId": "order456",
     "reason": "DAMAGED",
     "description": "Gem arrived with large scratch",
     "evidenceUrls": ["https://cloudinary.com/damage.jpg"]
   }
   
3. Seller provides counter-evidence and messages
   
4. Admin reviews all evidence and decides seller's gem was properly packaged
   
   PUT /api/v1/disputes/dispute456/resolve
   {
     "decision": "SELLER",
     "resolution": "Seller photos show proper packaging. Damage likely false claim."
   }
   
   Result:
   Order.status = COMPLETED
   Order.escrowStatus = RELEASED
   ✓ Seller receives $4,750 (after 5% platform fee)
```

### Scenario 3: Admin Views All Disputes

```
Admin monitors platform health:
GET /api/v1/disputes

Response shows:
- 5 OPEN disputes (new this week)
- 3 UNDER_REVIEW (currently investigating)
- 4 RESOLVED_BUYER (refunded)
- 2 RESOLVED_SELLER (released)

Admin can click on any dispute to review evidence and resolve
```

---

## Evidence Management

### Supported Evidence Types

- Screenshots (PNG, JPG)
- Documents (PDF)
- Tracking photos
- Shipping labels
- Communication logs
- Video clips

### Best Practices

✅ **For Buyers Opening Disputes:**
- Include tracking screenshots showing failed delivery
- Photograph the package if received (damage cases)
- Include seller communication attempts
- Be detailed in description

✅ **For Sellers Responding:**
- Provide shipping label showing proper address
- Include photos of proper packaging
- Show communication history
- Request buyer provide more evidence if false

✅ **For Admins Resolving:**
- Review all evidence provided
- Cross-reference tracking info
- Check communication timeline
- Document decision thoroughly
- Be fair and consistent

---

## Monitoring & Alerts

### Admin Dashboard Should Track

- Dispute count by status
- Average resolution time
- Resolution ratio (buyer vs seller)
- Most common dispute reasons
- Repeat complainers/sellers

### Example Metrics

```
Week-to-Date:
- Total Disputes: 15
- Open: 5
- Under Review: 3
- Resolved Buyer: 4
- Resolved Seller: 2
- Closed: 1

Reasons:
- NOT_RECEIVED: 6 (40%)
- DAMAGED: 5 (33%)
- ITEM_MISMATCH: 3 (20%)
- CUTTING_QUALITY: 1 (7%)

Avg Resolution Time: 2.3 days
Buyer Win Rate: 65%
Seller Win Rate: 35%
```

---

## Error Handling

### Common Scenarios

**Scenario: User tries to open duplicate dispute**
```json
{
  "statusCode": 400,
  "message": "An active dispute already exists for this order. Wait for resolution."
}
```

**Scenario: Non-admin tries to resolve dispute**
```json
{
  "statusCode": 403,
  "message": "Access denied. Only administrators can resolve disputes."
}
```

**Scenario: Invalid reason provided**
```json
{
  "statusCode": 400,
  "message": "Invalid reason. Must be one of: NOT_RECEIVED, ITEM_MISMATCH, DAMAGED, CUTTING_QUALITY, OTHER"
}
```

**Scenario: Trying to resolve already resolved dispute**
```json
{
  "statusCode": 400,
  "message": "Cannot resolve dispute with status: RESOLVED_BUYER"
}
```

---

## Testing Checklist

- [ ] Buyer can open dispute for their order
- [ ] Seller can open dispute for their order
- [ ] Third party cannot open dispute
- [ ] Opening dispute freezes escrow (status = HELD)
- [ ] Order status changes to DISPUTED
- [ ] Cannot open duplicate disputes for same order
- [ ] Cannot open dispute for completed orders
- [ ] Admin can see all disputes
- [ ] Non-admin sees only their own disputes
- [ ] Admin can resolve dispute as BUYER
- [ ] Admin can resolve dispute as SELLER
- [ ] BUYER resolution sets escrow to REFUNDED
- [ ] SELLER resolution sets escrow to RELEASED
- [ ] Non-admin cannot resolve disputes
- [ ] Evidence URLs are stored and returned
- [ ] Reason validation works correctly

---

## Best Practices

### For Platform Health

1. **Respond Quickly** - Resolve disputes within 48-72 hours
2. **Be Fair** - Make decisions based on evidence, not bias
3. **Document Well** - Clear resolution notes help with appeals
4. **Track Patterns** - Notice repeat abusers (buyer or seller)
5. **Communicate** - Notify both parties of resolution

### For Users

- **Buyers:** Provide clear evidence, photos, tracking details
- **Sellers:** Respond to disputes promptly, provide counter-evidence
- **Both:** Keep communication professional and documented

### For Developers

- Use escrow freezing to prevent fund leakage
- Validate all dispute fields
- Log all admin actions for audit trail
- Monitor dispute volume and resolution times
- Consider automated fraud detection for patterns

---

## Integration Checklist

- [x] Dispute model with proper schema
- [x] Open dispute endpoint (POST)
- [x] Get disputes endpoint (GET) with role-based filtering
- [x] Resolve dispute endpoint (PUT, admin only)
- [x] Escrow freezing on dispute open
- [x] Escrow release/refund on resolution
- [x] Order status updates
- [x] Evidence URL storage
- [x] Comprehensive validation
- [x] Security authorization checks
- [x] Logger integration
- [ ] Frontend components (next step)
- [ ] Notifications to users (next step)
- [ ] Admin dashboard (next step)
- [ ] Appeal mechanism (future)
- [ ] Auto-resolution rules (future)

---

## Related Documentation

- [Order System](./ORDER_ESCROW_GUIDE.md)
- [Payment System](./PAYMENT_INTEGRATION.md)
- [Authentication](../src/middleware/auth.middleware.ts)
- [Role-Based Access Control](../src/middleware/role.middleware.ts)
