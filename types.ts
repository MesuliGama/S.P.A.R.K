
export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    address: string;
}

export interface WorkExperience {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate:string;
    responsibilities: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    location: string;
    gradDate: string;
}

export interface Skill {
    id: string;
    name: string;
}

export interface Reference {
    id: string;
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    summary: string;
    experience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    references: Reference[];
    certifications: Certification[];
}

export type TemplateName = 'classic' | 'modern' | 'professional' | 'creative';
export type FontFamily = 'sans' | 'serif';
export type FontSize = 'sm' | 'base' | 'lg';
export type Spacing = 'compact' | 'normal' | 'relaxed';

export type AIContentTracker = {
    summary?: string;
    experience?: Record<number, string>;
};

export interface InterviewPrepData {
    behavioralQuestions: {
        question: string;
        answer: {
            situation: string;
            task: string;
            action: string;
            result: string;
        };
    }[];
    technicalQuestions: string[];
    questionsForInterviewer: string[];
}