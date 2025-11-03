# Fastor Nodejs Assignment

## 1. Objective

The primary goal of this assignment is to design and implement a secure, RESTful API backend for a Customer Relationship Management (CRM) system focused on lead management.

The core purpose is to:

1. **Manage Counselor Accounts:** Allow employees/counselors to register and log in securely.
2. **Capture Leads:** Provide a public, unauthenticated endpoint for prospective clients to submit new enquiries.
3. **Implement Claim Logic:** Distinguish between **Public Enquiries** (visible to all counselors) and **Private Enquiries** (claimed and visible only to the assigned counselor).
4. **Enforce Security:** Secure internal endpoints using JSON Web Tokens (JWT) for authentication.

## 2. Technical Requirements

This section lists the essential software and libraries required to successfully complete the project.

| Requirement | Description | Suggested Library/Tool |
| --- | --- | --- |
| **Runtime Environment** | Executable environment for the JavaScript code. | Node.js (LTS version 18+) |
| **Package Manager** | Tool to manage project dependencies. | npm (Comes bundled with Node.js) |
| **Web Framework** | The core framework for building the REST API. | Express.js |
| **Database** | Persistent storage for data (Employees, Enquiries). | **SQLite** |
| **Database Connector (ORM/ODM)** | Tool to interact with the database using JavaScript objects. | **Sequelize** (for SQL databases like SQLite/PostgreSQL/MySQL) |
| **Authentication** | Securely handle user sessions and permissions. | `jsonwebtoken` |
| **Password Hashing** | Securely store user passwords. | `bcrypt` |
| **Utilities** | Environment variable management and boilerplate reduction. | `dotenv`, `nodemon` (for development) |

## 3. Step-by-Step Instructions

Follow these steps sequentially to build the required REST API.

### Step 1: Initial Project Setup

1. **Initialize Project:** Open your terminal in the project directory and create the core configuration file.
    
    ```
    npm init -y
    
    ```
    
2. **Install Core Dependencies:** Install the Express framework and development tools.
    
    ```
    npm install express dotenv
    npm install --save-dev nodemon
    
    ```
    
3. **Configure Scripts:** Open `package.json` and add a start script for development using `nodemon`.
    
    ```
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js"
    }
    
    ```
    
4. **Create `.env` file:** Create a file named `.env` to store environment-specific variables like the JWT secret key and database connection details.
    
    ```
    # Example .env content
    PORT=3000
    JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY
    DB_DIALECT=sqlite
    DB_STORAGE=./crm_db.sqlite
    
    ```
    

### Step 2: Database Setup and Initialization

1. **Install Database Connector:** We will use Sequelize for a database-agnostic approach.
    
    ```
    npm install sequelize sqlite3 # Use pg for PostgreSQL
    
    ```
    
2. **Configure Connection:** Create a `config/database.js` file. This file will use the variables from `.env` to establish a connection to your chosen database (e.g., SQLite).
3. **Test Connection:** Ensure your connection object initializes correctly before starting the server.

### Step 3: Define Data Models

Define the two primary entities of the system: `Employee` (Counselor) and `Enquiry` (Lead).

1. **Employee Model (`models/employee.js`):**
    - **Fields:** `id`, `email` (unique), `password` (hashed), `name`.
2. **Enquiry Model (`models/enquiry.js`):**
    - **Fields:** `id`, `name`, `email`, `courseInterest`, `claimed` (Boolean, default `false`), `counselorId` (Foreign Key, null if unclaimed).

### Step 4: Implement Employee Authentication (Login/Register)

1. **Register API (`POST /api/employees/register`):**
    - Hash the received password using `bcrypt` before saving the new `Employee` to the database.
2. **Login API (`POST /api/employees/login`):**
    - Find the employee by `email`.
    - Compare the received password with the stored hash using `bcrypt.compare()`.
    - If credentials are valid, generate a JWT token containing the employee's ID (`{ id: employee.id }`).
    - Return the JWT token in the response.

### Step 5: Implement JWT Authentication Middleware

Create a middleware function (`middlewares/auth.js`) that runs before every protected API route.

1. **Check Header:** Extract the token from the `Authorization` header (Format: `Bearer <token>`).
2. **Verify Token:** Use `jsonwebtoken.verify()` with your `JWT_SECRET` to decode the payload.
3. **Attach User:** If verification succeeds, attach the decoded user ID (e.g., `req.user = decoded.id`) to the request object and call `next()`.
4. **Handle Error:** If no token or an invalid token is found, return a `401 Unauthorized` response.

### Step 6: Implement Public Enquiry Form API

1. **Submission API (`POST /api/enquiries/public`):**
    - **Authentication:** Must be accessible **without** JWT.
    - **Logic:** Accept client details (Name, Email, Course Interest) and save them to the `Enquiry` table. Set `claimed` to `false` and `counselorId` to `null`.
    - **Response:** Return a `201 Created` status with a confirmation message.

### Step 7: Implement Protected Lead Management APIs

These APIs must use the JWT middleware created in Step 5.

1. **Fetch Unclaimed Leads (Public Enquiries):**
    - **API:** `GET /api/enquiries/public`
    - **Logic:** Query the `Enquiry` table where `claimed` is `false` or `counselorId` is `null`.
2. **Fetch Claimed Leads (Private Enquiries):**
    - **API:** `GET /api/enquiries/private`
    - **Logic:** Query the `Enquiry` table where `counselorId` matches the ID of the logged-in counselor (retrieved from `req.user`).
3. **Claim Lead API:**
    - **API:** `PATCH /api/enquiries/:id/claim`
    - **Logic:**
        - Find the enquiry by the provided `:id`.
        - **CRITICAL BUSINESS LOGIC:** Check if the enquiry is already claimed (`claimed === true`). If so, return a `409 Conflict` error.
        - If unclaimed, update the enquiry: set `claimed` to `true` and set `counselorId` to the ID of the logged-in counselor (`req.user`).
        - **Response:** Return the updated private enquiry data.

## 4. Project Structure

A well-organized structure makes the project easier to navigate, especially as it scales.

```
crm-backend/
├── node_modules/           (Installed libraries)
├── config/
│   └── database.js         (Database connection setup)
├── controllers/            (Houses the business logic for each route)
│   ├── employeeController.js
│   ├── enquiryController.js
├── middlewares/            (Reusable functions executed before routes)
│   └── auth.js             (JWT verification middleware)
├── models/                 (Defines the database schema and relationships)
│   ├── index.js            (Initialize all models and relationships)
│   ├── employee.js         (Employee Model definition)
│   └── enquiry.js          (Enquiry Model definition)
├── routes/                 (Defines the API endpoints)
│   ├── employeeRoutes.js   (Login, Register routes)
│   └── enquiryRoutes.js    (Public submit, Claim, Fetch public/private routes)
├── .env                    (Environment variables)
├── package.json
└── server.js               (Main entry point: sets up Express and loads routes)

```

## 5. Example Codes

These snippets illustrate the key concepts mentioned in the steps. They are not complete files but demonstrations of critical logic.

### A. Express Server Setup (server.js)

```
// server.js snippet - Main entry point
const express = require('express');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Load routes (Example: Employee routes)
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.send('CRM API is running.');
});

// Database initialization (assuming models/index.js handles connection)
// const db = require('./models');
// db.sequelize.sync().then(() => {
//     app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
// });

```

### B. JWT Generation (Controller Snippet)

This is how a token is created upon successful login using `jsonwebtoken`.

```
// employeeController.js snippet - inside the login function
const jwt = require('jsonwebtoken');

// ... successful password check logic ...
const employeeId = employee.id;

const token = jwt.sign(
    { id: employeeId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expires after 1 hour
);

return res.status(200).json({
    message: 'Login successful',
    token: token
});

```

### C. JWT Middleware (middlewares/auth.js)

This function ensures a valid token is present before proceeding to the route logic.

```
// middlewares/auth.js snippet
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check for 'Bearer <token>' in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user's ID to the request object
            req.user = decoded.id; // Counselor ID is now available as req.user

            next(); // Move to the next middleware or route handler

        } catch (error) {
            console.error('JWT Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = protect;

```

### D. Lead Claim Logic (Controller Snippet)

This shows the crucial logic for claiming a lead, ensuring it's not already claimed.

```
// enquiryController.js snippet - inside the claimLead function
// Assume Enquiry model is imported, and auth middleware ran to set req.user
const claimLead = async (req, res) => {
    const enquiryId = req.params.id;
    const counselorId = req.user; // ID from JWT payload

    try {
        const enquiry = await Enquiry.findByPk(enquiryId);

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        // --- CRITICAL BUSINESS LOGIC CHECK ---
        if (enquiry.claimed === true) {
            return res.status(409).json({ message: 'This lead has already been claimed.' });
        }
        // ------------------------------------

        // Update and save
        enquiry.claimed = true;
        enquiry.counselorId = counselorId;
        await enquiry.save();

        res.status(200).json({ message: 'Lead claimed successfully', enquiry });

    } catch (error) {
        // Handle database or server errors
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

```