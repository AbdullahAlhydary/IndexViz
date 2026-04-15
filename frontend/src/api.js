import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/students',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export const studentApi = {
  getAll: () => api.get('/'),
  getStats: () => api.get('/stats'),
  getHashTable: () => api.get('/hash-table'),
  searchById: (id) => api.get(`/search/id/${id}`),
  searchByFirstName: (name) => api.get(`/search/firstName/${name}`),
  searchByLastName: (name) => api.get(`/search/lastName/${name}`),
  getByLevel: (level) => api.get(`/level/${level}`),
  addStudent: (data) => api.post('/', data),
  updateStudent: (id, data) => api.put(`/${id}`, data),
  deleteStudent: (id) => api.delete(`/${id}`),
  loadSample: () => api.post('/load-sample'),
  reset: () => api.post('/reset'),
  importCsv: (csvContent) => api.post('/import-csv', { csvContent }),
  comparePerformance: (type, key) => api.get(`/performance/${type}/${key}`),
}

export default api
