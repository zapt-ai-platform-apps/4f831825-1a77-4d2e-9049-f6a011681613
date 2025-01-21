import React from 'react';

function ExamListItem({ exam, onEdit, onDelete }) {
  return (
    <div className="bg-input p-4 rounded-lg border border-border transition-all hover:border-primary">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-white">{exam.subject}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(exam.examDate).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
          <div className="mt-2 space-x-2">
            <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
              {exam.timeOfDay}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(exam)}
            className="px-3 py-1 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(exam.id)}
            className="px-3 py-1 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamListItem;