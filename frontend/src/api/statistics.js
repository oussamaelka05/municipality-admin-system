import api from './axios'

export const getDashboard      = () => api.get('/statistics/dashboard')
export const getDailyStats     = (params) => api.get('/statistics/daily', { params })
export const getMonthlyStats   = (params) => api.get('/statistics/monthly', { params })
export const getYearlyStats    = () => api.get('/statistics/yearly')
export const getEmployeeStats  = (params) => api.get('/statistics/employees', { params })
export const getAvailableYears = () => api.get('/statistics/available-years')
