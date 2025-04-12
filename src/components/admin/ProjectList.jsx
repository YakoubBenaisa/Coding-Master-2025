import React, { useState, useEffect } from 'react';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Perform the fetch call.
        const response = await fetch('https://5138-41-111-220-41.ngrok-free.app/api/add-project', {
          method: 'PATCH',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if the HTTP status is OK.
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert response body to JSON.
        const data = await response.json();
        
        // Optionally, log the JSON data to verify its structure.
        console.log('Fetched Data:', data);

        // Assuming your API returns an object that contains a "projects" array.
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{project.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.owner_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.create_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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
