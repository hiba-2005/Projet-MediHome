import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/medical-home-visits-backend/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;