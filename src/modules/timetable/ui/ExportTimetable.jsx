import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import { exportToPdf, exportToExcel } from '../internal/exportUtils';
import * as Sentry from '@sentry/browser';

/**
 * Component for exporting timetable to different formats
 * @param {Object} props - Component props
 * @param {Object} props.datesWithData - Timetable data by date
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Export timetable component
 */
function ExportTimetable({ datesWithData, subjectColours }) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  /**
   * Handle export action
   * @param {string} type - Export type ('pdf' or 'excel')
   */
  const handleExport = async (type) => {
    if (exporting) return; // Prevent multiple clicks
    
    try {
      setExporting(true);
      setExportType(type);
      
      // Check if there's any data to export
      const hasData = Object.values(datesWithData).some(
        data => (data.sessions && data.sessions.length > 0) || (data.exams && data.exams.length > 0)
      );
      
      if (!hasData) {
        alert('No data to export. Please generate a timetable first.');
        return;
      }
      
      // Perform export based on type
      if (type === 'pdf') {
        await exportToPdf(datesWithData, subjectColours);
      } else if (type === 'excel') {
        await exportToExcel(datesWithData, subjectColours);
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      Sentry.captureException(error);
      alert(`Failed to export timetable. Please try again.`);
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="mt-4 mb-2 px-2">
      <h3 className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        <FaDownload className="inline mr-1" /> Export Your Timetable
      </h3>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all duration-200"
        >
          {exporting && exportType === 'pdf' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : (
            <>
              <FaFilePdf className="mr-2" /> Export to PDF
            </>
          )}
        </button>
        <button 
          onClick={() => handleExport('excel')}
          disabled={exporting}
          className="w-full sm:w-auto px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all duration-200"
        >
          {exporting && exportType === 'excel' ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : (
            <>
              <FaFileExcel className="mr-2" /> Export to Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ExportTimetable;