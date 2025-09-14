const Department = require('../models/Department');
const Employee = require('../models/Employee');

const departmentController = {
  // GET /departments - List all departments
  getAllDepartments: async (req, res) => {
    try {
      const departments = await Department.find({ isActive: true })
        .populate('headOfDepartment', 'firstName lastName')
        .populate('employeeCount')
        .sort({ name: 1 });

      if (req.baseUrl === '/api/departments') {
        return res.json({
          success: true,
          data: departments
        });
      }

      res.render('departments/index', {
        title: 'Departments',
        departments
      });
    } catch (error) {
      console.error(error);
      if (req.baseUrl === '/api/departments') {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch departments'
        });
      }
      req.flash('error_msg', 'Failed to fetch departments');
      res.redirect('/');
    }
  },

  // GET /departments/new - Show create department form
  showCreateForm: async (req, res) => {
    try {
      // Get all employees to populate the "Head of Department" dropdown
      const employees = await Employee.find({ isActive: true })
        .sort({ firstName: 1, lastName: 1 });

      res.render('departments/create', {
        title: 'Create Department',
        employees
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Failed to load form data');
      res.redirect('/departments');
    }
  },

  // POST /departments - Create new department
  createDepartment: async (req, res) => {
    try {
      const { name, description, budget, headOfDepartment } = req.body;
      
      const departmentData = {
        name: name.trim(),
        description: description?.trim(),
        budget: budget || 0
      };

      // Add head of department if provided
      if (headOfDepartment && headOfDepartment !== '') {
        departmentData.headOfDepartment = headOfDepartment;
      }
      
      const department = new Department(departmentData);

      await department.save();

      if (req.baseUrl === '/api/departments') {
        return res.status(201).json({
          success: true,
          data: department
        });
      }

      req.flash('success_msg', 'Department created successfully');
      res.redirect('/departments');
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/departments') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      req.flash('error_msg', error.message);
      res.redirect('/departments/new');
    }
  },

  // GET /departments/:id - Show single department
  getDepartment: async (req, res) => {
    try {
      const department = await Department.findById(req.params.id)
        .populate('headOfDepartment', 'firstName lastName email jobTitle')
        .populate('employees');

      if (!department) {
        if (req.baseUrl === '/api/departments') {
          return res.status(404).json({
            success: false,
            error: 'Department not found'
          });
        }
        req.flash('error_msg', 'Department not found');
        return res.redirect('/departments');
      }

      // Get employees in this department
      const employees = await Employee.find({ 
        department: department._id, 
        isActive: true 
      }).populate('supervisor', 'firstName lastName');

      if (req.baseUrl === '/api/departments') {
        return res.json({
          success: true,
          data: { department, employees }
        });
      }

      res.render('departments/show', {
        title: department.name,
        department,
        employees
      });
    } catch (error) {
      console.error(error);
      if (req.baseUrl === '/api/departments') {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch department'
        });
      }
      req.flash('error_msg', 'Failed to fetch department');
      res.redirect('/departments');
    }
  },

  // GET /departments/:id/edit - Show edit department form
  showEditForm: async (req, res) => {
    try {
      const department = await Department.findById(req.params.id);
      
      if (!department) {
        req.flash('error_msg', 'Department not found');
        return res.redirect('/departments');
      }

      // Get potential heads of department (employees in this department)
      const employees = await Employee.find({ 
        department: department._id, 
        isActive: true 
      }).sort({ firstName: 1, lastName: 1 });

      res.render('departments/edit', {
        title: 'Edit Department',
        department,
        employees
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Failed to fetch department');
      res.redirect('/departments');
    }
  },

  // PUT/PATCH /departments/:id - Update department
  updateDepartment: async (req, res) => {
    try {
      const { name, description, budget, headOfDepartment } = req.body;
      
      const updateData = {
        name: name.trim(),
        description: description?.trim(),
        budget: budget || 0
      };

      if (headOfDepartment && headOfDepartment !== '') {
        updateData.headOfDepartment = headOfDepartment;
      } else {
        updateData.headOfDepartment = null;
      }

      const department = await Department.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!department) {
        if (req.baseUrl === '/api/departments') {
          return res.status(404).json({
            success: false,
            error: 'Department not found'
          });
        }
        req.flash('error_msg', 'Department not found');
        return res.redirect('/departments');
      }

      if (req.baseUrl === '/api/departments') {
        return res.json({
          success: true,
          data: department
        });
      }

      req.flash('success_msg', 'Department updated successfully');
      res.redirect(`/departments/${department._id}`);
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/departments') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      req.flash('error_msg', error.message);
      res.redirect(`/departments/${req.params.id}/edit`);
    }
  },

  // DELETE /departments/:id - Delete department
  deleteDepartment: async (req, res) => {
    try {
      // Check if department has employees
      const employeeCount = await Employee.countDocuments({ 
        department: req.params.id, 
        isActive: true 
      });

      if (employeeCount > 0) {
        if (req.baseUrl === '/api/departments') {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete department with active employees'
          });
        }
        req.flash('error_msg', 'Cannot delete department with active employees');
        return res.redirect('/departments');
      }

      // Soft delete - mark as inactive
      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!department) {
        if (req.baseUrl === '/api/departments') {
          return res.status(404).json({
            success: false,
            error: 'Department not found'
          });
        }
        req.flash('error_msg', 'Department not found');
        return res.redirect('/departments');
      }

      if (req.baseUrl === '/api/departments') {
        return res.json({
          success: true,
          message: 'Department deleted successfully'
        });
      }

      req.flash('success_msg', 'Department deleted successfully');
      res.redirect('/departments');
    } catch (error) {
      console.error(error);
      
      if (req.baseUrl === '/api/departments') {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete department'
        });
      }

      req.flash('error_msg', 'Failed to delete department');
      res.redirect('/departments');
    }
  }
};

module.exports = departmentController;