import React, { forwardRef } from 'react';
import type { ResumeData, TemplateName, FontFamily, FontSize, Spacing } from '../types';

interface ResumePreviewProps {
    data: ResumeData;
    template: TemplateName;
    accentColor: string;
    fontFamily: FontFamily;
    fontSize: FontSize;
    spacing: Spacing;
}

// --- FONT & SPACING MAPS ---
const FONT_FAMILY_MAP: Record<FontFamily, string> = { sans: 'font-sans', serif: 'font-serif' };
const FONT_SIZE_MAP: Record<FontSize, Record<string, string>> = {
  sm: { h1: 'text-2xl', h1_modern: 'text-3xl', contact: 'text-[9px]', summary: 'text-[10px]', sectionTitle: 'text-xs', jobTitle: 'text-sm', itemTitle: 'text-xs', itemDetail: 'text-[10px]', itemDate: 'text-[9px]', skill: 'text-[10px]' },
  base: { h1: 'text-3xl', h1_modern: 'text-4xl', contact: 'text-xs', summary: 'text-xs', sectionTitle: 'text-sm', jobTitle: 'text-base', itemTitle: 'text-sm', itemDetail: 'text-xs', itemDate: 'text-xs', skill: 'text-xs' },
  lg: { h1: 'text-4xl', h1_modern: 'text-5xl', contact: 'text-sm', summary: 'text-sm', sectionTitle: 'text-base', jobTitle: 'text-lg', itemTitle: 'text-base', itemDetail: 'text-sm', itemDate: 'text-sm', skill: 'text-sm' }
};
const SPACING_MAP: Record<Spacing, Record<string, string>> = {
  compact: { section: 'mb-4', item: 'mb-2', list: 'space-y-0.5', header: 'mb-4', headerGap: 'gap-y-0.5', p: 'leading-snug', li: 'mb-0.5', contactGap: 'gap-x-3 gap-y-1', p_sm: 'p-4 sm:p-6', p_creative: 'p-4' },
  normal: { section: 'mb-6', item: 'mb-4', list: 'space-y-1', header: 'mb-6', headerGap: 'gap-y-1', p: 'leading-relaxed', li: 'mb-1', contactGap: 'gap-x-4 gap-y-1.5', p_sm: 'p-6 sm:p-8', p_creative: 'p-6' },
  relaxed: { section: 'mb-8', item: 'mb-6', list: 'space-y-2', header: 'mb-8', headerGap: 'gap-y-2', p: 'leading-loose', li: 'mb-2', contactGap: 'gap-x-6 gap-y-2', p_sm: 'p-8 sm:p-10', p_creative: 'p-8' }
};

// --- CONTACT HELPERS ---
const ContactItem: React.FC<{ text: string; href?: string; show: boolean; textClassName?: string; hoverClassName?: string; creative?: boolean }> = ({ text, href, show, textClassName = 'text-slate-500', hoverClassName = 'hover:text-sky-500', creative = false }) => {
    if (!show || !text) return null;

    const content = <>{text}</>; 

    const link = href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`break-all transition-colors ${textClassName} ${hoverClassName}`} data-pdf-link={href}>
            {content}
        </a>
    ) : <span className={`break-all ${textClassName}`}>{content}</span>;

    const liClassName = creative
        ? `flex items-center`
        : `flex items-center after:content-['•'] after:mx-2 after:text-slate-400 last:after:content-['']`;

    return <li className={liClassName}>{link}</li>;
};


const getWebsiteText = (url: string) => {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
};

const formatResponsibilities = (text: string, sizeClass: string, spacingClass: string) => {
    return text.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('-')) {
            return (
                <li key={index} className={`text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400 ${sizeClass} ${spacingClass}`}>
                    {trimmedLine.substring(1).trim()}
                </li>
            );
        }
        return null;
    }).filter(Boolean);
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, template, accentColor, fontFamily, fontSize, spacing }, ref) => {
    const { personalInfo, summary, experience, education, skills, references, certifications } = data;
    
    const sizeStyles = FONT_SIZE_MAP[fontSize];
    const spacingStyles = SPACING_MAP[spacing];

    // --- SHARED CONTENT COMPONENTS ---
    const ExperienceItems = () => (
        <>
            {experience.map(exp => (
                <div key={exp.id} className={`${spacingStyles.item} break-inside-avoid`}>
                    <div className="flex justify-between items-baseline">
                        <h3 className={`${sizeStyles.jobTitle} font-bold text-slate-700`}>{exp.jobTitle || "Job Title"}</h3>
                        <p className={`${sizeStyles.itemDate} text-slate-500 font-mono`}>{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className={`${sizeStyles.itemTitle} font-semibold text-slate-600`}>{exp.company || "Company"}</p>
                        <p className={`${sizeStyles.itemDetail} text-slate-500`}>{exp.location}</p>
                    </div>
                    <ul className={`list-none mt-2 ${spacingStyles.list}`}>
                        {formatResponsibilities(exp.responsibilities, sizeStyles.itemDetail, spacingStyles.li)}
                    </ul>
                </div>
            ))}
        </>
    );

    const EducationItems = () => (
        <>
            {education.map(edu => (
                <div key={edu.id} className={`${spacingStyles.item} break-inside-avoid`}>
                    <div className="flex justify-between items-baseline">
                        <h3 className={`${sizeStyles.itemTitle} font-bold text-slate-700`}>{edu.institution || "Institution"}</h3>
                        <p className={`${sizeStyles.itemDate} text-slate-500 font-mono`}>{edu.gradDate}</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <p className={`${sizeStyles.itemDetail} text-slate-600`}>{edu.degree || "Degree"}</p>
                        <p className={`${sizeStyles.itemDetail} text-slate-500`}>{edu.location}</p>
                    </div>
                </div>
            ))}
        </>
    );

    const CertificationItems = () => (
        <>
            {certifications.map(cert => (
                <div key={cert.id} className={`${spacingStyles.item} break-inside-avoid`}>
                    <div className="flex justify-between items-baseline">
                        <h3 className={`${sizeStyles.itemTitle} font-bold text-slate-700`}>{cert.name || "Certification Name"}</h3>
                        <p className={`${sizeStyles.itemDate} text-slate-500 font-mono`}>{cert.date}</p>
                    </div>
                    <p className={`${sizeStyles.itemDetail} text-slate-600`}>Issued by: {cert.issuer || "Issuing Organization"}</p>
                </div>
            ))}
        </>
    );
    
    const ReferenceItems = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {references.map(ref => (
                <div key={ref.id} className="break-inside-avoid">
                    <h3 className={`${sizeStyles.itemTitle} font-bold text-slate-700`}>{ref.name || "Reference Name"}</h3>
                    <p className={`${sizeStyles.itemDetail} text-slate-600`}>
                        {ref.title}
                        {ref.title && ref.company ? ', ' : ''}
                        {ref.company}
                    </p>
                    <div className={`${sizeStyles.itemDetail} text-slate-500 mt-1 space-y-0.5`}>
                        {ref.email && <p>Email: {ref.email}</p>}
                        {ref.phone && <p>Phone: {ref.phone}</p>}
                    </div>
                </div>
            ))}
        </div>
    );

    const ContactInfo: React.FC<{ alignment: 'center' | 'left', className?: string, creative?: boolean }> = ({ alignment, className, creative = false }) => {
        const textClass = creative ? 'text-white/90' : 'text-slate-500';
        const hoverClass = creative ? 'hover:text-white' : 'hover:text-sky-500';

        const ensureHttp = (url: string) => {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            return `https://${url}`;
        };

        const listClassName = creative 
            ? `flex flex-col items-start space-y-2 ${sizeStyles.contact} ${className}`
            : `flex items-center flex-wrap ${alignment === 'center' ? 'justify-center' : 'justify-start'} ${sizeStyles.contact} ${spacingStyles.contactGap} ${className}`;

        return (
            <ul className={listClassName}>
                <ContactItem text={personalInfo.email} href={`mailto:${personalInfo.email}`} show={!!personalInfo.email} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
                <ContactItem text={personalInfo.phone} show={!!personalInfo.phone} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
                <ContactItem text={personalInfo.address} show={!!personalInfo.address} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
                <ContactItem text={getWebsiteText(personalInfo.linkedin)} href={ensureHttp(personalInfo.linkedin)} show={!!personalInfo.linkedin} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
                <ContactItem text={getWebsiteText(personalInfo.github)} href={ensureHttp(personalInfo.github)} show={!!personalInfo.github} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
                <ContactItem text={getWebsiteText(personalInfo.website)} href={ensureHttp(personalInfo.website)} show={!!personalInfo.website} textClassName={textClass} hoverClassName={hoverClass} creative={creative} />
            </ul>
        );
    };

    const renderTemplate = () => {
        // --- CLASSIC TEMPLATE ---
        if (template === 'classic') {
            const Section: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
                if (!show) return null;
                return (
                    <section className={spacingStyles.section}>
                        <h2 className={`${sizeStyles.sectionTitle} font-bold uppercase tracking-widest border-b-2 pb-2 mb-3`} style={{ color: accentColor, borderColor: accentColor }}>{title}</h2>
                        {children}
                    </section>
                );
            };
            return (
                <>
                    <header className={`text-center ${spacingStyles.header}`}>
                        <h1 className={`${sizeStyles.h1} font-bold text-slate-800`}>{personalInfo.name || "Your Name"}</h1>
                        <ContactInfo alignment="center" className="mt-4" />
                    </header>
                    <main>
                        <Section title="Summary" show={!!summary}><p className={`${sizeStyles.summary} text-slate-600 ${spacingStyles.p}`}>{summary}</p></Section>
                        <Section title="Experience" show={experience.length > 0}><ExperienceItems /></Section>
                        <Section title="Education" show={education.length > 0}><EducationItems /></Section>
                        <Section title="Certifications" show={certifications.length > 0}><CertificationItems /></Section>
                        <Section title="Skills" show={skills.length > 0}>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill.id} className={`inline-flex items-center justify-center text-center bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md ${sizeStyles.skill}`}>{skill.name}</span>
                                ))}
                            </div>
                        </Section>
                        <Section title="References" show={references.length > 0}><ReferenceItems /></Section>
                    </main>
                </>
            );
        }

        // --- MODERN TEMPLATE ---
        if (template === 'modern') {
            const Section: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
                if (!show) return null;
                return (
                    <section className={spacingStyles.section}>
                        <h2 className={`${sizeStyles.sectionTitle} font-semibold uppercase tracking-widest text-slate-500 mb-3`}>{title}</h2>
                        {children}
                    </section>
                );
            };
            return (
                <>
                    <header className={`text-left ${spacingStyles.header} pb-4 border-b`} style={{ borderColor: accentColor }}>
                        <h1 className={`${sizeStyles.h1_modern} font-light tracking-wider text-slate-800 uppercase`}>{personalInfo.name || "Your Name"}</h1>
                        <ContactInfo alignment="left" className="mt-5" />
                    </header>
                    <main>
                        <Section title="Summary" show={!!summary}><p className={`${sizeStyles.summary} text-slate-600 ${spacingStyles.p}`}>{summary}</p></Section>
                        <Section title="Experience" show={experience.length > 0}><ExperienceItems /></Section>
                        <Section title="Education" show={education.length > 0}><EducationItems /></Section>
                        <Section title="Certifications" show={certifications.length > 0}><CertificationItems /></Section>
                        <Section title="Skills" show={skills.length > 0}>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill.id} className={`inline-flex items-center justify-center text-center bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md ${sizeStyles.skill}`}>{skill.name}</span>
                                ))}
                            </div>
                        </Section>
                        <Section title="References" show={references.length > 0}><ReferenceItems /></Section>
                    </main>
                </>
            );
        }

        // --- PROFESSIONAL TEMPLATE ---
        if (template === 'professional') {
            const Section: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
                if (!show) return null;
                return (
                    <section className={spacingStyles.section}>
                        <h2 className={`${sizeStyles.sectionTitle} font-bold uppercase tracking-wider text-slate-600 pb-3 mb-3 border-b-2 border-slate-200`}>{title}</h2>
                        {children}
                    </section>
                );
            };
            return (
                <>
                    <header className={`text-left ${spacingStyles.header}`}>
                        <h1 className={`${sizeStyles.h1} font-bold text-slate-800 tracking-tight`}>{personalInfo.name || "Your Name"}</h1>
                        <ContactInfo alignment="left" className="mt-4 mb-4" />
                        <hr style={{ borderColor: accentColor, borderWidth: '1px' }}/>
                    </header>
                    <main>
                        <Section title="Summary" show={!!summary}><p className={`${sizeStyles.summary} text-slate-600 ${spacingStyles.p}`}>{summary}</p></Section>
                        <Section title="Experience" show={experience.length > 0}><ExperienceItems /></Section>
                        <Section title="Education" show={education.length > 0}><EducationItems /></Section>
                        <Section title="Certifications" show={certifications.length > 0}><CertificationItems /></Section>
                        <Section title="Skills" show={skills.length > 0}>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill.id} className={`inline-flex items-center justify-center text-center bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md ${sizeStyles.skill}`}>{skill.name}</span>
                                ))}
                            </div>
                        </Section>
                        <Section title="References" show={references.length > 0}><ReferenceItems /></Section>
                    </main>
                </>
            );
        }

        // --- CREATIVE TEMPLATE ---
        if (template === 'creative') {
            const MainSection: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
                if (!show) return null;
                return (
                    <section className={spacingStyles.section}>
                        <h2 className={`${sizeStyles.sectionTitle} font-bold uppercase tracking-widest border-b-2 pb-2 mb-3`} style={{ color: accentColor, borderColor: accentColor }}>{title}</h2>
                        {children}
                    </section>
                );
            };
            const SidebarSection: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
                if (!show) return null;
                return (
                    <section className={spacingStyles.section}>
                        <h2 className={`${sizeStyles.sectionTitle} font-bold uppercase tracking-widest text-white/80 pb-1 mb-3`}>{title}</h2>
                        {children}
                    </section>
                );
            };
            return (
                <div className="flex h-full">
                    <aside className={`w-1/3 text-white ${spacingStyles.p_creative}`} style={{ backgroundColor: accentColor }}>
                        <header className={spacingStyles.header}>
                            <h1 className={`${sizeStyles.h1} font-bold`}>{personalInfo.name || "Your Name"}</h1>
                        </header>
                        <SidebarSection title="Contact" show={true}>
                             <ContactInfo alignment="left" creative={true} />
                        </SidebarSection>
                        <SidebarSection title="Skills" show={skills.length > 0}>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill.id} className={`inline-flex items-center justify-center text-center bg-white/20 text-white font-medium px-2 py-1 rounded ${sizeStyles.skill}`}>
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </SidebarSection>
                    </aside>
                    <main className={`w-2/3 ${spacingStyles.p_creative} overflow-y-auto`}>
                        <MainSection title="Summary" show={!!summary}><p className={`${sizeStyles.summary} text-slate-600 ${spacingStyles.p}`}>{summary}</p></MainSection>
                        <MainSection title="Experience" show={experience.length > 0}><ExperienceItems /></MainSection>
                        <MainSection title="Education" show={education.length > 0}><EducationItems /></MainSection>
                        <MainSection title="Certifications" show={certifications.length > 0}><CertificationItems /></MainSection>
                        <MainSection title="References" show={references.length > 0}><ReferenceItems /></MainSection>
                    </main>
                </div>
            );
        }

        return null;
    };

    return (
        <div ref={ref} id="resume-preview" className={`bg-white shadow-lg border border-slate-200 dark:border-slate-700 aspect-[210/297] max-w-full overflow-hidden ${FONT_FAMILY_MAP[fontFamily]}`}>
             <div className={`resume-content-wrapper w-full h-full ${template === 'creative' ? '' : `${spacingStyles.p_sm} overflow-y-auto`}`}>
                {renderTemplate()}
            </div>
        </div>
    );
});