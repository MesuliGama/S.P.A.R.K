import React from 'react';

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-transform active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
        {children}
    </button>
);

interface InterviewPrepGeneratorProps {
    onGenerate: () => void;
    onClear: () => void;
    hasData: boolean;
    isLoading: boolean;
    resumeName: string;
    resumeExperienceCount: number;
    jobDescription: string;
}

export const InterviewPrepGenerator: React.FC<InterviewPrepGeneratorProps> = ({
    onGenerate, onClear, hasData, isLoading, resumeName, resumeExperienceCount, jobDescription
}) => {
    const canGenerate = !!resumeName && resumeExperienceCount > 0 && !!jobDescription;

    const getDisabledReason = () => {
        if (canGenerate) return '';

        const missingItems: string[] = [];
        if (!resumeName) {
            missingItems.push("your name in 'Personal Info'");
        }
        if (resumeExperienceCount === 0) {
            missingItems.push("at least one 'Work Experience' entry");
        }
        if (!jobDescription) {
            missingItems.push("a 'Job Description' in the 'Analyze & Export' tab");
        }

        if (missingItems.length === 0) {
            return 'Please complete your resume and add a job description to generate your prep kit.';
        }

        let reason = 'Please add ';
        if (missingItems.length === 1) {
            reason += missingItems[0];
        } else if (missingItems.length === 2) {
            reason += `${missingItems[0]} and ${missingItems[1]}`;
        } else {
            // Should not be more than 3, but this handles it.
            const lastItem = missingItems.pop();
            reason += `${missingItems.join(', ')}, and ${lastItem}`;
        }

        return `${reason} to enable kit generation.`;
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">AI Interview Prep Kit</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Generate likely interview questions and tailored answers based on your resume and the target job description.
                </p>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionButton onClick={onGenerate} disabled={isLoading || !canGenerate}>
                        {hasData ? 'Regenerate Kit' : 'Generate Kit'}
                    </ActionButton>
                    <ActionButton onClick={onClear} disabled={isLoading || !hasData} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">
                        Clear Kit
                    </ActionButton>
                </div>
                {!canGenerate && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">{getDisabledReason()}</p>}
            </div>
        </div>
    );
};