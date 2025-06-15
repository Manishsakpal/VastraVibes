
# Vastra Vibes Application Requirements

## 1. Project Overview

Vastra Vibes is a web application designed as an e-commerce platform for Indian and modern apparel. It allows users to browse a collection of clothing items, and provides an admin interface for managing store content. The application features a dynamic frontend built with Next.js and React, styled with Tailwind CSS and ShadCN UI components, and leverages Genkit for potential AI-driven features.

## 2. Core Technologies

*   **Frontend Framework:** Next.js (with App Router)
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **State Management:** React Context API (for item catalog and admin auth)
*   **AI Integration:** Genkit (for AI flows, e.g., with Google Gemini models)
*   **Language:** TypeScript
*   **Package Manager:** npm
*   **Version Control:** Git (assumed, though not explicitly managed by Firebase Studio)

## 3. System Requirements for Local Development

### 3.1. Software
*   **Node.js:**
    *   Recommended: LTS version (e.g., 18.x, 20.x, or newer LTS).
    *   Check with `node -v`.
*   **npm (Node Package Manager):**
    *   Comes bundled with Node.js.
    *   Check with `npm -v`.
*   **Operating System:**
    *   Windows 10 or later
    *   macOS (latest 2-3 versions)
    *   Linux (most common distributions like Ubuntu, Fedora, etc.)
*   **Web Browser:**
    *   Latest version of Chrome, Firefox, Edge, or Safari.
*   **(Optional but Recommended for Genkit AI features)**
    *   **Google Cloud SDK (`gcloud` CLI):** For authenticating with Google Cloud services if not using an API key directly.
    *   **Google AI API Key:** If using Genkit with Google AI models, an API key might be required, typically set in a `.env.local` file (e.g., `GOOGLE_API_KEY=YOUR_KEY_HERE`).

### 3.2. Hardware
*   Minimum 4GB RAM (8GB+ recommended for smoother development experience, especially with multiple dev servers and browser tabs).
*   Sufficient disk space for Node.js, project dependencies (`node_modules`), and source code (typically a few hundred MBs to a GB).

## 4. Setup and Running Instructions (Local Development)

1.  **Clone/Download Code:** Obtain the project codebase.
2.  **Navigate to Project Root:** Open a terminal and `cd` into the project's root directory (where `package.json` is located).
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Set up Environment Variables (Optional but Recommended for AI):**
    *   Create a `.env.local` file in the project root.
    *   Add necessary environment variables, e.g., `GOOGLE_API_KEY=YOUR_API_KEY`.
5.  **Run the Frontend Development Server:**
    *   In one terminal:
        ```bash
        npm run dev
        ```
    *   This usually starts the Next.js app on `http://localhost:9002`.
6.  **Run the Genkit AI Development Server:**
    *   In a *new, separate* terminal:
        ```bash
        npm run genkit:dev
        ```
    *   This usually starts the Genkit server on `http://localhost:4000` and provides a Developer UI.

## 5. Key Features (Functional Requirements)

### 5.1. Public User Features
*   **Homepage:**
    *   Display a welcome message and tagline.
    *   List available clothing items in a grid.
    *   Allow filtering items by predefined categories (All, Men, Women, Kids, Ethnic, Western).
    *   Allow searching items by title or description.
    *   Display a message if no items match the filter or search.
*   **Item Card:**
    *   Display item image, title, description, price, category, and available sizes.
    *   "Add to Bag" button (currently simulates adding to bag with a toast notification).
*   **Navigation:**
    *   Header with links to Home and Admin Login.
    *   Footer with copyright information.

### 5.2. Admin Features
*   **Admin Login:**
    *   Secure login page for administrators (`/admin/login`).
    *   Uses predefined credentials (`admin`/`password123` stored in constants).
    *   Authentication state managed via localStorage.
*   **Admin Dashboard (`/admin/dashboard` - requires login):**
    *   Welcome message for admins.
    *   Navigation options:
        *   Add New Item
        *   Manage Products (placeholder for future feature)
        *   User Management (placeholder for future feature)
*   **Add New Item (`/admin/add-item` - requires login):**
    *   Form to add new clothing items with fields for:
        *   Title
        *   Description
        *   Price
        *   Size(s)
        *   Category (dropdown)
        *   Image URL
        *   Image Hint (optional, for placeholder services)
    *   Form validation using Zod.
    *   On successful submission, item is added to the local item list (managed by `ItemContext` and persisted in localStorage) and a success toast is shown.
    *   Redirects or provides a link back to the dashboard.
*   **Admin Logout:**
    *   Allows admins to log out, clearing their authentication state.

## 6. Non-Functional Requirements (Implicit & Implemented)

*   **Responsiveness:** The UI should adapt to different screen sizes (desktop, tablet, mobile). Achieved using Tailwind CSS.
*   **Usability:** The application should be intuitive and easy to navigate.
*   **Data Persistence (Local):**
    *   Item catalog is persisted in the browser's localStorage to simulate a database for demo purposes.
    *   Admin authentication status is persisted in localStorage.
*   **Code Quality:**
    *   Written in TypeScript for type safety.
    *   Organized into a modular structure (components, hooks, lib, context, app routes).
*   **Error Handling:**
    *   Basic form validation errors are displayed.
    *   Toasts are used for notifications (e.g., item added, login failed - though toasts for login errors are generally discouraged in production in favor of inline messages).
*   **Accessibility:** Basic ARIA attributes are used in some components (e.g., labels for buttons), but comprehensive accessibility auditing is not explicitly covered yet.

## 7. Future Considerations / Potential Enhancements (Not Yet Implemented)

*   Actual backend database integration (e.g., Firestore) instead of localStorage for items and users.
*   Full shopping cart and checkout functionality.
*   Real user authentication system (e.g., Firebase Authentication).
*   AI-powered features via Genkit (e.g., product recommendations, image analysis, automated descriptions).
*   Advanced product management for admins (edit, delete items).
*   User account management for admins.
*   Order management.
*   Deployment to a hosting platform.
