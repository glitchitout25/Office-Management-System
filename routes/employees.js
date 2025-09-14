const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all employee routes
router.use(protect);

// GET /employees - List employees with pagination, search, and filtering
router.get('/', employeeController.getAllEmployees);

// GET /employees/new - Show create employee form
router.get('/new', employeeController.showCreateForm);

// POST /employees - Create new employee
router.post('/', employeeController.createEmployee);

// GET /employees/:id - Show single employee
router.get('/:id', employeeController.getEmployee);

// GET /employees/:id/edit - Show edit employee form
router.get('/:id/edit', employeeController.showEditForm);

// PUT /employees/:id - Update employee
router.put('/:id', employeeController.updateEmployee);

// DELETE /employees/:id - Delete employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;