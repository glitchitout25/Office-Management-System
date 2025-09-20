# Database Seeding Script

This directory contains scripts for populating the MongoDB database with initial data.

## Seed Script (`seed.js`)

The seed script populates the database with:
- 1 admin user with login credentials
- 5 sample departments
- 8 sample employees with realistic data
- Department head assignments
- Supervisor-subordinate relationships

### Admin Login Credentials

After running the seed script, you can log in with:
- **Email**: `admin@company.com`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login for security!

### Usage

#### Option 1: Using npm script (Recommended)
```bash
npm run seed
```

#### Option 2: Direct execution
```bash
node scripts/seed.js
```

### What the Script Does

1. **Connects to MongoDB** using the configuration from `config/config.js`
2. **Clears existing data** (optional - can be commented out)
3. **Creates departments** with budgets and descriptions
4. **Creates admin user** with hashed password
5. **Creates employees** with realistic data including:
   - Personal information (name, email, phone)
   - Job details (title, salary, hire date)
   - Location data (country, state, city, address)
6. **Assigns employees to departments**
7. **Sets department heads**
8. **Creates supervisor relationships**

### Sample Data Created

#### Departments
- Human Resources (Budget: $500,000)
- Information Technology (Budget: $800,000)
- Finance (Budget: $300,000)
- Marketing (Budget: $400,000)
- Operations (Budget: $600,000)

#### Employees
- John Smith (HR Manager)
- Sarah Johnson (Senior Software Engineer)
- Michael Brown (Financial Analyst)
- Emily Davis (Marketing Specialist)
- David Wilson (Operations Manager)
- Lisa Anderson (Software Developer)
- Robert Taylor (Accountant)
- Jennifer Martinez (Marketing Coordinator)

### Customization

To modify the seed data:

1. **Edit department data**: Modify the `departmentsData` array in `scripts/seed.js`
2. **Edit employee data**: Modify the `employeesData` array in `scripts/seed.js`
3. **Change admin credentials**: Modify the `adminData` object in `scripts/seed.js`
4. **Adjust relationships**: Modify the `departmentAssignments`, `departmentHeads`, and `supervisorRelations` arrays

### Safety Features

- The script includes error handling and will rollback on failures
- Database connection is properly closed after execution
- Clear logging shows progress and any issues
- Existing data can be preserved by commenting out the clear operations

### Troubleshooting

If the script fails:

1. **Check MongoDB connection**: Ensure your `MONGO_URI` in `config/config.js` is correct
2. **Verify dependencies**: Make sure all required packages are installed (`npm install`)
3. **Check permissions**: Ensure the database user has write permissions
4. **Review logs**: The script provides detailed error messages

### Production Considerations

For production environments:

1. **Change default admin password** immediately
2. **Review and customize sample data** to match your organization
3. **Consider data privacy** - remove or modify personal information
4. **Test thoroughly** in a staging environment first
5. **Backup existing data** before running in production
