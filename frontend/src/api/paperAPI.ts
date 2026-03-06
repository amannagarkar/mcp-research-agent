import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const paperAPI = {
  /**
   * Upload a paper
   */
  uploadPaper: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('title', metadata.title || '');
      formData.append('authors', JSON.stringify(metadata.authors || []));
      formData.append('tags', JSON.stringify(metadata.tags || []));
    }

    const response = await axios.post(`${API_BASE_URL}/papers/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get all papers
   */
  getAllPapers: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await axios.get(
      `${API_BASE_URL}/papers${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific paper
   */
  getPaper: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/papers/${id}`);
    return response.data;
  },

  /**
   * Search papers
   */
  searchPapers: async (query: string, limit?: number) => {
    const response = await axios.post(`${API_BASE_URL}/papers/search`, {
      query,
      limit,
    });
    return response.data;
  },

  /**
   * Get similar papers
   */
  getSimilarPapers: async (paperId: string, limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await axios.get(
      `${API_BASE_URL}/papers/${paperId}/similar${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Update paper
   */
  updatePaper: async (id: string, data: any) => {
    const response = await axios.put(`${API_BASE_URL}/papers/${id}`, data);
    return response.data;
  },

  /**
   * Delete paper
   */
  deletePaper: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/papers/${id}`);
    return response.data;
  },
};
