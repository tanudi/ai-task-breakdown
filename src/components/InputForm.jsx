import { useState } from 'react';
import { getTaskBreakdown } from '../services/claude';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'General'];

export default function InputForm({ onResult, onError, onLoadingChange }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const description = form.description.value.trim();
    const language = form.language.value;
    if (!description) return;

    setIsLoading(true);
    onLoadingChange?.(true);
    try {
      const data = await getTaskBreakdown(description, language);
      onResult(data);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="description" className="form-label">Project or feature description</label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          placeholder="e.g. Build a user authentication system with email/password login, JWT tokens, and a password reset flow..."
          rows={6}
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <div className="form-group form-group--language">
          <label htmlFor="language" className="form-label">Language / context</label>
          <select id="language" name="language" className="form-select" disabled={isLoading}>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Thinking…
            </>
          ) : (
            'Break it down'
          )}
        </button>
      </div>
    </form>
  );
}
