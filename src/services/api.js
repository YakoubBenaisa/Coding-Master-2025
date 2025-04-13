import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

// API base URL
// In a real app, this would point to your backend server

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
    status: 'Processing',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Sample Task 3',
    description: 'A third sample task description',
    status: 'Directed to Interface 1',
    created_at: new Date().toISOString()
  }
];

// Mock functions
const login = async (credentials) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo purposes, accept any credentials but validate they exist
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Mock successful login response
    // In a real app, this would come from the server

    // For demo purposes, assign different roles based on email
    let role = 'student';
    let lastname = 'Student';

    // Check if this is a supervisor account
    if (credentials.email.includes('supervisor')) {
      role = 'supervisyer';
      lastname = 'Supervisor';
    }
    // Check if this is an admin account
    else if (credentials.email.includes('admin')) {
      role = 'admin';
      lastname = 'Admin';
    }

    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: credentials.email,
        firstname: credentials.email.split('@')[0],
        lastname: lastname,
        phone: '123-456-7890',
        role: role,
        created_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};


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
    data: ['Sent', 'Processing', 'Directed to Interface 1', 'Directed to Interface 2', 'Directed to Interface 3', 'Rejected']
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

// Mock student projects data
let mockStudentProjects = [
  {
    id: 101,
    title: 'Smart Home Automation',
    description: 'A project to automate home appliances using IoT devices and machine learning algorithms. The system will learn user preferences over time and adjust settings automatically.',
    status: 'Processing',
    created_at: new Date().toISOString(),
    submitted: false,
    submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    teamMembers: [
      { id: 'ST001', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      { id: 'ST002', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
    ]
  },
  {
    id: 102,
    title: 'AI-Powered Chatbot',
    description: 'A chatbot that uses natural language processing to provide customer support for e-commerce websites. It can handle product inquiries, order status, and returns.',
    status: 'Directed to Interface 1',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    submitted: true,
    submitted_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    submission_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    teamMembers: [
      { id: 'ST003', name: 'Bob Johnson', email: 'bob@example.com', phone: '345-678-9012' },
      { id: 'ST004', name: 'Alice Brown', email: 'alice@example.com', phone: '456-789-0123' },
      { id: 'ST005', name: 'Charlie Davis', email: 'charlie@example.com', phone: '567-890-1234' }
    ]
  },
  {
    id: 103,
    title: 'Blockchain-Based Voting System',
    description: 'A secure and transparent voting system using blockchain technology to ensure the integrity of election results and prevent fraud.',
    status: 'Directed to Interface 2',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    submitted: false,
    submission_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    teamMembers: [
      { id: 'ST006', name: 'David Wilson', email: 'david@example.com', phone: '678-901-2345' },
      { id: 'ST007', name: 'Eva Martinez', email: 'eva@example.com', phone: '789-012-3456' },
      { id: 'ST008', name: 'Frank Thomas', email: 'frank@example.com', phone: '890-123-4567' },
      { id: 'ST009', name: 'Grace Lee', email: 'grace@example.com', phone: '901-234-5678' }
    ]
  },
  {
    id: 104,
    title: 'Augmented Reality Learning App',
    description: 'An educational app that uses augmented reality to make learning more interactive and engaging for K-12 students. Covers subjects like science, history, and mathematics.',
    status: 'Rejected',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    submitted: true,
    submitted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    submission_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (past deadline)
    teamMembers: [
      { id: 'ST010', name: 'Henry Clark', email: 'henry@example.com', phone: '012-345-6789' },
      { id: 'ST011', name: 'Ivy Rodriguez', email: 'ivy@example.com', phone: '123-456-7890' }
    ]
  }
];

// Mock function to get student projects
const mockGetStudentProjects = async () => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  // In a real app, we would filter projects by the current user's ID
  // For this demo, we'll just return the first project to simulate a student having only one project
  return { data: [mockStudentProjects[0]] };
};

// Mock function to get a single student project by ID
const mockGetStudentProject = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  const project = mockStudentProjects.find(p => p.id === parseInt(projectId));

  if (!project) {
    throw new Error('Project not found');
  }

  return { data: project };
};



// Mock function to submit a project
const mockSubmitProject = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  const projectIndex = mockStudentProjects.findIndex(p => p.id === parseInt(projectId));

  if (projectIndex === -1) {
    throw new Error('Project not found');
  }

  // Update the project's submitted status
  mockStudentProjects[projectIndex] = {
    ...mockStudentProjects[projectIndex],
    submitted: true,
    submitted_at: new Date().toISOString()
  };

  return { data: mockStudentProjects[projectIndex] };
};

// Mock function to update a student project
const mockUpdateStudentProject = async (projectId, payload) => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  const projectIndex = mockStudentProjects.findIndex(p => p.id === parseInt(projectId));

  if (projectIndex === -1) {
    throw new Error('Project not found');
  }

  // Check if project is already submitted
  if (mockStudentProjects[projectIndex].submitted) {
    throw new Error('Cannot update a submitted project');
  }

  // Check if project is past deadline
  const deadline = new Date(mockStudentProjects[projectIndex].submission_deadline);
  if (deadline < new Date()) {
    throw new Error('Cannot update a project past its submission deadline');
  }

  // Update the project
  mockStudentProjects[projectIndex] = {
    ...mockStudentProjects[projectIndex],
    ...payload,
    id: parseInt(projectId) // Ensure ID doesn't change
  };

  return { data: mockStudentProjects[projectIndex] };
};

// Export student-related API functions
export const studentAPI = {
  getStudentProjects: mockGetStudentProjects,
  getStudentProject: mockGetStudentProject,
  submitProject: mockSubmitProject,
  updateStudentProject: mockUpdateStudentProject
};

// Mock function to get all projects for supervisors
const mockGetAllProjects = async () => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  // Return all projects
  return { data: mockStudentProjects };
};

// Mock function to send educational program to a project owner
const mockSendEducationalProgram = async (projectId, file, message) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  // In a real app, this would upload the file to the server and notify the project owner
  console.log(`Sending educational program to project ${projectId}`);
  console.log(`File: ${file.name}, Size: ${file.size} bytes`);
  console.log(`Message: ${message || 'No message provided'}`);

  return {
    success: true,
    message: 'Educational program sent successfully'
  };
};

// Export supervisor-related API functions
export const supervisorAPI = {
  getAllProjects: mockGetAllProjects,
  sendEducationalProgram: mockSendEducationalProgram
};

export default api;