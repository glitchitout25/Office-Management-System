# Database Seeding Guide

## Quick Start

### Option 1: Direct seeding (no confirmation)
```bash
npm run seed
```

### Option 2: Seeding with confirmation prompt
```bash
npm run seed:confirm
```

## What Gets Created

### Admin User
- **Email**: `admin@company.com`
- **Password**: `admin123`
- ⚠️ **Change this password after first login!**

### Sample Departments
1. **Human Resources** - $500,000 budget
2. **Information Technology** - $800,000 budget  
3. **Finance** - $300,000 budget
4. **Marketing** - $400,000 budget
5. **Operations** - $600,000 budget

### Sample Employees
1. **John Smith** - HR Manager (Human Resources)
2. **Sarah Johnson** - Senior Software Engineer (IT)
3. **Michael Brown** - Financial Analyst (Finance)
4. **Emily Davis** - Marketing Specialist (Marketing)
5. **David Wilson** - Operations Manager (Operations)
6. **Lisa Anderson** - Software Developer (IT)
7. **Robert Taylor** - Accountant (Finance)
8. **Jennifer Martinez** - Marketing Coordinator (Marketing)

## Prerequisites

1. Make sure MongoDB is running
2. Ensure your `.env` file has the correct `MONGO_URI`
3. Install dependencies: `npm install`

## After Seeding

1. Start your application: `npm start` or `npm run dev`
2. Navigate to the login page
3. Use the admin credentials to log in
4. **Change the admin password immediately**
5. Explore the populated data in your application

## Troubleshooting

- **Connection issues**: Check your MongoDB connection string
- **Permission errors**: Ensure database user has write access
- **Data not appearing**: Check browser console and server logs
- **Login issues**: Verify admin credentials are correct

## Customization

Edit `scripts/seed.js` to modify:
- Department names and budgets
- Employee information
- Admin credentials
- Relationships between employees and departments
