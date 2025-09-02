
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Loader from './Loader';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setError('');
    setImageUrl('');
    setIsLoading(true);
    try {
      const resultUrl = await generateImage(prompt);
      setImageUrl(resultUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">AI Image Generator</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Describe the image you want to create. Be as specific as you like.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cute cat astronaut floating in space"
            className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? 'Creating...' : 'Generate Image'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Result</h3>
          <div className="w-full aspect-square bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
            {isLoading ? (
              <Loader message="AI is painting..." />
            ) : imageUrl ? (
              <img src={imageUrl} alt={prompt} className="w-full h-full object-contain rounded-lg animate-fade-in" />
            ) : (
              <p className="text-slate-500">Your generated image will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
