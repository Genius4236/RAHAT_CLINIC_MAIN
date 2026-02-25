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
  logoutDoctor: () => axiosInstance.post('/user/doctor/logout'),

  // Patient
  getPatient: () => axiosInstance.get('/user/patient/me'),

  // Doctors
  getDoctors: () => axiosInstance.get('/user/doctors'),

  // Appointments
  postAppointment: (body) =>
    axiosInstance.post('/appointment/post', body),
  getAppointments: () => axiosInstance.get('/appointment/getall'),
  getMyAppointments: () => axiosInstance.get('/appointment/my'),
  getDoctorAppointments: () => axiosInstance.get('/appointment/doctor'),
  updateAppointment: (id, body) =>
    axiosInstance.put(`/appointment/update/${id}`, body),
  rescheduleAppointment: (id, body) =>
    axiosInstance.put(`/appointment/reschedule/${id}`, body),
  deleteAppointment: (id) =>
    axiosInstance.delete(`/appointment/delete/${id}`),
  addAppointmentNotes: (id, body) =>
    axiosInstance.put(`/appointment/notes/${id}`, body),

  // Messages
  sendMessage: (body) =>
    axiosInstance.post('/message/send', body),
  getAllMessages: () =>
    axiosInstance.get('/message/getall'),
  deleteMessage: (id) =>
    axiosInstance.delete(`/message/delete/${id}`),
  replyToMessage: (id, body) =>
    axiosInstance.post(`/message/reply/${id}`, body),

  // Admin
  getAdmin: () => axiosInstance.get('/user/admin/me'),
  addAdmin: (body) =>
    axiosInstance.post('/user/admin/addnew', body),
  addDoctor: (formData) =>
    axiosInstance.post('/user/doctor/addnew', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // User Profile
  updateProfile: (body) =>
    axiosInstance.put('/user/profile/update', body),

  // Doctor Dashboard
  getDoctor: () => axiosInstance.get('/user/doctor/me'),
  getDoctorAppointments: () => axiosInstance.get('/appointment/doctor'),

  // Availability
  setAvailability: (body) =>
    axiosInstance.post('/availability/set', body),
  getDoctorAvailability: (doctorId) =>
    axiosInstance.get(`/availability/${doctorId}`),
  getAvailableSlots: (doctorId, date) =>
    axiosInstance.get('/availability/slots/available', {
      params: { doctorId, date },
    }),
  updateAvailability: (id, body) =>
    axiosInstance.put(`/availability/update/${id}`, body),
  deleteAvailability: (id) =>
    axiosInstance.delete(`/availability/delete/${id}`),

  // Payments
  createPaymentOrder: (appointmentId, amount) =>
    axiosInstance.post('/payment/create-order', { appointmentId, amount }),
  verifyPayment: (razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId) =>
    axiosInstance.post('/payment/verify', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      appointmentId,
    }),
  getPaymentHistory: (status, limit = 10, page = 1) =>
    axiosInstance.get('/payment/history', {
      params: { status, limit, page },
    }),
  getAppointmentPayment: (appointmentId) =>
    axiosInstance.get(`/payment/appointment/${appointmentId}`),

  // Password Reset
  requestPasswordReset: (email) =>
    axiosInstance.post('/user/password/request-reset', { email }),
  verifyResetToken: (token) =>
    axiosInstance.post('/user/password/verify-token', { token }),
  resetPassword: (token, newPassword, confirmPassword) =>
    axiosInstance.post('/user/password/reset', {
      token,
      newPassword,
      confirmPassword,
    }),
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    axiosInstance.post('/user/password/change', {
      oldPassword,
      newPassword,
      confirmPassword,
    }),

  // Legacy payment endpoints
  getPaymentKey: () => axiosInstance.get('/product/payment/key'),
  processPayment: (amount) =>
    axiosInstance.post('/product/payment/process', { amount }),
}
