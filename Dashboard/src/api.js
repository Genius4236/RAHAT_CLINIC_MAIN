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
  // Auth
  loginAdmin: (email, password) =>
    request('/user/login', { method: 'POST', body: JSON.stringify({ email, password, role: 'Admin' }) }),
  getAdmin: () => request('/user/admin/me'),
  logoutAdmin: () => request('/user/admin/logout'),
  addAdmin: (body) =>
    request('/user/admin/addnew', { method: 'POST', body: JSON.stringify(body) }),

  // Doctors
  getDoctors: () => request('/user/doctors'),
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

  // Appointments
  getAppointments: () => request('/appointment/getall'),
  updateAppointment: (id, body) =>
    request(`/appointment/update/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAppointment: (id) =>
    request(`/appointment/delete/${id}`, { method: 'DELETE' }),

  // Messages
  sendMessage: (body) =>
    request('/message/send', { method: 'POST', body: JSON.stringify(body) }),
  getMessages: () => request('/message/getall'),
};
