/**
 * Analytics Controller
 * Basic analytics based on employee task counters + workload score
 */

const Employee = require('../models/Employee');
const Department = require('../models/Department');

class AnalyticsController {
  /**
   * Employee analytics (global)
   * GET /api/analytics/employees
   */
  async employees(req, res) {
    try {
      const employees = await Employee.find({ status: { $ne: 'INACTIVE' } })
        .select('fullName email phone departmentId openTasks inProgressTasks profession position status')
        .populate('departmentId', 'name code')
        .sort({ fullName: 1 });

      const rows = employees.map(emp => ({
        employeeId: emp._id.toString(),
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || null,
        departmentId: emp.departmentId?._id?.toString() || emp.departmentId?.toString() || null,
        departmentName: emp.departmentId?.name || null,
        openTasks: emp.openTasks || 0,
        inProgressTasks: emp.inProgressTasks || 0,
        workloadScore: emp.workloadScore,
        profession: emp.profession || null,
        position: emp.position || null
      }));

      const totalEmployees = rows.length;
      const totalOpen = rows.reduce((s, r) => s + (r.openTasks || 0), 0);
      const totalInProgress = rows.reduce((s, r) => s + (r.inProgressTasks || 0), 0);
      const totalWorkload = rows.reduce((s, r) => s + (r.workloadScore || 0), 0);

      res.json({
        success: true,
        data: {
          summary: {
            totalEmployees,
            totalOpenTasks: totalOpen,
            totalInProgressTasks: totalInProgress,
            totalWorkloadScore: totalWorkload,
            averageWorkloadScore: totalEmployees ? totalWorkload / totalEmployees : 0
          },
          employees: rows
        }
      });
    } catch (error) {
      console.error('Error fetching employee analytics:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employee analytics',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Department analytics
   * GET /api/analytics/department/:id
   */
  async department(req, res) {
    try {
      const { id } = req.params;

      const department = await Department.findById(id);
      if (!department) {
        return res.status(404).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found',
          action: 'Check department ID'
        });
      }

      const employees = await Employee.find({
        departmentId: id,
        status: { $ne: 'INACTIVE' }
      })
        .select('fullName email phone openTasks inProgressTasks profession position status')
        .sort({ fullName: 1 });

      const rows = employees.map(emp => ({
        employeeId: emp._id.toString(),
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || null,
        openTasks: emp.openTasks || 0,
        inProgressTasks: emp.inProgressTasks || 0,
        workloadScore: emp.workloadScore,
        profession: emp.profession || null,
        position: emp.position || null
      }));

      const totalEmployees = rows.length;
      const totalOpen = rows.reduce((s, r) => s + (r.openTasks || 0), 0);
      const totalInProgress = rows.reduce((s, r) => s + (r.inProgressTasks || 0), 0);
      const totalWorkload = rows.reduce((s, r) => s + (r.workloadScore || 0), 0);

      res.json({
        success: true,
        data: {
          department: {
            id: department._id.toString(),
            name: department.name,
            code: department.code,
            headEmployeeId: department.headEmployeeId?.toString() || null
          },
          summary: {
            totalEmployees,
            totalOpenTasks: totalOpen,
            totalInProgressTasks: totalInProgress,
            totalWorkloadScore: totalWorkload,
            averageWorkloadScore: totalEmployees ? totalWorkload / totalEmployees : 0
          },
          employees: rows
        }
      });
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch department analytics',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new AnalyticsController();

