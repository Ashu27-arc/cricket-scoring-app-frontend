import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Match API functions
export const matchAPI = {
  // Save match to backend
  saveMatch: async (matchData) => {
    const response = await api.post('/matches', {
      fullMatchJSON: matchData,
      teamA: matchData.teamA,
      teamB: matchData.teamB,
      batting: matchData.batting,
      overs: matchData.overs
    });
    return response.data;
  },

  // Get all matches
  getAllMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },

  // Get single match
  getMatch: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  // Update match
  updateMatch: async (id, matchData, lastBall = null, additionalData = {}) => {
    const response = await api.put(`/matches/${id}`, {
      fullMatchJSON: matchData,
      teamA: matchData.teamA,
      teamB: matchData.teamB,
      batting: matchData.batting,
      overs: matchData.overs,
      lastBall: lastBall,
      ...additionalData
    });
    return response.data;
  },

  // Delete match
  deleteMatch: async (id) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  }
};

export default api;