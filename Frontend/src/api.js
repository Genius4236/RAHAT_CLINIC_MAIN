const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
  return data;
};

export const api = {
  login: (email, password, role) =>
    request('/user/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  register: (body) =>
    request('/user/patient/register', { method: 'POST', body: JSON.stringify(body) }),
  getDoctors: () => request('/user/doctors'),
  getPatient: () => request('/user/patient/me'),
  postAppointment: (body) =>
    request('/appointment/post', { method: 'POST', body: JSON.stringify(body) }),
  sendMessage: (body) =>
    request('/message/send', { method: 'POST', body: JSON.stringify(body) }),
  logoutPatient: () => request('/user/patient/logout'),

  // Admin
  getAdmin: () => request('/user/admin/me'),
  logoutAdmin: () => request('/user/admin/logout'),
  addAdmin: (body) =>
    request('/user/admin/addnew', { method: 'POST', body: JSON.stringify(body) }),

  // Appointments (admin)
  getAppointments: () => request('/appointment/getall'),
  updateAppointment: (id, body) =>
    request(`/appointment/update/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAppointment: (id) =>
    request(`/appointment/delete/${id}`, { method: 'DELETE' }),

  // Doctors (admin, with file upload)
  addDoctor: async (formData) => {
    const url = `${API_BASE}/user/doctor/addnew`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
    return data;
  },

  // Payments
  getPaymentKey: () => request('/product/payment/key'),
  processPayment: (amount) =>
    request('/product/payment/process', { method: 'POST', body: JSON.stringify({ amount }) }),
};
