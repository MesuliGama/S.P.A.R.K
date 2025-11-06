import React, { useState, useCallback, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, BorderStyle } from 'docx';

import { UserInputForm } from './components/UserInputForm';
import { ResumePreview } from './components/ResumePreview';
import { ActionPanel } from './components/ActionPanel';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TemplateSelector } from './components/TemplateSelector';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { ApiDocumentation } from './components/ApiDocumentation';
import { useHistoryState } from './hooks/useHistoryState';
import { Tabs } from './components/Tabs';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';
import { CoverLetterPreview } from './components/CoverLetterPreview';
import { InterviewPrepGenerator } from './components/InterviewPrepGenerator';
import { InterviewPrepPreview } from './components/InterviewPrepPreview';
import { ConfirmationModal } from './components/ConfirmationModal';


import { generateEnhancedContent, runATSCheck, runJobMatch, generateContentSuggestion, learnFromEdit, generateCoverLetter, generateInterviewPrep } from './services/geminiService';
import type { ResumeData, TemplateName, FontFamily, FontSize, Spacing, AIContentTracker, InterviewPrepData } from './types';
import { INITIAL_RESUME_DATA } from './constants';

const LOCAL_STORAGE_KEY = 'intelligentResumeGeneratorState';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    
    const loadState = () => {
        try {
            const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (serializedState === null) {
                return { resumeData: INITIAL_RESUME_DATA, jobDescription: '', targetJobRole: 'Senior Software Engineer', learnedPreferences: '', template: 'classic', accentColor: '#0ea5e9', fontFamily: 'sans', fontSize: 'base', spacing: 'normal', coverLetter: '', companyName: '', hiringManager: '', companyAddress: '', interviewPrepData: null };
            }
            const loaded = JSON.parse(serializedState);
            // Ensure resumeData is not undefined, fallback to initial if it is.
            loaded.resumeData = loaded.resumeData || INITIAL_RESUME_DATA;
            // Ensure new fields exist
            if (!loaded.resumeData.certifications) {
                loaded.resumeData.certifications = [];
            }
            if (!loaded.resumeData.personalInfo.github) {
                loaded.resumeData.personalInfo.github = '';
            }

            return loaded;
        } catch (e) {
            console.warn("Could not load state from local storage", e);
            return { resumeData: INITIAL_RESUME_DATA, jobDescription: '', targetJobRole: 'Senior Software Engineer', learnedPreferences: '', template: 'classic', accentColor: '#0ea5e9', fontFamily: 'sans', fontSize: 'base', spacing: 'normal', coverLetter: '', companyName: '', hiringManager: '', companyAddress: '', interviewPrepData: null };
        }
    };

    const initialState = loadState();

    const { 
        state: resumeData, 
        setState: setResumeData, 
        undo, 
        redo, 
        canUndo, 
        canRedo,
        resetState: resetResumeDataHistory
    } = useHistoryState<ResumeData>(initialState.resumeData);
    
    const [jobDescription, setJobDescription] = useState<string>(initialState.jobDescription);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
    const [targetJobRole, setTargetJobRole] = useState<string>(initialState.targetJobRole);
    
    // Feedback loop state
    const [aiContentTracker, setAiContentTracker] = useState<AIContentTracker>({});
    const [learnedPreferences, setLearnedPreferences] = useState<string>(initialState.learnedPreferences);

    // Cover Letter State
    const [coverLetter, setCoverLetter] = useState<string>(initialState.coverLetter);
    const [companyName, setCompanyName] = useState<string>(initialState.companyName);
    const [hiringManager, setHiringManager] = useState<string>(initialState.hiringManager);
    const [companyAddress, setCompanyAddress] = useState<string>(initialState.companyAddress || '');

    // Interview Prep State
    const [interviewPrepData, setInterviewPrepData] = useState<InterviewPrepData | null>(initialState.interviewPrepData);

    // Customization State
    const [template, setTemplate] = useState<TemplateName>(initialState.template);
    const [accentColor, setAccentColor] = useState<string>(initialState.accentColor);
    const [fontFamily, setFontFamily] = useState<FontFamily>(initialState.fontFamily);
    const [fontSize, setFontSize] = useState<FontSize>(initialState.fontSize);
    const [spacing, setSpacing] = useState<Spacing>(initialState.spacing);
    
    const [activeTab, setActiveTab] = useState('Content');

    // Theme State
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'dark') {
                return 'dark';
            }
        }
        return 'light'; // Default to light mode
    });

    const resumePreviewRef = useRef<HTMLDivElement>(null);
    const coverLetterPreviewRef = useRef<HTMLDivElement>(null);

     // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            resumeData,
            jobDescription,
            targetJobRole,
            learnedPreferences,
            template,
            accentColor,
            fontFamily,
            fontSize,
            spacing,
            coverLetter,
            companyName,
            hiringManager,
            companyAddress,
            interviewPrepData
        };
        try {
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        } catch (e) {
            console.error("Could not save state to local storage", e);
        }
    }, [resumeData, jobDescription, targetJobRole, learnedPreferences, template, accentColor, fontFamily, fontSize, spacing, coverLetter, companyName, hiringManager, companyAddress, interviewPrepData]);

    // Effect for handling theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };


    const handleDataChange = useCallback((data: ResumeData) => {
        setResumeData(data);
    }, [setResumeData]);

    const handleGenerateExperience = async (index: number) => {
        const experience = resumeData.experience[index];
        if (!experience.jobTitle || !experience.responsibilities) return;

        setIsLoading(true);
        setLoadingMessage('Enhancing experience description...');
        try {
            const enhancedDescription = await generateEnhancedContent({
                title: experience.jobTitle,
                company: experience.company,
                points: experience.responsibilities,
                preferences: learnedPreferences,
            });

            const newExperience = [...resumeData.experience];
            newExperience[index] = { ...newExperience[index], responsibilities: enhancedDescription };
            setResumeData(prev => ({ ...prev, experience: newExperience }));
            
            // Track for feedback
            setAiContentTracker(prev => ({
                ...prev,
                experience: { ...prev.experience, [index]: enhancedDescription }
            }));

        } catch (error) {
            console.error("Error generating experience:", error);
            setAnalysisResult('<p>An error occurred while enhancing the experience. Please try again.</p>');
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleGenerateSuggestion = async (section: 'summary' | 'experience', index?: number) => {
        if (!targetJobRole) {
            setAnalysisResult('<p>Please enter a target job role first to get AI suggestions.</p>');
            setIsModalOpen(true);
            return;
        }

        setIsLoading(true);

        if (section === 'summary') {
            setLoadingMessage('Generating professional summary...');
            try {
                const suggestion = await generateContentSuggestion({ 
                    targetJobRole, 
                    sectionType: 'summary',
                    preferences: learnedPreferences,
                });
                setResumeData(prev => ({ ...prev, summary: suggestion }));
                setAiContentTracker(prev => ({ ...prev, summary: suggestion }));
            } catch (error) {
                console.error("Error generating summary:", error);
                setAnalysisResult('<p>An error occurred while generating the summary. Please try again.</p>');
                setIsModalOpen(true);
            }
        } else if (section === 'experience' && index !== undefined) {
            setLoadingMessage('Generating experience description...');
            const experience = resumeData.experience[index];
            try {
                const suggestion = await generateContentSuggestion({
                    targetJobRole,
                    sectionType: 'experience',
                    context: { jobTitle: experience.jobTitle, company: experience.company },
                    preferences: learnedPreferences,
                });
                const newExperience = [...resumeData.experience];
                newExperience[index] = { ...newExperience[index], responsibilities: suggestion };
                setResumeData(prev => ({ ...prev, experience: newExperience }));
                setAiContentTracker(prev => ({
                    ...prev,
                    experience: { ...prev.experience, [index]: suggestion }
                }));
            } catch (error) {
                console.error("Error generating experience suggestion:", error);
                setAnalysisResult('<p>An error occurred while generating the experience suggestion. Please try again.</p>');
                setIsModalOpen(true);
            }
        }

        setIsLoading(false);
        setLoadingMessage('');
    };

    const handleGenerateCoverLetter = async () => {
        setIsLoading(true);
        setLoadingMessage('Generating Cover Letter...');
        setCoverLetter(''); // Clear previous letter
        try {
            const stream = await generateCoverLetter({
                resumeData,
                jobDescription,
                companyName,
                hiringManager
            });
            for await (const chunk of stream) {
                setCoverLetter(prev => prev + chunk);
            }
        } catch (error) {
            console.error("Error generating cover letter:", error);
            setAnalysisResult('<p>An error occurred while generating the cover letter. Please try again.</p>');
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateInterviewPrep = async () => {
        const { personalInfo, summary, experience, education, skills, certifications } = resumeData;
        const sections = [
            `Name: ${personalInfo.name}`,
            `Contact: ${[personalInfo.email, personalInfo.phone, personalInfo.address, personalInfo.linkedin, personalInfo.github, personalInfo.website].filter(Boolean).join(' | ')}`,
            summary ? `\nPROFESSIONAL SUMMARY\n${summary}` : '',
            experience.length > 0 ? `\nWORK EXPERIENCE\n${experience.map(exp => 
                `${exp.jobTitle} - ${exp.company} (${exp.startDate} to ${exp.endDate})\n${exp.responsibilities}`
            ).join('\n\n')}` : '',
            education.length > 0 ? `\nEDUCATION\n${education.map(edu => 
                `${edu.degree}, ${edu.institution} (${edu.gradDate})`
            ).join('\n')}` : '',
            certifications.length > 0 ? `\nCERTIFICATIONS\n${certifications.map(cert => `${cert.name} - ${cert.issuer} (${cert.date})`).join('\n')}` : '',
            skills.length > 0 ? `\nSKILLS\n${skills.map(skill => skill.name).join(', ')}` : ''
        ];
        const resumeText = sections.filter(Boolean).join('\n\n');

        if (!resumeData.personalInfo.name || experience.length === 0 || !jobDescription) return;
    
        setIsLoading(true);
        setLoadingMessage('Generating your Interview Prep Kit...');
        try {
            const result = await generateInterviewPrep(resumeText, jobDescription);
            setInterviewPrepData(result);
        } catch (error) {
            console.error("Error generating interview prep:", error);
            setAnalysisResult('<p>An error occurred while generating the interview prep kit. Please try again.</p>');
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleSuggestionEdited = async (section: 'summary' | 'experience', index?: number) => {
        let originalText: string | undefined;
        let editedText: string | undefined;

        if (section === 'summary') {
            originalText = aiContentTracker.summary;
            editedText = resumeData.summary;
        } else if (section === 'experience' && index !== undefined) {
            originalText = aiContentTracker.experience?.[index];
            editedText = resumeData.experience[index]?.responsibilities;
        }

        if (originalText && editedText && originalText !== editedText) {
            setIsLoading(true);
            setLoadingMessage('Learning from your edit...');
            try {
                const newPreference = await learnFromEdit({ originalText, userText: editedText });
                setLearnedPreferences(prev => prev ? `${prev}\n- ${newPreference}` : `- ${newPreference}`);
                
                // Clear tracker for this item
                if (section === 'summary') {
                    setAiContentTracker(prev => ({ ...prev, summary: undefined }));
                } else if (section === 'experience' && index !== undefined) {
                    const newExpTracker = { ...aiContentTracker.experience };
                    delete newExpTracker[index];
                    setAiContentTracker(prev => ({ ...prev, experience: newExpTracker }));
                }

            } catch (error) {
                console.error("Error learning from edit:", error);
                // Optionally show an error to the user
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        }
    };


    const getResumeTextContent = () => {
        if (!resumePreviewRef.current) return '';
        return resumePreviewRef.current.innerText;
    }

    const handleATSCheck = async () => {
        const resumeText = getResumeTextContent();
        if (!resumeText) return;
    
        setIsLoading(true);
        setLoadingMessage('Performing ATS compatibility check...');
    
        let analysisHtml;
        try {
            const stream = await runATSCheck(resumeText);
            let fullResult = '';
            for await (const chunk of stream) {
                fullResult += chunk;
            }
            analysisHtml = fullResult;
        } catch (error) {
            console.error("Error with ATS check:", error);
            analysisHtml = '<p>An error occurred during the ATS check. Please try again.</p>';
        }
    
        setAnalysisResult(analysisHtml);
        setIsLoading(false);
        setLoadingMessage('');
        setIsModalOpen(true);
    };
    
    const handleJobMatch = async () => {
        const resumeText = getResumeTextContent();
        if (!resumeText || !jobDescription) return;
    
        setIsLoading(true);
        setLoadingMessage('Analyzing resume against job description...');
    
        let analysisHtml;
        try {
            const stream = await runJobMatch(resumeText, jobDescription);
            let fullResult = '';
            for await (const chunk of stream) {
                fullResult += chunk;
            }
            analysisHtml = fullResult;
        } catch (error) {
            console.error("Error with Job Match:", error);
            analysisHtml = '<p>An error occurred during the job match analysis. Please try again.</p>';
        }
    
        setAnalysisResult(analysisHtml);
        setIsLoading(false);
        setLoadingMessage('');
        setIsModalOpen(true);
    };

    const handleExportPDF = async () => {
        const resumeContainer = resumePreviewRef.current;
        if (!resumeContainer) {
            console.error("Resume preview element not found for PDF export.");
            return;
        }
    
        setIsLoading(true);
        setLoadingMessage('Generating PDF...');
    
        try {
            await document.fonts.ready;
    
            const canvas = await html2canvas(resumeContainer, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
            // Add clickable links to the PDF
            const linkElements = resumeContainer.querySelectorAll<HTMLAnchorElement>('[data-pdf-link]');
            const containerRect = resumeContainer.getBoundingClientRect();
            
            const scaleX = pdfWidth / containerRect.width;
            const scaleY = pdfHeight / containerRect.height;
    
            linkElements.forEach(link => {
                const href = link.getAttribute('data-pdf-link');
                if (href) {
                    const linkRect = link.getBoundingClientRect();
                    const pdfX = (linkRect.left - containerRect.left) * scaleX;
                    const pdfY = (linkRect.top - containerRect.top) * scaleY;
                    const pdfW = linkRect.width * scaleX;
                    const pdfH = linkRect.height * scaleY;
                    pdf.link(pdfX, pdfY, pdfW, pdfH, { url: href });
                }
            });
    
            pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            setAnalysisResult('<p>An error occurred while generating the PDF. Please try again.</p>');
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const getFullHtmlForExport = async (element: HTMLElement, title: string): Promise<string> => {
        const cssPromises = Array.from(document.styleSheets)
            .filter(sheet => sheet.href)
            .map(sheet => fetch(sheet.href!).then(res => res.text()).catch(e => {
                console.warn('Could not fetch stylesheet:', sheet.href, e);
                return '';
            }));

        const fetchedCss = await Promise.all(cssPromises);
        let cssText = fetchedCss.join('\n');
        
        const localStyles = Array.from(document.querySelectorAll('style')).map(style => style.innerHTML).join('\n');
        cssText += localStyles;

        const wrapperStart = `
            <body class="flex justify-center items-start min-h-screen p-8 bg-slate-100 dark:bg-slate-900">
        `;
        const wrapperEnd = `
            </body>
        `;

        return `
            <!DOCTYPE html>
            <html lang="en" class="${document.documentElement.className}">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>${cssText}</style>
            </head>
            <body>
                ${wrapperStart}
                    ${element.outerHTML}
                ${wrapperEnd}
            </body>
            </html>`;
    };
    
    const handleExportHTML = async () => {
        if (!resumePreviewRef.current) return;
        setIsLoading(true);
        setLoadingMessage('Generating HTML...');
        try {
            const fullHtml = await getFullHtmlForExport(resumePreviewRef.current, `${resumeData.personalInfo.name}'s Resume`);
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating HTML:", error);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleExportDOCX = async () => {
        if (!resumeData) return;
        setIsLoading(true);
        setLoadingMessage('Generating DOCX...');

        try {
            const { personalInfo, summary, experience, education, skills, references, certifications } = resumeData;
            
            const formatResponsibilitiesForDocx = (text: string) => {
                return text.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('-') && line.length > 1)
                    .map(line => new Paragraph({
                        text: line.substring(1).trim(),
                        bullet: { level: 0 },
                        style: "wellSpaced"
                    }));
            };
    
            const children = [];
    
            // Personal Info
            children.push(new Paragraph({
                children: [new TextRun({ text: personalInfo.name, bold: true, size: 48, font: "Roboto Slab" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }));
            
            const contactInfo = [
                personalInfo.email,
                personalInfo.phone,
                personalInfo.address,
                personalInfo.linkedin,
                personalInfo.github,
                personalInfo.website
            ].filter(Boolean).join(' | ');
    
            children.push(new Paragraph({
                children: [new TextRun({ text: contactInfo, size: 20, font: "Inter" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
            }));
    
            const sectionHeading = (text: string) => new Paragraph({
                text: text.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { after: 150, before: 150 }
            });
    
            // Summary
            if (summary) {
                children.push(sectionHeading("Summary"));
                children.push(new Paragraph({
                    children: [new TextRun({ text: summary, size: 20, font: "Inter" })],
                    style: "wellSpaced"
                }));
            }
    
            // Experience
            if (experience.length > 0) {
                children.push(sectionHeading("Experience"));
                
                experience.forEach(exp => {
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: exp.jobTitle, bold: true, size: 24, font: "Roboto Slab" }),
                            new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, size: 20, font: "Inter" }),
                        ],
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                    }));
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: exp.company, size: 22, font: "Inter" }),
                            new TextRun({ text: `\t${exp.location}`, size: 20, font: "Inter" }),
                        ],
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                        spacing: { after: 100 }
                    }));
    
                    const responsibilities = formatResponsibilitiesForDocx(exp.responsibilities);
                    children.push(...responsibilities);
                    children.push(new Paragraph({ text: "", spacing: { after: 200 }}));
                });
            }
            
            // Education
            if (education.length > 0) {
                children.push(sectionHeading("Education"));
    
                education.forEach(edu => {
                     children.push(new Paragraph({
                        children: [
                            new TextRun({ text: edu.institution, bold: true, size: 24, font: "Roboto Slab" }),
                            new TextRun({ text: `\t${edu.gradDate}`, size: 20, font: "Inter" }),
                        ],
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                    }));
                     children.push(new Paragraph({
                        children: [
                            new TextRun({ text: edu.degree, size: 22, font: "Inter" }),
                            new TextRun({ text: `\t${edu.location}`, size: 20, font: "Inter" }),
                        ],
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                        spacing: { after: 200 }
                    }));
                });
            }

            // Certifications
            if (certifications.length > 0) {
                children.push(sectionHeading("Certifications"));
                certifications.forEach(cert => {
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: cert.name, bold: true, size: 24, font: "Roboto Slab" }),
                            new TextRun({ text: `\t${cert.date}`, size: 20, font: "Inter" }),
                        ],
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                    }));
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: `Issued by: ${cert.issuer}`, size: 22, font: "Inter" }),
                        ],
                        spacing: { after: 200 }
                    }));
                });
            }
    
            // Skills
            if (skills.length > 0) {
                children.push(sectionHeading("Skills"));
                const skillsText = skills.map(s => s.name).join(' \u2022 ');
                children.push(new Paragraph({ text: skillsText, style: "wellSpaced" }));
            }
            
            // References
            if (references.length > 0) {
                 children.push(sectionHeading("References"));
                
                references.forEach(ref => {
                     children.push(new Paragraph({
                        children: [new TextRun({ text: ref.name, bold: true, size: 24, font: "Roboto Slab" })],
                    }));
                    if(ref.title || ref.company) children.push(new Paragraph({ text: `${ref.title}${ref.company ? `, ${ref.company}`: ''}`, size: 22, font: "Inter" }));
                    if(ref.email) children.push(new Paragraph({ text: ref.email, size: 22, font: "Inter" }));
                    if(ref.phone) children.push(new Paragraph({ text: ref.phone, size: 22, font: "Inter" }));
                    children.push(new Paragraph({ text: "", spacing: { after: 200 }}));
                });
            }
    
            const doc = new Document({
                styles: {
                    paragraphStyles: [
                        {
                            id: "wellSpaced",
                            name: "Well Spaced",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                font: "Inter",
                                size: 20,
                            },
                        },
                        {
                            id: "Heading1",
                            name: "Heading 1",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                font: "Roboto Slab",
                                size: 28,
                                bold: true,
                                color: "000000",
                            },
                        }
                    ]
                },
                sections: [{ children }]
            });
    
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${personalInfo.name.replace(' ', '_')}_Resume.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error generating DOCX:", err);
            setAnalysisResult('<p>An error occurred while generating the DOCX file. Please try again.</p>');
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleExportCoverLetterPDF = () => {
        const coverLetterElement = coverLetterPreviewRef.current;
        if (!coverLetterElement) return;

        setIsLoading(true);
        setLoadingMessage('Generating Cover Letter PDF...');

        html2canvas(coverLetterElement, {
            scale: 3, // High resolution capture
            useCORS: true,
            backgroundColor: '#ffffff',
        }).then((canvas) => {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // The captured canvas should have the same A4 aspect ratio as the preview div,
            // so we can fit it directly to the page.
            pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Cover_Letter.pdf`);
        }).catch(err => {
            console.error("Error generating PDF:", err);
            setAnalysisResult('<p>An error occurred while generating the PDF. Please try again.</p>');
            setIsModalOpen(true);
        }).finally(() => {
            setIsLoading(false);
            setLoadingMessage('');
        });
    };

    const handleRequestReset = () => {
        setIsResetModalOpen(true);
    };

    const handleConfirmReset = () => {
        // Clear local storage
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        // Reset all state to initial values
        resetResumeDataHistory(INITIAL_RESUME_DATA);
        setJobDescription('');
        setTargetJobRole('Senior Software Engineer');
        setLearnedPreferences('');
        setTemplate('classic');
        setAccentColor('#0ea5e9');
        setFontFamily('sans');
        setFontSize('base');
        setSpacing('normal');
        setCoverLetter('');
        setCompanyName('');
        setHiringManager('');
        setCompanyAddress('');
        setInterviewPrepData(null);
        
        // Close the modal
        setIsResetModalOpen(false);
    };


    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors duration-300">
            {isLoading && <LoadingSpinner message={loadingMessage} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Analysis Result">
                <div className="analysis-report" dangerouslySetInnerHTML={{ __html: analysisResult }} />
            </Modal>
            <Modal isOpen={isDocsModalOpen} onClose={() => setIsDocsModalOpen(false)} title="API Usage & Limitations">
                <ApiDocumentation />
            </Modal>
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmReset}
                title="Reset All Data"
            >
                <p>Are you sure you want to reset all your data? This will clear everything you've entered and cannot be undone.</p>
            </ConfirmationModal>
            
            <Header onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onDocsClick={() => setIsDocsModalOpen(true)} theme={theme} onToggleTheme={toggleTheme} />

            <main className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-screen-2xl mx-auto">
                    
                    <div>
                         <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
                            <div title="Content">
                                <div className="space-y-6">
                                    <UserInputForm 
                                       resumeData={resumeData} 
                                       onDataChange={handleDataChange} 
                                       onGenerateExperience={handleGenerateExperience}
                                       targetJobRole={targetJobRole}
                                       onTargetJobRoleChange={setTargetJobRole}
                                       onGenerateSuggestion={handleGenerateSuggestion}
                                       onSuggestionEdited={handleSuggestionEdited}
                                    />
                                    <FeedbackDisplay 
                                        preferences={learnedPreferences} 
                                        onClear={() => setLearnedPreferences('')} 
                                    />
                                </div>
                            </div>
                             <div title="Cover Letter">
                                <CoverLetterGenerator
                                    coverLetter={coverLetter}
                                    companyName={companyName}
                                    onCompanyNameChange={setCompanyName}
                                    hiringManager={hiringManager}
                                    onHiringManagerChange={setHiringManager}
                                    companyAddress={companyAddress}
                                    onCompanyAddressChange={setCompanyAddress}
                                    jobDescription={jobDescription}
                                    onGenerate={handleGenerateCoverLetter}
                                    onExportPDF={handleExportCoverLetterPDF}
                                    isLoading={isLoading}
                                    hasResume={!!resumeData.personalInfo.name && resumeData.experience.length > 0}
                                />
                            </div>
                            <div title="Interview Prep">
                                <InterviewPrepGenerator
                                    onGenerate={handleGenerateInterviewPrep}
                                    onClear={() => setInterviewPrepData(null)}
                                    hasData={!!interviewPrepData}
                                    isLoading={isLoading}
                                    resumeName={resumeData.personalInfo.name}
                                    resumeExperienceCount={resumeData.experience.length}
                                    jobDescription={jobDescription}
                                />
                            </div>
                            <div title="Design">
                                <TemplateSelector 
                                    currentTemplate={template}
                                    onTemplateChange={setTemplate}
                                    accentColor={accentColor}
                                    onAccentColorChange={setAccentColor}
                                    fontFamily={fontFamily}
                                    onFontFamilyChange={setFontFamily}
                                    fontSize={fontSize}
                                    onFontSizeChange={setFontSize}
                                    spacing={spacing}
                                    onSpacingChange={setSpacing}
                                />
                            </div>
                            <div title="Analyze & Export">
                                <ActionPanel 
                                    jobDescription={jobDescription}
                                    onJobDescriptionChange={setJobDescription}
                                    onATSCheck={handleATSCheck}
                                    onJobMatch={handleJobMatch}
                                    onExportPDF={handleExportPDF}
                                    onExportHTML={handleExportHTML}
                                    onExportDOCX={handleExportDOCX}
                                    onResetResume={handleRequestReset}
                                    isLoading={isLoading}
                                />
                            </div>
                        </Tabs>
                    </div>
                    
                    <div className="lg:sticky top-28 self-start space-y-6">
                       {activeTab === 'Cover Letter' ? (
                            <CoverLetterPreview
                                ref={coverLetterPreviewRef}
                                personalInfo={resumeData.personalInfo}
                                companyName={companyName}
                                hiringManager={hiringManager}
                                companyAddress={companyAddress}
                                coverLetter={coverLetter}
                            />
                        ) : activeTab === 'Interview Prep' ? (
                            <InterviewPrepPreview data={interviewPrepData} />
                        ) : (
                            <ResumePreview 
                                ref={resumePreviewRef} 
                                data={resumeData} 
                                template={template}
                                accentColor={accentColor}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                                spacing={spacing}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;