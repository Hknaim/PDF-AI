
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createDocQAChat } from '../services/geminiService';
import Loader from './Loader';
import { SendIcon } from './icons';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const DocQA: React.FC = () => {
  const [phase, setPhase] = useState<'context' | 'chat'>('context');
  const [docText, setDocText] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartChat = useCallback(() => {
    if (!docText.trim()) {
      setError('Please paste the document text to begin.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const chat = createDocQAChat(docText);
      setChatSession(chat);
      setPhase('chat');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start chat session.');
    } finally {
      setIsLoading(false);
    }
  }, [docText]);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !chatSession) return;

    const userMessage: Message = { sender: 'user', text: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await chatSession.sendMessage({ message: currentMessage });
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get a response from the AI.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, chatSession]);

  if (phase === 'context') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Chat With Your Document</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Paste your document text below. The AI will answer questions based solely on the information provided.</p>
          <textarea
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste your document here..."
            className="w-full h-80 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-y"
            disabled={isLoading}
          />
          <button
            onClick={handleStartChat}
            disabled={isLoading}
            className="mt-4 w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? 'Initializing...' : 'Start Chat'}
          </button>
          {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in h-[80vh] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col flex-grow">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chat With Your Document</h2>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-lg p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center space-x-2">
                     <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
	                  <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
	                  <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                  </div>
               </div>
            </div>
          )}
        </div>
        {error && <p className="p-4 text-red-500 dark:text-red-400 border-t border-slate-200 dark:border-slate-700">{error}</p>}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask a question about the document..."
              className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocQA;
