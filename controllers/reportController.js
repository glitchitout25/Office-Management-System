const Employee = require('../models/Employee');
const Department = require('../models/Department');

// Employee Analytics Report
const getEmployeeAnalytics = async (req, res) => {
  try {
    // Salary statistics
    const salaryStats = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      }
    ]);

    // Salary distribution by ranges
    const salaryRanges = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [0, 50000, 75000, 100000, 125000, 150000, 200000, Infinity],
          default: '200000+',
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        }
      }
    ]);

    // Department-wise employee distribution
    const departmentDistribution = await Department.aggregate([
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
          employeeCount: { $size: '$employees' },
          avgSalary: { $avg: '$employees.salary' },
          totalSalary: { $sum: '$employees.salary' }
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);

    // Experience analysis (years since hire)
    const experienceStats = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          jobTitle: 1,
          department: 1,
          salary: 1,
          hireDate: 1,
          yearsOfExperience: {
            $divide: [
              { $subtract: [new Date(), '$hireDate'] },
              365 * 24 * 60 * 60 * 1000
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$yearsOfExperience',
          boundaries: [0, 1, 3, 5, 10, 15, 20, Infinity],
          default: '20+',
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        }
      }
    ]);

    // Salary trends by job title
    const salaryByJobTitle = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$jobTitle',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      },
      { $sort: { avgSalary: -1 } },
      { $limit: 15 }
    ]);

    // Top earners
    const topEarners = await Employee.find({ isActive: true })
      .populate('department', 'name')
      .populate('supervisor', 'firstName lastName')
      .sort({ salary: -1 })
      .limit(10)
      .select('firstName lastName jobTitle salary department supervisor');

    const data = {
      title: 'Employee Analytics',
      salaryStats: salaryStats[0] || {},
      salaryRanges,
      departmentDistribution,
      experienceStats,
      salaryByJobTitle,
      topEarners
    };

    if (req.baseUrl.includes('/api')) {
      res.json(data);
    } else {
      res.render('reports/employee-analytics', data);
    }
  } catch (error) {
    console.error('Employee analytics error:', error);
    if (req.baseUrl.includes('/api')) {
      res.status(500).json({ error: 'Failed to fetch employee analytics' });
    } else {
      req.flash('error_msg', 'Failed to load employee analytics');
      res.redirect('/reports');
    }
  }
};

// Department Performance Report
const getDepartmentPerformance = async (req, res) => {
  try {
    // Department budget vs actual spending
    const departmentPerformance = await Department.aggregate([
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
          totalSalary: { $sum: '$employees.salary' },
          avgSalary: { $avg: '$employees.salary' },
          budgetUtilization: {
            $cond: {
              if: { $gt: ['$budget', 0] },
              then: { $multiply: [{ $divide: [{ $sum: '$employees.salary' }, '$budget'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { budgetUtilization: -1 } }
    ]);

    // Department head analysis
    const departmentHeads = await Department.find({ 
      isActive: true, 
      headOfDepartment: { $exists: true, $ne: null } 
    })
    .populate('headOfDepartment', 'firstName lastName jobTitle salary')
    .select('name headOfDepartment budget');

    // Department growth trends (employees hired in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const departmentGrowth = await Department.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'employees',
          let: { deptId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$department', '$$deptId'] },
                    { $gte: ['$hireDate', sixMonthsAgo] }
                  ]
                }
              }
            }
          ],
          as: 'recentHires'
        }
      },
      {
        $project: {
          name: 1,
          recentHires: { $size: '$recentHires' }
        }
      },
      { $sort: { recentHires: -1 } }
    ]);

    const data = {
      title: 'Department Performance',
      departmentPerformance,
      departmentHeads,
      departmentGrowth
    };

    if (req.baseUrl.includes('/api')) {
      res.json(data);
    } else {
      res.render('reports/department-performance', data);
    }
  } catch (error) {
    console.error('Department performance error:', error);
    if (req.baseUrl.includes('/api')) {
      res.status(500).json({ error: 'Failed to fetch department performance data' });
    } else {
      req.flash('error_msg', 'Failed to load department performance data');
      res.redirect('/reports');
    }
  }
};

// Financial Report
const getFinancialReport = async (req, res) => {
  try {
    // Total salary costs by department
    const salaryCosts = await Department.aggregate([
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
          totalSalary: { $sum: '$employees.salary' },
          avgSalary: { $avg: '$employees.salary' },
          employeeCount: { $size: '$employees' },
          budgetVariance: { $subtract: ['$budget', { $sum: '$employees.salary' }] }
        }
      },
      { $sort: { totalSalary: -1 } }
    ]);

    // Salary trends by job title
    const salaryByJobTitle = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$jobTitle',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      },
      { $sort: { avgSalary: -1 } },
      { $limit: 15 }
    ]);

    // Cost per employee by department
    const costPerEmployee = await Department.aggregate([
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
          employeeCount: { $size: '$employees' },
          totalSalary: { $sum: '$employees.salary' },
          budget: 1,
          costPerEmployee: {
            $cond: {
              if: { $gt: [{ $size: '$employees' }, 0] },
              then: { $divide: [{ $sum: '$employees.salary' }, { $size: '$employees' }] },
              else: 0
            }
          }
        }
      },
      { $sort: { costPerEmployee: -1 } }
    ]);

    // Budget utilization summary
    const budgetSummary = await Department.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          departmentsWithBudget: {
            $sum: { $cond: [{ $gt: ['$budget', 0] }, 1, 0] }
          },
          departmentsWithoutBudget: {
            $sum: { $cond: [{ $lte: ['$budget', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const data = {
      title: 'Financial Report',
      salaryCosts,
      salaryByJobTitle,
      costPerEmployee,
      budgetSummary: budgetSummary[0] || {}
    };

    if (req.baseUrl.includes('/api')) {
      res.json(data);
    } else {
      res.render('reports/financial', { ...data, layout: 'layout' });
    }
  } catch (error) {
    console.error('Financial report error:', error);
    if (req.baseUrl.includes('/api')) {
      res.status(500).json({ error: 'Failed to fetch financial data' });
    } else {
      req.flash('error_msg', 'Failed to load financial data');
      res.redirect('/reports');
    }
  }
};

module.exports = {
  getEmployeeAnalytics,
  getDepartmentPerformance,
  getFinancialReport
};
