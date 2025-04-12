import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { studentAPI } from '../services/api';
import EditProjectModal from '../components/projects/EditProjectModal';

export default function StudentProjects() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingProject, setSubmittingProject] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [projectToSubmit, setProjectToSubmit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        if (!user) {
          setError('User session not found. Please log in again.');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
          return;
        }

        const response = await studentAPI.getStudentProjects();
        setProjects(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, logout, navigate]);

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

    // Add student information if available
    if (user) {
      doc.text(`Student: ${user.firstname || ''} ${user.lastname || ''}`, 20, 30);
      doc.text(`Email: ${user.email || 'N/A'}`, 20, 37);
      doc.text(`Phone: ${user.phone || 'N/A'}`, 20, 44);
    }

    // Add status color indicator
    let statusColor;
    if (project.status.includes('Directed')) {
      statusColor = [0, 128, 0]; // Green
    } else if (project.status === 'Rejected') {
      statusColor = [220, 0, 0]; // Red
    } else if (project.status === 'Processing') {
      statusColor = [255, 165, 0]; // Orange
    } else {
      statusColor = [0, 0, 255]; // Blue
    }
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);

    // Add project details
    doc.text(`Status: ${project.status}`, 20, 55);
    doc.setTextColor(0, 0, 0); // Reset text color to black
    doc.text(`Submission Status: ${project.submitted ? 'Submitted' : 'Not Submitted'}`, 20, 62);
    if (project.submitted) {
      doc.text(`Submitted on: ${new Date(project.submitted_at).toLocaleString()}`, 20, 69);
      doc.text(`Description:`, 20, 76);

      // Handle long descriptions with text wrapping
      const splitDescription = doc.splitTextToSize(project.description, 170);
      doc.text(splitDescription, 20, 83);

      // Calculate y position after description
      let yPos = 83 + (splitDescription.length * 7);

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
    } else {
      doc.text(`Submission Deadline: ${new Date(project.submission_deadline).toLocaleString()}`, 20, 69);
      doc.text(`Description:`, 20, 76);

      // Handle long descriptions with text wrapping
      const splitDescription = doc.splitTextToSize(project.description, 170);
      doc.text(splitDescription, 20, 83);

      // Calculate y position after description
      let yPos = 83 + (splitDescription.length * 7);

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
    }

    // Add generation info at the bottom
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${today}`, pageWidth - 15, 285, { align: 'right' });

    // Save the PDF
    doc.save(`project-${project.id}-details.pdf`);
  };

  // Handle showing the confirmation dialog
  const handleSubmitClick = (project) => {
    setProjectToSubmit(project);
    setShowConfirmDialog(true);
  };

  // Handle canceling the submission
  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setProjectToSubmit(null);
  };

  // Handle confirming the submission
  const handleConfirmSubmit = async () => {
    if (!projectToSubmit) return;

    try {
      setSubmittingProject(projectToSubmit.id);
      setShowConfirmDialog(false);

      const response = await studentAPI.submitProject(projectToSubmit.id);

      // Update the project in the local state
      const updatedProjects = projects.map(p =>
        p.id === projectToSubmit.id ? response.data : p
      );

      setProjects(updatedProjects);
      toast.success('Project submitted successfully! No further changes can be made.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit project');
    } finally {
      setSubmittingProject(null);
      setProjectToSubmit(null);
    }
  };

  // Handle opening the edit modal
  const handleEditClick = (project) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
  };

  // Handle project update
  const handleProjectUpdated = (updatedProject) => {
    // Update the project in the local state
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    );

    setProjects(updatedProjects);
  };

  // Check if a project is past its deadline
  const isPastDeadline = (deadline) => {
    return new Date(deadline) < new Date();
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
            {user && (
              <p className="text-gray-600 mt-1">
                Welcome, {user.firstname || user.name || user.email}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${project.status.includes('Directed') ? 'bg-green-100 text-green-800' : project.status === 'Rejected' ? 'bg-red-100 text-red-800' : project.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {project.status}
                        </div>
                        {project.submitted ? (
                          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                            Submitted
                          </div>
                        ) : isPastDeadline(project.submission_deadline) ? (
                          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                            Deadline Passed
                          </div>
                        ) : (
                          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Not Submitted
                          </div>
                        )}
                      </div>
                      {!project.submitted && !isPastDeadline(project.submission_deadline) && (
                        <div className="text-sm text-gray-500 mb-3">
                          Deadline: {new Date(project.submission_deadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => downloadAsPDF(project)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download as PDF
                      </button>
                      {!project.submitted && !isPastDeadline(project.submission_deadline) && (
                        <>
                          <button
                            onClick={() => handleEditClick(project)}
                            className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Project
                          </button>
                          <button
                            onClick={() => handleSubmitClick(project)}
                            disabled={submittingProject === project.id}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center disabled:bg-green-300 disabled:cursor-not-allowed"
                          >
                            {submittingProject === project.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Submit Project
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{project.description}</p>



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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Project Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit this project? Once submitted, <span className="font-bold">no further changes</span> can be made.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Yes, Submit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && projectToEdit && (
        <EditProjectModal
          project={projectToEdit}
          onClose={handleCloseEditModal}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
}
