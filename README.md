# Office Management System

A comprehensive RESTful Office Management System built with Node.js, Express, and MongoDB for managing departments and employees with advanced features like pagination, search, filtering, and dynamic location data integration.

## 🚀 Features

### Core Functionality
- **Department Management**: Full CRUD operations for departments with budget tracking
- **Employee Management**: Complete employee lifecycle management with hierarchical relationships
- **Self-Referencing Relationships**: Employees can have supervisors (other employees)
- **Department-Employee Relationships**: Each employee belongs to a department

### Advanced Features
- **Server-side Pagination**: Efficient handling of large datasets
- **Search & Filtering**: Search employees by name/email, filter by department or job title
- **External API Integration**: Dynamic country, state, and city selection using CountriesNow API
- **Responsive Design**: Mobile-first design built with Tailwind CSS
- **Form Validation**: Client-side and server-side validation with real-time feedback
- **Flash Messages**: User-friendly success/error notifications

### Technical Features
- **RESTful API**: Well-structured API endpoints for external consumption
- **MVC Architecture**: Clean separation of concerns
- **Soft Deletes**: Data integrity with soft delete functionality
- **Data Validation**: Comprehensive validation using Mongoose schemas
- **Error Handling**: Robust error handling and user feedback

## 📋 Table of Contents

- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features Overview](#features-overview)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher)
- **npm** (v6.0 or higher)
- **MongoDB** (v4.0 or higher)
- **Git** (for version control)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd office-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` file with your configuration (see [Environment Configuration](#environment-configuration))

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # For Windows (if MongoDB is installed as a service)
   net start MongoDB
   
   # For macOS with Homebrew
   brew services start mongodb-community
   
   # For Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/office-management

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# External API Configuration
COUNTRIES_API_URL=https://countriesnow.space/api/v0.1
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/office-management` | ✅ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `SESSION_SECRET` | Session encryption key | - | ✅ |
| `COUNTRIES_API_URL` | External location API URL | `https://countriesnow.space/api/v0.1` | ❌ |

## 🗄️ Database Setup

The application uses MongoDB with Mongoose ODM. The database schema will be automatically created when you run the application for the first time.

### Database Schema

#### Departments Collection
```javascript
{
  name: String (required, unique),
  description: String,
  budget: Number,
  headOfDepartment: ObjectId (Employee),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Employees Collection
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String,
  jobTitle: String (required),
  department: ObjectId (Department, required),
  supervisor: ObjectId (Employee, self-reference),
  salary: Number (required),
  hireDate: Date (required),
  country: String (required),
  state: String (required),
  city: String (required),
  address: String,
  isActive: Boolean,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Seeding Sample Data (Optional)

To populate your database with sample data for testing:

```bash
node scripts/seed.js
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This runs the application with `nodemon` for automatic restarts on file changes.

### Production Mode
```bash
npm start
```
This runs the application in production mode.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node app.js` | Start the application in production mode |
| `dev` | `nodemon app.js` | Start the application in development mode |
| `test` | `echo "Error: no test specified"` | Placeholder for tests |

## 📚 API Documentation

The application provides both web interface and RESTful API endpoints.

### Base URLs
- **Web Interface**: `http://localhost:3000`
- **API Endpoints**: `http://localhost:3000/api`

### Department Endpoints

#### Get All Departments
```http
GET /api/departments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "departmentId",
      "name": "Engineering",
      "description": "Software development team",
      "budget": 100000,
      "headOfDepartment": {
        "_id": "employeeId",
        "firstName": "John",
        "lastName": "Doe"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Department
```http
POST /api/departments
Content-Type: application/json

{
  "name": "New Department",
  "description": "Department description",
  "budget": 50000
}
```

#### Get Single Department
```http
GET /api/departments/:id
```

#### Update Department
```http
PUT /api/departments/:id
Content-Type: application/json

{
  "name": "Updated Department Name",
  "budget": 75000
}
```

#### Delete Department
```http
DELETE /api/departments/:id
```

### Employee Endpoints

#### Get All Employees (with pagination, search, and filtering)
```http
GET /api/employees?page=1&limit=10&search=john&department=departmentId&jobTitle=developer
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or email
- `department`: Filter by department ID
- `jobTitle`: Filter by job title

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "employeeId",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "jobTitle": "Software Developer",
      "department": {
        "_id": "departmentId",
        "name": "Engineering"
      },
      "supervisor": {
        "_id": "supervisorId",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "salary": 75000,
      "hireDate": "2024-01-01T00:00:00.000Z",
      "country": "United States",
      "state": "California",
      "city": "San Francisco",
      "address": "123 Main St",
      "isActive": true,
      "fullName": "John Doe"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null,
    "totalEmployees": 50
  }
}
```

#### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "jobTitle": "Software Developer",
  "department": "departmentId",
  "supervisor": "supervisorId",
  "salary": 75000,
  "hireDate": "2024-01-01",
  "country": "United States",
  "state": "California",
  "city": "San Francisco",
  "address": "123 Main St"
}
```

#### Get Single Employee
```http
GET /api/employees/:id
```

#### Update Employee
```http
PUT /api/employees/:id
Content-Type: application/json
```

#### Delete Employee
```http
DELETE /api/employees/:id
```

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## 📁 Project Structure

```
office-management-system/
├── config/
│   └── database.js              # Database connection configuration
├── controllers/
│   ├── departmentController.js  # Department CRUD operations
│   └── employeeController.js    # Employee CRUD operations
├── models/
│   ├── Department.js           # Department Mongoose schema
│   └── Employee.js             # Employee Mongoose schema
├── routes/
│   ├── departments.js          # Department routes
│   └── employees.js            # Employee routes
├── views/
│   ├── partials/
│   │   ├── sidebar.ejs         # Navigation sidebar
│   │   ├── header.ejs          # Page header
│   │   ├── footer.ejs          # Page footer
│   │   └── flash-messages.ejs  # Flash message notifications
│   ├── departments/
│   │   ├── index.ejs           # Department list view
│   │   ├── create.ejs          # Create department form
│   │   ├── edit.ejs            # Edit department form
│   │   └── show.ejs            # Department detail view
│   ├── employees/
│   │   ├── index.ejs           # Employee list view (with pagination)
│   │   ├── create.ejs          # Create employee form
│   │   ├── edit.ejs            # Edit employee form
│   │   └── show.ejs            # Employee detail view
│   ├── layout.ejs              # Base layout template
│   ├── index.ejs               # Dashboard homepage
│   └── error.ejs               # Error page template
├── public/
│   ├── css/                    # Custom stylesheets
│   ├── js/
│   │   ├── main.js             # Main JavaScript functionality
│   │   └── location-api.js     # Location API integration
│   └── images/                 # Static images
├── .env                        # Environment configuration
├── .gitignore                  # Git ignore rules
├── app.js                      # Main application file
├── package.json                # Node.js dependencies and scripts
└── README.md                   # Project documentation
```

## 🌟 Features Overview

### Dashboard
- **Statistics Cards**: Total employees, departments, new hires, active projects
- **Quick Actions**: Direct links to add employees/departments
- **Recent Activity**: Timeline of recent system changes
- **Department Overview**: Quick department summary with employee counts

### Department Management
- ✅ Create, read, update, delete departments
- ✅ Set department head from existing employees
- ✅ Budget tracking and management
- ✅ Soft delete with data integrity checks
- ✅ Employee count and listing per department

### Employee Management
- ✅ Comprehensive employee profiles with all personal and professional details
- ✅ Hierarchical relationships (supervisor-subordinate)
- ✅ Department assignment with validation
- ✅ Dynamic location selection (Country → State → City)
- ✅ Salary management and hire date tracking
- ✅ Advanced search and filtering capabilities
- ✅ Server-side pagination for performance

### Search & Filtering
- **Search**: Real-time search by employee name or email
- **Department Filter**: Filter employees by department
- **Job Title Filter**: Filter employees by job title
- **Pagination**: Server-side pagination with configurable page sizes
- **URL State Management**: Search and filter states persist in URL

### External API Integration
- **CountriesNow API**: Dynamic loading of countries, states, and cities
- **Cascading Dropdowns**: Country selection loads states, state selection loads cities
- **Error Handling**: Graceful degradation when API is unavailable
- **Loading States**: Visual feedback during API calls

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with responsive navigation
- **Tailwind CSS**: Modern utility-first CSS framework
- **Interactive Components**: Hover effects, transitions, and animations
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📱 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Main dashboard with statistics, quick actions, and recent activity*

### Employee List
![Employee List](screenshots/employee-list.png)
*Employee listing with search, filters, and pagination*

### Employee Form
![Employee Form](screenshots/employee-form.png)
*Employee creation/editing form with dynamic location selection*

### Department Management
![Department Management](screenshots/department-management.png)
*Department listing and management interface*

## 🧪 Testing

### Manual Testing
1. **Department CRUD**: Test creating, viewing, editing, and deleting departments
2. **Employee CRUD**: Test employee management with all form fields
3. **Relationships**: Test supervisor-employee relationships
4. **Search & Filtering**: Test all search and filtering combinations
5. **API Integration**: Test location dropdown functionality
6. **Responsive Design**: Test on different screen sizes

### API Testing with Postman
Import the provided Postman collection (`postman/Office-Management-API.postman_collection.json`) to test all API endpoints.

### Testing Checklist
- [ ] Create department successfully
- [ ] Create employee with valid data
- [ ] Test supervisor assignment
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test location API integration
- [ ] Test form validations
- [ ] Test responsive design
- [ ] Test API endpoints
- [ ] Test error handling

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Implement your feature or bug fix
4. **Test thoroughly**: Ensure all functionality works as expected
5. **Commit your changes**: `git commit -am 'Add some feature'`
6. **Push to the branch**: `git push origin feature/your-feature-name`
7. **Submit a pull request**: Describe your changes in detail

### Development Guidelines
- Follow the existing code style and structure
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly
- Follow RESTful API conventions

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the documentation** above for common setup and usage questions
2. **Search existing issues** in the GitHub repository
3. **Create a new issue** with detailed information about your problem
4. **Include your environment details**: Node.js version, MongoDB version, operating system

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control
- [ ] Employee performance tracking
- [ ] Department budget analytics
- [ ] Email notifications
- [ ] File upload for employee profiles
- [ ] Advanced reporting and analytics
- [ ] Bulk employee operations
- [ ] Integration with HR systems
- [ ] Mobile app development

---

**Happy Managing! 🎉**

For more information, visit the [GitHub repository](https://github.com/yourusername/office-management-system).