
import React, { useState } from 'react';
import { ToolId } from './types';
import ToolCard from './components/ToolCard';
import Summarizer from './components/Summarizer';
import ImageGenerator from './components/ImageGenerator';
import DocQA from './components/DocQA';
import MergePdf from './components/MergePdf';
import { SummarizeIcon, ImageIcon, ChatIcon, BackArrowIcon, MergePdfIcon } from './components/icons';

const tools = [
  {
    id: ToolId.MERGE_PDF,
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document. Easily reorder files before merging.',
    icon: <MergePdfIcon className="w-8 h-8" />,
    component: <MergePdf />,
  },
  {
    id: ToolId.SUMMARIZER,
    title: 'Text Summarizer',
    description: 'Condense long articles or documents into key points quickly and efficiently.',
    icon: <SummarizeIcon className="w-8 h-8" />,
    component: <Summarizer />,
  },
  {
    id: ToolId.IMAGE_GENERATOR,
    title: 'AI Image Generator',
    description: 'Turn your imagination into stunning visuals. Describe any scene or idea to create a unique image.',
    icon: <ImageIcon className="w-8 h-8" />,
    component: <ImageGenerator />,
  },
  {
    id: ToolId.DOC_QA,
    title: 'Chat with Document',
    description: 'Upload a document and ask specific questions to find the information you need instantly.',
    icon: <ChatIcon className="w-8 h-8" />,
    component: <DocQA />,
  },
];

const Header: React.FC = () => (
  <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          <span className="text-indigo-600 dark:text-indigo-400">AI</span> Power Tools
        </div>
      </div>
    </div>
  </header>
);

const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} AI Power Tools. Powered by Google Gemini.</p>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const selectedTool = tools.find(t => t.id === activeTool);

  const renderContent = () => {
    if (selectedTool) {
      return (
        <div className="animate-fade-in">
          <button
            onClick={() => setActiveTool(null)}
            className="flex items-center gap-2 mb-8 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <BackArrowIcon className="w-5 h-5" />
            Back to All Tools
          </button>
          {selectedTool.component}
        </div>
      );
    }

    return (
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Your Ultimate AI Toolkit</h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12">
          Leverage the power of generative AI to enhance your productivity. Summarize text, create images, and interact with documents like never before.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;