import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
export const apiClient = axios.create({
    baseURL,
    timeout: 10000
});
