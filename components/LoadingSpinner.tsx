import React, { useState, useEffect } from 'react';

const motivationalMessages = [
    "Analyzing your data...",
    "Consulting with the AI...",
    "Crafting the perfect response...",
    "Just a moment...",
    "Good things are coming...",
    "Polishing the results..."
];

export const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
    const [subMessage, setSubMessage] = useState(motivationalMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSubMessage(prev => {
                const currentIndex = motivationalMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % motivationalMessages.length;
                return motivationalMessages[nextIndex];
            });
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="fixed inset-0 bg-slate-100/70 dark:bg-slate-900/70 z-50 flex flex-col justify-center items-center backdrop-blur-sm text-center px-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
            <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{message || 'Processing...'}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subMessage}</p>
        </div>
    );
};
