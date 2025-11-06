import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 id="dialog-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-3xl leading-none" aria-label="Close">&times;</button>
                </div>
                <div id="dialog-description" className="p-6 text-slate-600 dark:text-slate-300">
                    {children}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
