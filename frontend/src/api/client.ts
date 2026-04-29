import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const baseURL = configuredBaseURL === undefined ? 'http://localhost:4000' : configuredBaseURL;

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000
});
