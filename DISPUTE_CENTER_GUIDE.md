# DisputeCenter Component - Complete Implementation Guide

## Overview

The **DisputeCenter** is a comprehensive React component for managing disputes in the B2B Escrow Gem Trading System. It implements frosted glassmorphism styling with role-based rendering for Admins, Buyers, and Sellers.

## File Structure

```
frontend/src/pages/
├── DisputeCenter.css              # Frosted glassmorphism styling
└── Disputes/
    └── DisputeCenter.tsx          # Main component (React TypeScript)
```

## Features

### 1. **Role-Based Rendering**

#### Admin View
- **Display**: Table/Grid of ALL active disputes across the platform
- **Capabilities**:
  - View all dispute details including reason, description, and evidence
  - Resolve disputes with decision buttons
  - Provide resolution notes explaining the decision
  - Choose resolution outcome (Buyer or Seller wins)
  - See resolution history

#### Buyer/Seller View
- **Display**: Only their own active disputes
- **Capabilities**:
  - View their own dispute history
  - Raise new disputes using "Raise New Dispute" button
  - Upload evidence images
  - See resolution status

### 2. **Dispute Form Modal**

The "Raise New Dispute" modal includes:
- **Order ID Input**: Enter the disputed order ID
- **Reason Dropdown**: Select from predefined dispute reasons
  - Item Not Received
  - Item Mismatch
  - Item Damaged
  - Cutting Quality Issue
  - Other
- **Description Textarea**: Detailed explanation of the dispute
- **Evidence Upload Zone**: 
  - Drag-and-drop support for images
  - Click to browse files
  - Image preview thumbnails
  - Up to 5 images (PNG, JPG, GIF)
  - 5MB per file limit
  - Remove individual images before submission

### 3. **Dispute Cards**

Each dispute displays:
- Order number with status badge
- Dispute reason
- Raised by (user name)
- Creation date
- Gem details (if available)
- Full description
- Evidence thumbnails with lightbox view
- Admin resolution (if resolved)
- Admin action button (for Admins only)

### 4. **Status Badges**

Color-coded status indicators:
- **🟠 Open**: New dispute, awaiting review
- **🔵 Under Review**: Admin actively reviewing
- **🟢 Resolved - Buyer**: Decision favored the buyer
- **🟣 Resolved - Seller**: Decision favored the seller
- **⚪ Closed**: Dispute is closed

### 5. **Admin Resolution Modal**

Allows admins to:
- View dispute summary
- Choose resolution (Buyer or Seller)
- Add detailed resolution notes
- Confirm the resolution

## Styling

### Frosted Glassmorphism Design

The component uses premium frosted glass styling with:

```css
/* Base glass effect */
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.5);
border: 1px solid rgba(255, 255, 255, 0.6);

/* Premium shadows and depth */
box-shadow: 
  0 8px 32px rgba(31, 38, 135, 0.05),
  inset 1px 1px 0 rgba(255, 255, 255, 0.3);

/* Hover effects */
transform: translateY(-4px);
box-shadow: 
  0 20px 40px rgba(31, 38, 135, 0.15),
  inset 1px 1px 0 rgba(255, 255, 255, 0.4);
```

### Color Scheme
- **Primary Gradient**: Emerald (#10b981) to Blue (#0ea5e9)
- **Background**: Light gradient (white to slate-50)
- **Text**: Slate-900 on white backgrounds
- **Borders**: Subtle white with emerald accents
- **Accent**: Emerald-600 for primary actions

## Component Integration

### Import

```typescript
import { DisputeCenter } from '../pages/Disputes/DisputeCenter';
```

### Usage in Router

```typescript
// In your routing configuration
import { DisputeCenter } from './pages/Disputes/DisputeCenter';

const routes = [
  {
    path: '/disputes',
    element: <DisputeCenter />,
    requiresAuth: true,
  },
  // ... other routes
];
```

### Prerequisites

This component requires:

1. **Dependencies**:
   - React 18+
   - TypeScript
   - Lucide React (for icons)
   - Tailwind CSS
   - Redux (for auth state)

2. **Existing Services**:
   ```typescript
   import * as disputeService from '../../services/dispute.service';
   ```
   - `getDisputes()`: Fetch disputes
   - `openDispute(payload)`: Create new dispute
   - `resolveDispute(disputeId, payload)`: Resolve dispute

3. **Hooks**:
   ```typescript
   import { useAuth } from '../../hooks/useAuth';
   ```
   - Provides user, isAdmin, isBuyer, isSeller flags

4. **Components**:
   - Card, CardHeader, CardTitle
   - Button
   - Input
   - Textarea
   - Badge
   - Toast notifications

## API Endpoints

The component interacts with these endpoints:

### Get All Disputes
```
GET /api/v1/disputes
Headers: Authorization: Bearer {token}
```

### Create Dispute
```
POST /api/v1/disputes
Headers: Authorization: Bearer {token}
Body: {
  orderId: string,
  reason: string,
  description: string,
  evidenceImages?: string[]
}
```

### Resolve Dispute (Admin)
```
PUT /api/v1/disputes/{disputeId}/resolve
Headers: Authorization: Bearer {token}
Body: {
  resolution: string,
  decision: 'BUYER' | 'SELLER'
}
```

## State Management

The component manages local state for:

- **Disputes List**: All disputes for current user/admin
- **Modal States**: Show/hide dispute and resolution modals
- **Form Data**: Order ID, reason, description
- **Images**: Selected images, previews, drag-drop state
- **Loading**: Async operation states

## Responsive Design

Breakpoints:
- **Desktop**: Grid layout with up to 4 columns
- **Tablet** (max-width: 768px): 2-3 columns
- **Mobile** (max-width: 640px): Single column

Features automatically adapt:
- Modal max-width adjusts
- Font sizes scale down
- Padding/spacing reduces
- Touch-friendly interactions

## Accessibility Features

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance
- Reduced motion support

## Error Handling

The component includes:
- File validation (type, size, count)
- Required field validation
- API error handling with toast notifications
- Fallback UI for empty states
- Loading states during async operations

## Example Data Structure

```typescript
interface Dispute {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    buyerId?: { firstName: string; lastName: string };
    sellerId?: { firstName: string; lastName: string };
    gemId?: { title: string };
  };
  raisedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  description: string;
  evidenceImages: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'CLOSED';
  adminResolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Testing Checklist

- [ ] Non-admin users see only their disputes
- [ ] Admin sees all disputes
- [ ] Dispute form validates all fields
- [ ] Image upload works with drag-and-drop
- [ ] Image preview shows correct thumbnails
- [ ] Evidence images open in lightbox viewer
- [ ] Admin can resolve disputes
- [ ] Resolution notes are saved
- [ ] Status badges display correctly
- [ ] Responsive design works on mobile
- [ ] Toast notifications appear
- [ ] Loading states show/hide properly
- [ ] Empty state displays when no disputes
- [ ] Date formatting is correct

## Customization

### Adding Custom Dispute Reasons

Edit the `DISPUTE_REASONS` array in DisputeCenter.tsx:

```typescript
const DISPUTE_REASONS = [
  { value: 'YOUR_REASON', label: 'Your Custom Reason' },
  // ... other reasons
];
```

### Changing Colors

Update Tailwind classes in the component or CSS variables:
- `from-emerald-600 to-blue-600`: Gradient colors
- `bg-amber-100 text-amber-800`: Status badge colors
- `text-emerald-600`: Accent text color

### Adjusting Grid Layout

Modify the grid template in DisputeCenter.css:

```css
.disputes-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}
```

Change `350px` to adjust card width breakpoint.

## Performance Optimizations

- Lazy image loading for evidence thumbnails
- Memoized status config lookups
- Efficient re-renders with React hooks
- CSS animations use GPU acceleration
- Modal lazy rendering (only rendered when open)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- IE11: Not supported (modern ES6+)

## Troubleshooting

### Images not uploading
- Check file size (max 5MB)
- Verify file is image format (PNG, JPG, GIF)
- Check browser console for errors

### Disputes not loading
- Verify API endpoint is correct
- Check authentication token
- Review network tab for API responses

### Styling not applying
- Ensure Tailwind CSS is configured
- Check CSS file path in import
- Clear browser cache

### Role-based filtering not working
- Verify user.roles data structure
- Check useAuth hook returns correct values
- Review auth state in Redux

## Future Enhancements

- [ ] Email notifications for dispute updates
- [ ] Dispute timeline/history view
- [ ] Attachment support (PDFs, documents)
- [ ] Dispute categories/tags
- [ ] Advanced filtering/search
- [ ] Bulk dispute management (admin)
- [ ] Export disputes to CSV
- [ ] Real-time updates with WebSockets
- [ ] Dispute analytics dashboard
- [ ] AI-powered dispute suggestions

## Support & Documentation

For questions or issues:
1. Check this guide first
2. Review component comments in code
3. Check error messages in browser console
4. Review backend API documentation
5. Test with sample data in browser DevTools

---

**Last Updated**: May 31, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
