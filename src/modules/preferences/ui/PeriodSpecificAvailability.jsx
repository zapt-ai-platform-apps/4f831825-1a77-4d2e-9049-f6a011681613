import React, { useState } from 'react';
import { FaTrash, FaEdit, FaPlus, FaClone } from 'react-icons/fa';

/**
 * Component for managing period-specific availability
 * @param {Object} props - Component props
 * @param {Array} props.periodSpecificAvailability - Period-specific availability data
 * @param {Function} props.onAdd - Function to add a new period
 * @param {Function} props.onRemove - Function to remove a period
 * @param {Function} props.onUpdate - Function to update a period
 * @param {Function} props.onBlockSelection - Function to toggle a block for a period
 * @returns {React.ReactElement} Period-specific availability component
 */
function PeriodSpecificAvailability({ 
  periodSpecificAvailability, 
  onAdd, 
  onRemove, 
  onUpdate,
  onBlockSelection
}) {
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newPeriod, setNewPeriod] = useState({
    startDate: '',
    endDate: '',
    revisionTimes: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }
  });
  const [error, setError] = useState('');

  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleAddPeriod = () => {
    setIsAddingPeriod(true);
    setNewPeriod({
      startDate: '',
      endDate: '',
      revisionTimes: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      }
    });
    setError('');
  };

  const handleEditPeriod = (index) => {
    setEditingIndex(index);
    setNewPeriod({...periodSpecificAvailability[index]});
    setError('');
  };

  const handleDuplicatePeriod = (index) => {
    const periodToDuplicate = {...periodSpecificAvailability[index]};
    setIsAddingPeriod(true);
    setNewPeriod({
      ...periodToDuplicate,
      startDate: '',
      endDate: ''
    });
    setError('');
  };

  const handleSavePeriod = () => {
    // Validate dates
    if (!newPeriod.startDate || !newPeriod.endDate) {
      setError('Start and end dates are required');
      return;
    }

    if (new Date(newPeriod.endDate) < new Date(newPeriod.startDate)) {
      setError('End date must be after or equal to start date');
      return;
    }

    // Validate at least one block is selected
    const hasBlock = Object.values(newPeriod.revisionTimes).some(
      day => day.length > 0
    );

    if (!hasBlock) {
      setError('Select at least one revision time');
      return;
    }

    // Check if this period overlaps with existing periods (except the one being edited)
    const newStartDate = new Date(newPeriod.startDate);
    const newEndDate = new Date(newPeriod.endDate);
    
    const hasOverlap = periodSpecificAvailability.some((period, idx) => {
      if (idx === editingIndex) return false; // Skip the period being edited
      
      const periodStartDate = new Date(period.startDate);
      const periodEndDate = new Date(period.endDate);
      
      // Check for overlap
      return (
        (newStartDate <= periodEndDate && newEndDate >= periodStartDate)
      );
    });
    
    if (hasOverlap) {
      setError('This period overlaps with an existing time period. Please choose different dates.');
      return;
    }

    // Save the period
    if (editingIndex >= 0) {
      onUpdate(editingIndex, newPeriod);
      setEditingIndex(-1);
    } else {
      onAdd(newPeriod);
      setIsAddingPeriod(false);
    }
    
    setError('');
  };

  const handleCancel = () => {
    setIsAddingPeriod(false);
    setEditingIndex(-1);
    setError('');
  };

  const handleDateChange = (field, value) => {
    setNewPeriod({
      ...newPeriod,
      [field]: value
    });
  };

  const handleBlockToggle = (day, block) => {
    const dayBlocks = newPeriod.revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);
    
    setNewPeriod({
      ...newPeriod,
      revisionTimes: {
        ...newPeriod.revisionTimes,
        [day]: hasBlock
          ? dayBlocks.filter((b) => b !== block)
          : [...dayBlocks, block],
      },
    });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">
        Period-Specific Availability
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Set different availability for specific time periods (e.g., during holidays or busy weeks)
      </p>

      {/* List of existing periods */}
      {periodSpecificAvailability.length > 0 && (
        <div className="space-y-3 mb-4">
          {periodSpecificAvailability.map((period, index) => (
            <div 
              key={index} 
              className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              {editingIndex === index ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="mb-2 sm:mb-0 sm:w-1/2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newPeriod.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full p-2 border box-border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:w-1/2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newPeriod.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full p-2 border box-border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {daysOfWeek.map((day) => (
                        <div key={day}>
                          <p className="font-semibold mb-1 capitalize text-gray-700 dark:text-gray-300">{day}</p>
                          <div className="flex flex-wrap gap-2">
                            {timeBlocks.map((block) => (
                              <button
                                key={block}
                                className={`btn px-3 py-1 cursor-pointer ${
                                  newPeriod.revisionTimes[day].includes(block)
                                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => handleBlockToggle(day, block)}
                              >
                                {block}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <div className="flex justify-end space-x-2 mt-2">
                    <button 
                      onClick={handleCancel}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSavePeriod}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {formatDate(period.startDate)} to {formatDate(period.endDate)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Customized availability for this period
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDuplicatePeriod(index)}
                        className="p-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
                        aria-label="Duplicate period"
                        title="Duplicate period"
                      >
                        <FaClone />
                      </button>
                      <button
                        onClick={() => handleEditPeriod(index)}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        aria-label="Edit period"
                        title="Edit period"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onRemove(index)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        aria-label="Remove period"
                        title="Remove period"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {daysOfWeek.map((day) => {
                      const dayBlocks = period.revisionTimes[day] || [];
                      if (dayBlocks.length === 0) return null;
                      
                      return (
                        <div key={day} className="text-xs">
                          <span className="font-medium capitalize">{day}:</span>{' '}
                          {dayBlocks.join(', ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form to add new period */}
      {isAddingPeriod ? (
        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Add New Time Period</h4>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-3">
            <div className="mb-2 sm:mb-0 sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newPeriod.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full p-2 border box-border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={newPeriod.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full p-2 border box-border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select available revision times for this period:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day}>
                  <p className="font-semibold mb-1 capitalize text-gray-700 dark:text-gray-300">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {timeBlocks.map((block) => (
                      <button
                        key={block}
                        className={`btn px-3 py-1 cursor-pointer ${
                          newPeriod.revisionTimes[day].includes(block)
                            ? 'bg-primary text-white dark:bg-primary dark:text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => handleBlockToggle(day, block)}
                      >
                        {block}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <div className="flex justify-end space-x-2">
            <button 
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleSavePeriod}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAddPeriod}
          className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
        >
          <FaPlus className="mr-2" />
          Add Period-Specific Availability
        </button>
      )}
    </div>
  );
}

export default PeriodSpecificAvailability;