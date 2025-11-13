# CRM for Sales Management

A full-stack CRM (Customer Relationship Management) application for managing leads, contacts, and deals with comprehensive reporting and activity tracking.

## Overview

This CRM system helps businesses manage their sales pipeline effectively by tracking leads, contacts, and deals through various stages. It includes features like user authentication, role-based access control, activity logging, reporting with charts, and mock email/SMS notifications.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with secure login/registration
- **Leads Management**: Create, read, update, and delete leads with status tracking
- **Contacts Management**: Manage customer contacts with detailed information
- **Deals Management**: Track deals through stages (New, In Progress, Won, Lost)
- **Dashboard**: Overview with statistics and recent activities
- **Reports**: Comprehensive reporting with charts for deals analysis
- **Activity Logs**: Track all user actions (who changed what)

### Additional Features
- **Search & Filter**: Search and filter across all modules
- **User Roles**: Admin, Agent, and User roles with role-based access
- **Charts & Visualizations**: Interactive charts using Recharts library
- **Mock Notifications**: Email and SMS notifications (console-based mock)
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Validation**: express-validator
- **Security**: CORS enabled

### Frontend
- **Framework**: React.js 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Toastify

## Project Structure

```
Proxima/
├── backend/
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── utils/              # Utility functions
│   ├── .env                # Environment variables
│   ├── server.js           # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
│
└── README.md
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone or Download the Project

If you received this as a ZIP file, extract it. Otherwise, clone from GitHub:

```bash
git clone <repository-url>
cd Proxima
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file (already created, but verify the settings):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-sales
JWT_SECRET=crm_sales_secret_key_2024_proxima_change_this
JWT_EXPIRE=7d
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## Running the Application

You need to run both backend and frontend servers.

### Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# MongoDB should start automatically if installed as a service
# Or manually start it:
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongodb
# Or
mongod
```

### Start Backend Server

Open a terminal in the `backend` directory:

```bash
cd backend
npm start
```

The backend server will start on **http://localhost:5000**

You should see:
```
Server is running on port 5000
MongoDB Connected Successfully
API available at http://localhost:5000/api
```

### Start Frontend Server

Open another terminal in the `frontend` directory:

```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:3000** and should automatically open in your browser.

## First Time Usage

### 1. Register an Admin Account

1. Navigate to **http://localhost:3000**
2. Click on "Don't have an account? Register"
3. Fill in the registration form:
   - Name: Your Name
   - Email: admin@example.com
   - Password: password123 (min 6 characters)
   - Role: Select **Admin**
4. Click "Register"

### 2. Explore the Application

After logging in, you'll see the dashboard. You can:

1. **Create Contacts** first (required for deals)
2. **Create Leads** to track potential customers
3. **Create Deals** and link them to contacts
4. **View Reports** to see charts and statistics
5. **Check Activity Logs** to see all actions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)

### Leads
- `GET /api/leads` - Get all leads (with search & filters)
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Deals
- `GET /api/deals` - Get all deals
- `GET /api/deals/:id` - Get single deal
- `POST /api/deals` - Create deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/deals` - Get deals report

### Activity Logs
- `GET /api/activity-logs` - Get all activity logs
- `GET /api/activity-logs/record/:module/:recordId` - Get logs for specific record
- `GET /api/activity-logs/user/:userId` - Get logs for specific user

## Features Walkthrough

### Dashboard
- View total counts of leads, contacts, and deals
- See total revenue from won deals
- Interactive charts showing deals by stage and leads by status
- Recent leads and deals list

### Leads Management
- Create new leads with contact information
- Assign leads to users
- Track lead status (New, Contacted, Qualified, Unqualified, Converted)
- Search and filter by status and source
- Full CRUD operations

### Contacts Management
- Create detailed contact profiles
- Include address information
- Categorize contacts by type (Customer, Partner, Vendor, Other)
- Assign to users for management

### Deals Management
- Create deals linked to contacts
- Track through stages (New, In Progress, Won, Lost)
- Set deal amount and expected close date
- Automatic probability calculation based on stage
- Record lost reasons for analysis
- Mock notifications on stage changes

### Reports
- Filter reports by date range
- View total revenue and win rate
- Deals breakdown by stage
- Performance metrics by user
- Lists of won and lost deals

### Activity Logs
- Complete audit trail of all actions
- Filter by module (Lead, Contact, Deal, User, Auth)
- Filter by action type (CREATE, UPDATE, DELETE, LOGIN)
- See who made changes and when
- IP address tracking

### Mock Notifications
- Email notifications logged to console
- SMS notifications logged to console
- Triggered on:
  - New lead/contact/deal creation
  - Record updates
  - Deal stage changes

## User Roles

### Admin
- Full access to all features
- Can view all users
- Can manage all leads, contacts, and deals
- Access to all reports and logs

### Agent
- Can create and manage assigned items
- Access to basic reporting
- Limited administrative functions

### User
- Basic access
- Can view and manage own assigned items
- Limited access to features

## Development

### Backend Development Mode

For development with auto-restart on changes:

```bash
cd backend
npm install -g nodemon
npm run dev
```

### Frontend Development

The frontend runs in development mode by default with hot reload:

```bash
cd frontend
npm start
```

## Building for Production

### Backend
The backend runs directly with Node.js. For production:

```bash
cd backend
NODE_ENV=production npm start
```

### Frontend
To create an optimized production build:

```bash
cd frontend
npm run build
```

The build folder will contain the production-ready files.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in backend `.env` file
- Verify MongoDB is listening on port 27017

### Port Already in Use
- Backend (5000): Change PORT in `.env` file
- Frontend (3000): React will prompt to use a different port

### CORS Errors
- Backend CORS is enabled for all origins in development
- For production, update CORS settings in `server.js`

### Dependencies Installation Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## Mock Notifications

Email and SMS notifications are implemented as console logs for demonstration:

**Example Email Notification:**
```
=== EMAIL NOTIFICATION ===
To: user@example.com
Subject: Deal Won - Congratulations!
Message: Great news! Your deal "New Deal" has been marked as Won.
========================
```

**Example SMS Notification:**
```
=== SMS NOTIFICATION ===
To: +1234567890
Message: Congratulations! Your deal "New Deal" has been won!
========================
```

Check the browser console (F12 → Console tab) to see these notifications.

## Key Features Implementation

### JWT Authentication
- Secure token-based authentication
- Tokens stored in localStorage
- Automatic token validation on protected routes
- Role-based access control

### Activity Logging
- All CRUD operations are logged
- Includes user info, timestamp, IP address
- Stores before/after values for updates
- Queryable by module, action, user

### Search & Filter
- Real-time search across modules
- Multiple filter options
- Optimized MongoDB queries with indexes

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Collapsible sidebar on mobile

## Demo Credentials

You can create test accounts with different roles:

**Admin Account:**
- Email: admin@test.com
- Password: admin123
- Role: Admin

**Agent Account:**
- Email: agent@test.com
- Password: agent123
- Role: Agent

## Future Enhancements

Potential improvements for production:
- Real email/SMS integration (SendGrid, Twilio)
- File upload for attachments
- Advanced filtering with date ranges
- Export data to CSV/Excel
- Email templates customization
- Calendar integration for meetings
- Pipeline visualization
- Advanced analytics and forecasting

## Support

For issues or questions:
- Check the console for error messages
- Verify all services are running
- Review the API endpoints documentation
- Ensure MongoDB is accessible

## License

This project is created for educational/recruitment purposes.

## Credits

Developed for Proxima Skills Training & Consulting Services Pvt. Ltd.

---

**Note**: This is a demonstration project running on localhost. For production deployment, additional security measures, environment configuration, and hosting setup would be required.
