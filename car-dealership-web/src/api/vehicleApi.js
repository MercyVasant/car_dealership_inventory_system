import apiClient from './apiClient';

export const vehicleApi = {
  // GET /api/vehicles
  getVehicles: async () => {
    return apiClient.get('/vehicles');
  },

  // GET /api/vehicles/search
  searchVehicles: async (params) => {
    return apiClient.get('/vehicles/search', { params });
  },

  // POST /api/vehicles
  createVehicle: async (vehicleData) => {
    return apiClient.post('/vehicles', vehicleData);
  },

  // PUT /api/vehicles/:id
  updateVehicle: async (id, vehicleData) => {
    return apiClient.put(`/vehicles/${id}`, vehicleData);
  },

  // DELETE /api/vehicles/:id
  deleteVehicle: async (id) => {
    return apiClient.delete(`/vehicles/${id}`);
  },

  // POST /api/vehicles/:id/purchase
  purchaseVehicle: async (id) => {
    return apiClient.post(`/vehicles/${id}/purchase`);
  },

  // POST /api/vehicles/:id/restock
  restockVehicle: async (id, quantity) => {
    return apiClient.post(`/vehicles/${id}/restock`, { quantity });
  }
};
