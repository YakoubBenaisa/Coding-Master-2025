import React, { useState, useEffect } from 'react';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusOptions] = useState(['Processing', 'Rejected', 'Directed']); // Mock options
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which project is being updated

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const response = await fetch('https://5138-41-111-220-41.ngrok-free.app/api/add-project', {
          method: 'PATCH',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Data:', data);
        setProjects(data.projects);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatus(id);

      const updated = projects.map(project =>
        project.id === id ? { ...project, status: newStatus } : project
      );
      setProjects(updated);

      const response = await fetch(`https://5138-41-111-220-41.ngrok-free.app/api/update-status/${id}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Status update failed: ${response.status}`);
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) return <p className="p-4">Loading projects...</p>;

  return (
    <div className="project-list p-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Project List</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Create Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.owner_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(project.create_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      disabled={updatingStatus === project.id}
                      className="border rounded p-1 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {updatingStatus === project.id && (
                      <span className="ml-2 text-indigo-500 animate-spin">⏳</span>
                    )}
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
  );
}
