
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-md animate-fade-in">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-solid rounded-full animate-spin border-slate-200 dark:border-slate-700"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{message}</p>
    </div>
  );
};

export default Loader;
