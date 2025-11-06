
import type { ResumeData } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
    personalInfo: {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '123-456-7890',
        linkedin: 'linkedin.com/in/janedoe',
        github: 'github.com/janedoe',
        website: 'janedoe.com',
        address: 'City, State',
    },
    summary: 'A highly motivated and results-oriented professional with 5+ years of experience in project management and software development. Seeking to leverage proven skills in a challenging new role.',
    experience: [
        {
            id: 'exp1',
            jobTitle: 'Senior Project Manager',
            company: 'Tech Solutions Inc.',
            location: 'San Francisco, CA',
            startDate: '2020-01',
            endDate: 'Present',
            responsibilities: '- Led cross-functional teams to deliver projects on time.\n- Managed project budgets and resources.\n- Reported project status to stakeholders.',
        },
    ],
    education: [
        {
            id: 'edu1',
            institution: 'State University',
            degree: 'B.S. in Computer Science',
            location: 'Anytown, USA',
            gradDate: '2019-05',
        },
    ],
    skills: [
        { id: 'skill1', name: 'JavaScript' },
        { id: 'skill2', name: 'React' },
        { id: 'skill3', name: 'Node.js' },
        { id: 'skill4', name: 'Agile Methodology' },
        { id: 'skill5', name: 'Project Management' },
    ],
    references: [],
    certifications: [],
};