# Requirements Document

## Introduction

The NHF Admin Panel is a secure, browser-based management interface for the Nikita Home Furnishing (NHF) platform. It allows administrators to log in, browse an overview dashboard, and perform full CRUD operations on Categories and Products via the existing Express.js REST API. The panel runs as a Next.js 16 App Router route group `(admin)` alongside the public storefront. All communication with the backend uses a JWT-in-memory + httpOnly-refresh-cookie authentication scheme already implemented in `adminApi.js` and `AdminAuthContext.jsx`.

---

## Glossary

- **Admin_Panel**: The set of Next.js pages and React components served under the `/admin` path that allow administrators to manage site content.
- **AdminAuthProvider**: The React context provider (`src/context/AdminAuthContext.jsx`) that holds the authenticated user, exposes `login`/`logout`, and silently refreshes the access token on page load.
- **AdminGuard**: A client component that reads `AdminAuthProvider` state and redirects unauthenticated visitors to `/admin/login`.
- **AdminShell**: The persistent layout component containing the sidebar navigation and top bar, rendered inside every authenticated admin page.
- **AdminLoginPage**: The standalone login form rendered at `/admin/login`, outside `AdminShell`.
- **AdminDashboard**: The overview page showing aggregate statistics (product count, category count).
- **AdminCategories**: The category management page supporting list, create, edit, and soft-delete operations.
- **AdminProducts**: The product list page supporting paginated browsing, search, category filter, and navigation to create/edit forms.
- **AdminProductForm**: The create/edit form for a single Product, covering all Product model fields.
- **ImageUploader**: A reusable drag-and-drop component that presigns an upload via `POST /api/v1/upload/presign` and PUTs the file directly to Cloudflare R2, returning the public URL.
- **apiFetch**: The authenticated fetch wrapper in `src/lib/adminApi.js` that attaches the in-memory JWT, retries once on 401 by calling the refresh endpoint, and exposes `{ ok, status, data }`.
- **R2**: Cloudflare R2 object storage used for product and category images.
- **Presign_Endpoint**: `POST /api/v1/upload/presign` — accepts `{ mimeType, fileSize, folder }`, returns `{ uploadUrl, publicUrl, key }`.
- **Admin_API**: The set of authenticated backend endpoints: `/api/v1/categories/admin/all`, `/api/v1/products/admin/all`, and the create/update/delete endpoints for both resources.
- **Soft_Delete**: Setting `isActive: false` on a document rather than permanently removing it from the database, which is the deletion behaviour implemented in both category and product controllers.

---

## Requirements

### Requirement 1: Authentication and Session Management

**User Story:** As an administrator, I want to log in with my credentials and have my session maintained across page refreshes, so that I can access the admin panel securely without re-entering my password.

#### Acceptance Criteria

1. WHEN a visitor navigates to any `/admin/*` route other than `/admin/login`, THE AdminGuard SHALL check `AdminAuthProvider` loading state and, once resolved, redirect unauthenticated visitors to `/admin/login`.
2. WHEN the `AdminAuthProvider` mounts, THE AdminAuthProvider SHALL call `POST /api/v1/auth/refresh` to silently restore a session from the httpOnly refresh cookie; IF the refresh fails, THEN THE AdminAuthProvider SHALL set `user` to `null` and `loading` to `false`, allowing the AdminGuard to redirect to `/admin/login` without blocking navigation to the dashboard for authenticated sessions restored on the next attempt.
3. WHEN the silent refresh succeeds, THE AdminAuthProvider SHALL store the returned access token in memory via `setAccessToken` and fetch `/api/v1/auth/me` to populate the `user` state.
4. WHEN a visitor submits the login form with a valid email and password, THE AdminLoginPage SHALL call `AdminAuthProvider.login`, store the returned access token, and redirect to `/admin/dashboard`.
5. IF the login form is submitted with invalid credentials, THEN THE AdminLoginPage SHALL display the error message returned by the API without clearing the email field.
6. WHEN an administrator clicks the logout button, THE AdminShell SHALL call `AdminAuthProvider.logout`, clear the access token, and redirect to `/admin/login`.
7. WHEN `apiFetch` receives a 401 response and a valid in-memory token exists, THE apiFetch SHALL attempt one silent token refresh before retrying the original request.
8. IF the silent refresh fails during any API call, THEN THE apiFetch SHALL clear the access token and return `{ ok: false, status: 401, _sessionExpired: true }`, causing the AdminGuard to redirect to `/admin/login`.
9. WHILE the `AdminAuthProvider` loading state is `true`, THE AdminGuard SHALL render a full-screen loading indicator instead of the protected page content.

---

### Requirement 2: Application Layout and Navigation

**User Story:** As an administrator, I want a consistent shell layout with sidebar navigation, so that I can move between the dashboard, categories, and products pages without disorientation.

#### Acceptance Criteria

1. THE AdminShell SHALL render a sidebar containing navigation links to Dashboard (`/admin/dashboard`), Categories (`/admin/categories`), and Products (`/admin/products`).
2. WHEN the current route matches a navigation link, THE AdminShell SHALL apply an active visual style to that link.
3. THE AdminShell SHALL render a top bar displaying the name of the currently authenticated user from `AdminAuthProvider`.
4. WHEN the viewport width is below 768 px, THE AdminShell SHALL collapse the sidebar and render a hamburger toggle button in the top bar.
5. WHEN a user taps the hamburger toggle, THE AdminShell SHALL show or hide the sidebar as an overlay without affecting page content layout.
6. THE `(admin)` route group layout SHALL wrap all child pages with `AdminAuthProvider` and import `src/styles/admin.css`.
7. THE `/admin` route SHALL redirect to `/admin/dashboard` using a Next.js `redirect()` call.

---

### Requirement 3: Admin Dashboard

**User Story:** As an administrator, I want to see a summary of site content at a glance, so that I can quickly assess the current state of products and categories.

#### Acceptance Criteria

1. WHEN the AdminDashboard page loads, THE AdminDashboard SHALL fetch total product count from `GET /api/v1/products/admin/all?limit=1` and total category count from `GET /api/v1/categories/admin/all?limit=1`.
2. THE AdminDashboard SHALL display the total product count and total category count in clearly labelled stat cards.
3. WHEN dashboard data is loading, THE AdminDashboard SHALL render skeleton placeholder cards in place of the stat values.
4. IF a dashboard API call fails, THEN THE AdminDashboard SHALL display an inline error message within the specific stat card for that failed call, without blocking the rest of the page.

---

### Requirement 4: Category Management

**User Story:** As an administrator, I want to list, create, edit, and deactivate categories, so that I can keep the site's category structure up to date.

#### Acceptance Criteria

1. WHEN the AdminCategories page loads, THE AdminCategories SHALL fetch the paginated category list from `GET /api/v1/categories/admin/all` and render each category in a table row showing name, slug, image thumbnail, `showInWardrobe`, `isActive`, and `sortOrder`.
2. WHEN a user types in the search input, THE AdminCategories SHALL debounce the input by 400 ms and re-fetch the category list with the `search` query parameter.
3. WHEN a user clicks "Add Category", THE AdminCategories SHALL open a modal form with empty fields for name, description, image, `showInWardrobe` (checkbox), `isActive` (checkbox, default true), and `sortOrder`.
4. WHEN a user clicks the edit icon on a category row, THE AdminCategories SHALL open the same modal form pre-populated with that category's current values.
5. WHEN the category form is submitted with a non-empty name, THE AdminCategories SHALL call `POST /api/v1/categories` (create) or `PATCH /api/v1/categories/:id` (update), close the modal on success, and refresh the list.
6. IF the category form is submitted with an empty name, THEN THE AdminCategories SHALL display a validation error and prevent the API call.
7. WHEN a user clicks the delete icon on a category row and confirms the action, THE AdminCategories SHALL call `DELETE /api/v1/categories/:id` (which soft-deletes by setting `isActive: false`) and refresh the list.
8. THE AdminCategories category form SHALL include the ImageUploader component for the `image` field, allowing a single image to be uploaded to R2.
9. WHEN the category list is loading, THE AdminCategories SHALL render a loading state in the table body.
10. THE AdminCategories SHALL render pagination controls when `total` exceeds `limit`, allowing the user to navigate between pages.

---

### Requirement 5: Product Management — List View

**User Story:** As an administrator, I want to browse, search, and filter all products with pagination, so that I can quickly find any product in the catalogue.

#### Acceptance Criteria

1. WHEN the AdminProducts page loads, THE AdminProducts SHALL fetch the paginated product list from `GET /api/v1/products/admin/all` and render each product in a table row showing name, SKU, category name, `isActive`, `isFeatured`, `showInNewArrivals`, and `sortOrder`.
2. WHEN a user types in the search input, THE AdminProducts SHALL debounce the input by 400 ms and re-fetch the product list with the `search` query parameter.
3. WHEN a user selects a category from the filter dropdown, THE AdminProducts SHALL re-fetch the product list with the `category` query parameter set to the selected category's `_id`.
4. WHEN a user selects a status from the active/inactive filter, THE AdminProducts SHALL re-fetch the product list with the `active` query parameter.
5. THE AdminProducts SHALL render pagination controls consistent with AdminCategories, allowing navigation between pages.
6. WHEN a user clicks "Add Product", THE AdminProducts SHALL navigate to `/admin/products/new`.
7. WHEN a user clicks the edit icon on a product row, THE AdminProducts SHALL navigate to `/admin/products/[id]/edit`.
8. WHEN a user clicks the delete icon on a product row and confirms the action, THE AdminProducts SHALL call `DELETE /api/v1/products/:id` and refresh the list.
9. WHEN the product list is loading, THE AdminProducts SHALL render a loading state in the table body.

---

### Requirement 6: Product Management — Create / Edit Form

**User Story:** As an administrator, I want to create new products and edit existing ones using a structured form, so that I can maintain accurate product data for the storefront.

#### Acceptance Criteria

1. THE AdminProductForm SHALL be rendered at route `/admin/products/new` (create mode) and `/admin/products/[id]/edit` (edit mode).
2. WHEN the AdminProductForm loads in edit mode, THE AdminProductForm SHALL fetch the product by ID from `GET /api/v1/products/admin/all?limit=1` or use the list cache, and pre-populate all form fields.
3. THE AdminProductForm SHALL include form fields for all Product model fields: `name`, `sku`, `category` (dropdown populated from all active categories), `item`, `threadCount`, `fabric`, `material`, `size`, `gsm`, `usageApplication`, `bedSize`, `washType`, `packagingType`, `type`, `countryOfOrigin`, `cotton`, `handmade`, `design`, `description`, `moreInformation`, `isActive`, `isFeatured`, `showInNewArrivals`, and `sortOrder`.
4. THE AdminProductForm SHALL include the ImageUploader component for the `mainImage` field (single image).
5. THE AdminProductForm SHALL include the ImageUploader component for the `galleryImages` field (multiple images, up to 10).
6. THE AdminProductForm SHALL render dynamic list editors for `features`, `materials`, and `careInstructions` (each a list of plain strings with add/remove controls).
7. THE AdminProductForm SHALL render a dynamic key-value editor for `specs` (list of `{ label, value }` pairs with add/remove controls).
8. WHEN the AdminProductForm is submitted with a non-empty `name`, THE AdminProductForm SHALL call `POST /api/v1/products` (create) or `PATCH /api/v1/products/:id` (update) and redirect to `/admin/products` on success.
9. IF the AdminProductForm is submitted with an empty `name`, THEN THE AdminProductForm SHALL display a validation error and prevent the API call.
10. IF the AdminProductForm API call returns an error, THEN THE AdminProductForm SHALL display the error message returned by the API and remain on the form page.
11. WHEN the user clicks the cancel button on AdminProductForm, THE AdminProductForm SHALL navigate back to `/admin/products` without saving changes.

---

### Requirement 7: Image Upload via R2 Presigned URL

**User Story:** As an administrator, I want to drag-and-drop or browse for an image and have it uploaded directly to R2 storage, so that product and category images are hosted on the CDN without passing through the backend server.

#### Acceptance Criteria

1. THE ImageUploader SHALL accept an optional `value` prop (current URL string or array of URL strings) and an optional `onChange` prop (callback receiving the new URL or URL array), and SHALL function correctly when only some props are provided.
2. WHEN a user drags a file onto the ImageUploader drop zone or selects a file via the file input, THE ImageUploader SHALL validate that the file MIME type is one of `image/jpeg`, `image/png`, `image/webp`, or `image/gif`.
3. IF a file with an unsupported MIME type is dropped, THEN THE ImageUploader SHALL display an error message and reject the file.
4. WHEN a valid file is selected, THE ImageUploader SHALL call `POST /api/v1/upload/presign` with `{ mimeType, fileSize, folder }` to obtain `{ uploadUrl, publicUrl, key }`.
5. WHEN the presign response is received, THE ImageUploader SHALL execute a `PUT` request directly to `uploadUrl` with the file binary and the correct `Content-Type` header, without sending the file through the Next.js server.
6. WHEN the R2 PUT upload succeeds, THE ImageUploader SHALL call `onChange` with the `publicUrl` and display a preview of the uploaded image.
7. IF the presign request or R2 PUT request fails, THEN THE ImageUploader SHALL display an error message and leave the previous value unchanged.
8. WHILE an upload is in progress, THE ImageUploader SHALL render a progress indicator and disable further file selection.
9. WHERE the ImageUploader is used for gallery images (`galleryImages`), THE ImageUploader SHALL allow multiple files to be uploaded sequentially and display all current images as a thumbnail list with individual remove buttons.
10. WHEN an existing image thumbnail's remove button is clicked, THE ImageUploader SHALL call `onChange` with the updated array that excludes the removed URL.

---

### Requirement 8: Styling and Accessibility

**User Story:** As an administrator, I want the admin panel to have a consistent, readable visual style and be usable with keyboard navigation, so that the interface is professional and accessible.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use the custom CSS classes defined in `src/styles/admin.css` (including `nhf-btn`, `nhf-form-input`, `nhf-modal`, and related utilities) for all admin UI elements rather than Tailwind utility classes.
2. THE Admin_Panel color scheme SHALL use the NHF olive-dark palette: sidebar background `#1C1F17`, primary accent `#7B7F5C`, and page background `#FAFAF6`.
3. THE AdminLoginPage SHALL render an accessible `<form>` with labelled `<input>` elements for email and password, and the submit button SHALL be disabled while the login API call is in progress.
4. WHEN the modal is open and keyboard focus trapping is active, THE AdminCategories modal SHALL trap keyboard focus within the modal and close when the user presses the Escape key; IF focus trapping fails to activate, THEN THE modal SHALL remain open.
5. THE Admin_Panel SHALL use `lucide-react` icons consistently for action buttons (edit, delete, add, close, menu toggle).
