import { useState } from 'react';

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when the user starts typing again
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Retrieve owner_id from localStorage; convert to number if needed
    const owner_id = JSON.parse(localStorage.getItem('user')).id;
    console.log('owner_id:', owner_id);
     
    const create_date =new Date().toISOString().split('T')[0]
    console.log('create_date:', create_date);

    // Build the payload for the API call
    const payload = {
      title: formData.title,
      description: formData.description,
      owner_id, // This sets owner_id from localStorage
      create_date 
    };

    try {
      const response = await fetch('https://5138-41-111-220-41.ngrok-free.app/api/add-project', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to get error details from the API
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Project creation failed');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      // Get the response data (if your API returns something)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setSuccess('Project created successfully!');
        console.log('Submitted project:', data);
        window.location.href = '/student';
      } else {
        setSuccess('Project created successfully!');
        console.log('Project submitted, but no JSON response received');
      }

      // Reset form after success
      setFormData({
        title: '',
        description: '',
      });
    } catch (err) {
      console.error('Error submitting project:', err);
      // Check if it's the HTML parsing error
      if (err.name === 'SyntaxError' && err.message.includes('Unexpected token')) {
        setError('Server error: The API endpoint is not responding correctly. Please try again later.');
      } else {
        setError(err.message || 'Project creation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Project</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md animate-pulse">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md">
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="md:flex md:space-x-4 space-y-6 md:space-y-0">
          <div className="flex-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project in detail..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length > 0
              ? `${formData.description.length} characters`
              : 'Add a comprehensive description for your project'}
          </p>
        </div>

        <div className="flex space-x-4 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setFormData({
                title: '',
                description: '',
              })
            }
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
