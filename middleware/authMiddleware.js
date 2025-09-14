
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Redirect to login page if no token is found
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.admin = await Admin.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error(error);
        return res.status(404).render('error', {
            title: 'Page Not Found',
            error: { status: 404, message: 'Page not found' }
        });
    }
};

exports.checkAuth = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            jwt.verify(token, config.JWT_SECRET);
            return res.redirect('/');
        } catch (error) {
            // Token is invalid, proceed to next middleware (login page)
            next();
        }
    } else {
        // No token, proceed to next middleware (login page)
        next();
    }
};
