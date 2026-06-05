import TaskCard from './TaskCard';

export default function ResultsPanel({ result, isLoading, hasSubmitted, error }) {
  if (isLoading) {
    return (
      <section className="results-panel results-panel--loading">
        <div className="loading-state">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
          <p className="loading-text">Breaking down your project…</p>
        </div>
      </section>
    );
  }

  if (!hasSubmitted) {
    return (
      <section className="results-panel results-panel--empty">
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p className="empty-text">Your tasks will appear here</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="results-panel results-panel--empty">
        <div className="error-state">
          <span className="empty-icon">⚠️</span>
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="results-panel">
      {result.complexity && (
        <div className="complexity-block">
          <div className="complexity-header">
            <span className={`complexity-badge complexity-badge--${result.complexity.level.toLowerCase()}`}>
              {result.complexity.level}
            </span>
            <span className="complexity-score">Score: {result.complexity.score}</span>
          </div>
          <p className="complexity-recommendation">{result.complexity.recommendation}</p>
        </div>
      )}

      <p className="results-summary">{result.summary}</p>

      <div className="results-header">
        <h2 className="results-title">Breakdown</h2>
        <span className="results-count">{result.tasks.length} tasks</span>
      </div>

      <div className="task-list">
        {result.tasks.map((task, i) => (
          <TaskCard key={i} task={task} index={i} />
        ))}
      </div>

      <p className="results-footer">
        <span className="estimate-label">Total estimate:</span> {result.totalEstimate}
      </p>
    </section>
  );
}
