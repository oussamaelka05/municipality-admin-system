import api from './axios'

export const getFicheDepouillement = (params) =>
  api.get('/fiche-depouillement', { params })
