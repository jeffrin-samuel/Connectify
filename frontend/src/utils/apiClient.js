import axios from 'axios';

const client = axios.create({
    baseURL: "http://localhost:8000/api/users"
})

// Intercepts every request globally before it's actually sent
client.interceptors.request.use((config) => {
  // config arrives here — request hasn't been sent yet
  const token = localStorage.getItem("token");
  if(token){
    config.headers.Authorization = `Bearer ${token}`; // add to blueprint
  }
  return config; // send the modified blueprint — MUST return config or request hangs forever
});

// Intercepts every response globally before it reaches individual catch blocks
client.interceptors.response.use(
  (response) => response,                     // success — pass through untouched
  (error) => {
    if(error.response?.status === 401){        // session expired or overridden
      localStorage.removeItem("token");        // clear stale token from browser
      window.location.href = "/auth";          // hard redirect — forces full page reload to reset app state
    }
    return Promise.reject(error);              // other errors bubble up to individual catch blocks
  }
);

export default client;