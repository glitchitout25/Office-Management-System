const Employee = require('../models/Employee');
const Department = require('../models/Department');

const employeeController = {
  // GET /employees - List employees with pagination, search, and filtering
  getAllEmployees: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build query object
      let query = { isActive: true };
      
      // Search by name or email
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ];
      }
      
      // Filter by department
      if (req.query.department && req.query.department !== '') {
        query.department = req.query.department;
      }
      
      // Filter by job title
      if (req.query.jobTitle && req.query.jobTitle !== '') {
        query.jobTitle = new RegExp(req.query.jobTitle, 'i');
      }

      // Execute queries
      const [employees, totalEmployees, departments] = await Promise.all([
        Employee.find(query)
          .populate('department', 'name')
          .populate('supervisor', 'firstName lastName')
          .sort({ firstName: 1, lastName: 1 })
          .skip(skip)
          .limit(limit),
        Employee.countDocuments(query),
        Department.find({ isActive: true }).sort({ name: 1 })
      ]);

      const totalPages = Math.ceil(totalEmployees / limit);
      
      const pagination = {
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        totalEmployees
      };

      if (req.baseUrl === '/api/employees') {
        return res.json({
          success: true,
          data: employees,
          pagination
        });
      }

      res.render('employees/index', {
        title: 'Employees',
        employees,
        departments,
        pagination,
        filters: {
          search: req.query.search || '',
          department: req.query.department || '',
          jobTitle: req.query.jobTitle || ''
        }
      });
    } catch (error) {
      console.error(error);
      if (req.baseUrl === '/api/employees') {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch employees'
        });
      }
      req.flash('error_msg', 'Failed to fetch employees');
      res.redirect('/');
    }
  },

  // GET /employees/new - Show create employee form
  showCreateForm: async (req, res) => {
    try {
      const [departments, employees] = await Promise.all([
        Department.find({ isActive: true }).sort({ name: 1 }),
        Employee.find({ isActive: true }).sort({ firstName: 1, lastName: 1 })
      ]);

      res.render('employees/create', {
        title: 'Add New Employee',
        departments,
        employees
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Failed to load form data');
      res.redirect('/employees');
    }
  },

  // POST /employees - Create new employee
  createEmployee: async (req, res) => {
    try {
      const {
        firstName, lastName, email, phone, jobTitle,
        department, supervisor, salary, hireDate,
        country, state, city, address
      } = req.body;

      const employee = new Employee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        jobTitle: jobTitle.trim(),
        department,
        supervisor: supervisor || null,
        salary: parseFloat(salary),
        hireDate: new Date(hireDate),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address?.trim()
      });

      await employee.save();

      if (req.baseUrl === '/api/employees') {
        return res.status(201).json({
          success: true,
          data: employee
        });
      }

      req.flash('success_msg', 'Employee created successfully');
      res.redirect('/employees');
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/employees') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      req.flash('error_msg', error.message);
      res.redirect('/employees/new');
    }
  },

  // GET /employees/:id - Show single employee
  getEmployee: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate('department', 'name description')
        .populate('supervisor', 'firstName lastName email jobTitle')
        .populate('subordinates');

      if (!employee) {
        if (req.baseUrl === '/api/employees') {
          return res.status(404).json({
            success: false,
            error: 'Employee not found'
          });
        }
        req.flash('error_msg', 'Employee not found');
        return res.redirect('/employees');
      }

      if (req.baseUrl === '/api/employees') {
        return res.json({
          success: true,
          data: employee
        });
      }

      res.render('employees/show', {
        title: employee.fullName,
        employee
      });
    } catch (error) {
      console.error(error);
      if (req.baseUrl === '/api/employees') {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch employee'
        });
      }
      req.flash('error_msg', 'Failed to fetch employee');
      res.redirect('/employees');
    }
  },

  // GET /employees/:id/edit - Show edit employee form
  showEditForm: async (req, res) => {
    try {
      const [employee, departments, employees] = await Promise.all([
        Employee.findById(req.params.id),
        Department.find({ isActive: true }).sort({ name: 1 }),
        Employee.find({ 
          isActive: true, 
          _id: { $ne: req.params.id } // Exclude current employee from supervisor options
        }).sort({ firstName: 1, lastName: 1 })
      ]);
      
      if (!employee) {
        req.flash('error_msg', 'Employee not found');
        return res.redirect('/employees');
      }

      res.render('employees/edit', {
        title: 'Edit Employee',
        employee,
        departments,
        employees
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Failed to fetch employee');
      res.redirect('/employees');
    }
  },

  // PUT/PATCH /employees/:id - Update employee
  updateEmployee: async (req, res) => {
    try {
      const {
        firstName, lastName, email, phone, jobTitle,
        department, supervisor, salary, hireDate,
        country, state, city, address
      } = req.body;

      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        jobTitle: jobTitle.trim(),
        department,
        supervisor: supervisor || null,
        salary: parseFloat(salary),
        hireDate: new Date(hireDate),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address?.trim()
      };

      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!employee) {
        if (req.baseUrl === '/api/employees') {
          return res.status(404).json({
            success: false,
            error: 'Employee not found'
          });
        }
        req.flash('error_msg', 'Employee not found');
        return res.redirect('/employees');
      }

      if (req.baseUrl === '/api/employees') {
        return res.json({
          success: true,
          data: employee
        });
      }

      req.flash('success_msg', 'Employee updated successfully');
      res.redirect(`/employees/${employee._id}`);
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/employees') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      req.flash('error_msg', error.message);
      res.redirect(`/employees/${req.params.id}/edit`);
    }
  },

  // DELETE /employees/:id - Delete employee
  deleteEmployee: async (req, res) => {
    try {
      // Check if employee is a supervisor
      const subordinatesCount = await Employee.countDocuments({ 
        supervisor: req.params.id, 
        isActive: true 
      });

      if (subordinatesCount > 0) {
        if (req.baseUrl === '/api/employees') {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete employee who is supervising other employees'
          });
        }
        req.flash('error_msg', 'Cannot delete employee who is supervising other employees');
        return res.redirect('/employees');
      }

      // Soft delete - mark as inactive
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!employee) {
        if (req.baseUrl === '/api/employees') {
          return res.status(404).json({
            success: false,
            error: 'Employee not found'
          });
        }
        req.flash('error_msg', 'Employee not found');
        return res.redirect('/employees');
      }

      if (req.baseUrl === '/api/employees') {
        return res.json({
          success: true,
          message: 'Employee deleted successfully'
        });
      }

      req.flash('success_msg', 'Employee deleted successfully');
      res.redirect('/employees');
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/employees') {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete employee'
        });
      }

      req.flash('error_msg', 'Failed to delete employee');
      res.redirect('/employees');
    }
  }
};

module.exports = employeeController;