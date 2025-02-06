import React from 'react';

function ExamListItem({ exam, onEdit, onDelete }) {
  return (
    <div className="bg-input p-4 rounded-lg border border-border transition-all hover:border-primary">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="text-lg font-semibold text-white flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: exam.examColour || '#ffffff' }}
            ></span>
            <div>
              <div>{exam.timeOfDay}</div>
              <div>{exam.subject}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(exam.examDate).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onEdit(exam)}
            className="px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(exam.id)}
            className="px-3 py-1.5 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamListItem;