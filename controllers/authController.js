
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/config');

const generateToken = (id) => {
    return jwt.sign({ id }, config.JWT_SECRET, {
        expiresIn: '1h',
    });
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            const token = generateToken(admin._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                maxAge: 3600000, // 1 hour
            });
            res.redirect('/');
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token'); // Clear the JWT token cookie
    req.flash('success_msg', 'You are logged out.'); // Set flash message before destroying session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error_msg', 'Could not log out, please try again.');
        }
        res.redirect('/login'); // Always redirect to login page after logout
    });
};
