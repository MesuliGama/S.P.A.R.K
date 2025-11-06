
import React from 'react';

interface FeedbackDisplayProps {
    preferences: string;
    onClear: () => void;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ preferences, onClear }) => {
    if (!preferences) {
        return null;
    }

    const preferenceItems = preferences.split('\n').filter(p => p.trim() !== '');

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Learned Preferences</h3>
                <button 
                    onClick={onClear} 
                    className="text-sm font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                    title="Clear learned preferences for this session"
                >
                    Clear All
                </button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                 <p>The AI will remember these preferences for this session to improve future suggestions.</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 pt-2">
                    {preferenceItems.map((pref, index) => (
                        <li key={index}>{pref.replace(/^- /, '')}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};