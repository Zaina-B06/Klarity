import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('klarity_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)
export const getTasks = () => api.get('/tasks')
export const createTask = (data) => api.post('/tasks', data)
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status })
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const getInsights = () => api.get('/insights')
export const getEmployeeInsights = (id) => api.get(`/insights/${id}`)
export const remindEmployee = (taskId) => api.post(`/tasks/${taskId}/remind`)
export const reassignTask = (taskId, assignedTo) => api.patch(`/tasks/${taskId}/reassign`, { assigned_to: assignedTo })
export const getAdvisorInsights = () => api.get('/advisor')