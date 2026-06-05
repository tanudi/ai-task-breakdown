const COMPLEXITY_CLASS = { low: 'badge--low', medium: 'badge--medium', high: 'badge--high' };

export default function TaskCard({ task, index }) {
  const estimate = task.estimate ?? task.estimatedTime;

  return (
    <div className="task-card">
      <div className="task-card__header">
        <span className="task-number">{index + 1}</span>
        <h3 className="task-title">{task.title}</h3>
        {task.complexity && (
          <span className={`badge ${COMPLEXITY_CLASS[task.complexity] ?? ''}`}>
            {task.complexity.charAt(0).toUpperCase() + task.complexity.slice(1)}
          </span>
        )}
      </div>
      <p className="task-description">{task.description}</p>
      {task.subtasks?.length > 0 && (
        <ul className="subtask-list">
          {task.subtasks.map((sub, i) => (
            <li key={i} className="subtask-item">
              <span className="subtask-bullet" aria-hidden="true">›</span>
              {sub}
            </li>
          ))}
        </ul>
      )}
      {estimate && (
        <p className="task-estimate">
          <span className="estimate-label">Estimated time:</span> {estimate}
        </p>
      )}
    </div>
  );
}
