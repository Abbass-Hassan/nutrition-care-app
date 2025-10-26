# Food Approval System Implementation

## Overview
Implemented a complete food approval workflow where client-created custom foods must be approved by their dietitian before they can be used and counted in meal totals.

## Backend Changes

### Database Migration
**File**: `backend/database/migrations/2025_10_20_160420_add_approval_status_to_foods_table.php`

Added columns to `foods` table:
- `approval_status` (enum: 'pending', 'approved', 'rejected') - default: 'approved'
- `created_by_client_id` (foreign key to users table)
- `rejection_reason` (text, nullable)
- `approved_at` (timestamp, nullable)
- `approved_by_dietitian_id` (foreign key to users table)

### Model Updates
**File**: `backend/app/Models/Food.php`

Added:
- New relationships: `createdByClient()`, `approvedByDietitian()`
- Scopes: `approved()`, `pending()`
- Updated `$fillable` and `$casts` arrays

### Controller Updates
**File**: `backend/app/Http/Controllers/FoodController.php`

New/Updated Methods:
1. **`getClientFoods()`** - Modified to return only approved foods for clients
   - Returns dietitian's approved foods + client's approved custom foods
   
2. **`submitClientFood(Request $request)`** - NEW
   - Allows clients to submit custom foods for approval
   - Creates food with status 'pending'
   - Links food to client and their dietitian

3. **`getPendingFoods()`** - NEW
   - Returns all pending foods for the logged-in dietitian
   - Includes client information via eager loading

4. **`approveFood(string $id)`** - NEW
   - Allows dietitian to approve a pending food
   - Sets status to 'approved', records approval timestamp and dietitian ID

5. **`rejectFood(Request $request, string $id)`** - NEW
   - Allows dietitian to reject a pending food
   - Optional rejection reason
   - Sets status to 'rejected'

### Routes
**File**: `backend/routes/api.php`

New routes (all protected by `auth:sanctum` middleware):
```php
POST   /api/client-foods/submit     // Client submits custom food
GET    /api/pending-foods            // Dietitian gets pending foods
POST   /api/foods/{id}/approve       // Dietitian approves food
POST   /api/foods/{id}/reject        // Dietitian rejects food
```

Updated route:
```php
GET    /api/client-foods             // Now returns only approved foods
```

## Mobile App Changes

### MealsTab Component
**File**: `mobile/src/screens/tabs/MealsTab.js`

**Changed**: `handleAddCustomFood()` function
- **Before**: Stored custom foods locally in AsyncStorage
- **After**: Submits custom foods to API for dietitian approval
- Shows success alert: "Food submitted for approval"
- Food won't appear in available foods until approved

**Impact**:
- Removed local `myFoods` storage dependency for new foods
- Custom foods now follow the same approval workflow
- Only approved foods appear in the "My Food" tab and "All" tab

### API Integration
- Added new endpoint: `POST ${API_BASE}/client-foods/submit`
- Sends food data: name, calories, protein, carbs, fat, default_serving
- Backend automatically links to client's dietitian

## Dashboard Changes

### New Component: FoodApprovals
**File**: `dashboard/src/components/FoodApprovals.jsx`

Features:
- Displays all pending foods submitted by clients
- Shows client name, nutrition info, and submission date
- **Approve** button - approves the food with one click
- **Reject** button - opens modal to optionally provide rejection reason
- Auto-refreshes pending foods after approval/rejection
- Empty state when no pending foods

### Dashboard Integration
**File**: `dashboard/src/pages/Dashboard.jsx`

Changes:
1. Added new nav item: "Food Approvals" with `MdCheckCircle` icon
2. Added notification badge showing pending foods count
3. Auto-fetches pending foods count on load
4. Polls for updates every 30 seconds
5. Badge pulses to draw attention
6. Badge color changes when nav item is active (white badge on green background)

New state:
```javascript
const [pendingFoodsCount, setPendingFoodsCount] = useState(0);
```

New function:
```javascript
const fetchPendingFoodsCount = async () => { ... }
```

New view case:
```javascript
case 'food-approvals':
  return <FoodApprovals />;
```

### Styling
**File**: `dashboard/src/pages/Dashboard.css`

New styles added:
- `.notification-badge` - Red badge with pulse animation
- `.food-card.pending` - Orange border and gradient background for pending foods
- `.pending-badge` - Yellow badge with "PENDING APPROVAL" text
- `.client-info` - Blue info box showing who submitted the food
- `.approval-actions` - Button container for approve/reject
- `.empty-state` - Friendly empty state when no pending foods

## User Flow

### Client Flow (Mobile App)
1. Client navigates to Meals tab
2. Clicks central "+" button → "Create Food"
3. Fills in food details (name, calories, macros)
4. Clicks "Create Food"
5. **Sees alert**: "Submitted for Approval - [Food Name] has been submitted to your dietitian for approval. You'll be able to use it once approved."
6. Food does NOT appear in available foods yet
7. Food does NOT count towards meal totals yet

### Dietitian Flow (Dashboard)
1. Dietitian sees notification badge on "Food Approvals" nav item
2. Badge shows count (e.g., "3") and pulses
3. Clicks "Food Approvals"
4. Sees list of pending foods with:
   - Food name with "PENDING APPROVAL" badge
   - Client name who submitted it
   - Nutrition information
   - Submission date
5. Reviews food details
6. **Option A - Approve**:
   - Clicks "Approve" button
   - Food immediately becomes available to client
   - Food removed from pending list
   - Success alert shown
7. **Option B - Reject**:
   - Clicks "Reject" button
   - Modal opens to optionally provide reason
   - Enters rejection reason (optional)
   - Clicks "Reject Food"
   - Food remains in database but won't be shown to client
   - Food removed from pending list

### After Approval
1. Client's mobile app refreshes foods list (on app open or pull-to-refresh)
2. Approved food now appears in:
   - "All" tab
   - "My Food" tab (if custom)
3. Client can now log the food to meals
4. Food calories/macros count towards daily totals

## Database State Examples

### Dietitian-created food (auto-approved):
```sql
INSERT INTO foods (
  dietitian_id, name, calories, approval_status, 
  created_by_client_id, approved_at, approved_by_dietitian_id
) VALUES (
  1, 'Grilled Chicken Breast', 165, 'approved', 
  NULL, NOW(), NULL
);
```

### Client-submitted food (pending):
```sql
INSERT INTO foods (
  dietitian_id, name, calories, approval_status, 
  created_by_client_id, approved_at, approved_by_dietitian_id
) VALUES (
  1, 'Homemade Protein Shake', 250, 'pending', 
  5, NULL, NULL
);
```

### After dietitian approves:
```sql
UPDATE foods SET
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by_dietitian_id = 1,
  rejection_reason = NULL
WHERE id = 123;
```

### After dietitian rejects:
```sql
UPDATE foods SET
  approval_status = 'rejected',
  approved_at = NULL,
  approved_by_dietitian_id = NULL,
  rejection_reason = 'Please provide more accurate nutrition information'
WHERE id = 123;
```

## API Endpoints Reference

### 1. Submit Custom Food (Client)
```
POST /api/client-foods/submit
Authorization: Bearer {client_token}
Content-Type: application/json

{
  "name": "Homemade Smoothie",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fat": 8,
  "default_serving": "1 serving"
}

Response 201:
{
  "success": true,
  "message": "Food submitted for approval",
  "food": { ... }
}
```

### 2. Get Pending Foods (Dietitian)
```
GET /api/pending-foods
Authorization: Bearer {dietitian_token}

Response 200:
{
  "success": true,
  "pending_foods": [
    {
      "id": 123,
      "name": "Homemade Smoothie",
      "calories": 250,
      "approval_status": "pending",
      "created_by_client": {
        "id": 5,
        "name": "John Client",
        "email": "john@client.com"
      },
      "created_at": "2025-10-20T16:30:00.000000Z"
    }
  ]
}
```

### 3. Approve Food (Dietitian)
```
POST /api/foods/123/approve
Authorization: Bearer {dietitian_token}

Response 200:
{
  "success": true,
  "message": "Food approved successfully",
  "food": { ... }
}
```

### 4. Reject Food (Dietitian)
```
POST /api/foods/123/reject
Authorization: Bearer {dietitian_token}
Content-Type: application/json

{
  "reason": "Please provide more accurate nutrition information"
}

Response 200:
{
  "success": true,
  "message": "Food rejected",
  "food": { ... }
}
```

### 5. Get Client Foods (Client) - Updated
```
GET /api/client-foods
Authorization: Bearer {client_token}

Response 200:
{
  "success": true,
  "foods": [
    // Only returns foods where approval_status = 'approved'
    // Includes dietitian's foods + client's approved custom foods
  ]
}
```

## Security & Permissions

- **Client** can only:
  - Submit custom foods for their assigned dietitian
  - View approved foods only
  
- **Dietitian** can only:
  - View pending foods assigned to them
  - Approve/reject foods assigned to them
  - Cannot approve foods from other dietitians' clients

- All endpoints require `auth:sanctum` authentication
- Role checks enforced in controller methods
- Foreign key constraints ensure data integrity

## Benefits

1. **Quality Control**: Dietitian verifies nutrition accuracy
2. **Professional Oversight**: Maintains dietitian's authority over meal plans
3. **Data Integrity**: Prevents incorrect nutrition data from affecting client progress
4. **Transparency**: Client knows their food is being reviewed
5. **Accountability**: Records who created and who approved each food
6. **Audit Trail**: Tracks approval timestamps and rejection reasons

## Testing Checklist

### Backend
- [x] Migration runs successfully
- [x] Routes are registered
- [ ] Client can submit custom food
- [ ] Dietitian can view pending foods
- [ ] Dietitian can approve food
- [ ] Dietitian can reject food
- [ ] Approved food appears in client's food list
- [ ] Pending/rejected foods don't appear in client's list

### Mobile App
- [ ] Custom food form submits to API
- [ ] Success message shows after submission
- [ ] Food doesn't appear immediately in "My Food" tab
- [ ] After approval, food appears in "All" and "My Food" tabs
- [ ] Approved food can be logged to meals
- [ ] Macros count correctly after approval

### Dashboard
- [ ] "Food Approvals" nav item appears
- [ ] Notification badge shows correct count
- [ ] Badge pulses/animates
- [ ] Pending foods list displays correctly
- [ ] Client name shows for each food
- [ ] Approve button works
- [ ] Reject modal opens
- [ ] Reject with/without reason works
- [ ] List refreshes after approve/reject
- [ ] Empty state shows when no pending foods

## Future Enhancements

1. **Notifications**: Push notification when food approved/rejected
2. **Rejection Feedback**: Show rejection reason to client in app
3. **Edit & Resubmit**: Allow client to edit and resubmit rejected foods
4. **Bulk Actions**: Approve/reject multiple foods at once
5. **Food Templates**: Dietitian can suggest corrections before approving
6. **Analytics**: Track approval times, rejection rates, etc.
7. **Comments**: Allow dietitian to add notes/corrections
8. **Client Dashboard**: Show pending foods status in mobile app

---

**Implementation Date**: October 20, 2025
**Status**: ✅ Complete - Ready for Testing


