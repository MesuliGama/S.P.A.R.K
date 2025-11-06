import React, { forwardRef } from 'react';
import type { ResumeData } from '../types';

interface CoverLetterPreviewProps {
    personalInfo: ResumeData['personalInfo'];
    companyName: string;
    hiringManager: string;
    companyAddress: string;
    coverLetter: string;
}

export const CoverLetterPreview = forwardRef<HTMLDivElement, CoverLetterPreviewProps>(({
    personalInfo,
    companyName,
    hiringManager,
    companyAddress,
    coverLetter,
}, ref) => {

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Split the cover letter by double newlines to create paragraphs
    const letterParagraphs = coverLetter.split(/\n\s*\n/);

    return (
        <div ref={ref} id="cover-letter-preview" className="bg-white shadow-lg border border-slate-200 dark:border-slate-700 aspect-[210/297] max-w-full overflow-hidden font-serif">
             <div className="w-full h-full p-24 text-slate-800 flex flex-col"> {/* p-24 is roughly 1 inch for A4 size */}
                <div className="text-right text-[10pt] mb-12">
                    <p className="font-bold text-xl text-slate-900">{personalInfo.name}</p>
                    <p>{personalInfo.address}</p>
                    <p>{personalInfo.phone}</p>
                    <p>{personalInfo.email}</p>
                </div>
                
                <div className="text-left text-[10pt] mb-8">
                    <p className="mb-8">{today}</p>
                    
                    <div>
                        <p>{hiringManager || 'Hiring Manager'}</p>
                        <p className="font-bold">{companyName}</p>
                        {companyAddress && <p className="whitespace-pre-wrap">{companyAddress}</p>}
                    </div>
                </div>

                <div className="text-left text-[11pt] leading-relaxed cover-letter-content-wrapper flex-grow overflow-hidden">
                   {letterParagraphs.map((p, i) => (
                       <p key={i} className={`${i < letterParagraphs.length - 1 ? "pb-4" : ""} whitespace-pre-line`}>{p}</p>
                   ))}
                </div>
            </div>
        </div>
    );
});