import React from 'react';

type Theme = 'light' | 'dark';

interface HeaderProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onDocsClick: () => void;
    theme: Theme;
    onToggleTheme: () => void;
}

const HistoryButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; title: string }> = ({ onClick, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="text-slate-500 disabled:text-slate-400 dark:disabled:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 disabled:hover:text-slate-400 dark:disabled:hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
    >
        {children}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ onUndo, onRedo, canUndo, canRedo, onDocsClick, theme, onToggleTheme }) => {
    return (
        <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-900/10 dark:bg-slate-900/70 dark:border-slate-50/[0.06]">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500 dark:text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 2H5C3.34 2 2 3.34 2 5V19C2 20.66 3.34 22 5 22H19C20.66 22 22 20.66 22 19V5C22 3.34 20.66 2 19 2ZM8 6H16V8H8V6ZM16 12H8V10H16V12ZM12 16H8V14H12V16Z" />
                        </svg>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-200 leading-tight">S.P.A.R.K</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Smart Personal AI Resume Kit</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Powered by Gemini</span>
                         <button 
                            onClick={onDocsClick}
                            title="About the AI Features"
                            className="text-slate-400 hover:text-sky-500 dark:text-slate-500 dark:hover:text-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-4 border-l border-slate-300 dark:border-slate-700 pl-4">
                            <div className="flex items-center gap-2">
                                <HistoryButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 010 10H9" />
                                    </svg>
                                </HistoryButton>
                                 <HistoryButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 000 10h3" />
                                    </svg>
                                </HistoryButton>
                            </div>
                            <button
                                onClick={onToggleTheme}
                                title="Toggle theme"
                                className="text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1"
                            >
                                {theme === 'light' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};