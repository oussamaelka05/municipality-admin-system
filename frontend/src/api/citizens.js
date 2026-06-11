import api from './axios'

export const getCitizens   = (params) => api.get('/citizens', { params })
export const getCitizen    = (id) => api.get(`/citizens/${id}`)
export const createCitizen = (data) => api.post('/citizens', data)
export const updateCitizen = (id, data) => api.put(`/citizens/${id}`, data)
export const deleteCitizen = (id) => api.delete(`/citizens/${id}`)
