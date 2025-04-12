import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

// Mock data
const MOCK_USER = {
  email: 'student@unive.com',
  password: 'hackathon2025'
};

// Mock tasks data
let mockTasks = [
  {
    id: 1,
    title: 'Sample Task 1',
    description: 'This is a sample task description',
    status: 'Sent',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Sample Task 2',
    description: 'Another sample task description',
    status: 'Sent',
    created_at: new Date().toISOString()
  }
];

// Mock functions
const login = async (credentials) => {
  try {
    const response = await fetch(API_URL+'/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Optionally, you can customize error handling based on response status.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    // Assuming the API returns JSON in a similar structure as your mockLogin function.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    // Here you might want to re-throw the error or handle it gracefully.
    throw error;
  }
};

// Example usage:
const credentials = { email: 'user@example.com', password: 'securePassword' };

login(credentials)
  .then(data => {
    // Successful login: handle token and user info from data.data
    console.log('Login successful:', data);
  })
  .catch(error => {
    // Handle errors: show error message, etc.
    console.error('Login error:', error);
  });


const mockGetTasks = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { data: mockTasks };
};

const mockGetTask = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const task = mockTasks.find(t => t.id === parseInt(id));
  if (!task) throw new Error('Task not found');
  return { data: task };
};

const mockPostTask = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  const newTask = {
    id: Date.now(),
    title: payload.title,
    description: payload.description,
    status: 'Sent',
    created_at: new Date().toISOString()
  };

  mockTasks.push(newTask);
  return {
    data: newTask
  };
};

const mockDeleteTask = async (taskId) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  mockTasks = mockTasks.filter(task => task.id !== parseInt(taskId));
  return { data: { id: taskId } };
};

const mockUpdateTask = async (taskId, payload) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Find the existing task to preserve any fields not in the payload
  const existingTask = mockTasks.find(task => task.id === parseInt(taskId));

  if (!existingTask) {
    throw new Error('Task not found');
  }

  const updatedTask = {
    ...existingTask,
    ...payload,
    id: parseInt(taskId)
  };

  mockTasks = mockTasks.map(task =>
    task.id === parseInt(taskId) ? updatedTask : task
  );

  return {
    data: updatedTask
  };
};

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: login, // Using mock login instead of real API
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/user/'),
};

const mockGetStatuses = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    data: ['Sent', 'Directed to Interface 1', 'Directed to Interface 2', 'Directed to Interface 3', 'Rejected']
  };
};

export const tasksAPI = {
  getTasks: mockGetTasks, // Using mock task fetching instead of real API
  getTask: mockGetTask, // Using mock task fetching instead of real API
  createTask: mockPostTask, // Using mock task creation instead of real API
  updateTask: mockUpdateTask, // Using mock task update instead of real API
  deleteTask: mockDeleteTask, // Using mock task deletion instead of real API
  getStatuses: mockGetStatuses, // Using mock statuses fetching
};

export default api;