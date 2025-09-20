
const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getDashboardData = async (req, res) => {
    try {
        // Get basic counts
        const totalEmployees = await Employee.countDocuments({ isActive: true });
        const totalDepartments = await Department.countDocuments({ isActive: true });
        
        // Get recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHires = await Employee.countDocuments({ 
          isActive: true, 
          hireDate: { $gte: thirtyDaysAgo } 
        });

        // Get total salary budget
        const salaryAggregation = await Employee.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, totalSalary: { $sum: '$salary' } } }
        ]);
        const totalSalaryBudget = salaryAggregation.length > 0 ? salaryAggregation[0].totalSalary : 0;

        // Get department statistics
        const departmentStats = await Department.aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'employees',
              localField: '_id',
              foreignField: 'department',
              as: 'employees'
            }
          },
          {
            $project: {
              name: 1,
              budget: 1,
              employeeCount: { $size: '$employees' },
              totalSalary: { $sum: '$employees.salary' }
            }
          },
          { $sort: { employeeCount: -1 } }
        ]);

        // Get top job titles
        const jobTitleStats = await Employee.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);

        // Get location distribution
        const locationStats = await Employee.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);

        // Get hire date trends (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const hireTrends = await Employee.aggregate([
          { 
            $match: { 
              isActive: true, 
              hireDate: { $gte: twelveMonthsAgo } 
            } 
          },
          {
            $group: {
              _id: {
                year: { $year: '$hireDate' },
                month: { $month: '$hireDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const data = {
          title: 'Dashboard Overview',
          overview: {
            totalEmployees,
            totalDepartments,
            recentHires,
            totalSalaryBudget
          },
          departmentStats,
          jobTitleStats,
          locationStats,
          hireTrends
        };

        res.render('dashboard', data);

    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Failed to load dashboard data');
        res.redirect('/');
    }
};
