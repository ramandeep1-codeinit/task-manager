import axios from "axios";

// ✅ Use environment variable for flexibility and safety
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // keep this if your backend uses cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;


// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:8080/api', // Replace with your backend URL
//   withCredentials: true, // if you're using cookies/sessions
// });

// export default api;
