import { useState } from 'react';

export default function ExportCSVButton({ projects }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    // Debug: Log the projects data to help diagnose issues
    console.log('Projects data for CSV export:', projects);
    try {
      setIsExporting(true);

      // Create CSV headers
      const headers = "Project ID,Project Title,Description,Owner ID,Create Date,Status\n";

      // Create CSV rows
      const rows = projects.map(project => {
        // Escape any commas in the title or description to prevent CSV format issues
        const safeTitle = project.title ? project.title.replace(/,/g, ' ') : '';
        const safeDescription = project.description ? project.description.replace(/,/g, ' ') : '';

        // Format the date if it exists
        const createDate = project.create_date ? new Date(project.create_date).toLocaleDateString() : '';

        return `"${project.id || ''}","${safeTitle}","${safeDescription}","${project.owner_id || ''}","${createDate}","${project.status || ''}"`;
      }).join('\n');

      // Combine headers and rows
      const csvContent = headers + rows;

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Set link properties
      link.href = url;
      link.setAttribute('download', `projects_export_${new Date().toISOString().slice(0, 10)}.csv`);

      // Append to document, trigger click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Provide more detailed error information
      console.error('Projects data that caused the error:', projects);
      alert(`Failed to export CSV: ${error.message}. Please check the console for details.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={isExporting || !projects || projects.length === 0}
      className={`
        flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm
        ${isExporting || !projects || projects.length === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow transform hover:scale-105'
        }
        transition-all duration-200
      `}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Export as CSV
        </>
      )}
    </button>
  );
}
