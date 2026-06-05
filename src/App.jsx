import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsPanel from './components/ResultsPanel';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState(null);

  function handleResult(data) {
    setResult(data);
    setError(null);
    setHasSubmitted(true);
  }

  function handleError(message) {
    setError(message);
    setResult(null);
    setHasSubmitted(true);
  }

  return (
    <div className="app">
      <Header />
      <main className="main">
        <InputForm
          onResult={handleResult}
          onError={handleError}
          onLoadingChange={setIsLoading}
        />
        <ResultsPanel
          result={result}
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
        />
      </main>
    </div>
  );
}
