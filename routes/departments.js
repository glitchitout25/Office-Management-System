const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all department routes
router.use(protect);

// GET /departments - List all departments
router.get('/', departmentController.getAllDepartments);

// GET /departments/new - Show create department form
router.get('/new', departmentController.showCreateForm);

// POST /departments - Create new department
router.post('/', departmentController.createDepartment);

// GET /departments/:id - Show single department
router.get('/:id', departmentController.getDepartment);

// GET /departments/:id/edit - Show edit department form
router.get('/:id/edit', departmentController.showEditForm);

// PUT /departments/:id - Update department
router.put('/:id', departmentController.updateDepartment);

// DELETE /departments/:id - Delete department
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;