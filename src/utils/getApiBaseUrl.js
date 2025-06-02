// export function getApiBaseUrl() {
//   return import.meta.env.VITE_API_URL.replace("/api", "");
// }

export function getApiBaseUrl() {
  const hostname = window.location.hostname;

  return `https://${hostname}:7265`;
}
