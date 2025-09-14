
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginAdmin);
router.get('/logout', authController.logout);

module.exports = router;
