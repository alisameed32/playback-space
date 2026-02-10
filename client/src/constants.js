export const BASE_URL = import.meta.env.PROD
  ? "/api/v1"
  : import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/";

