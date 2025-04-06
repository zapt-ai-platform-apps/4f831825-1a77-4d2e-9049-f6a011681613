import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, parseISO, startOfMonth, endOfMonth, getDay, isValid, isBefore, isAfter, isSameMonth } from 'date-fns';
import { api as preferencesApi } from '../api';
import { api as examsApi } from '../../exams/api';
import * as Sentry from '@sentry/browser';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';

function AvailabilityCalendar({ preferences, onSave }) {
  const [loading, setLoading] = useState(true);
  const [savingBlock, setSavingBlock] = useState(false);
  const [exams, setExams] = useState([]);
  const [periodSpecificAvailability, setPeriodSpecificAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [error, setError] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const startDateRef = useRef(null);
  const lastExamDateRef = useRef(null);
  
  // Fetch exams and period-specific availability
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [examsData, availabilityData] = await Promise.all([
          examsApi.getExams(),
          preferencesApi.getPeriodSpecificAvailability()
        ]);
        
        setExams(examsData || []);
        setPeriodSpecificAvailability(availabilityData || []);
        
        // If preferences include a startDate, use that for initial calendar view
        if (preferences?.startDate) {
          const startDate = parseISO(preferences.startDate);
          if (isValid(startDate)) {
            startDateRef.current = startDate;
            setDisplayedMonth(startDate);
          }
        }

        // Find the latest exam date
        if (examsData && examsData.length > 0) {
          const lastExamDate = examsData.reduce((latest, exam) => {
            const examDate = parseISO(exam.examDate);
            return !latest || examDate > latest ? examDate : latest;
          }, null);
          lastExamDateRef.current = lastExamDate;
        }
      } catch (error) {
        console.error('Error fetching data for availability calendar:', error);
        Sentry.captureException(error);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [preferences]);

  // Generate calendar data whenever displayedMonth, exams, or preferences changes
  useEffect(() => {
    if (!preferences || !preferences.startDate) return;
    
    const startDate = parseISO(preferences.startDate);
    startDateRef.current = startDate;
    let lastExamDate;
    
    if (exams.length > 0) {
      // Find the latest exam date
      lastExamDate = exams.reduce((latest, exam) => {
        const examDate = parseISO(exam.examDate);
        return !latest || examDate > latest ? examDate : latest;
      }, null);
      lastExamDateRef.current = lastExamDate;
    } else {
      // Default to 30 days if no exams
      lastExamDate = addDays(startDate, 30);
      lastExamDateRef.current = lastExamDate;
    }

    if (isValid(startDate) && isValid(lastExamDate)) {
      generateCalendarData(startDate, lastExamDate);
    }
  }, [displayedMonth, exams, preferences, periodSpecificAvailability]);

  const generateCalendarData = (startDate, endDate) => {
    const calendar = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
      
      // Get default availability from preferences
      const defaultAvailability = {
        morning: preferences.revisionTimes[dayOfWeek]?.includes('Morning') || false,
        afternoon: preferences.revisionTimes[dayOfWeek]?.includes('Afternoon') || false,
        evening: preferences.revisionTimes[dayOfWeek]?.includes('Evening') || false
      };
      
      // Check if there are any exams on this day
      const examsOnDay = exams.filter(exam => exam.examDate === dateString);
      
      // Override with period-specific availability if exists
      const customAvailability = {
        morning: null,
        afternoon: null,
        evening: null
      };
      
      periodSpecificAvailability.forEach(entry => {
        const entryStartDate = parseISO(entry.startDate);
        const entryEndDate = parseISO(entry.endDate);
        
        if (
          currentDate >= entryStartDate && 
          currentDate <= entryEndDate && 
          dayOfWeek === entry.dayOfWeek.toLowerCase()
        ) {
          if (entry.block === 'Morning') {
            customAvailability.morning = entry.isAvailable;
          } else if (entry.block === 'Afternoon') {
            customAvailability.afternoon = entry.isAvailable;
          } else if (entry.block === 'Evening') {
            customAvailability.evening = entry.isAvailable;
          }
        }
      });
      
      // Create calendar day object
      calendar.push({
        date: currentDate,
        dateString,
        dayOfWeek,
        defaultAvailability,
        customAvailability,
        exams: examsOnDay
      });
      
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
    
    setCalendar(calendar);
  };

  const handlePrevMonth = () => {
    // Prevent navigating to months before the start date
    const prevMonth = new Date(displayedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    if (startDateRef.current && isBefore(startOfMonth(prevMonth), startOfMonth(startDateRef.current))) {
      // Don't allow navigation if previous month starts before the start date's month
      return;
    }
    
    setDisplayedMonth(prevMonth);
  };

  const handleNextMonth = () => {
    // Prevent navigating to months after the final exam
    const nextMonth = new Date(displayedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (lastExamDateRef.current && isAfter(startOfMonth(nextMonth), startOfMonth(lastExamDateRef.current))) {
      // Don't allow navigation if next month starts after the last exam date's month
      return;
    }
    
    setDisplayedMonth(nextMonth);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleBlockToggle = async (date, block, isCurrentlyAvailable) => {
    try {
      setSavingBlock(true);
      // Create entry for custom availability
      const newEntry = {
        startDate: format(date, 'yyyy-MM-dd'),
        endDate: format(date, 'yyyy-MM-dd'),
        dayOfWeek: format(date, 'EEEE').toLowerCase(),
        block,
        isAvailable: !isCurrentlyAvailable
      };
      
      // Save to server
      await preferencesApi.savePeriodSpecificAvailability([newEntry]);
      
      // Update local state
      setPeriodSpecificAvailability(prev => {
        // Remove existing entry for this date/block if exists
        const filtered = prev.filter(entry => 
          !(entry.startDate === newEntry.startDate && 
            entry.endDate === newEntry.endDate && 
            entry.dayOfWeek === newEntry.dayOfWeek && 
            entry.block === newEntry.block)
        );
        
        // Add new entry
        return [...filtered, newEntry];
      });
    } catch (error) {
      console.error('Error updating block availability:', error);
      Sentry.captureException(error);
      setError('Failed to update availability. Please try again.');
    } finally {
      setSavingBlock(false);
    }
  };

  // Filter calendar to only show current month
  const currentMonthDays = () => {
    const monthStart = startOfMonth(displayedMonth);
    const monthEnd = endOfMonth(displayedMonth);
    
    return calendar.filter(day => 
      day.date >= monthStart && day.date <= monthEnd
    );
  };

  // Calendar header (day names)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate day offset for first day of month
  const firstDayOffset = () => {
    const monthStart = startOfMonth(displayedMonth);
    return getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
  };

  // Check if previous month button should be disabled
  const isPrevMonthDisabled = () => {
    if (!startDateRef.current) return false;
    
    const prevMonth = new Date(displayedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    return isBefore(startOfMonth(prevMonth), startOfMonth(startDateRef.current));
  };

  // Check if next month button should be disabled
  const isNextMonthDisabled = () => {
    if (!lastExamDateRef.current) return false;
    
    const nextMonth = new Date(displayedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return isAfter(startOfMonth(nextMonth), startOfMonth(lastExamDateRef.current));
  };

  if (loading) {
    return <LoadingOverlay message="Loading your availability calendar..." />;
  }

  if (error) {
    return <div className="text-center text-destructive mt-4">{error}</div>;
  }

  return (
    <div>
      {savingBlock && <LoadingOverlay message="Saving availability changes..." />}
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Your Availability Calendar</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          Adjust your available study blocks for specific days by clicking on them. This calendar shows all days from your start date until your last exam.
        </p>
      </div>
      
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          disabled={isPrevMonthDisabled()}
          className={`bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded cursor-pointer ${
            isPrevMonthDisabled() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          &lt; Previous
        </button>
        <h4 className="text-lg font-medium">
          {format(displayedMonth, 'MMMM yyyy')}
        </h4>
        <button
          onClick={handleNextMonth}
          disabled={isNextMonthDisabled()}
          className={`bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded cursor-pointer ${
            isNextMonthDisabled() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next &gt;
        </button>
      </div>
      
      {/* Calendar legend */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
          <span className="text-xs">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded mr-1"></div>
          <span className="text-xs">Not Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-1"></div>
          <span className="text-xs">Exam</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border border-primary rounded mr-1"></div>
          <span className="text-xs">Custom Setting</span>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-7 gap-1 mb-1 p-2">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center font-medium text-sm p-1">
                {day}
              </div>
            ))}
            
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset() }).map((_, index) => (
              <div key={`offset-${index}`} className="bg-gray-100 dark:bg-gray-800 rounded min-h-[80px]"></div>
            ))}
            
            {/* Calendar days */}
            {currentMonthDays().map(day => {
              // Get effective availability for each block
              const morningAvailable = day.customAvailability.morning !== null 
                ? day.customAvailability.morning 
                : day.defaultAvailability.morning;
              
              const afternoonAvailable = day.customAvailability.afternoon !== null 
                ? day.customAvailability.afternoon 
                : day.defaultAvailability.afternoon;
                
              const eveningAvailable = day.customAvailability.evening !== null 
                ? day.customAvailability.evening 
                : day.defaultAvailability.evening;
              
              // Check for exams in each block
              const morningExam = day.exams.some(exam => exam.timeOfDay === 'Morning');
              const afternoonExam = day.exams.some(exam => exam.timeOfDay === 'Afternoon');
              const eveningExam = day.exams.some(exam => exam.timeOfDay === 'Evening');
              
              // Check for custom settings
              const hasCustomSettings = Object.values(day.customAvailability).some(val => val !== null);
              
              return (
                <div 
                  key={day.dateString} 
                  className={`border rounded p-1 cursor-pointer min-h-[80px] ${
                    selectedDate && format(selectedDate, 'yyyy-MM-dd') === day.dateString
                      ? 'border-primary dark:border-primary ring-2 ring-primary/20 dark:ring-primary/40'
                      : hasCustomSettings
                        ? 'border-primary dark:border-primary'
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className="text-xs font-semibold mb-1 flex justify-between">
                    <span>{format(day.date, 'd')}</span>
                    {day.exams.length > 0 && (
                      <span className="text-red-500">
                        {day.exams.length > 1 ? `${day.exams.length} Exams` : "Exam"}
                      </span>
                    )}
                  </div>
                  
                  {/* Show blocks */}
                  <div className="flex flex-col gap-1">
                    {/* Morning block */}
                    <div 
                      className={`text-center text-xs p-1 rounded ${
                        morningExam
                          ? 'bg-red-500 text-white'
                          : morningAvailable
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!morningExam) {
                          handleBlockToggle(day.date, 'Morning', morningAvailable);
                        }
                      }}
                    >
                      M
                    </div>
                    
                    {/* Afternoon block */}
                    <div 
                      className={`text-center text-xs p-1 rounded ${
                        afternoonExam
                          ? 'bg-red-500 text-white'
                          : afternoonAvailable
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!afternoonExam) {
                          handleBlockToggle(day.date, 'Afternoon', afternoonAvailable);
                        }
                      }}
                    >
                      A
                    </div>
                    
                    {/* Evening block */}
                    <div 
                      className={`text-center text-xs p-1 rounded ${
                        eveningExam
                          ? 'bg-red-500 text-white'
                          : eveningAvailable
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!eveningExam) {
                          handleBlockToggle(day.date, 'Evening', eveningAvailable);
                        }
                      }}
                    >
                      E
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Selected date details */}
      {selectedDate && (
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <h4 className="font-semibold mb-3 text-center">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h4>
          
          {/* Exams on this day */}
          {calendar.find(day => day.dateString === format(selectedDate, 'yyyy-MM-dd'))?.exams.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2 border-b pb-1 dark:border-gray-700">Exams on this day:</h5>
              <ul className="space-y-1">
                {calendar.find(day => day.dateString === format(selectedDate, 'yyyy-MM-dd'))?.exams.map(exam => (
                  <li key={exam.id} className="text-sm flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="font-medium">{exam.subject}</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">({exam.timeOfDay})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Block availability toggles */}
          <div>
            <h5 className="font-medium text-sm mb-2 border-b pb-1 dark:border-gray-700">Block Availability:</h5>
            
            {['Morning', 'Afternoon', 'Evening'].map(block => {
              const day = calendar.find(day => day.dateString === format(selectedDate, 'yyyy-MM-dd'));
              if (!day) return null;
              
              const blockLower = block.toLowerCase();
              const defaultAvailable = day?.defaultAvailability[blockLower] || false;
              const customAvailable = day?.customAvailability[blockLower];
              const isAvailable = customAvailable !== null ? customAvailable : defaultAvailable;
              
              // Check if there's an exam in this block
              const examInBlock = day?.exams.some(exam => exam.timeOfDay === block) || false;
              const timeInfo = preferences?.blockTimes?.[block] ? 
                `(${preferences.blockTimes[block].startTime} - ${preferences.blockTimes[block].endTime})` : '';
              
              return (
                <div key={block} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                  <span className="text-sm">{block} {timeInfo}</span>
                  
                  {examInBlock ? (
                    <span className="text-red-500 text-sm">Exam scheduled</span>
                  ) : (
                    <button
                      className={`px-3 py-1 rounded text-sm cursor-pointer ${
                        isAvailable
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleBlockToggle(selectedDate, block, isAvailable)}
                    >
                      {isAvailable ? 'Available' : 'Not Available'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Show if this is a custom setting */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {['Morning', 'Afternoon', 'Evening'].some(block => {
              const day = calendar.find(day => day.dateString === format(selectedDate, 'yyyy-MM-dd'));
              const blockLower = block.toLowerCase();
              return day?.customAvailability[blockLower] !== null;
            }) 
              ? 'This day has custom availability settings that override your default preferences'
              : 'This day is using your default weekly availability preferences'}
          </div>
        </div>
      )}
      
      {onSave && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onSave}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Go to Exams
          </button>
        </div>
      )}
    </div>
  );
}

export default AvailabilityCalendar;