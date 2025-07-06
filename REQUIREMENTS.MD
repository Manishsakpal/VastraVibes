
# Vastra Vibes Application Requirements

## 1. Project Overview

Vastra Vibes is an e-commerce platform for Indian and modern apparel. It allows users to browse a clothing collection and provides an admin interface for managing store content. The application features a dynamic frontend built with Next.js and React, styled with Tailwind CSS and ShadCN UI components, and is powered by a MongoDB backend.

## 2. Core Technologies

*   **Frontend Framework:** Next.js (with App Router)
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **Database:** MongoDB (via MongoDB Atlas)
*   **State Management:** React Context API
*   **Language:** TypeScript
*   **Package Manager:** npm

## 3. System Requirements for Local Development

### 3.1. Software
*   **Node.js:** Recommended LTS version (e.g., 18.x, 20.x).
*   **npm (Node Package Manager):** Bundled with Node.js.
*   **MongoDB:** A connection string to a MongoDB database (e.g., a free tier on MongoDB Atlas).

## 4. Setup and Running Instructions (Local Development)

1.  **Obtain Project Code:** Clone or download the codebase.
2.  **Navigate to Project Root:** Open a terminal and `cd` into the project's root directory.
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Set up Environment Variables:**
    *   Open the file named `.env.local` in the project root.
    *   Replace the placeholder `MONGODB_URI` with your actual MongoDB connection string.
    *   The `SUPERADMIN_ID` and `SUPERADMIN_PASSWORD` are also set in this file.
        ```
        MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
        DB_NAME=vastra-vibes
        SUPERADMIN_ID=admin
        SUPERADMIN_PASSWORD=password123
        ```
5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *   This starts the Next.js app, typically on `http://localhost:9002`.

## 5. Key Features (Functional Requirements)

### 5.1. Public User Features
*   **Homepage:** Browse, filter, and search for clothing items.
*   **Item Detail Page:** View detailed information about a specific product.
*   **Shopping Bag:** Add/remove items and view the current cart.
*   **Checkout:** Enter shipping details and place an order.
*   **Order Tracking:** Check the status of a placed order using an Order ID.

### 5.2. Admin Features
*   **Secure Login:**
    *   Separate login page for administrators (`/admin/login`).
    *   **Super Admin:** Uses credentials from the `.env.local` file to access the Super Admin Dashboard.
    *   **Standard Admins:** Use credentials created by the Super Admin (these are stored in the database).
*   **Super Admin Dashboard (`/superAdmin`):**
    *   View store analytics (total revenue, orders, unique visitors).
    *   **Manage Admin Users:** Add or remove standard admin accounts.
    *   Access a view of all orders across the store.
*   **Standard Admin Dashboard (`/admin/dashboard`):**
    *   **Add New Item:** Form to add new clothing items to the store.
    *   **Manage Products:** View, edit, and delete products created by that specific admin.
    *   **View Orders:** View customer orders that contain items sold by that specific admin.

## 6. Data & Persistence

*   **Shared Data (MongoDB):** All persistent, shared data is stored in the MongoDB database. This includes:
    *   Products
    *   Orders
    *   Standard Admin User Accounts
    *   Site Analytics (visitor counts, purchase counts)
*   **Session Data (Browser `localStorage`):** Data specific to a single user's browsing session is stored locally in their browser. This includes:
    *   The contents of their shopping bag.
    *   Authentication status (to keep an admin logged in).
    *   A visitor session flag for analytics.

## 7. Future Considerations / Potential Enhancements

*   Full user authentication system for customers (e.g., Firebase Authentication).
*   Integration with a real payment gateway.
*   Deployment to a hosting platform like Vercel or Firebase Hosting.

