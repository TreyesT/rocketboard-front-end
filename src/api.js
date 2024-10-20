import axios from 'axios';

// console.log('Test variable:', process.env.REACT_APP_TEST_VARIABLE);
console.log('Cool variable:', process.env.REACT_APP_API_URL);

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export default api;