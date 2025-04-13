import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { supervisorAPI } from '../services/api';
import { jsPDF } from 'jspdf';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeSection, setActiveSection] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [sendingProgram, setSendingProgram] = useState(false);

  // API functions
  const authAPI = {
    logout: async () => {
      try {
        const response = await fetch('https://5138-41-111-220-41.ngrok-free.app/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Logout failed');
        }

        return await response.json();
      } catch (error) {
        console.error('Error during logout:', error);
        throw error;
      }
    }
  };

  // We're using the supervisorAPI imported from services/api.js

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated and has supervisor role
        if (!user) {
          setError('User session not found. Please log in again.');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
          return;
        }

        if (user.role !== 'supervisor' && user.role !== 'supervisyer') {
          setError('You do not have permission to access this page.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const response = await supervisorAPI.getAllProjects();
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, logout, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout endpoint
      const data = await authAPI.logout();
      // Show a success toast with the API message
      toast.success(data.message || 'Logged out successfully.');
      // Clear authentication data
      logout();
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      // Show an error toast if logout fails
      toast.error(error.message || 'Logout failed.');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);

      // Create a preview URL for the PDF
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPdfPreview(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Handle sending educational program
  const handleSendProgram = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error('Please select a project first.');
      return;
    }

    if (!pdfFile) {
      toast.error('Please select a PDF file to send.');
      return;
    }

    try {
      setSendingProgram(true);

      const message = e.target.message.value || 'Educational program for your project';

      const response = await supervisorAPI.sendEducationalProgram(
        selectedProject.id,
        pdfFile,
        message
      );

      if (response.success) {
        toast.success('Educational program sent successfully!');
        // Reset form
        setPdfFile(null);
        setPdfPreview(null);
        setSelectedProject(null);
        e.target.reset();
      } else {
        throw new Error(response.message || 'Failed to send educational program');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send educational program');
    } finally {
      setSendingProgram(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-full md:w-64 bg-white shadow-xl border-r border-gray-100 z-10 transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Supervisor Dashboard</h2>
          <button className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => document.querySelector('.md\\:w-64').classList.toggle('hidden')}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveSection('projects')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${
              activeSection === 'projects'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Projects
          </button>
          <button
            onClick={() => setActiveSection('educational')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${
              activeSection === 'educational'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Educational Programs
          </button>
        </nav>
        <div className="px-4 py-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.firstname?.charAt(0) || 'S'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.firstname} {user?.lastname}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {activeSection === 'projects' ? 'Projects' : 'Educational Programs'}
            </h2>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-opacity-50">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {activeSection === 'projects' ? (
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Management</h3>
                  <p className="text-gray-600 mb-6">
                    View all projects and their details. You can send educational programs to project owners.
                  </p>

                  {/* Projects List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{project.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{project.teamMembers && project.teamMembers[0] ? project.teamMembers[0].name : 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{project.teamMembers && project.teamMembers[0] ? project.teamMembers[0].email : 'Unknown'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${project.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                    project.status.includes('Interface') ? 'bg-green-100 text-green-800' :
                                    project.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(project.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setActiveSection('educational');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Send Program
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No projects found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Educational Programs</h3>
                  <p className="text-gray-600 mb-6">
                    Send educational programs in PDF format to project owners.
                  </p>

                  {/* Educational Program Form */}
                  <form onSubmit={handleSendProgram} className="space-y-6">
                    <div>
                      <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Project
                      </label>
                      <select
                        id="project"
                        name="project"
                        required
                        value={selectedProject?.id || ''}
                        onChange={(e) => {
                          const projectId = parseInt(e.target.value);
                          const project = projects.find(p => p.id === projectId);
                          setSelectedProject(project || null);
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">-- Select a project --</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title} - {project.teamMembers && project.teamMembers[0] ? project.teamMembers[0].name : 'Unknown'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload PDF
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".pdf"
                                className="sr-only"
                                onChange={handleFileChange}
                                required={!pdfFile}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        </div>
                      </div>

                      {/* PDF Preview */}
                      {pdfPreview && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <svg className="h-6 w-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">{pdfFile?.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPdfFile(null);
                                setPdfPreview(null);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Size: {(pdfFile?.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Add a message to the project owner..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingProgram || !pdfFile || !selectedProject}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          sendingProgram || !pdfFile || !selectedProject
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {sendingProgram ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Educational Program'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
