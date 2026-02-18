import api from './api';

export const hrService = {
  async getDashboardStats() {
    const response = await api.get('/api/analytics/employees');
    return response.data;
  },

  async getEmployees() {
    const response = await api.get('/api/employees');
    return response.data.data || [];
  },

  async getEmployeeById(id) {
    const response = await api.get(`/api/employees/${id}`);
    return response.data.data;
  },

  async createEmployee(data) {
    const response = await api.post('/api/employees', data);
    return response.data;
  },

  async updateEmployee(id, data) {
    // Backend may need PUT /api/employees/:id endpoint for updates
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },

  async getDepartments() {
    const response = await api.get('/api/departments');
    return response.data.data || [];
  },

  async createDepartment(data) {
    const response = await api.post('/api/departments', data);
    return response.data;
  },

  async assignDepartmentHead(deptId, headEmployeeId) {
    const response = await api.put(`/api/departments/${deptId}/head`, {
      headEmployeeId
    });
    return response.data;
  }
};
