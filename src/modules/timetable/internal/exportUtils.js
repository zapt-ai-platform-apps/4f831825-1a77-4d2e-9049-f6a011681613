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
    // Dynamically import jsPDF and autotable
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    // Create landscape document for better calendar layout
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('UpGrade Revision Timetable', 14, 20);
    
    // Get array of dates with data
    const sortedDates = Object.keys(datesWithData)
      .filter(date => {
        const data = datesWithData[date];
        return (data.sessions && data.sessions.length > 0) || 
               (data.exams && data.exams.length > 0);
      })
      .sort();
    
    if (sortedDates.length === 0) {
      doc.setFontSize(12);
      doc.text('No timetable data available.', 14, 30);
      doc.save('upgrade-timetable.pdf');
      return true;
    }
    
    // Group by month for better organization
    const monthGroups = {};
    sortedDates.forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(date);
    });
    
    let currentY = 30;
    
    // Process each month
    for (const [monthKey, datesInMonth] of Object.entries(monthGroups)) {
      // Get first date of month to determine calendar structure
      const monthDate = new Date(`${monthKey}-01`);
      const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      // Add month header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(monthName, 14, currentY);
      currentY += 8;
      
      // Create calendar data for this month
      const calendarData = createCalendarData(monthDate, datesWithData);
      
      // Create calendar table
      doc.autoTable({
        startY: currentY,
        head: [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
        body: calendarData,
        theme: 'grid',
        styles: {
          cellPadding: 2,
          fontSize: 8,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [78, 205, 196],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fillColor: [245, 245, 245] }, // Sunday
          6: { fillColor: [245, 245, 245] }  // Saturday
        },
        willDrawCell: function(data) {
          // Customize cell appearance
          if (data.section === 'body') {
            try {
              // Get cell text content
              const cellText = data.cell.text;
              
              // If it's an empty cell or just containing day number
              if (!cellText || cellText.length <= 1) {
                return;
              }
              
              // Extract day number (always the first item)
              const dayNumber = cellText[0];
              
              // Clear existing text - we'll redraw everything manually
              data.cell.text = [];
              
              // Draw white background to ensure clean slate
              doc.setFillColor(255, 255, 255);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
              
              // Draw day number
              doc.setFontSize(10);
              doc.setTextColor(100, 100, 100);
              doc.text(dayNumber, data.cell.x + 2, data.cell.y + 5);
              
              // Draw session and exam blocks
              let blockY = data.cell.y + 8;
              for (let i = 1; i < cellText.length; i++) {
                const item = cellText[i];
                
                // Check if this is an exam
                if (item.startsWith('[EXAM]')) {
                  const examText = item.replace('[EXAM]', '').trim();
                  
                  // Draw exam block with lighter red background
                  doc.setFillColor(255, 200, 200); // Lighter red background
                  doc.roundedRect(data.cell.x + 2, blockY, data.cell.width - 4, 6, 1, 1, 'F');
                  
                  doc.setFontSize(7);
                  doc.setTextColor(150, 0, 0); // Dark red text
                  doc.text(examText, data.cell.x + 3, blockY + 4);
                }
                // Otherwise it's a revision session
                else {
                  const sessionParts = item.split(':');
                  if (sessionParts.length >= 2) {
                    const block = sessionParts[0].trim();
                    const subject = sessionParts[1].trim();
                    
                    // Get subject color
                    let fillColor = [240, 240, 240]; // Default gray
                    if (subjectColours[subject]) {
                      try {
                        const rgb = hexToRgb(subjectColours[subject]);
                        // Make colors lighter for better readability in PDF
                        fillColor = [
                          Math.min(255, rgb.r + 60),  // Lighten red
                          Math.min(255, rgb.g + 60),  // Lighten green
                          Math.min(255, rgb.b + 60)   // Lighten blue
                        ];
                      } catch (error) {
                        console.error('Error processing color:', error);
                      }
                    }
                    
                    // Draw session block
                    doc.setFillColor(...fillColor);
                    doc.roundedRect(data.cell.x + 2, blockY, data.cell.width - 4, 6, 1, 1, 'F');
                    
                    doc.setFontSize(7);
                    doc.setTextColor(0, 0, 0); // Black text for contrast
                    doc.text(`${block}: ${subject}`, data.cell.x + 3, blockY + 4);
                  }
                }
                
                blockY += 7; // Move down for next block
              }
            } catch (error) {
              console.error('Error rendering cell:', error);
              // Don't let one cell error break the whole PDF
              // Just render the day number
              if (data.cell.text && data.cell.text.length > 0) {
                const dayNumber = data.cell.text[0];
                data.cell.text = [dayNumber];
              }
            }
          }
        }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
      
      // Add page break if needed
      if (currentY > 180) {
        doc.addPage('landscape');
        currentY = 20;
      }
    }
    
    // Add legend
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Timetable Legend', 14, 20);
    
    // Exam legend
    doc.setFillColor(255, 200, 200);
    doc.roundedRect(14, 30, 15, 8, 1, 1, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Exam', 35, 35);
    
    // Subject colors
    doc.setFontSize(14);
    doc.text('Subject Colors:', 14, 50);
    
    const subjectEntries = Object.entries(subjectColours);
    
    if (subjectEntries.length > 0) {
      // Create two columns for subject legend
      const columns = 2;
      const itemsPerColumn = Math.ceil(subjectEntries.length / columns);
      
      for (let i = 0; i < subjectEntries.length; i++) {
        const [subject, color] = subjectEntries[i];
        const column = Math.floor(i / itemsPerColumn);
        const row = i % itemsPerColumn;
        
        const x = 14 + column * 140;
        const y = 60 + row * 10;
        
        try {
          const rgb = hexToRgb(color);
          
          // Draw color swatch with lighter color
          doc.setFillColor(
            Math.min(255, rgb.r + 60),
            Math.min(255, rgb.g + 60),
            Math.min(255, rgb.b + 60)
          );
          doc.roundedRect(x, y, 15, 8, 1, 1, 'F');
          
          // Draw subject name
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(subject, x + 20, y + 5);
        } catch (error) {
          console.error(`Error rendering legend for ${subject}:`, error);
        }
      }
    } else {
      doc.setFontSize(10);
      doc.text('No subjects defined.', 14, 60);
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on ${format(new Date(), 'MMM dd, yyyy')} by UpGrade`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
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

// Helper function to create calendar data structure for a month
function createCalendarData(monthDate, datesWithData) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // Determine first day of month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();
  
  // Determine last day of month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Create weeks array (up to 6 weeks in a month)
  const weeks = [];
  let currentWeek = Array(7).fill('');
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek[i] = '';
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
    
    // Format date string (YYYY-MM-DD)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Get calendar content for this date
    const content = getCalendarCellContent(day, dateStr, datesWithData);
    
    // Add to current week
    currentWeek[dayOfWeek] = content;
    
    // Start new week if this is the last day of the week
    if (dayOfWeek === 6) {
      weeks.push([...currentWeek]);
      currentWeek = Array(7).fill('');
    }
  }
  
  // Add the last week if it's not complete
  if (currentWeek.some(day => day !== '')) {
    weeks.push([...currentWeek]);
  }
  
  return weeks;
}

// Helper function to get cell content for a specific date
function getCalendarCellContent(day, dateStr, datesWithData) {
  // Start with the day number
  const content = [String(day)];
  
  // Get data for this date
  const dayData = datesWithData[dateStr];
  if (!dayData) {
    return content;
  }
  
  // Add exams
  if (dayData.exams && dayData.exams.length > 0) {
    dayData.exams.forEach(exam => {
      content.push(`[EXAM] ${exam.timeOfDay || 'Morning'}: ${exam.subject}`);
    });
  }
  
  // Add sessions
  if (dayData.sessions && dayData.sessions.length > 0) {
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    
    // Sort sessions by block
    const sortedSessions = [...dayData.sessions]
      .sort((a, b) => blockOrder[a.block] - blockOrder[b.block]);
    
    sortedSessions.forEach(session => {
      content.push(`${session.block}: ${session.subject}`);
    });
  }
  
  return content;
}

// Helper function to convert hex color to RGB with enhanced error handling
function hexToRgb(hex) {
  // Check if hex is a valid color
  if (!hex || typeof hex !== 'string') {
    return { r: 240, g: 240, b: 240 }; // Default to light gray
  }
  
  try {
    hex = hex.replace(/^#/, '');
    
    // Handle shorthand hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Validate hex format
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return { r: 240, g: 240, b: 240 }; // Default to light gray
    }
    
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
  } catch (error) {
    console.error('Error parsing hex color:', error);
    return { r: 240, g: 240, b: 240 }; // Default to light gray
  }
}