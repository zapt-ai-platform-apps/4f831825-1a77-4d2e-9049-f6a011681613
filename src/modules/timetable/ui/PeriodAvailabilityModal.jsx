import React, { useState } from 'react';
import { makeAuthenticatedRequest, handleApiResponse } from '@/modules/core/api';
import * as Sentry from '@sentry/browser';

/**
 * Modal component for setting period-specific availability
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSave - Function to call after saving
 * @param {Array} props.existingPeriods - Existing period availability settings
 * @returns {React.ReactElement} Period availability modal
 */
function PeriodAvailabilityModal({ onClose, onSave, existingPeriods = [] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState({
    monday: { Morning: true, Afternoon: true, Evening: true },
    tuesday: { Morning: true, Afternoon: true, Evening: true },
    wednesday: { Morning: true, Afternoon: true, Evening: true },
    thursday: { Morning: true, Afternoon: true, Evening: true },
    friday: { Morning: true, Afternoon: true, Evening: true },
    saturday: { Morning: true, Afternoon: true, Evening: true },
    sunday: { Morning: true, Afternoon: true, Evening: true }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const handleAvailabilityChange = (day, block) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [block]: !prev[day][block]
      }
    }));
  };

  const handleSave = async () => {
    try {
      if (!startDate || !endDate) {
        setError('Please set both start and end dates');
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start date must be before end date');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Convert availability object to array format for API
      const availabilityArray = [];
      for (const [day, blocks] of Object.entries(availability)) {
        for (const [block, isAvailable] of Object.entries(blocks)) {
          availabilityArray.push({
            dayOfWeek: day,
            block,
            isAvailable
          });
        }
      }
      
      const response = await makeAuthenticatedRequest('/api/setPeriodAvailability', {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          availability: availabilityArray
        })
      });
      
      await handleApiResponse(response, 'Setting period availability');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error setting period availability:', error);
      Sentry.captureException(error);
      setError(error.message || 'Failed to set period availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingPeriod = (period) => {
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    
    // Convert period settings to availability object
    const newAvailability = { ...availability };
    
    // First reset all to true
    for (const day of Object.keys(newAvailability)) {
      for (const block of Object.keys(newAvailability[day])) {
        newAvailability[day][block] = true;
      }
    }
    
    // Then apply the specific settings
    period.settings.forEach(setting => {
      if (newAvailability[setting.dayOfWeek] && 
          newAvailability[setting.dayOfWeek][setting.block] !== undefined) {
        newAvailability[setting.dayOfWeek][setting.block] = setting.isAvailable;
      }
    });
    
    setAvailability(newAvailability);
    setSelectedPeriod(period);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Set Period Availability</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 cursor-pointer"
            >
              &times;
            </button>
          </div>
          
          {existingPeriods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Existing Periods</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {existingPeriods.map((period, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectExistingPeriod(period)}
                    className={`p-2 border rounded text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition
                    ${selectedPeriod && period.startDate === selectedPeriod.startDate && period.endDate === selectedPeriod.endDate
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <p className="font-medium text-sm">
                      {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {period.settings.filter(s => !s.isAvailable).length} unavailable blocks
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Date Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 box-border border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 box-border border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Availability</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Uncheck blocks when you're NOT available during this period
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(availability).map(([day, blocks]) => (
                <div key={day} className="border dark:border-gray-700 rounded p-3">
                  <h4 className="font-medium mb-2 capitalize text-gray-800 dark:text-white">{day}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(blocks).map(([block, isAvailable]) => (
                      <label 
                        key={`${day}-${block}`} 
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={() => handleAvailabilityChange(day, block)}
                          className="mr-1.5"
                        />
                        <span className="text-sm dark:text-gray-300">{block}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary/90 dark:hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeriodAvailabilityModal;