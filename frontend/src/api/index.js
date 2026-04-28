import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (studentId) => api.get(`/students/${studentId}`),
  add: (student) => api.post('/students', student),
  update: (studentId, student) => api.put(`/students/${studentId}`, student),
};

export const dormitoryApi = {
  getBuildings: () => api.get('/dormitory/buildings'),
  getRooms: (buildingId) => api.get(`/dormitory/buildings/${buildingId}/rooms`),
  getBeds: (roomId) => api.get(`/dormitory/rooms/${roomId}/beds`),
  getAvailableBeds: (gender) => api.get('/dormitory/beds/available', { params: { gender } }),
  getBed: (bedId) => api.get(`/dormitory/beds/${bedId}`),
  getRoom: (roomId) => api.get(`/dormitory/rooms/${roomId}`),
  assign: (data) => api.post('/dormitory/assign', data),
};

export const billApi = {
  getAll: () => api.get('/bills'),
  getById: (billId) => api.get(`/bills/${billId}`),
  getByStudent: (studentId) => api.get(`/bills/student/${studentId}`),
  pay: (data) => api.post('/bills/pay', data),
  generate: () => api.post('/bills/generate'),
  checkOverdue: () => api.post('/bills/check-overdue'),
};

export const maintenanceApi = {
  getAllRequests: () => api.get('/maintenance/requests'),
  getRequest: (requestId) => api.get(`/maintenance/requests/${requestId}`),
  getByStudent: (studentId) => api.get(`/maintenance/requests/student/${studentId}`),
  getAllStaff: () => api.get('/maintenance/staff'),
  create: (data) => api.post('/maintenance/requests', data),
  start: (requestId, staffId) => api.put(`/maintenance/requests/${requestId}/start`, null, { params: { staffId } }),
  complete: (requestId, remark) => api.put(`/maintenance/requests/${requestId}/complete`, null, { params: { remark } }),
  checkEscalation: () => api.post('/maintenance/check-escalation'),
};

export const checkoutApi = {
  checkout: (data) => api.post('/checkout', data),
};

export const roomChangeApi = {
  change: (data) => api.post('/room-change', data),
};

export const accessCardApi = {
  getAll: () => api.get('/access-cards'),
  getByStudent: (studentId) => api.get(`/access-cards/student/${studentId}`),
  getActive: (studentId) => api.get(`/access-cards/student/${studentId}/active`),
};

export const disciplineApi = {
  getAll: () => api.get('/discipline'),
  getByStudent: (studentId) => api.get(`/discipline/student/${studentId}`),
  add: (record) => api.post('/discipline', record),
};

export default api;
