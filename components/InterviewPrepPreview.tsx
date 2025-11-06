import React from 'react';
import type { InterviewPrepData } from '../types';

interface InterviewPrepPreviewProps {
    data: InterviewPrepData | null;
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="prep-section">
        <h2 className="prep-section-title">
            <span className="mr-3 text-sky-500 dark:text-sky-400">{icon}</span>
            {title}
        </h2>
        <div>{children}</div>
    </div>
);

const BehavioralQuestionCard: React.FC<{ item: InterviewPrepData['behavioralQuestions'][0] }> = ({ item }) => (
    <details className="prep-card">
        <summary>{item.question}</summary>
        <div className="prep-card-content star-method">
            <p><strong>Situation:</strong> {item.answer.situation}</p>
            <p><strong>Task:</strong> {item.answer.task}</p>
            <p><strong>Action:</strong> {item.answer.action}</p>
            <p><strong>Result:</strong> {item.answer.result}</p>
        </div>
    </details>
);

export const InterviewPrepPreview: React.FC<InterviewPrepPreviewProps> = ({ data }) => {
    if (!data) {
        return (
            <div id="interview-prep-preview-placeholder" className="bg-white shadow-lg border border-slate-200 dark:border-slate-700 aspect-[210/297] max-w-full overflow-hidden flex flex-col justify-center items-center text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 className="mt-4 text-xl font-semibold text-slate-600 dark:text-slate-400">Interview Prep Kit</h2>
                <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                    Generate your personalized interview prep kit from the "Interview Prep" tab. <br/>
                    You'll need to fill out some of your resume and add a job description first.
                </p>
            </div>
        );
    }

    return (
        <div id="interview-prep-preview" className="bg-white shadow-lg border border-slate-200 dark:border-slate-700 aspect-[210/297] max-w-full overflow-hidden">
             <div className="w-full h-full p-8 sm:p-10 overflow-y-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Interview Preparation Kit</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalized for your target role</p>
                </header>
                <main className="interview-prep-preview">
                    <Section title="Behavioral Questions" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 002-2V3a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4 4h5a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>}>
                        {data.behavioralQuestions.map((item, index) => (
                           <BehavioralQuestionCard key={index} item={item} />
                        ))}
                    </Section>

                    <Section title="Technical Questions" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}>
                        <ul className="prep-list">
                            {data.technicalQuestions.map((q, index) => <li key={index}>{q}</li>)}
                        </ul>
                    </Section>

                    <Section title="Questions for the Interviewer" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                         <ul className="prep-list">
                            {data.questionsForInterviewer.map((q, index) => <li key={index}>{q}</li>)}
                        </ul>
                    </Section>
                </main>
            </div>
        </div>
    );
};