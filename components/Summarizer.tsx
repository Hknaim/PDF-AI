
import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';
import Loader from './Loader';

const Summarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = useCallback(async () => {
    if (!inputText) {
      setError('Please enter some text to summarize.');
      return;
    }
    setError('');
    setSummary('');
    setIsLoading(true);
    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Text Summarizer</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Paste your text below and let the AI provide a concise summary.</p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your article, report, or any long text here..."
          className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-y"
          disabled={isLoading}
        />
        
        <button
          onClick={handleSummarize}
          disabled={isLoading}
          className="mt-4 w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? 'Summarizing...' : 'Summarize Text'}
        </button>

        {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}

        {(isLoading || summary) && (
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Summary</h3>
            {isLoading ? (
              <Loader message="Generating summary..." />
            ) : (
              <div className="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-md whitespace-pre-wrap text-slate-700 dark:text-slate-300 animate-fade-in">
                {summary}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
