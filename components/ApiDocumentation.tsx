import React from 'react';

const DocumentationSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h4>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">{children}</div>
    </div>
);

export const ApiDocumentation: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert prose-h4:mb-2 prose-p:my-1 prose-ul:my-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                S.P.A.R.K (Smart Personal AI Resume Kit) uses Google's Gemini large language models to provide intelligent features. Here's a breakdown of how it works and some important considerations to keep in mind.
            </p>

            <DocumentationSection title="1. Content Generation & Enhancement">
                <p>
                    <strong>How it works:</strong> When you use "Suggest with AI" or "Enhance," we send the relevant context (like your target job role or existing bullet points) to the Gemini model. It then generates professional, action-oriented text based on its vast training data.
                </p>
                <p>
                    <strong>Feedback Loop:</strong> When you edit an AI suggestion, the app analyzes your changes. It asks Gemini to identify your preference (e.g., "prefers shorter sentences"). This "learned preference" is then used to tailor future suggestions to your personal style during your current session.
                </p>
            </DocumentationSection>
            
            <DocumentationSection title="2. AI Analysis">
                <p>
                    <strong>ATS Compatibility Check:</strong> We send the text content of your resume to Gemini, asking it to act as an Applicant Tracking System (ATS) and evaluate your resume's formatting, keywords, and clarity.
                </p>
                <p>
                    <strong>Job Match Analysis:</strong> The text of your resume and the job description you provide are sent to Gemini. It compares the two to identify strengths, weaknesses, and areas for improvement, providing a match score.
                </p>
            </DocumentationSection>

            <DocumentationSection title="Important Limitations & Considerations">
                 <ul className="list-disc list-outside pl-5 space-y-2">
                    <li>
                        <strong>AI is a Tool:</strong> The generated content and analysis are suggestions. Always review and edit them to ensure they are accurate and truly reflect your experience. You are responsible for the final content of your resume.
                    </li>
                    <li>
                        <strong>Potential for Inaccuracies:</strong> While powerful, AI models can sometimes generate incorrect, biased, or nonsensical information. Double-check all facts, figures, and dates.
                    </li>
                    <li>
                        <strong>Privacy:</strong> Your resume data and job descriptions are sent to the Google Gemini API for processing when you use AI features. Your data is saved locally in your browser and is not stored on any other servers. Please review Google's API policies for more information on how they handle data.
                    </li>
                     <li>
                        <strong>No Guarantees:</strong> Using these AI features does not guarantee an interview or a job offer. They are designed to assist you in creating a stronger, more competitive resume.
                    </li>
                </ul>
            </DocumentationSection>
        </div>
    );
};