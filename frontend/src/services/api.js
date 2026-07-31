import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsersByRole: (role, params) => api.get(`/admin/users/${role}`, { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  updateAppointmentStatus: (id, data) => api.put(`/admin/appointments/${id}/status`, data),
  getPrescriptions: (params) => api.get('/admin/prescriptions', { params }),
  getBills: (params) => api.get('/admin/bills', { params }),
  createBill: (data) => api.post('/admin/bills', data),
  updateBill: (id, data) => api.put(`/admin/bills/${id}`, data),
  deleteBill: (id) => api.delete(`/admin/bills/${id}`)
};

// Doctor API
export const doctorAPI = {
  getAppointments: (params) => api.get('/doctor/appointments', { params }),
  getTodayAppointments: () => api.get('/doctor/today-appointments'),
  getUpcomingAppointments: () => api.get('/doctor/upcoming-appointments'),
  updateAppointmentStatus: (id, data) => api.put(`/doctor/appointments/${id}/status`, data),
  createPrescription: (data) => api.post('/doctor/prescriptions', data),
  getPrescriptions: (params) => api.get('/doctor/prescriptions', { params }),
  updateAvailability: (data) => api.put('/doctor/availability', data),
  getPatientDetails: (id) => api.get(`/doctor/patients/${id}`),
  getMyPatients: (params) => api.get('/doctor/patients', { params })
};

// Patient API
export const patientAPI = {
  getDashboard: () => api.get('/patient/dashboard'),
  getAppointments: (params) => api.get('/patient/appointments', { params }),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  cancelAppointment: (id) => api.put(`/patient/appointments/${id}/cancel`),
  getPrescriptions: (params) => api.get('/patient/prescriptions', { params }),
  getBills: (params) => api.get('/patient/bills', { params }),
  getDoctors: (params) => api.get('/patient/doctors', { params }),
  getMedicalRecords: (params) => api.get('/patient/medical-records', { params }),
  getNotifications: () => api.get('/patient/notifications')
};

export default api;

