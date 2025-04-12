import { useState, useEffect } from 'react';
import { tasksAPI } from '../../services/api';

export default function ProjectList({ onProjectsLoaded }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which project is being updated
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch projects and statuses in parallel
        const [projectsResponse, statusesResponse] = await Promise.all([
          tasksAPI.getTasks(),
          tasksAPI.getStatuses()
        ]);

        // Add mock team members since the original data doesn't have them
        const projectsWithTeamMembers = projectsResponse.data.map(project => ({
          ...project,
          teamMembers: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
          ]
        }));

        setProjects(projectsWithTeamMembers);
        setStatusOptions(statusesResponse.data);
        setError(null);

        // Notify parent component about loaded projects
        if (onProjectsLoaded) {
          onProjectsLoaded(projectsWithTeamMembers);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onProjectsLoaded]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatus(id);

      // Get the current project data
      const project = projects.find(p => p.id === id);

      // Call the API to update the status
      await tasksAPI.updateTask(id, {
        title: project.title,
        description: project.description,
        status: newStatus
      });

      // Update the local state with the new status
      const updatedProjects = projects.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      );

      setProjects(updatedProjects);

      // Notify parent component about updated projects
      if (onProjectsLoaded) {
        onProjectsLoaded(updatedProjects);
      }

      // Clear any previous errors
      setError(null);
    } catch (err) {
      setError(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
        <h3 className="text-lg font-medium text-gray-900">Projects</h3>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full border-collapse min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-white">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Team Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.title}</div>
                    <div className="text-sm text-gray-500">{project.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 border-2 border-white"
                          title={member.name}
                        >
                          <span className="text-xs font-medium text-gray-800">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : project.status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : project.status.includes('Directed')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>

                      <div className="flex items-center space-x-2">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          disabled={updatingStatus === project.id}
                          className="border rounded p-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:bg-gray-50 transition-colors duration-150 cursor-pointer w-full"
                        >
                          {statusOptions.length > 0 ? (
                            statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))
                          ) : (
                            <option value="">Loading statuses...</option>
                          )}
                        </select>

                        {updatingStatus === project.id && (
                          <svg className="animate-spin h-4 w-4 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
