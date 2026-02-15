import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response error handler
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

export const api = {
  // Auth
  login: (email, password, role) =>
    axiosInstance.post('/user/login', { email, password, role }),
  register: (body) =>
    axiosInstance.post('/user/patient/register', body),
  logoutPatient: () => axiosInstance.post('/user/patient/logout'),
  logoutAdmin: () => axiosInstance.post('/user/admin/logout'),

  // Patient
  getPatient: () => axiosInstance.get('/user/patient/me'),

  // Doctors
  getDoctors: () => axiosInstance.get('/user/doctors'),

  // Appointments
  postAppointment: (body) =>
    axiosInstance.post('/appointment/post', body),
  getAppointments: () => axiosInstance.get('/appointment/getall'),
  updateAppointment: (id, body) =>
    axiosInstance.put(`/appointment/update/${id}`, body),
  deleteAppointment: (id) =>
    axiosInstance.delete(`/appointment/delete/${id}`),

  // Messages
  sendMessage: (body) =>
    axiosInstance.post('/message/send', body),

  // Admin
  getAdmin: () => axiosInstance.get('/user/admin/me'),
  addAdmin: (body) =>
    axiosInstance.post('/user/admin/addnew', body),
  addDoctor: (formData) =>
    axiosInstance.post('/user/doctor/addnew', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Payments
  getPaymentKey: () => axiosInstance.get('/product/payment/key'),
  processPayment: (amount) =>
    axiosInstance.post('/product/payment/process', { amount }),
}
