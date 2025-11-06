import React from 'react';

// Re-using some styled components for consistency
const commonInputStyles = "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-md focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 dark:focus:border-sky-500 block w-full p-2.5 transition-all duration-200 ease-in-out placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed";
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={commonInputStyles} />
);
const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={commonInputStyles} />
);
const Label: React.FC<{ children: React.ReactNode, htmlFor?: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{children}</label>
);
const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-transform active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
        {children}
    </button>
);

interface CoverLetterGeneratorProps {
    coverLetter: string;
    companyName: string;
    onCompanyNameChange: (value: string) => void;
    hiringManager: string;
    onHiringManagerChange: (value: string) => void;
    companyAddress: string;
    onCompanyAddressChange: (value: string) => void;
    jobDescription: string;
    onGenerate: () => void;
    onExportPDF: () => void;
    isLoading: boolean;
    hasResume: boolean;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
    coverLetter,
    companyName, onCompanyNameChange,
    hiringManager, onHiringManagerChange,
    companyAddress, onCompanyAddressChange,
    jobDescription,
    onGenerate, onExportPDF, isLoading, hasResume
}) => {
    const hasJobDescription = !!jobDescription;
    const canGenerate = hasResume && hasJobDescription && !!companyName;

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">AI Cover Letter Generator</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Provide company details to generate a tailored cover letter. The job description from the "Analyze & Export" tab will be used.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)} disabled={isLoading} placeholder="e.g., Google" />
                    </div>
                    <div>
                        <Label htmlFor="hiringManager">Hiring Manager Name (Optional)</Label>
                        <Input id="hiringManager" value={hiringManager} onChange={(e) => onHiringManagerChange(e.target.value)} disabled={isLoading} placeholder="e.g., Pat Smith" />
                    </div>
                    <div className="sm:col-span-2">
                        <Label htmlFor="companyAddress">Company Address (Optional)</Label>
                        <TextArea id="companyAddress" value={companyAddress} onChange={(e) => onCompanyAddressChange(e.target.value)} disabled={isLoading} placeholder={"123 Main St\nAnytown, USA 12345"} rows={3} />
                    </div>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionButton onClick={onGenerate} disabled={isLoading || !canGenerate}>
                        Generate Cover Letter
                    </ActionButton>
                    <ActionButton onClick={onExportPDF} disabled={isLoading || !coverLetter} className="bg-red-500 hover:bg-red-600 text-white">
                        Export as PDF
                    </ActionButton>
                </div>
                {!canGenerate && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">Please fill out your resume, provide a job description in the "Analyze & Export" tab, and enter a company name to generate a letter.</p>}
            </div>
        </div>
    );
};
