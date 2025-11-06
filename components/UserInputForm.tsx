import React, { useState } from 'react';
import type { ResumeData, WorkExperience, Education, Skill, Reference, Certification } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface UserInputFormProps {
    resumeData: ResumeData;
    onDataChange: (data: ResumeData) => void;
    onGenerateExperience: (index: number) => void;
    targetJobRole: string;
    onTargetJobRoleChange: (role: string) => void;
    onGenerateSuggestion: (section: 'summary' | 'experience', index?: number) => void;
    onSuggestionEdited: (section: 'summary' | 'experience', index?: number) => void;
}

// --- Icon Components ---
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mr-3 text-slate-400 dark:text-slate-500">{children}</div>
);
const TargetIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg></IconWrapper>);
const UserCircleIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></IconWrapper>);
const DocumentTextIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></IconWrapper>);
const BriefcaseIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></IconWrapper>);
const BookOpenIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.494h18" /></svg></IconWrapper>);
const SparklesIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg></IconWrapper>);
const IdentificationIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-6 6h6m-6 4h6m-6-8h6" /></svg></IconWrapper>);
const CertificateIcon: React.FC = () => (<IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg></IconWrapper>);
const TrashIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const PlusIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);

// --- Reusable Styled Components ---
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
            {icon}
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
        </div>
        {children}
    </div>
);
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

// --- New AI Action Button Component ---
const AiActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: React.ReactNode;
    variant?: 'suggest' | 'enhance';
}> = ({ onClick, disabled, title, children, variant = 'suggest' }) => {
    const baseClasses = "flex items-center justify-center text-xs font-semibold py-1.5 px-3 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:transform-none";
    
    const variantClasses = variant === 'suggest'
        ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-sky-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500"
        : "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-500/30 focus:ring-sky-500 disabled:bg-sky-50 dark:disabled:bg-sky-500/10 disabled:text-sky-400 dark:disabled:text-sky-400/50";
        
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseClasses} ${variantClasses}`}
        >
            {children}
        </button>
    );
};

export const UserInputForm: React.FC<UserInputFormProps> = ({ 
    resumeData, 
    onDataChange, 
    onGenerateExperience,
    targetJobRole,
    onTargetJobRoleChange,
    onGenerateSuggestion,
    onSuggestionEdited,
 }) => {

    const [itemToRemove, setItemToRemove] = useState<{
        section: 'experience' | 'education' | 'references' | 'certifications';
        index: number;
    } | null>(null);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDataChange({
            ...resumeData,
            personalInfo: { ...resumeData.personalInfo, [e.target.name]: e.target.value },
        });
    };
    
    const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDataChange({ ...resumeData, summary: e.target.value });
    };

    const handleDynamicChange = <T extends { id: string }>(
      section: keyof Pick<ResumeData, 'experience' | 'education' | 'skills' | 'references' | 'certifications'>,
      index: number,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      data: T[]
    ) => {
        const newData = [...data];
        newData[index] = { ...newData[index], [e.target.name]: e.target.value };
        onDataChange({ ...resumeData, [section]: newData });
    };
    
    const addDynamicItem = <T extends { id: string }>(section: keyof Pick<ResumeData, 'experience' | 'education' | 'skills' | 'references' | 'certifications'>, newItem: T, data: T[]) => {
        onDataChange({ ...resumeData, [section]: [...data, newItem] });
    };

    const requestRemoveItem = (section: 'experience' | 'education' | 'references' | 'certifications', index: number) => {
        setItemToRemove({ section, index });
    };

    const handleConfirmRemove = () => {
        if (!itemToRemove) return;
        const { section, index } = itemToRemove;
        const currentSectionData = resumeData[section];

        if (Array.isArray(currentSectionData)) {
            const updatedSectionData = currentSectionData.filter((_, i) => i !== index);
            onDataChange({ ...resumeData, [section]: updatedSectionData });
        }
        
        setItemToRemove(null);
    };

    const handleCancelRemove = () => {
        setItemToRemove(null);
    };

    const getItemToRemoveName = (): string => {
        if (!itemToRemove) return 'this item';
        const { section, index } = itemToRemove;
        const item = resumeData[section][index];
        const sectionSingular = section.slice(0, -1);
        if (section === 'experience') {
            return `the "${(item as WorkExperience).jobTitle || 'Untitled'}" experience entry`;
        }
        if (section === 'education') {
            return `the "${(item as Education).institution || 'Untitled'}" education entry`;
        }
        if (section === 'certifications') {
            return `the "${(item as Certification).name || 'Untitled'}" certification entry`;
        }
        if (section === 'references') {
            return `the "${(item as Reference).name || 'Untitled'}" reference entry`;
        }
        return `this ${sectionSingular}`;
    };


    return (
        <div className="space-y-8">
            <Section title="Target Role" icon={<TargetIcon />}>
                <Label>Target Job Role / Industry</Label>
                <Input 
                    name="targetJobRole" 
                    value={targetJobRole} 
                    onChange={(e) => onTargetJobRoleChange(e.target.value)} 
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Provide a role to get tailored AI content suggestions.</p>
            </Section>

            <Section title="Personal Information" icon={<UserCircleIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Full Name</Label><Input name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>Email</Label><Input name="email" type="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>Phone Number</Label><Input name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>Address</Label><Input name="address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>LinkedIn Profile</Label><Input name="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>GitHub Profile</Label><Input name="github" value={resumeData.personalInfo.github} onChange={handlePersonalInfoChange} /></div>
                    <div><Label>Website/Portfolio</Label><Input name="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} /></div>
                </div>
            </Section>

            <Section title="Professional Summary" icon={<DocumentTextIcon />}>
                <Label htmlFor="summary">Summary</Label>
                <div className="relative group">
                    <TextArea 
                        id="summary" 
                        name="summary" 
                        rows={4} 
                        value={resumeData.summary} 
                        onChange={handleSummaryChange} 
                        onBlur={() => onSuggestionEdited('summary')}
                        placeholder="Write a brief summary or use the AI suggestion button..."/>
                     <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AiActionButton
                            onClick={() => onGenerateSuggestion('summary')}
                            disabled={!targetJobRole}
                            title={!targetJobRole ? "Enter a target role to enable suggestions" : "Suggest summary with AI"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Suggest with AI
                        </AiActionButton>
                    </div>
                </div>
            </Section>

            <Section title="Work Experience" icon={<BriefcaseIcon />}>
                <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 relative group transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50">
                        <div className="flex items-start justify-between">
                             <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Job Title</Label><Input name="jobTitle" value={exp.jobTitle} onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} /></div>
                                <div><Label>Company</Label><Input name="company" value={exp.company} onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} /></div>
                                <div><Label>Location</Label><Input name="location" value={exp.location} onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} /></div>
                                <div><Label>Start Date</Label><Input name="startDate" type="text" placeholder="YYYY-MM" value={exp.startDate} onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} /></div>
                                <div><Label>End Date</Label><Input name="endDate" type="text" placeholder="YYYY-MM" value={exp.endDate} onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} /></div>
                            </div>
                            <button 
                                onClick={() => requestRemoveItem('experience', index)} 
                                className="ml-4 mt-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Experience"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                        <div>
                           <Label>Key Responsibilities & Achievements</Label>
                           <div className="relative group/textarea">
                               <TextArea 
                                    name="responsibilities" 
                                    rows={5} 
                                    value={exp.responsibilities} 
                                    onChange={e => handleDynamicChange('experience', index, e, resumeData.experience)} 
                                    onBlur={() => onSuggestionEdited('experience', index)}
                                    placeholder="Enter key points, or use AI to suggest them."
                               />
                               <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover/textarea:opacity-100 transition-opacity">
                                    <AiActionButton
                                        onClick={() => onGenerateSuggestion('experience', index)}
                                        disabled={!targetJobRole}
                                        title={!targetJobRole ? "Enter a target role to enable suggestions" : "Suggest responsibilities with AI"}
                                    >
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                       </svg>
                                       Suggest with AI
                                    </AiActionButton>
                                    <AiActionButton
                                        onClick={() => onGenerateExperience(index)}
                                        disabled={!exp.responsibilities}
                                        title={!exp.responsibilities ? "Enter some responsibilities to enhance" : "Enhance with AI"}
                                        variant="enhance"
                                    >
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.414-1.414l11-11zM11 9a1 1 0 112 0v3a1 1 0 11-2 0v-3zM7 9a1 1 0 112 0v3a1 1 0 11-2 0v-3zm4-4a1 1 0 112 0h3a1 1 0 110 2h-3a1 1 0 11-2 0zM3 5a1 1 0 112 0h3a1 1 0 110 2H5a1 1 0 11-2 0z" />
                                       </svg>
                                       Enhance
                                    </AiActionButton>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                <button onClick={() => addDynamicItem('experience', { id: `exp${Date.now()}`, jobTitle: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' }, resumeData.experience)} className="mt-4 w-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <PlusIcon /> Add Experience
                </button>
            </Section>

            <Section title="Education" icon={<BookOpenIcon />}>
                <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 relative group transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50">
                        <div className="flex items-start justify-between">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Institution</Label><Input name="institution" value={edu.institution} onChange={e => handleDynamicChange('education', index, e, resumeData.education)} /></div>
                                <div><Label>Degree/Certificate</Label><Input name="degree" value={edu.degree} onChange={e => handleDynamicChange('education', index, e, resumeData.education)} /></div>
                                <div><Label>Location</Label><Input name="location" value={edu.location} onChange={e => handleDynamicChange('education', index, e, resumeData.education)} /></div>
                                <div><Label>Graduation Date</Label><Input name="gradDate" type="text" placeholder="YYYY-MM" value={edu.gradDate} onChange={e => handleDynamicChange('education', index, e, resumeData.education)} /></div>
                            </div>
                            <button 
                                onClick={() => requestRemoveItem('education', index)} 
                                className="ml-4 mt-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Education"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                </div>
                 <button onClick={() => addDynamicItem('education', { id: `edu${Date.now()}`, institution: '', degree: '', location: '', gradDate: '' }, resumeData.education)} className="mt-4 w-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <PlusIcon /> Add Education
                </button>
            </Section>

            <Section title="Certifications" icon={<CertificateIcon />}>
                <div className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                    <div key={cert.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 relative group transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50">
                        <div className="flex items-start justify-between">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Certification Name</Label><Input name="name" value={cert.name} onChange={e => handleDynamicChange('certifications', index, e, resumeData.certifications)} /></div>
                                <div><Label>Issuing Organization</Label><Input name="issuer" value={cert.issuer} onChange={e => handleDynamicChange('certifications', index, e, resumeData.certifications)} /></div>
                                <div className="md:col-span-2"><Label>Date Issued</Label><Input name="date" type="text" placeholder="YYYY-MM" value={cert.date} onChange={e => handleDynamicChange('certifications', index, e, resumeData.certifications)} /></div>
                            </div>
                            <button 
                                onClick={() => requestRemoveItem('certifications', index)} 
                                className="ml-4 mt-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Certification"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                </div>
                 <button onClick={() => addDynamicItem('certifications', { id: `cert${Date.now()}`, name: '', issuer: '', date: '' }, resumeData.certifications)} className="mt-4 w-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <PlusIcon /> Add Certification
                </button>
            </Section>
            
            <Section title="Skills" icon={<SparklesIcon />}>
                <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                        <div key={skill.id} className="flex items-center justify-center gap-1.5 bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200 text-sm font-medium px-3 py-1.5 rounded-full">
                            <span>{skill.name}</span>
                            <button onClick={() => onDataChange({ ...resumeData, skills: resumeData.skills.filter((_, i) => i !== index) })} className="text-sky-500 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-100 rounded-full hover:bg-sky-200/50 dark:hover:bg-sky-500/30 p-0.5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                 <form className="flex mt-4" onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('skillInput') as HTMLInputElement;
                        if (input && input.value.trim()) {
                            addDynamicItem('skills', { id: `skill${Date.now()}`, name: input.value.trim() }, resumeData.skills);
                            input.value = '';
                        }
                    }}>
                    <Input
                        name="skillInput"
                        type="text"
                        placeholder="Add a skill and press Enter"
                    />
                </form>
            </Section>

            <Section title="References" icon={<IdentificationIcon />}>
                <div className="space-y-4">
                {resumeData.references.map((ref, index) => (
                    <div key={ref.id} className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 relative group transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50">
                        <div className="flex items-start justify-between">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Full Name</Label><Input name="name" value={ref.name} onChange={e => handleDynamicChange('references', index, e, resumeData.references)} /></div>
                                <div><Label>Title/Relationship</Label><Input name="title" value={ref.title} onChange={e => handleDynamicChange('references', index, e, resumeData.references)} /></div>
                                <div><Label>Company</Label><Input name="company" value={ref.company} onChange={e => handleDynamicChange('references', index, e, resumeData.references)} /></div>
                                <div><Label>Email</Label><Input name="email" type="email" value={ref.email} onChange={e => handleDynamicChange('references', index, e, resumeData.references)} /></div>
                                <div><Label>Phone Number</Label><Input name="phone" value={ref.phone} onChange={e => handleDynamicChange('references', index, e, resumeData.references)} /></div>
                            </div>
                            <button 
                                onClick={() => requestRemoveItem('references', index)} 
                                className="ml-4 mt-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Reference"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                </div>
                 <button onClick={() => addDynamicItem('references', { id: `ref${Date.now()}`, name: '', title: '', company: '', email: '', phone: '' }, resumeData.references)} className="mt-4 w-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <PlusIcon /> Add Reference
                </button>
            </Section>

            <ConfirmationModal
                isOpen={!!itemToRemove}
                onClose={handleCancelRemove}
                onConfirm={handleConfirmRemove}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to permanently delete {getItemToRemoveName()}? This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};