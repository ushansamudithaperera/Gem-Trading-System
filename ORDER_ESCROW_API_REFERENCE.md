# Order & Escrow System - API Reference

## 🔗 Base URL

```
http://localhost:5000/api/v1
```

All requests require Bearer token authentication (except public routes).

---

## 📤 Endpoint 1: Update Tracking Info

### Details
- **Method**: `PUT`
- **Path**: `/orders/:id/tracking`
- **Authentication**: Required (Bearer token)
- **Authorization**: Seller of the order (or Admin)

### Request

```bash
curl -X PUT \
  http://localhost:5000/api/v1/orders/6476abc123456/tracking \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "courierCompany": "FedEx",
    "trackingNumber": "794644298644",
    "status": "in_transit"
  }'
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courierCompany` | string | Yes | Courier service name (e.g., "FedEx", "DHL", "UPS", "Local Courier") |
| `trackingNumber` | string | Yes | Tracking number provided by courier |
| `status` | string | No | Delivery status: "pending", "in_transit", "delivered", "failed" (defaults to "in_transit") |

### Success Response (200)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "6476abc123456",
    "orderNumber": "ORD-1717225200000-a1b2c3d4",
    "buyerId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "gemId": "507f1f77bcf86cd799439013",
    "amount": 1500,
    "adminFee": 75,
    "sellerAmount": 1425,
    "status": "SHIPPED",
    "escrowStatus": "HELD",
    "stripePaymentIntentId": "pi_1234567890",
    "deliveryInfo": {
      "courierCompany": "FedEx",
      "trackingNumber": "794644298644",
      "status": "in_transit",
      "shippedAt": "2026-05-31T10:30:45.123Z",
      "autoReleaseDate": "2026-06-03T10:30:45.123Z"
    },
    "createdAt": "2026-05-31T09:00:00.000Z",
    "updatedAt": "2026-05-31T10:30:45.123Z"
  },
  "message": "Tracking information updated. Auto-release scheduled for 2026-06-03T10:30:45.123Z"
}
```

### Error Responses

#### 400 Bad Request - Missing Fields

```json
{
  "statusCode": 400,
  "message": "courierCompany and trackingNumber are required",
  "success": false
}
```

#### 400 Bad Request - Invalid Status

```json
{
  "statusCode": 400,
  "message": "Invalid tracking status",
  "success": false
}
```

#### 400 Bad Request - Order Not Shippable

```json
{
  "statusCode": 400,
  "message": "Cannot update tracking for order in status: SHIPPED",
  "success": false
}
```

#### 403 Forbidden - Not Seller

```json
{
  "statusCode": 403,
  "message": "Only the seller can update tracking information for this order",
  "success": false
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Order not found",
  "success": false
}
```

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Authentication token missing",
  "success": false
}
```

### Postman Collection

```json
{
  "name": "Update Tracking Info",
  "request": {
    "method": "PUT",
    "url": "{{BASE_URL}}/orders/{{ORDER_ID}}/tracking",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{SELLER_TOKEN}}"
      },
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\"courierCompany\": \"FedEx\",\"trackingNumber\": \"794644298644\",\"status\": \"in_transit\"}"
    }
  }
}
```

---

## 💰 Endpoint 2: Release Escrow

### Details
- **Method**: `PUT`
- **Path**: `/orders/:id/release-escrow`
- **Authentication**: Required (Bearer token)
- **Authorization**: Buyer of the order (or Admin)

### Request

```bash
curl -X PUT \
  http://localhost:5000/api/v1/orders/6476abc123456/release-escrow \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Request Body

Empty object or can be omitted.

```json
{}
```

### Success Response (200)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "order": {
      "_id": "6476abc123456",
      "orderNumber": "ORD-1717225200000-a1b2c3d4",
      "buyerId": "507f1f77bcf86cd799439011",
      "sellerId": "507f1f77bcf86cd799439012",
      "gemId": "507f1f77bcf86cd799439013",
      "amount": 1500,
      "adminFee": 75,
      "sellerAmount": 1425,
      "status": "DELIVERED",
      "escrowStatus": "RELEASED",
      "stripePaymentIntentId": "pi_1234567890",
      "deliveryInfo": {
        "courierCompany": "FedEx",
        "trackingNumber": "794644298644",
        "status": "in_transit",
        "shippedAt": "2026-05-31T10:30:45.123Z",
        "deliveredAt": "2026-05-31T14:30:45.123Z",
        "autoReleaseDate": null
      },
      "createdAt": "2026-05-31T09:00:00.000Z",
      "updatedAt": "2026-05-31T14:30:45.123Z"
    },
    "transferId": "tr_1J8xXyZaBcDeFgHiJkLmNoPq",
    "message": "Escrow released successfully"
  },
  "message": "Funds ($1,425) transferred to seller account"
}
```

### Field Breakdown

| Field | Type | Description |
|-------|------|-------------|
| `order.status` | string | Changed to "DELIVERED" after release |
| `order.escrowStatus` | string | Changed to "RELEASED" |
| `order.deliveryInfo.deliveredAt` | Date | Timestamp when buyer confirmed |
| `order.deliveryInfo.autoReleaseDate` | null | Cleared after manual release |
| `transferId` | string | Stripe transfer ID for tracking payout |

### Error Responses

#### 403 Forbidden - Not Buyer

```json
{
  "statusCode": 403,
  "message": "Only the buyer can release escrow for this order",
  "success": false
}
```

#### 400 Bad Request - Order Not Shipped

```json
{
  "statusCode": 400,
  "message": "Cannot release escrow for order in status: PENDING_DISPATCH",
  "success": false
}
```

#### 400 Bad Request - Escrow Already Released

```json
{
  "statusCode": 400,
  "message": "Escrow is already in status: RELEASED. Cannot release again.",
  "success": false
}
```

#### 400 Bad Request - Seller Not Set Up

```json
{
  "statusCode": 400,
  "message": "Seller has not set up payment account. Please contact support.",
  "success": false
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Order not found",
  "success": false
}
```

#### 500 Internal Server Error - Payment Failed

```json
{
  "statusCode": 500,
  "message": "Failed to release escrow and transfer funds",
  "success": false
}
```

### Postman Collection

```json
{
  "name": "Release Escrow",
  "request": {
    "method": "PUT",
    "url": "{{BASE_URL}}/orders/{{ORDER_ID}}/release-escrow",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{BUYER_TOKEN}}"
      },
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{}"
    }
  }
}
```

---

## 🧪 Complete Test Scenario

### Scenario: Full Order Lifecycle

#### Step 1: Create Order (Buyer)

```bash
curl -X POST \
  http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gemId": "507f1f77bcf86cd799439013",
    "amount": 1500
  }'
```

**Response**: Order created with status `PENDING_DISPATCH`, escrow `HELD`

**Save**: `ORDER_ID` from response

---

#### Step 2: Seller Ships & Updates Tracking (Seller)

Wait ~5 minutes to simulate shipping time, then:

```bash
curl -X PUT \
  http://localhost:5000/api/v1/orders/ORDER_ID/tracking \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courierCompany": "FedEx",
    "trackingNumber": "794644298644"
  }'
```

**Verify in Response**:
- `status` → `SHIPPED` ✅
- `deliveryInfo.shippedAt` → Current time ✅
- `deliveryInfo.autoReleaseDate` → 3 days from now ✅

---

#### Step 3: Buyer Receives & Confirms Delivery (Buyer)

Wait for package to "arrive", then:

```bash
curl -X PUT \
  http://localhost:5000/api/v1/orders/ORDER_ID/release-escrow \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Verify in Response**:
- `order.status` → `DELIVERED` ✅
- `order.escrowStatus` → `RELEASED` ✅
- `transferId` → Stripe transfer ID ✅
- Message includes seller amount transferred ✅

---

#### Step 4: Verify Seller Received Payment

Check seller's Stripe Connect account:
- Should show transfer of $1,425 (minus 5% admin fee from $1,500)
- Transfer status: `succeeded`

---

## 📋 Environment Variables Reference

```bash
# ============================================
# STRIPE CONFIGURATION
# ============================================

# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# ============================================
# ESCROW CONFIGURATION
# ============================================

# Auto-release timer duration (days)
AUTO_RELEASE_DAYS=3

# ============================================
# DATABASE
# ============================================

MONGODB_URI=mongodb://localhost:27017/gemDB

# ============================================
# JWT
# ============================================

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# ============================================
# URLs
# ============================================

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# ============================================
# EMAIL (Optional)
# ============================================

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ============================================
# REDIS (Optional)
# ============================================

REDIS_URL=redis://localhost:6379
```

---

## 🔐 Bearer Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6MTYxNjg0MzgyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**How to get token**:
1. Register/Login user
2. Use returned JWT token
3. Include in Authorization header as `Bearer {token}`

---

## ⏱️ Timing Notes

- **Escrow Hold**: From order creation until buyer confirms or auto-release triggers
- **Auto-Release**: Happens 3 days after shipping (configurable)
- **Stripe Transfer**: Seller receives funds in Stripe account within 1-2 business days
- **Direct Stripe Transfer**: If connected, usually instant to seller's bank

---

## 🧩 Response Structure

All responses follow this standard format:

```json
{
  "success": boolean,
  "statusCode": number,
  "data": object | null,
  "message": string
}
```

- **success**: `true` for 2xx status codes, `false` for 4xx/5xx
- **statusCode**: HTTP status code (200, 400, 403, 404, 500, etc.)
- **data**: Response payload (order details, transferId, etc.)
- **message**: Human-readable status message

---

## 🚨 Common Issues & Solutions

### Issue: `{"message":"Invalid token"}`
**Solution**: Token might be expired. Get a new token from login endpoint.

### Issue: `{"message":"Invalid tracking status"}`
**Solution**: Use one of: "pending", "in_transit", "delivered", "failed"

### Issue: `{"message":"Cannot update tracking for order in status: SHIPPED"}`
**Solution**: Order already shipped. Can't update tracking twice. Create new order if needed.

### Issue: `{"message":"Escrow is already in status: RELEASED"}`
**Solution**: Funds already released. Check if another user already confirmed.

### Issue: `{"message":"Failed to release escrow and transfer funds"}`
**Solution**: Check Stripe configuration. Seller might not have valid Stripe account.

---

## 📊 Order Status Transitions

```
PENDING_DISPATCH (escrow: HELD)
    ↓ [Seller calls /tracking]
SHIPPED (escrow: HELD) [Auto-release timer: 3 days]
    ↓ [Buyer calls /release-escrow OR timer expires]
DELIVERED (escrow: RELEASED)
    ↓
COMPLETED (escrow: RELEASED)
```

---

**API Version**: 1.0.0
**Last Updated**: May 31, 2026
**Status**: Production Ready
