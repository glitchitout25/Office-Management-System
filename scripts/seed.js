const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// Import models
const Admin = require('../models/Admin');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// Sample departments data
const departmentsData = [
  {
    name: 'Human Resources',
    description: 'Manages employee relations, recruitment, and company policies',
    budget: 500000,
    isActive: true
  },
  {
    name: 'Information Technology',
    description: 'Handles all technical infrastructure and software development',
    budget: 800000,
    isActive: true
  },
  {
    name: 'Finance',
    description: 'Manages company finances, accounting, and financial planning',
    budget: 300000,
    isActive: true
  },
  {
    name: 'Marketing',
    description: 'Responsible for brand promotion and customer acquisition',
    budget: 400000,
    isActive: true
  },
  {
    name: 'Operations',
    description: 'Oversees daily business operations and process optimization',
    budget: 600000,
    isActive: true
  }
];

// Sample employees data
const employeesData = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0101',
    jobTitle: 'HR Manager',
    salary: 75000,
    hireDate: new Date('2020-01-15'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '123 Main St, San Francisco, CA 94102',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0102',
    jobTitle: 'Senior Software Engineer',
    salary: 95000,
    hireDate: new Date('2019-06-01'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '456 Tech Ave, San Francisco, CA 94105',
    isActive: true
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@company.com',
    phone: '+1-555-0103',
    jobTitle: 'Financial Analyst',
    salary: 65000,
    hireDate: new Date('2021-03-10'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '789 Finance Blvd, San Francisco, CA 94108',
    isActive: true
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    phone: '+1-555-0104',
    jobTitle: 'Marketing Specialist',
    salary: 55000,
    hireDate: new Date('2022-01-20'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '321 Marketing St, San Francisco, CA 94103',
    isActive: true
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    phone: '+1-555-0105',
    jobTitle: 'Operations Manager',
    salary: 80000,
    hireDate: new Date('2018-09-15'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '654 Operations Way, San Francisco, CA 94107',
    isActive: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+1-555-0106',
    jobTitle: 'Software Developer',
    salary: 70000,
    hireDate: new Date('2021-08-01'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '987 Code Lane, San Francisco, CA 94104',
    isActive: true
  },
  {
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@company.com',
    phone: '+1-555-0107',
    jobTitle: 'Accountant',
    salary: 60000,
    hireDate: new Date('2020-11-30'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '147 Accounting Ave, San Francisco, CA 94109',
    isActive: true
  },
  {
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@company.com',
    phone: '+1-555-0108',
    jobTitle: 'Marketing Coordinator',
    salary: 45000,
    hireDate: new Date('2023-02-14'),
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '258 Brand Blvd, San Francisco, CA 94106',
    isActive: true
  }
];

// Admin user data
const adminData = {
  email: 'admin@company.com',
  password: 'admin123' // This will be hashed by the model's pre-save middleware
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create departments
    console.log('🏢 Creating departments...');
    const departments = await Department.insertMany(departmentsData);
    console.log(`✅ Created ${departments.length} departments`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = new Admin(adminData);
    await admin.save();
    console.log('✅ Admin user created');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);

    // Create employees with department assignments
    console.log('👥 Creating employees...');
    const employees = [];
    
    // Assign employees to departments
    const departmentAssignments = [
      { employeeIndex: 0, departmentName: 'Human Resources' }, // John Smith - HR Manager
      { employeeIndex: 1, departmentName: 'Information Technology' }, // Sarah Johnson - Senior Software Engineer
      { employeeIndex: 2, departmentName: 'Finance' }, // Michael Brown - Financial Analyst
      { employeeIndex: 3, departmentName: 'Marketing' }, // Emily Davis - Marketing Specialist
      { employeeIndex: 4, departmentName: 'Operations' }, // David Wilson - Operations Manager
      { employeeIndex: 5, departmentName: 'Information Technology' }, // Lisa Anderson - Software Developer
      { employeeIndex: 6, departmentName: 'Finance' }, // Robert Taylor - Accountant
      { employeeIndex: 7, departmentName: 'Marketing' } // Jennifer Martinez - Marketing Coordinator
    ];

    for (const assignment of departmentAssignments) {
      const employeeData = employeesData[assignment.employeeIndex];
      const department = departments.find(dept => dept.name === assignment.departmentName);
      
      if (department) {
        employeeData.department = department._id;
        const employee = new Employee(employeeData);
        await employee.save();
        employees.push(employee);
      }
    }

    console.log(`✅ Created ${employees.length} employees`);

    // Set department heads
    console.log('👑 Setting department heads...');
    const departmentHeads = [
      { departmentName: 'Human Resources', employeeEmail: 'john.smith@company.com' },
      { departmentName: 'Information Technology', employeeEmail: 'sarah.johnson@company.com' },
      { departmentName: 'Finance', employeeEmail: 'michael.brown@company.com' },
      { departmentName: 'Marketing', employeeEmail: 'emily.davis@company.com' },
      { departmentName: 'Operations', employeeEmail: 'david.wilson@company.com' }
    ];

    for (const head of departmentHeads) {
      const department = departments.find(dept => dept.name === head.departmentName);
      const employee = employees.find(emp => emp.email === head.employeeEmail);
      
      if (department && employee) {
        department.headOfDepartment = employee._id;
        await department.save();
      }
    }

    console.log('✅ Department heads assigned');

    // Set supervisor relationships
    console.log('🔗 Setting supervisor relationships...');
    const supervisorRelations = [
      { supervisorEmail: 'sarah.johnson@company.com', subordinateEmail: 'lisa.anderson@company.com' },
      { supervisorEmail: 'michael.brown@company.com', subordinateEmail: 'robert.taylor@company.com' },
      { supervisorEmail: 'emily.davis@company.com', subordinateEmail: 'jennifer.martinez@company.com' }
    ];

    for (const relation of supervisorRelations) {
      const supervisor = employees.find(emp => emp.email === relation.supervisorEmail);
      const subordinate = employees.find(emp => emp.email === relation.subordinateEmail);
      
      if (supervisor && subordinate) {
        subordinate.supervisor = supervisor._id;
        await subordinate.save();
      }
    }

    console.log('✅ Supervisor relationships set');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${departments.length} departments created`);
    console.log(`   - ${employees.length} employees created`);
    console.log(`   - 1 admin user created`);
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
