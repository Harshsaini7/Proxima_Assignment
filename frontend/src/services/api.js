import axios from 'axios';

const API_URL = '/api';

// Leads API
export const leadsAPI = {
  getAll: (params) => axios.get(`${API_URL}/leads`, { params }),
  getOne: (id) => axios.get(`${API_URL}/leads/${id}`),
  create: (data) => axios.post(`${API_URL}/leads`, data),
  update: (id, data) => axios.put(`${API_URL}/leads/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/leads/${id}`)
};

// Contacts API
export const contactsAPI = {
  getAll: (params) => axios.get(`${API_URL}/contacts`, { params }),
  getOne: (id) => axios.get(`${API_URL}/contacts/${id}`),
  create: (data) => axios.post(`${API_URL}/contacts`, data),
  update: (id, data) => axios.put(`${API_URL}/contacts/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/contacts/${id}`)
};

// Deals API
export const dealsAPI = {
  getAll: (params) => axios.get(`${API_URL}/deals`, { params }),
  getOne: (id) => axios.get(`${API_URL}/deals/${id}`),
  create: (data) => axios.post(`${API_URL}/deals`, data),
  update: (id, data) => axios.put(`${API_URL}/deals/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/deals/${id}`)
};

// Reports API
export const reportsAPI = {
  getDealsReport: (params) => axios.get(`${API_URL}/reports/deals`, { params }),
  getDashboardStats: () => axios.get(`${API_URL}/reports/dashboard`)
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params) => axios.get(`${API_URL}/activity-logs`, { params }),
  getRecordLogs: (module, recordId) => axios.get(`${API_URL}/activity-logs/record/${module}/${recordId}`),
  getUserLogs: (userId, params) => axios.get(`${API_URL}/activity-logs/user/${userId}`, { params })
};

// Users API
export const usersAPI = {
  getAll: () => axios.get(`${API_URL}/auth/users`)
};
