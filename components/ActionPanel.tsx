import React from 'react';

interface ActionPanelProps {
    jobDescription: string;
    onJobDescriptionChange: (value: string) => void;
    onATSCheck: () => void;
    onJobMatch: () => void;
    onExportPDF: () => void;
    onExportHTML: () => void;
    onExportDOCX: () => void;
    onResetResume: () => void;
    isLoading: boolean;
}

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string, icon?: React.ReactNode }> = ({ onClick, disabled, children, className = 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white', icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 px-4 rounded-lg transition-transform active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
        {icon}
        {children}
    </button>
);

const commonInputStyles = "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-md focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 dark:focus:border-sky-500 block w-full p-2.5 transition-all duration-200 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed";
const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={commonInputStyles} />
);
const Label: React.FC<{ children: React.ReactNode, htmlFor?: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{children}</label>
);

export const ActionPanel: React.FC<ActionPanelProps> = ({
    jobDescription,
    onJobDescriptionChange,
    onATSCheck,
    onJobMatch,
    onExportPDF,
    onExportHTML,
    onExportDOCX,
    onResetResume,
    isLoading
}) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">AI Analysis</h2>
                <div className="mb-4">
                    <Label htmlFor="jobDescriptionAnalysis">Target Job Description</Label>
                    <TextArea
                        id="jobDescriptionAnalysis"
                        value={jobDescription}
                        onChange={(e) => onJobDescriptionChange(e.target.value)}
                        placeholder="Paste the target job description here to enable analysis..."
                        rows={6}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionButton 
                        onClick={onATSCheck} 
                        disabled={isLoading}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v1.282A5.964 5.964 0 005 7.236V12.5A2.5 2.5 0 007.5 15h5A2.5 2.5 0 0015 12.5V7.236a5.964 5.964 0 00-3-2.954V3a1 1 0 00-1-1H9zm1.5 4.75A2.75 2.75 0 008 9.5v.256a2.5 2.5 0 00-.5 3.544l.002.002a2.75 2.75 0 105 0l.002-.002a2.5 2.5 0 00-.5-3.544V9.5A2.75 2.75 0 0010.5 6.75z" clipRule="evenodd" /></svg>}
                    >
                        Check ATS
                    </ActionButton>
                    <ActionButton 
                        onClick={onJobMatch} 
                        disabled={isLoading || !jobDescription}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" /></svg>}
                    >
                        Job Match
                    </ActionButton>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-8">Export Resume</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ActionButton onClick={onExportPDF} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white">Export PDF</ActionButton>
                    <ActionButton onClick={onExportDOCX} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">Export DOCX</ActionButton>
                    <ActionButton onClick={onExportHTML} disabled={isLoading} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">Export HTML</ActionButton>
                </div>
            </div>

            <div className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-700 text-center space-y-3">
                <button
                    onClick={onResetResume}
                    disabled={isLoading}
                    className="text-sm font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600"
                >
                    Reset All Resume Data
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your data is stored privately on your device only.
                </p>
            </div>
        </div>
    );
};