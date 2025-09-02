
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import Loader from './Loader';

const DragHandleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const RemoveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const MergePdf: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Cleanup object URL on component unmount
        return () => {
            if (mergedPdfUrl) {
                URL.revokeObjectURL(mergedPdfUrl);
            }
        };
    }, [mergedPdfUrl]);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
        if (newFiles.length !== selectedFiles.length) {
            setError('Some files were not PDFs and were ignored.');
        } else {
            setError('');
        }
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleMerge = useCallback(async () => {
        if (files.length < 2) {
            setError('Please select at least two PDF files to merge.');
            return;
        }
        setError('');
        setIsLoading(true);
        if (mergedPdfUrl) {
          URL.revokeObjectURL(mergedPdfUrl);
          setMergedPdfUrl(null);
        }

        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const pdfToMerge = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
                const pages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
            setFiles([]); // Clear files after merge
        } catch (err) {
            console.error(err);
            setError('An error occurred while merging the PDFs. One of the files might be corrupted or password-protected.');
        } finally {
            setIsLoading(false);
        }
    }, [files, mergedPdfUrl]);
    
    const handleDragStart = (index: number) => {
      setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
      e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (targetIndex: number) => {
      if (draggedItemIndex === null) return;
      const newFiles = [...files];
      const draggedItem = newFiles.splice(draggedItemIndex, 1)[0];
      newFiles.splice(targetIndex, 0, draggedItem);
      setFiles(newFiles);
      setDraggedItemIndex(null);
    };

    const handleReset = () => {
        setFiles([]);
        setError('');
        if (mergedPdfUrl) {
            URL.revokeObjectURL(mergedPdfUrl);
        }
        setMergedPdfUrl(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Merge PDF Files</h2>

                {mergedPdfUrl ? (
                    <div className="text-center p-8 animate-fade-in">
                        <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">Merge Successful!</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Your PDF has been created.</p>
                        <a
                            href={mergedPdfUrl}
                            download={`merged-${Date.now()}.pdf`}
                            className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-md hover:bg-green-700 transition-colors duration-300"
                        >
                            Download Merged PDF
                        </a>
                        <button onClick={handleReset} className="mt-4 w-full sm:w-auto text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-4">
                            Start Over
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Select multiple PDF files to combine them into a single document. Drag and drop to reorder.</p>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files)}
                            />
                            <p className="text-slate-500">Drag & drop your PDFs here, or click to select files</p>
                        </div>
                        
                        {files.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2 text-slate-800 dark:text-white">Selected Files:</h3>
                                <ul className="space-y-2">
                                    {files.map((file, index) => (
                                        <li
                                            key={`${file.name}-${index}`}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(index)}
                                            className={`flex items-center justify-between p-3 rounded-md bg-slate-100 dark:bg-slate-700 transition-all duration-300 ${draggedItemIndex === index ? 'opacity-50 scale-105' : 'opacity-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <DragHandleIcon className="w-5 h-5 text-slate-400 cursor-grab" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                                            </div>
                                            <button onClick={() => handleRemoveFile(index)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                                                <RemoveIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="mt-6">
                                <Loader message="Merging PDFs, please wait..." />
                            </div>
                        ) : (
                            <button
                                onClick={handleMerge}
                                disabled={files.length < 2 || isLoading}
                                className="mt-6 w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/80 disabled:cursor-not-allowed transition-colors duration-300"
                            >
                                Merge PDFs
                            </button>
                        )}
                        
                        {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default MergePdf;