import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// Courses API
export const coursesAPI = {
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    create: (courseData) => api.post('/courses', courseData),
    update: (id, courseData) => api.put(`/courses/${id}`, courseData),
    delete: (id) => api.delete(`/courses/${id}`),
    enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
    addTopic: (courseId, topicData) => api.post(`/courses/${courseId}/topics`, topicData),
};

// Exercises API
export const exercisesAPI = {
    getAll: () => api.get('/exercises'),
    getById: (id) => api.get(`/exercises/${id}`),
    getByCourse: (courseId) => api.get(`/exercises/course/${courseId}`),
    create: (exerciseData) => api.post('/exercises', exerciseData),
    update: (id, exerciseData) => api.put(`/exercises/${id}`, exerciseData),
    delete: (id) => api.delete(`/exercises/${id}`),
    submit: (id, answer) => api.post(`/exercises/${id}/submit`, answer),
};

// Progress API
export const progressAPI = {
    getUserProgress: () => api.get('/progress/my-progress'),
    getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
    getAllStudentsProgress: (courseId) => api.get(`/progress/course/${courseId}/all`),
    completeTopic: (courseId, topicId) => api.post(`/progress/course/${courseId}/topic/${topicId}/complete`),
    gradeExercise: (exerciseId, userId, score) => api.post(`/progress/exercise/${exerciseId}/grade`, { userId, score }),
};

export default api; 