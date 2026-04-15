import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Student endpoints
export const getStudents = () => api.get('/students').then(res => res.data)

export const searchStudents = (type, query) =>
  api.get('/students/search', { params: { type, query } }).then(res => res.data)

export const addStudent = (data) =>
  api.post('/students', data).then(res => res.data)

export const updateStudent = (id, field, value) =>
  api.put(`/students/${id}`, null, { params: { field, value } }).then(res => res.data)

export const deleteStudent = (id) =>
  api.delete(`/students/${id}`).then(res => res.data)

export const getStudentsByLevel = (level) =>
  api.get(`/students/level/${level}`).then(res => res.data)

// Import endpoints
export const importCsv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data)
}

export const loadSampleData = () =>
  api.post('/students/sample').then(res => res.data)

export const resetData = () =>
  api.post('/students/reset').then(res => res.data)

// Visualization endpoints
export const getHashTable = (level) =>
  api.get('/visualization/hashtable', { params: { level } }).then(res => res.data)

export const getIndices = () =>
  api.get('/visualization/indices').then(res => res.data)

export const probeSimulation = (id) =>
  api.get('/visualization/probe-simulation', { params: { id } }).then(res => res.data)

// Performance endpoints
export const getStats = () =>
  api.get('/performance/stats').then(res => res.data)

export const getPerformanceComparison = () =>
  api.get('/performance/compare').then(res => res.data)

export default api
