import { useState, useCallback } from 'react';
import { matchAPI } from '../services/api';

export const useMatchAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const saveMatch = useCallback(async (matchData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchAPI.saveMatch(matchData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const matches = await matchAPI.getAllMatches();
      return matches;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMatch = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const match = await matchAPI.getMatch(id);
      return match;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMatch = useCallback(async (id, matchData, lastBall = null, additionalData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchAPI.updateMatch(id, matchData, lastBall, additionalData);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMatch = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchAPI.deleteMatch(id);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    saveMatch,
    loadMatches,
    loadMatch,
    updateMatch,
    deleteMatch
  };
};