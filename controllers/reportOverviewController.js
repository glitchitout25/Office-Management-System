const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getReportsOverview = async (req, res) => {
    try {
        // Fetch overview data for the reports dashboard
        const totalEmployees = await Employee.countDocuments();
        const totalDepartments = await Department.countDocuments();

        res.render('reports/dashboard', {
            title: 'Reports Overview',
            overview: {
                totalEmployees,
                totalDepartments,
                recentHires: 12, // Placeholder, actual logic can be added later
                totalSalaryBudget: 5000000 // Placeholder, actual logic can be added later
            }
        });
    } catch (error) {
        console.error('Error fetching reports overview data:', error);
        req.flash('error_msg', 'Error loading reports overview.');
        res.redirect('/dashboard');
    }
};
