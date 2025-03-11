import { format, parseISO } from 'date-fns';
import * as Sentry from '@sentry/browser';

/**
 * Exports timetable data to PDF
 * @param {Object} datesWithData - Timetable data by date
 * @param {Object} subjectColours - Subject color mapping
 * @returns {Promise<void>}
 */
export async function exportToPdf(datesWithData, subjectColours) {
  try {
    // Dynamically import jsPDF to reduce initial load time
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('UpGrade Revision Timetable', 14, 22);
    
    // Get array of dates sorted chronologically
    const sortedDates = Object.keys(datesWithData)
      .filter(date => datesWithData[date].sessions.length > 0 || datesWithData[date].exams.length > 0)
      .sort();
    
    // Prepare table data
    const tableData = [];
    
    sortedDates.forEach(date => {
      const dayData = datesWithData[date];
      const formattedDate = format(parseISO(date), 'MMM dd, yyyy');
      
      // Add exams
      if (dayData.exams && dayData.exams.length > 0) {
        dayData.exams.forEach(exam => {
          tableData.push([
            formattedDate,
            exam.timeOfDay,
            'EXAM: ' + exam.subject,
            exam.board || '-'
          ]);
        });
      }
      
      // Add sessions sorted by block order
      if (dayData.sessions && dayData.sessions.length > 0) {
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        const sortedSessions = [...dayData.sessions].sort(
          (a, b) => blockOrder[a.block] - blockOrder[b.block]
        );
        
        sortedSessions.forEach(session => {
          const timeInfo = session.startTime && session.endTime 
            ? `${session.startTime.slice(0, 5)} - ${session.endTime.slice(0, 5)}`
            : '-';
          
          tableData.push([
            formattedDate,
            session.block,
            session.subject,
            timeInfo
          ]);
        });
      }
    });
    
    // Create table with styling
    doc.autoTable({
      head: [['Date', 'Block', 'Subject', 'Time/Details']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 107, 107] }, // Primary color
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Add footer with generation date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generated on ${format(new Date(), 'MMM dd, yyyy')} by UpGrade`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save('upgrade-timetable.pdf');
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Exports timetable data to Excel
 * @param {Object} datesWithData - Timetable data by date
 * @param {Object} subjectColours - Subject color mapping
 * @returns {Promise<void>}
 */
export async function exportToExcel(datesWithData, subjectColours) {
  try {
    // Dynamically import xlsx to reduce initial load time
    const XLSX = await import('xlsx');
    
    // Get array of dates sorted chronologically
    const sortedDates = Object.keys(datesWithData)
      .filter(date => datesWithData[date].sessions.length > 0 || datesWithData[date].exams.length > 0)
      .sort();
    
    // Prepare worksheet data
    const wsData = [
      ['Date', 'Block', 'Subject', 'Time/Details', 'Type', 'Status']
    ];
    
    sortedDates.forEach(date => {
      const dayData = datesWithData[date];
      const formattedDate = format(parseISO(date), 'MMM dd, yyyy');
      
      // Add exams sorted by time of day
      if (dayData.exams && dayData.exams.length > 0) {
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        const sortedExams = [...dayData.exams].sort(
          (a, b) => blockOrder[a.timeOfDay || 'Morning'] - blockOrder[b.timeOfDay || 'Morning']
        );
        
        sortedExams.forEach(exam => {
          wsData.push([
            formattedDate,
            exam.timeOfDay || 'Morning',
            exam.subject,
            exam.board || '-',
            'Exam',
            ''
          ]);
        });
      }
      
      // Add sessions sorted by block
      if (dayData.sessions && dayData.sessions.length > 0) {
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        const sortedSessions = [...dayData.sessions].sort(
          (a, b) => blockOrder[a.block] - blockOrder[b.block]
        );
        
        sortedSessions.forEach(session => {
          const timeInfo = session.startTime && session.endTime 
            ? `${session.startTime.slice(0, 5)} - ${session.endTime.slice(0, 5)}`
            : '-';
          
          wsData.push([
            formattedDate,
            session.block,
            session.subject,
            timeInfo,
            'Revision',
            session.isComplete ? 'Completed' : 'Pending'
          ]);
        });
      }
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add column widths
    const cols = [
      { wch: 15 }, // Date
      { wch: 10 }, // Block
      { wch: 20 }, // Subject
      { wch: 20 }, // Time/Details
      { wch: 10 }, // Type
      { wch: 10 }  // Status
    ];
    ws['!cols'] = cols;
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    
    // Write file and trigger download
    XLSX.writeFile(wb, 'upgrade-timetable.xlsx');
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    Sentry.captureException(error);
    throw error;
  }
}