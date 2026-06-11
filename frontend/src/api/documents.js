import api from './axios'

export const getDocuments   = (params) => api.get('/documents', { params })
export const getDocument    = (id) => api.get(`/documents/${id}`)
export const createDocument = (data) => api.post('/documents', data)
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data)
export const deleteDocument = (id) => api.delete(`/documents/${id}`)

export const getDocumentTypes   = (params) => api.get('/document-types', { params })
export const getDocumentType    = (id) => api.get(`/document-types/${id}`)
export const createDocumentType = (data) => api.post('/document-types', data)
export const updateDocumentType = (id, data) => api.put(`/document-types/${id}`, data)
export const deleteDocumentType = (id) => api.delete(`/document-types/${id}`)
