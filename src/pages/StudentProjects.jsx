import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import useAuthStore from '../store/authStore';
import { studentAPI } from '../services/api';

export default function StudentProjects() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainingPrograms, setTrainingPrograms] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getStudentProjects();
        setProjects(response.data);

        // Fetch training program details for projects directed to interfaces
        const directedProjects = response.data.filter(project =>
          project.status.includes('Directed to Interface')
        );

        const programsData = {};
        await Promise.all(
          directedProjects.map(async (project) => {
            try {
              const programResponse = await studentAPI.getTrainingProgram(project.id);
              if (programResponse.data) {
                programsData[project.id] = programResponse.data;
              }
            } catch (err) {
              console.error(`Error fetching training program for project ${project.id}:`, err);
            }
          })
        );

        setTrainingPrograms(programsData);
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const downloadAsPDF = (project) => {
    const doc = new jsPDF();

    // Set font size and add title
    doc.setFontSize(18);
    doc.text(`Project: ${project.title}`, 20, 20);

    // Set smaller font for content
    doc.setFontSize(12);

    // Add project details
    doc.text(`Status: ${project.status}`, 20, 35);
    doc.text(`Description:`, 20, 45);

    // Handle long descriptions with text wrapping
    const splitDescription = doc.splitTextToSize(project.description, 170);
    doc.text(splitDescription, 20, 55);

    // Calculate y position after description
    let yPos = 55 + (splitDescription.length * 7);

    // Add team members section
    doc.setFontSize(14);
    doc.text('Team Members:', 20, yPos + 10);
    doc.setFontSize(12);

    yPos += 20;
    project.teamMembers.forEach(member => {
      doc.text(`ID: ${member.id}`, 25, yPos);
      doc.text(`Name: ${member.name}`, 25, yPos + 7);
      doc.text(`Email: ${member.email}`, 25, yPos + 14);
      doc.text(`Phone: ${member.phone}`, 25, yPos + 21);
      yPos += 30;
    });

    // Add training program info if available
    if (trainingPrograms[project.id]) {
      const program = trainingPrograms[project.id];
      doc.setFontSize(14);
      doc.text('Training Program Details:', 20, yPos);
      doc.setFontSize(12);
      doc.text(`Training Date: ${new Date(program.trainingDate).toLocaleDateString()}`, 25, yPos + 10);
      doc.text(`Location: ${program.location}`, 25, yPos + 17);
      doc.text(`Duration: ${program.duration}`, 25, yPos + 24);
    }

    // Save the PDF
    doc.save(`project-${project.id}-details.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You don't have any projects yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h2>
                      <div className={`inline-block px-3 py-1 mb-3 text-sm font-medium rounded-full ${project.status.includes('Directed') ? 'bg-green-100 text-green-800' : project.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {project.status}
                      </div>
                    </div>
                    <button
                      onClick={() => downloadAsPDF(project)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download as PDF
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">{project.description}</p>

                  {/* Training Program Link */}
                  {project.status.includes('Directed to Interface') && trainingPrograms[project.id] && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">Training Program</h3>
                      <a
                        href={trainingPrograms[project.id].pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Training Program Details
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        Training Date: {new Date(trainingPrograms[project.id].trainingDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Team Members */}
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-2">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.teamMembers.map((member) => (
                        <div key={member.id} className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-600">ID: {member.id}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-600">{member.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
