# Implementation Plan: NHF Admin Panel

## Overview

Build the admin panel as a Next.js App Router route group `(admin)`. All authentication infrastructure already exists. Implementation proceeds from routing scaffolding → shared UI components → page-by-page feature work → image upload → final wiring.

---

## Tasks

- [x] 1. Set up route group, layout, and CSS foundation
  - Create `src/app/(admin)/layout.js` — wrap children with `AdminAuthProvider` and import `src/styles/admin.css`
  - Create `src/styles/admin.css` with the full NHF olive-dark theme: CSS variables for `--nhf-sidebar: #1C1F17`, `--nhf-accent: #7B7F5C`, `--nhf-bg: #FAFAF6`; define utility classes `nhf-btn`, `nhf-btn-sm`, `nhf-btn-danger`, `nhf-form-input`, `nhf-form-label`, `nhf-modal`, `nhf-modal-overlay`, `nhf-table`, `nhf-badge`, `nhf-card`, `nhf-skeleton`
  - Create `src/app/(admin)/admin/page.js` — server component that calls `redirect('/admin/dashboard')`
  - _Requirements: 2.6, 2.7_

- [x] 2. Implement AdminGuard and AdminShell
  - [x] 2.1 Create `src/components/admin/AdminGuard.jsx`
    - `"use client"` — reads `useAdminAuth()` → `{ user, loading }`
    - While `loading`: render a centred full-screen spinner using `nhf-skeleton` styling
    - If `!loading && !user`: call `router.replace('/admin/login')` and return `null`
    - Otherwise: render `{children}`
    - _Requirements: 1.1, 1.9_

  - [ ]* 2.2 Write unit tests for AdminGuard
    - Test: loading=true → spinner rendered, children not shown
    - Test: loading=false, user=null → redirect called
    - Test: loading=false, user present → children rendered
    - _Requirements: 1.1, 1.9_

  - [x] 2.3 Create `src/components/admin/AdminShell.jsx`
    - `"use client"` — sidebar nav + topbar layout
    - Sidebar links: Dashboard (`/admin/dashboard`), Categories (`/admin/categories`), Products (`/admin/products`) — use `lucide-react` icons (`LayoutDashboard`, `Tag`, `Package`)
    - Highlight active link by comparing `usePathname()` to each href
    - Topbar: show `user.name` from `useAdminAuth()` + logout button (`LogOut` icon)
    - Mobile: `sidebarOpen` state; hamburger `Menu` icon in topbar; sidebar renders as overlay below 768 px via CSS class toggle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.6_

  - [ ]* 2.4 Write unit tests for AdminShell
    - Test: all three nav links rendered with correct hrefs
    - Test: active class applied to matching route
    - Test: user name rendered in topbar
    - Test: logout button calls `logout()`
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implement AdminLoginPage and login route
  - [x] 3.1 Create `src/components/admin/AdminLoginPage.jsx`
    - `"use client"` — local state: `{ email, password, loading, error }`
    - Accessible `<form>` with `<label>` for each input; submit calls `AdminAuthProvider.login(email, password)`
    - On success: `router.push('/admin/dashboard')`
    - On failure: `setError(res.message)`, keep email field value
    - Submit button disabled while `loading === true`
    - Styled with `nhf-form-input`, `nhf-btn`, NHF palette
    - _Requirements: 1.4, 1.5, 8.3_

  - [x] 3.2 Create `src/app/(admin)/admin/login/page.js`
    - Renders `<AdminLoginPage />`; no AdminGuard (this is the public login page)
    - _Requirements: 1.4_

  - [ ]* 3.3 Write unit tests for AdminLoginPage
    - Test: successful login → redirect to /admin/dashboard
    - Test: failed login → error shown, email field preserved, password cleared
    - Test: submit button disabled during loading
    - _Requirements: 1.4, 1.5, 8.3_

- [x] 4. Implement AdminDashboard
  - [x] 4.1 Create `src/components/admin/AdminDashboard.jsx`
    - `"use client"` — state: `{ productCount, categoryCount, loadingP, loadingC, errorP, errorC }`
    - On mount: fire two independent `apiFetch` calls in parallel (`Promise.allSettled`):
      - `GET /products/admin/all?limit=1` → `data.total` → `productCount`
      - `GET /categories/admin/all?limit=1` → `data.total` → `categoryCount`
    - While loading: render `nhf-skeleton` card placeholders
    - On individual failure: show error message in that specific stat card only
    - Stat cards show count + label: "Total Products", "Total Categories"
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Create `src/app/(admin)/admin/dashboard/page.js`
    - Renders `<AdminGuard><AdminShell><AdminDashboard /></AdminShell></AdminGuard>`
    - _Requirements: 3.1_

  - [ ]* 4.3 Write property test for AdminDashboard stat rendering (Property 1)
    - **Property 1: Dashboard stat cards render any valid count**
    - **Validates: Requirements 3.2**
    - Use `fast-check`: generate `fc.tuple(fc.nat(), fc.nat())` for product/category counts; mock `apiFetch` to return those values; verify both numbers appear in rendered output
    - `// Feature: admin-panel, Property 1: Dashboard stat cards render any valid count`
    - _Requirements: 3.2_

  - [ ]* 4.4 Write unit tests for AdminDashboard
    - Test: skeleton cards shown while loading
    - Test: products API fail → error in products card, category card shows count
    - Test: categories API fail → error in categories card, products card shows count
    - _Requirements: 3.3, 3.4_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ImageUploader component
  - [x] 6.1 Create `src/components/admin/ImageUploader.jsx`
    - `"use client"` — props: `{ value, onChange, multiple=false, folder='uploads' }`
    - State: `{ uploading, dragOver, error }`
    - Drop zone: `onDragOver`, `onDrop`, `onClick → fileInput.click()`; visual drag-over state via CSS class
    - File validation: check `file.type` against `['image/jpeg','image/png','image/webp','image/gif']`; on failure set error and return
    - Upload flow:
      1. `apiFetch('/upload/presign', { method:'POST', body: JSON.stringify({ mimeType: file.type, fileSize: file.size, folder }) })`
      2. Raw `fetch(uploadUrl, { method:'PUT', body: file, headers: { 'Content-Type': file.type } })`
      3. On success: `onChange(publicUrl)` (single) or `onChange([...value, publicUrl])` (multiple)
    - While uploading: show spinner/progress indicator, disable file input
    - Single mode: show current image preview if `value` is a non-empty string
    - Multiple mode (`multiple=true`): show thumbnail grid of `value` (array); each thumbnail has a remove button (`X` icon) that calls `onChange(value.filter((_, i) => i !== idx))`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ]* 6.2 Write property test for MIME type validation (Property 8)
    - **Property 8: ImageUploader MIME type validation accepts only the four allowed types**
    - **Validates: Requirements 7.2, 7.3**
    - Use `fast-check`: generate arbitrary strings as MIME types; verify accepted iff exactly one of the four allowed types; verify `onChange` not called for rejected types
    - `// Feature: admin-panel, Property 8: ImageUploader MIME type validation accepts only the four allowed types`
    - _Requirements: 7.2, 7.3_

  - [ ]* 6.3 Write property test for upload failure (Property 9)
    - **Property 9: Upload failure leaves the ImageUploader value unchanged**
    - **Validates: Requirements 7.7**
    - Use `fast-check`: generate any valid current value (string or string array); simulate presign or R2 failure; verify `onChange` never called
    - `// Feature: admin-panel, Property 9: Upload failure leaves the ImageUploader value unchanged`
    - _Requirements: 7.7_

  - [ ]* 6.4 Write property test for gallery image removal (Property 10)
    - **Property 10: Gallery image removal produces correct filtered array**
    - **Validates: Requirements 7.10**
    - Use `fast-check`: generate `fc.array(fc.webUrl(), { minLength: 1 })` and a valid index; simulate remove click; verify `onChange` called with array of length N-1 excluding the removed URL
    - `// Feature: admin-panel, Property 10: Gallery image removal produces correct filtered array`
    - _Requirements: 7.10_

  - [ ]* 6.5 Write unit tests for ImageUploader
    - Test: upload in progress → file input disabled, spinner visible
    - Test: successful single upload → preview image shown
    - Test: multiple mode thumbnail list rendered
    - Test: presign call receives correct `{ mimeType, fileSize, folder }` params
    - _Requirements: 7.4, 7.5, 7.8, 7.9_

- [ ] 7. Implement AdminCategories (list + modal CRUD)
  - [-] 7.1 Create `src/components/admin/AdminCategories.jsx`
    - `"use client"` — full state as defined in design
    - Fetch function `loadCategories(page, search)` calls `GET /categories/admin/all?page&limit=20&search`
    - Search input: `useRef` for debounce timer, 400 ms debounce, resets page to 1
    - Table columns: Name, Slug, Image (thumbnail 40×40), Wardrobe, Active, Sort, Actions (edit `Pencil` icon, delete `Trash2` icon)
    - Loading state: render 5 `nhf-skeleton` rows in table body
    - Pagination: `<` / `>` buttons, disabled at boundaries, show "Page X of Y"
    - "Add Category" button opens modal in create mode
    - Edit icon: set `editingCategory`, open modal in edit mode
    - Delete icon: set `deleteConfirmId`; show inline confirmation row with "Confirm" + "Cancel"; on confirm call `DELETE /categories/:id` then reload
    - Modal (`nhf-modal` + `nhf-modal-overlay`): form with fields name, description, image (ImageUploader), showInWardrobe checkbox, isActive checkbox, sortOrder number input
    - Modal validation: if `form.name.trim() === ''` set formError, prevent submit
    - On successful create/update: close modal, reset form, reload list
    - Escape key listener on modal to close; focus trap via `useEffect` + `querySelectorAll` on focusable elements
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 8.4_

  - [ ] 7.2 Create `src/app/(admin)/admin/categories/page.js`
    - Renders `<AdminGuard><AdminShell><AdminCategories /></AdminShell></AdminGuard>`

  - [ ]* 7.3 Write property test for category list rendering (Property 2)
    - **Property 2: Category list renders exactly one row per category returned**
    - **Validates: Requirements 4.1**
    - Use `fast-check`: generate `fc.array(fc.record({ _id: fc.string(), name: fc.string(), slug: fc.string(), image: fc.string(), showInWardrobe: fc.boolean(), isActive: fc.boolean(), sortOrder: fc.integer() }), { minLength: 1, maxLength: 50 })`; mock API; verify `table` has exactly N data rows
    - `// Feature: admin-panel, Property 2: Category list renders exactly one row per category returned`
    - _Requirements: 4.1_

  - [ ]* 7.4 Write property test for category edit pre-population (Property 3)
    - **Property 3: Category edit modal pre-populates all fields from the selected category**
    - **Validates: Requirements 4.4**
    - Use `fast-check`: generate arbitrary category records; click edit; assert each form field value matches the generated category's data
    - `// Feature: admin-panel, Property 3: Category edit modal pre-populates all fields from the selected category`
    - _Requirements: 4.4_

  - [ ]* 7.5 Write property test for pagination visibility (Property 4)
    - **Property 4: Pagination controls appear if and only if total exceeds limit**
    - **Validates: Requirements 4.10, 5.5**
    - Use `fast-check`: generate `fc.tuple(fc.nat(), fc.nat({ min: 1 }))` for `(total, limit)`; when `total > limit` assert pagination visible; when `total <= limit` assert pagination absent
    - `// Feature: admin-panel, Property 4: Pagination controls appear if and only if total exceeds limit`
    - _Requirements: 4.10, 5.5_

  - [ ]* 7.6 Write unit tests for AdminCategories
    - Test: search debounce (400 ms timer, re-fetch triggered)
    - Test: empty name validation (error shown, no API call)
    - Test: delete two-step (delete icon shows confirm row; confirm calls DELETE; cancel resets)
    - Test: loading state renders skeleton rows
    - _Requirements: 4.2, 4.6, 4.7, 4.9_

- [~] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement AdminProducts (list view)
  - [~] 9.1 Create `src/components/admin/AdminProducts.jsx`
    - `"use client"` — full state as defined in design
    - On mount: fetch `GET /categories/admin/all?limit=100` to populate category filter dropdown
    - Fetch function `loadProducts(page, search, categoryFilter, activeFilter)` calls `GET /products/admin/all`
    - Search input: 400 ms debounce, same pattern as AdminCategories
    - Category filter: `<select>` with all categories + "All categories" option; on change re-fetch
    - Active filter: `<select>` with "All", "Active", "Inactive"; on change re-fetch with `active` param
    - Table columns: Name, SKU, Category, Active, Featured, New Arrivals, Sort, Actions (edit `Pencil`, delete `Trash2`)
    - Loading: skeleton rows
    - Pagination: same pattern as AdminCategories
    - "Add Product" button: `router.push('/admin/products/new')`
    - Edit icon: `router.push('/admin/products/' + product._id + '/edit')`
    - Delete: same two-step inline confirmation as AdminCategories calling `DELETE /products/:id`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [~] 9.2 Create `src/app/(admin)/admin/products/page.js`
    - Renders `<AdminGuard><AdminShell><AdminProducts /></AdminShell></AdminGuard>`

  - [ ]* 9.3 Write property test for product list rendering (Property 5)
    - **Property 5: Product list renders exactly one row per product returned**
    - **Validates: Requirements 5.1**
    - Use `fast-check`: generate random product arrays; mock API; verify table row count equals array length
    - `// Feature: admin-panel, Property 5: Product list renders exactly one row per product returned`
    - _Requirements: 5.1_

  - [ ]* 9.4 Write property test for edit navigation (Property 6)
    - **Property 6: Product edit navigation uses the product's exact ID**
    - **Validates: Requirements 5.7**
    - Use `fast-check`: generate random `_id` strings; render row with that product; simulate edit click; assert `router.push` called with `/admin/products/{_id}/edit`
    - `// Feature: admin-panel, Property 6: Product edit navigation uses the product's exact ID`
    - _Requirements: 5.7_

  - [ ]* 9.5 Write unit tests for AdminProducts
    - Test: search debounce
    - Test: category filter triggers re-fetch with category param
    - Test: active filter triggers re-fetch with active param
    - Test: "Add Product" button navigates to /admin/products/new
    - Test: delete two-step confirmation
    - _Requirements: 5.2, 5.3, 5.4, 5.6, 5.8_

- [ ] 10. Implement AdminProductForm (create / edit)
  - [~] 10.1 Create `src/components/admin/AdminProductForm.jsx`
    - `"use client"` — props: `{ productId?: string }`
    - Initial form state matches the full Product model as defined in the design
    - Edit mode (`productId` provided): on mount fetch `GET /products/admin/all?limit=200` and find product by `_id === productId`, then `setForm(product)`. If not found, show error banner.
    - Render form sections (use `<fieldset>` groups for clarity):
      - **Basic Info**: name (required), sku, category dropdown (fetched from `/categories/admin/all?limit=100`), isActive, isFeatured, showInNewArrivals, sortOrder
      - **Images**: `<ImageUploader>` for `mainImage` (single); `<ImageUploader multiple>` for `galleryImages`
      - **Specs & Attributes**: item, threadCount, fabric, material, size, gsm, usageApplication, bedSize, washType, packagingType, type, countryOfOrigin, cotton, handmade, design
      - **Description**: description (`<textarea>`), moreInformation (`<textarea>`)
      - **Lists**: dynamic list editor for `features`, `materials`, `careInstructions` — each with "Add" button and per-item remove; backed by string arrays in form state
      - **Specs table**: dynamic rows for `specs` (label + value pair); "Add Row" button + per-row remove
    - On submit: validate `form.name.trim() !== ''`; call `POST /products` (create) or `PATCH /products/:productId` (update); on success `router.push('/admin/products')`; on API error set `error` state and remain on page
    - Cancel button: `router.push('/admin/products')`
    - Styled with `nhf-form-input`, `nhf-form-label`, `nhf-btn`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11_

  - [~] 10.2 Create route pages for product form
    - `src/app/(admin)/admin/products/new/page.js` — renders `<AdminGuard><AdminShell><AdminProductForm /></AdminShell></AdminGuard>`
    - `src/app/(admin)/admin/products/[id]/edit/page.js` — renders `<AdminGuard><AdminShell><AdminProductForm productId={params.id} /></AdminShell></AdminGuard>`
    - _Requirements: 6.1_

  - [ ]* 10.3 Write property test for product form pre-population (Property 7)
    - **Property 7: AdminProductForm pre-populates all fields from the fetched product**
    - **Validates: Requirements 6.2**
    - Use `fast-check`: generate arbitrary product objects with all scalar fields set and arrays populated; mock API to return the generated product; render form in edit mode; verify each input value matches the generated product's field
    - `// Feature: admin-panel, Property 7: AdminProductForm pre-populates all fields from the fetched product`
    - _Requirements: 6.2_

  - [ ]* 10.4 Write unit tests for AdminProductForm
    - Test: all required field inputs are present in the rendered form
    - Test: empty name → validation error shown, no API call
    - Test: API error on submit → error message shown, user stays on page
    - Test: cancel button navigates to /admin/products
    - Test: dynamic list editor — add item → array grows; remove item → array shrinks
    - Test: specs editor — add row → specs array grows; remove row → specs array shrinks
    - _Requirements: 6.3, 6.6, 6.7, 6.9, 6.10, 6.11_

- [~] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation before moving to the next phase
- Property tests validate universal correctness properties using `fast-check`
- Unit tests validate specific examples and edge cases
- The design uses JavaScript/JSX throughout (no TypeScript) matching the existing codebase
- `apiFetch` from `src/lib/adminApi.js` is the only fetch utility used inside admin components; raw `fetch` is used only for the R2 PUT upload
