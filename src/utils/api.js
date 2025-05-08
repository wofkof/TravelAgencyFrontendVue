import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.postForm = function (url, formData) {
  return this.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
