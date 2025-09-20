require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config/config');
const PORT = process.env.PORT || 10000;

// Import database connection
const connectDB = require('./config/database');

// Import routes
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController');
const dashboardController = require('./controllers/dashboardController');
const { checkAuth, protect } = require('./middleware/authMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.get('/', protect, dashboardController.getDashboardData);

app.get('/login', checkAuth, (req, res) => {
  res.render('auth/login', { layout: false, title: 'Admin Login' });
});

app.use('/departments', departmentRoutes);
app.use('/employees', employeeRoutes);
app.use('/reports', reportRoutes);
app.use('/auth', authRoutes);
app.post('/auth/login', authController.loginAdmin);

// API Routes for external consumption
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    error: { status: 404, message: 'Page not found' }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    error: config.NODE_ENV === 'development' ? err : { message: 'Something went wrong!' }
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});