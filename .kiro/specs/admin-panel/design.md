# Design Document: NHF Admin Panel

## Overview

The NHF Admin Panel is a protected section of the existing Next.js 16 App Router application served at `/admin`. It provides administrators with a dashboard, category CRUD, and product CRUD — all wired to the existing Express.js backend via authenticated fetch calls.

Key design constraints:
- No additional npm libraries (no react-hook-form, react-query, zustand, etc.)
- Authentication is already implemented (`adminApi.js`, `AdminAuthContext.jsx`, `useAdminAuth.js`)
- All styling through a custom `admin.css` file; Tailwind is not used inside admin components
- Image uploads bypass the Next.js server and go directly to Cloudflare R2 via presigned PUT URLs

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router                                         │
│                                                             │
│  src/app/(admin)/layout.js                                  │
│    └─ AdminAuthProvider                                     │
│    └─ import admin.css                                      │
│                                                             │
│  /admin                  → redirect → /admin/dashboard      │
│  /admin/login            → AdminLoginPage                   │
│  /admin/dashboard        → AdminGuard → AdminShell          │
│                                         └─ AdminDashboard   │
│  /admin/categories       → AdminGuard → AdminShell          │
│                                         └─ AdminCategories  │
│  /admin/products         → AdminGuard → AdminShell          │
│                                         └─ AdminProducts    │
│  /admin/products/new     → AdminGuard → AdminShell          │
│                                         └─ AdminProductForm │
│  /admin/products/[id]/edit → AdminGuard → AdminShell        │
│                                           └─ AdminProductForm│
└─────────────────────────────────────────────────────────────┘
          │  apiFetch (adminApi.js)
          ▼
┌──────────────────────────────────────┐
│  Express.js API (port 5000)          │
│  /api/v1/auth/*                      │
│  /api/v1/categories/admin/all        │
│  /api/v1/categories (POST)           │
│  /api/v1/categories/:id (PATCH/DEL)  │
│  /api/v1/products/admin/all          │
│  /api/v1/products (POST)             │
│  /api/v1/products/:id (PATCH/DEL)    │
│  /api/v1/upload/presign (POST)       │
└──────────────────────────────────────┘
          │  Presigned PUT
          ▼
┌─────────────────────────┐
│  Cloudflare R2           │
└─────────────────────────┘
```

### Data flow — Image Upload

1. User selects / drops a file in `ImageUploader`.
2. `ImageUploader` validates MIME type client-side.
3. `ImageUploader` calls `POST /api/v1/upload/presign` via `apiFetch` → receives `{ uploadUrl, publicUrl, key }`.
4. `ImageUploader` executes `fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })` **directly** (not through `apiFetch`).
5. On success, `onChange(publicUrl)` is called; the URL is stored in the form state.

---

## Components and Interfaces

### Route Files

| File | Purpose |
|------|---------|
| `src/app/(admin)/layout.js` | Wraps with `AdminAuthProvider`, imports `admin.css` |
| `src/app/(admin)/admin/page.js` | `redirect('/admin/dashboard')` |
| `src/app/(admin)/admin/login/page.js` | Renders `<AdminLoginPage />` |
| `src/app/(admin)/admin/dashboard/page.js` | Renders `<AdminGuard><AdminShell><AdminDashboard /></AdminShell></AdminGuard>` |
| `src/app/(admin)/admin/categories/page.js` | Renders `<AdminGuard><AdminShell><AdminCategories /></AdminShell></AdminGuard>` |
| `src/app/(admin)/admin/products/page.js` | Renders `<AdminGuard><AdminShell><AdminProducts /></AdminShell></AdminGuard>` |
| `src/app/(admin)/admin/products/new/page.js` | Renders `<AdminGuard><AdminShell><AdminProductForm /></AdminShell></AdminGuard>` |
| `src/app/(admin)/admin/products/[id]/edit/page.js` | Renders `<AdminGuard><AdminShell><AdminProductForm productId={params.id} /></AdminShell></AdminGuard>` |

### Component Interfaces

#### `AdminGuard`
```jsx
// Props: { children }
// Reads: useAdminAuth() → { user, loading }
// Behaviour:
//   loading=true  → render <LoadingScreen />
//   user=null     → router.replace('/admin/login')
//   otherwise     → render children
```

#### `AdminLoginPage`
```jsx
// Props: none
// State: { email, password, loading, error }
// Calls: AdminAuthProvider.login(email, password)
// On success: router.push('/admin/dashboard')
// On failure: setError(message), keep email
```

#### `AdminShell`
```jsx
// Props: { children, currentPath }
// State: { sidebarOpen (mobile) }
// Renders: sidebar nav + topbar + <main>{children}</main>
// Uses: useAdminAuth() for user.name in topbar, logout()
```

#### `AdminDashboard`
```jsx
// Props: none
// State: { productCount, categoryCount, loadingProducts, loadingCategories,
//          errorProducts, errorCategories }
// Fetches on mount:
//   GET /api/v1/products/admin/all?limit=1   → total → productCount
//   GET /api/v1/categories/admin/all?limit=1 → total → categoryCount
```

#### `AdminCategories`
```jsx
// Props: none
// State: {
//   categories[], total, page, loading, error,
//   search (debounced),
//   modalOpen, modalMode ('create'|'edit'), editingCategory,
//   form: { name, description, image, showInWardrobe, isActive, sortOrder },
//   formError, formSubmitting, deleteConfirmId
// }
// API calls:
//   GET  /api/v1/categories/admin/all?page&limit&search
//   POST /api/v1/categories
//   PATCH /api/v1/categories/:id
//   DELETE /api/v1/categories/:id
```

#### `AdminProducts`
```jsx
// Props: none
// State: {
//   products[], total, page, loading, error,
//   search (debounced), categoryFilter, activeFilter,
//   allCategories[] (for filter dropdown),
//   deleteConfirmId
// }
// API calls:
//   GET /api/v1/products/admin/all?page&limit&search&category&active
//   GET /api/v1/categories/admin/all?limit=100 (for filter dropdown)
//   DELETE /api/v1/products/:id
```

#### `AdminProductForm`
```jsx
// Props: { productId?: string }  — undefined = create mode
// State: { form: { all Product model fields }, loading, submitting, error, fieldErrors }
// API calls:
//   GET /api/v1/products/admin/all?... (edit mode fetch by id — using list endpoint with id match)
//   OR: GET /api/v1/products/:slug (if a direct-by-id endpoint is added — otherwise filter from list)
//   POST /api/v1/products
//   PATCH /api/v1/products/:productId
// Note: Since the backend exposes GET /api/v1/products/admin/all with full list,
//       edit mode fetches the specific product by calling GET /api/v1/products/:slug
//       or using the admin list with a search. Prefer calling apiFetch('/products/admin/all')
//       and finding the item by _id in the results for the edit fetch.
```

#### `ImageUploader`
```jsx
// Props: {
//   value?: string | string[],
//   onChange?: (url: string | string[]) => void,
//   multiple?: boolean,     // false = single image, true = gallery
//   folder?: string,        // default 'uploads'
//   accept?: string         // default 'image/jpeg,image/png,image/webp,image/gif'
// }
// State: { uploading, uploadProgress, dragOver, error }
// Does NOT use apiFetch for the R2 PUT — uses raw fetch with no auth header
```

---

## Data Models

### Form State — Category
```js
{
  name: '',           // required
  description: '',
  image: '',          // URL string (from ImageUploader)
  showInWardrobe: false,
  isActive: true,
  sortOrder: 0
}
```

### Form State — Product
```js
{
  name: '',           // required
  sku: '',
  category: '',       // ObjectId string
  mainImage: '',      // URL string
  galleryImages: [],  // string[]
  item: '',
  threadCount: '',
  fabric: '',
  material: '',
  size: '',
  gsm: '',
  usageApplication: '',
  bedSize: '',
  washType: '',
  packagingType: '',
  type: '',
  countryOfOrigin: 'Made In India',
  cotton: '',
  handmade: '',
  design: '',
  description: '',
  moreInformation: '',
  features: [],           // string[]
  materials: [],          // string[]
  careInstructions: [],   // string[]
  specs: [],              // { label: '', value: '' }[]
  isActive: true,
  isFeatured: false,
  showInNewArrivals: false,
  sortOrder: 0
}
```

### API Response Shapes (backend)
```js
// Paginated list
{ ok: true, data: { items[], total, page, limit } }

// Single item create/update
{ ok: true, data: { category | product } }

// Error
{ ok: false, error: 'message' }

// Presign
{ ok: true, data: { uploadUrl, publicUrl, key } }
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Before listing properties, reviewing the prework to eliminate redundancy:

- Properties 4.1 (category list renders N rows) and 5.1 (product list renders N rows) follow the same pattern — both kept as they test different components.
- Properties 4.10 and 5.5 (pagination controls for categories vs products) are structurally identical — they can be unified into one generic "pagination visibility" property tested for both contexts.
- Properties 5.7 (edit navigation by product ID) and 6.2 (form pre-population) are distinct — 5.7 tests URL construction, 6.2 tests field binding.
- Properties 7.2/7.3 (MIME validation) are combined in 7.2 — covered by one property.
- Properties 7.7 (upload failure leaves value unchanged) and 7.10 (remove updates array) are independent and kept separate.

After reflection, 8 distinct properties remain.

---

### Property 1: Dashboard stat cards render any valid count

*For any* non-negative integer value for product count and category count, the AdminDashboard stat cards SHALL display both values in their respective labelled containers without omitting or mutating the numbers.

**Validates: Requirements 3.2**

---

### Property 2: Category list renders exactly one row per category returned

*For any* non-empty array of category objects returned by the API, the AdminCategories table SHALL render exactly one row per category, with each row displaying the category's name, slug, image thumbnail reference, `showInWardrobe`, `isActive`, and `sortOrder` values.

**Validates: Requirements 4.1**

---

### Property 3: Category edit modal pre-populates all fields from the selected category

*For any* category object with arbitrary field values, when the edit icon for that category is clicked, the AdminCategories modal form SHALL pre-populate every field (name, description, image, showInWardrobe, isActive, sortOrder) with the values from that specific category object.

**Validates: Requirements 4.4**

---

### Property 4: Pagination controls appear if and only if total exceeds limit

*For any* pair of non-negative integers `(total, limit)` where `limit > 0`, the list view (AdminCategories or AdminProducts) SHALL render pagination controls when `total > limit` and SHALL NOT render pagination controls when `total <= limit`.

**Validates: Requirements 4.10, 5.5**

---

### Property 5: Product list renders exactly one row per product returned

*For any* non-empty array of product objects returned by the API, the AdminProducts table SHALL render exactly one row per product, with each row displaying the product's name, SKU, category name, `isActive`, `isFeatured`, `showInNewArrivals`, and `sortOrder` values.

**Validates: Requirements 5.1**

---

### Property 6: Product edit navigation uses the product's exact ID

*For any* product object with a given `_id`, clicking the edit icon on that product's row SHALL trigger navigation to the URL `/admin/products/{_id}/edit`, using the exact `_id` value without modification.

**Validates: Requirements 5.7**

---

### Property 7: AdminProductForm pre-populates all fields from the fetched product

*For any* product object with arbitrary values across all model fields, when AdminProductForm is rendered in edit mode with that product's ID, every form input SHALL display the corresponding value from the product object, including nested arrays (`features`, `materials`, `careInstructions`) and key-value pairs (`specs`).

**Validates: Requirements 6.2**

---

### Property 8: ImageUploader MIME type validation accepts only the four allowed types

*For any* string value presented as a file's MIME type, the ImageUploader SHALL accept the file if and only if the MIME type is exactly one of: `image/jpeg`, `image/png`, `image/webp`, `image/gif`. All other MIME type strings SHALL be rejected with an error message, and `onChange` SHALL NOT be called.

**Validates: Requirements 7.2, 7.3**

---

### Property 9: Upload failure leaves the ImageUploader value unchanged

*For any* combination of current value (string URL or array of URLs) and any simulated failure mode (presign endpoint error or R2 PUT error), the `onChange` callback SHALL NOT be called, and the displayed value SHALL remain identical to the value before the failed upload attempt.

**Validates: Requirements 7.7**

---

### Property 10: Gallery image removal produces correct filtered array

*For any* non-empty array of image URL strings and any valid index within that array, clicking the remove button for the image at that index SHALL call `onChange` with an array of length `N-1` that contains all original URLs except the one at the removed index, in their original order.

**Validates: Requirements 7.10**

---

## Error Handling

### Authentication Errors
- `apiFetch` intercepts 401 → attempts one token refresh → retries original call.
- If refresh fails, returns `{ _sessionExpired: true }`. Callers (AdminGuard) redirect to `/admin/login`.
- Login form errors are shown inline beneath the password field; the email field is preserved.

### Form Validation Errors
- Client-side: empty `name` on category/product form → set field error state, do not call API.
- Server-side: API returns `{ ok: false, error: '...' }` → display error in a form-level alert. Errors persist in state until the user successfully submits or navigates away.

### Network / API Errors
- All `apiFetch` calls are wrapped in try/catch. On catch, set an error state string.
- List pages show errors in a banner above the table without clearing the existing list.
- Stat cards show their own individual error states.

### Upload Errors
- Presign failure: show error inside the ImageUploader drop zone. Previous value unchanged.
- R2 PUT failure: show error inside the ImageUploader drop zone. Previous value unchanged.
- `onChange` is only called on confirmed success.

### Confirmation Before Destructive Actions
- Delete actions require a two-step confirmation: click delete icon (sets `deleteConfirmId` in state) → a confirmation row/dialog appears → user must click "Confirm" to proceed. Clicking elsewhere or pressing Escape cancels.

---

## Testing Strategy

### Applicability Assessment

This feature is a React UI application with client-side logic — components render data, validate forms, handle uploads, and perform navigation. The core logic (rendering lists, form pre-population, MIME validation, array manipulation) is well-suited to property-based testing. Infrastructure/CSS/visual requirements are not suited to PBT.

### Property-Based Testing Library

Use **fast-check** for JavaScript property-based testing with **Vitest** as the test runner.

```bash
npm install --save-dev fast-check vitest @testing-library/react @testing-library/user-event jsdom
```

Configure each property test with a minimum of **100 runs**.

### Unit Tests (example-based)

Cover the specific examples and edge cases identified in the prework:

- **AdminGuard**: authenticated vs unauthenticated render, loading state
- **AdminLoginPage**: successful login → redirect; invalid credentials → error shown; submit disabled during loading
- **AdminAuthContext**: silent refresh on mount; token stored on success; session expired handling
- **apiFetch**: 401 retry once; refresh failure returns `_sessionExpired`
- **AdminShell**: nav links present; active route highlighted; mobile sidebar toggle; user name in topbar
- **AdminCategories**: search debounce; empty-name validation; delete two-step confirmation
- **AdminProducts**: filter interactions; navigation to new/edit routes
- **AdminProductForm**: all field inputs present; cancel navigation; API error persists on page
- **ImageUploader**: progress state during upload; multi-image thumbnail display; presign call parameters

### Property Tests

Each property test references its property number from this document:

| Test | Property | Library |
|------|----------|---------|
| Dashboard stat card rendering for any count | Property 1 | fast-check |
| Category table row count matches API response | Property 2 | fast-check |
| Category edit pre-populates all fields | Property 3 | fast-check |
| Pagination visibility for any (total, limit) | Property 4 | fast-check |
| Product table row count matches API response | Property 5 | fast-check |
| Edit URL uses exact product `_id` | Property 6 | fast-check |
| Product form pre-populates all fields | Property 7 | fast-check |
| MIME type gating accepts only 4 types | Property 8 | fast-check |
| Upload failure leaves value unchanged | Property 9 | fast-check |
| Gallery remove produces correct filtered array | Property 10 | fast-check |

### Tag Format

Each property test must include a comment:

```js
// Feature: admin-panel, Property N: <property title>
```

### Integration / Smoke Tests

- Verify `admin.css` is imported in the `(admin)` layout (smoke: file import present)
- Verify `AdminAuthProvider` wraps the layout (smoke: context provider in tree)
- Verify `lucide-react` icons are used in action buttons (smoke: icon component presence)
