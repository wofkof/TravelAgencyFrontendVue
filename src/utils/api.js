// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

// api.postForm = function (url, formData) {
//   return this.post(url, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// export default api;

import axios from "axios";

let baseUrl = "";

if (window.location.hostname === "localhost") {
  baseUrl = "https://localhost:7265/api"; // 自己機器本地開發
} else {
  baseUrl = `https://${window.location.hostname}:7265/api`; // 其他人訪問時
}

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.postForm = function (url, formData) {
  return this.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
