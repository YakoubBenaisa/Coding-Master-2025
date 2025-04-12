import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast from react-toastify
import useAuthStore from '../store/authStore';
import ProjectList from '../components/admin/ProjectList';
import ExportCSVButton from '../components/admin/ExportCSVButton';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [activeSection, setActiveSection] = useState('projects');
  const [projects, setProjects] = useState([]);

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
        navigate("/student");
      } catch (error) {
        console.error('Error during logout:', error);
        throw error;
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout endpoint
      const data = await authAPI.logout();
      // Show a success toast with the API message.
      toast.success(data.message || 'Logged out successfully.');
      // Clear authentication data
      logout();
      // Redirect to login after a short delay (e.g., 1 second) to allow the toast to show
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      // Optionally show an error toast if logout fails
      toast.error(error.message || 'Logout failed.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-full md:w-64 bg-white shadow-xl border-r border-gray-100 z-10 transition-all duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          <button className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => document.querySelector('.md\\:w-64').classList.toggle('hidden')}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
            onClick={() => setActiveSection('export')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${
              activeSection === 'export'
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Data
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">
              {activeSection === 'projects' ? 'Projects' : 'Export Data'}
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
          {activeSection === 'projects' ? (
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Management</h3>
              <p className="text-gray-600 mb-6">
                This is the projects section of the admin dashboard. Here you can manage all projects.
              </p>
              <div className="flex justify-end mb-4">
                <button
                  disabled={true}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow opacity-50 cursor-not-allowed"
                >
                  Submit All Projects
                </button>
              </div>
              <ProjectList onProjectsLoaded={setProjects} />
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
              <p className="text-gray-600">
                This is the export section of the admin dashboard. Here you can export data in various formats.
              </p>
              <div className="mt-6 space-y-4">
                <ExportCSVButton projects={projects} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
