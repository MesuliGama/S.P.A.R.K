import { GoogleGenAI, Type } from '@google/genai';
import type { ResumeData, InterviewPrepData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Reusable async generator to handle streaming text responses from the API
async function* streamText(
    model: string,
    prompt: string
): AsyncGenerator<string> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            // Ensure chunk and text property exist before yielding
            if (chunk && chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Gemini API stream call failed:", error);
        throw new Error(`Failed to get stream from Gemini API: ${error}`);
    }
}

export const learnFromEdit = async (
    { originalText, userText }: { originalText: string; userText: string; }
): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are a helpful assistant that analyzes user edits to AI-generated text to understand their preferences.

        An AI generated the 'ORIGINAL TEXT'. The user then edited it to produce the 'USER'S TEXT'.
        Based on the differences, describe the user's preference in a single, concise, actionable sentence that can be used to guide future AI generations.

        For example, if the user added metrics, the preference could be "The user prefers to include quantifiable achievements and metrics."
        If the user made sentences shorter, the preference could be "The user prefers shorter, more direct sentences."
        If the user changed the tone to be more formal, the preference could be "The user prefers a more formal and professional tone."

        ---
        ORIGINAL TEXT:
        ${originalText}
        ---
        USER'S TEXT:
        ${userText}
        ---

        USER PREFERENCE:
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call for learning failed:", error);
        throw new Error("Failed to learn from edit using Gemini API.");
    }
}

export const generateEnhancedContent = async (
    { title, company, points, preferences }: { title: string; company: string; points: string; preferences?: string; }
): Promise<string> => {
    const model = 'gemini-2.5-flash';
    let prompt = `
        You are a professional resume writer. Based on the following job title '${title}' at '${company}', and user-provided key responsibilities/achievements:
        ---
        ${points}
        ---
        Rewrite them into 3-5 professional, action-oriented bullet points for an ATS-friendly resume.
        Each bullet point should start with a strong action verb and be a single, concise sentence.
        Quantify achievements with metrics where possible, even if you have to invent realistic numbers based on the context.
        Return only the bullet points, each on a new line starting with '- '. Do not include any other text, titles, or explanations.
    `;

    if (preferences) {
        prompt += `\n\nIMPORTANT: When generating the text, adhere to the following user preferences that have been learned from their past edits:\n${preferences}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate content from Gemini API.");
    }
};

export const generateContentSuggestion = async (
    { targetJobRole, sectionType, context, preferences }: {
        targetJobRole: string;
        sectionType: 'summary' | 'experience';
        context?: { jobTitle?: string; company?: string };
        preferences?: string;
    }
): Promise<string> => {
    const model = 'gemini-2.5-flash';
    let prompt = '';

    if (sectionType === 'summary') {
        prompt = `
            You are a professional resume writer. Write a compelling, 2-3 sentence professional summary for a resume targeting the role of a '${targetJobRole}'.
            Highlight key skills and experience relevant to this role.
            Return only the summary text, without any titles or explanations.
        `;
    } else if (sectionType === 'experience' && context) {
        prompt = `
            You are a professional resume writer. For a job title of '${context.jobTitle || 'employee'}' at company '${context.company || 'a company'}', in the context of a career targeting '${targetJobRole}', generate 3-5 professional, action-oriented bullet points describing key responsibilities and achievements.
            Each bullet point should start with a strong action verb and be a single, concise sentence.
            Quantify achievements with metrics where possible, even if you have to invent realistic numbers based on the context.
            Return only the bullet points, each on a new line starting with '- '. Do not include any other text, titles, or explanations.
        `;
    } else {
        throw new Error("Invalid parameters for content suggestion.");
    }
    
    if (preferences) {
        prompt += `\n\nIMPORTANT: When generating the text, adhere to the following user preferences that have been learned from their past edits:\n${preferences}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate content suggestion from Gemini API.");
    }
};

export const generateCoverLetter = async (
    { resumeData, jobDescription, companyName, hiringManager }:
    { resumeData: ResumeData; jobDescription: string; companyName: string; hiringManager?: string; }
): Promise<AsyncGenerator<string>> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are a professional career coach. Write a compelling and professional cover letter for a job application that is concise and fits on a single page with standard formatting (1-inch margins, 11pt font).

        Use the provided resume and job description to tailor the cover letter. The tone should be enthusiastic, professional, and confident.

        **FORMATTING REQUIREMENTS:**
        - **Word Count:** Strictly between 180 and 200 words.
        - **Structure:** 3-4 concise paragraphs for the body.
        - **Paragraph Spacing:** Separate each paragraph with a double newline (\\n\\n).

        **DETAILS:**
        - Company Name: ${companyName}
        - Hiring Manager: ${hiringManager || 'Hiring Manager'}
        - The letter should highlight 2-3 key skills or experiences from the resume that are most relevant to the job description.
        - It must express genuine interest in the role and the company.
        - End with a strong call to action.

        **CANDIDATE'S RESUME:**
        ---
        Name: ${resumeData.personalInfo.name}
        Summary: ${resumeData.summary}
        Experience:
        ${resumeData.experience.map(exp => `- ${exp.jobTitle} at ${exp.company}: ${exp.responsibilities.replace(/\n/g, ' ')}`).join('\n')}
        Skills: ${resumeData.skills.map(s => s.name).join(', ')}
        Certifications: ${resumeData.certifications.map(c => `${c.name} - ${c.issuer}`).join(', ') || 'N/A'}
        ---

        **JOB DESCRIPTION:**
        ---
        ${jobDescription}
        ---

        Generate only the cover letter text, starting with a salutation (e.g., "Dear ${hiringManager || 'Hiring Manager'},") and ending with a closing (e.g., "Sincerely,\\n${resumeData.personalInfo.name}"). Do not include any other explanations or surrounding text.
    `;

    return streamText(model, prompt);
};

export const generateInterviewPrep = async (resumeText: string, jobDescription: string): Promise<InterviewPrepData> => {
    const model = 'gemini-2.5-pro'; // Using pro for better reasoning
    const prompt = `
        You are an expert career coach and interview preparer. Based on the provided resume and job description, generate a comprehensive and personalized interview preparation kit.

        ---RESUME---
        ${resumeText}
        ---END RESUME---

        ---JOB DESCRIPTION---
        ${jobDescription}
        ---END JOB DESCRIPTION---

        Generate the output in a structured JSON format. The kit must contain:
        1.  'behavioralQuestions': An array of 5-7 likely behavioral questions. For each question, provide a suggested answer using the STAR method (Situation, Task, Action, Result), tailored specifically to the experiences listed in the resume. The answer for each part of STAR should be a single, concise paragraph.
        2.  'technicalQuestions': An array of 3-5 potential technical questions based on the skills and technologies mentioned in both the resume and the job description.
        3.  'questionsForInterviewer': An array of 3 insightful questions the candidate can ask the interviewer to demonstrate their interest and intelligence.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            behavioralQuestions: {
                type: Type.ARRAY,
                description: "A list of behavioral questions with STAR-method answers.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: "The interview question." },
                        answer: {
                            type: Type.OBJECT,
                            properties: {
                                situation: { type: Type.STRING, description: "Describe the context/situation." },
                                task: { type: Type.STRING, description: "Describe your role or task." },
                                action: { type: Type.STRING, description: "Describe the action you took." },
                                result: { type: Type.STRING, description: "Describe the outcome or result." },
                            },
                            required: ["situation", "task", "action", "result"]
                        }
                    },
                    required: ["question", "answer"]
                }
            },
            technicalQuestions: {
                type: Type.ARRAY,
                description: "A list of potential technical questions.",
                items: { type: Type.STRING }
            },
            questionsForInterviewer: {
                type: Type.ARRAY,
                description: "A list of insightful questions for the candidate to ask.",
                items: { type: Type.STRING }
            }
        },
        required: ["behavioralQuestions", "technicalQuestions", "questionsForInterviewer"]
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as InterviewPrepData;
    } catch (error) {
        console.error("Gemini API call for interview prep failed:", error);
        throw new Error("Failed to generate interview prep kit from Gemini API.");
    }
};

export const runATSCheck = async (resumeText: string): Promise<AsyncGenerator<string>> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Act as an advanced Applicant Tracking System (ATS) checker. Analyze the following resume text for ATS compatibility.
        ---
        ${resumeText}
        ---
        Provide a detailed, easy-to-read analysis. Keep all points clear and concise. Format the entire output as clean, semantic HTML. Do not include <!DOCTYPE>, <html>, or <body> tags.

        IMPORTANT: Generate the response as a stream of valid HTML. Start with the match-score-container div and stream the rest of the content progressively. Do not wait for the full analysis to be complete before sending the initial HTML structure.

        The output MUST follow this structure:
        1.  A 'div' with class "match-score-container". Inside it, a 'p' tag with: the text "ATS Score: ", a 'span' with class "score-value" containing a percentage, and an info icon with a tooltip: '<span title="This score represents the estimated compatibility of your resume with Applicant Tracking Systems. Higher is better." class="cursor-help"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block ml-2 text-slate-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></span>'.
        2.  A 'div' with class "analysis-grid ats-check-grid". This div should contain 'details' elements with class "analysis-card", all open by default with the 'open' attribute.
        3.  Each card must have a 'summary' tag containing an 'h3'. The h3 must contain: a specific SVG icon with classes "h-6 w-6 mr-3", the title in a 'span', and an info icon with a relevant tooltip.
        4.  The card's content, inside the 'details' tag but after the 'summary', must be a 'ul' with class "analysis-list". Each point must be a 'li' tag with class "analysis-list-item".
        5.  - Positive points: 'li' should have class "positive".
        6.  - Negative points: 'li' should have class "negative".
        7.  - Suggestions: 'li' should have class "suggestion".
        8.  The cards inside the grid must be:
            - "Keyword Analysis" (class "strengths", Magnifying Glass icon)
            - "Formatting & Parseability" (class "weaknesses", Document Text icon)
            - "Clarity & Action Verbs" (class "strengths", Rocket Launch icon)
            - "Actionable Suggestions" (class "suggestions", Wrench & Screwdriver icon).
        9.  IMPORTANT: After the 'analysis-grid' div, create a new, separate 'div' with classes "analysis-card feedback" (NOT a <details> element). It must have an 'h3' with an 'Information Circle' SVG icon (h-6 w-6 mr-3) and the title "Overall Feedback". Its content should be a single 'p' tag with a concise, one-paragraph summary.

        Use these SVGs for section headers:
        - Keyword Analysis (Magnifying Glass): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
        - Formatting & Parseability (Document Text): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
        - Clarity & Action Verbs (Rocket Launch): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 5.05a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM6.343 14.243a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM12.95 14.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM10 14c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" /></svg>
        - Actionable Suggestions (Wrench/Screwdriver): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>
        - Overall Feedback (Information Circle): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
    `;

    return streamText(model, prompt);
};

export const runJobMatch = async (resumeText: string, jobDescription: string): Promise<AsyncGenerator<string>> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are a professional career coach providing a job match analysis. Compare the following resume with the provided job description.
        
        ---RESUME---
        ${resumeText}
        ---END RESUME---

        ---JOB DESCRIPTION---
        ${jobDescription}
        ---END JOB DESCRIPTION---
        
        Provide a detailed, easy-to-read analysis. For all sections, ensure each bullet point is clear, concise, and easy to read. If a point is complex, break it into a shorter sentence. Format the entire output as clean, semantic HTML. Do not include <!DOCTYPE>, <html>, or <body> tags.
        
        IMPORTANT: Generate the response as a stream of valid HTML. Start with the match-score-container div and stream the rest of the content progressively. Do not wait for the full analysis to be complete before sending the initial HTML structure.

        The output MUST follow this structure:
        1.  A 'div' with class "match-score-container". Inside it, a 'p' tag with: the text "Match Score: ", a 'span' with class "score-value" containing the percentage, and an info icon with a tooltip: '<span title="This score indicates how closely your resume matches the job description based on keywords, skills, and experience." class="cursor-help"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block ml-2 text-slate-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></span>'.
        2.  A 'div' with class "analysis-grid job-match-grid".
        3.  Inside the grid, create three 'details' elements with class "analysis-card", each open by default with the 'open' attribute. The card's content must be a 'ul' with class "analysis-list".
        4.  Each card must have a 'summary' tag containing an 'h3'. The h3 must contain: a specific SVG icon with classes "h-6 w-6 mr-3", the title in a 'span', and an info icon with a relevant tooltip.
        5.  For the "Strengths" card (class "strengths"), list items must be 'li' tags with class "analysis-list-item positive".
        6.  For the "Weaknesses" card (class "weaknesses"), list items must be 'li' tags with class "analysis-list-item negative".
        7.  For the "Suggestions for Improvement" card (class "suggestions"), list items must be 'li' tags with class "analysis-list-item suggestion".
        8.  IMPORTANT: After the 'analysis-grid' div, create a new, separate 'div' with classes "analysis-card feedback" (NOT a <details> element). It must have an 'h3' with an 'Information Circle' SVG icon (h-6 w-6 mr-3) and the title "Overall Feedback". Its content should be a single 'p' tag with a concise, one-to-two sentence summary providing a final verdict.

        Use these SVGs for section headers:
        - Strengths (Check Circle): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
        - Weaknesses (X Circle): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        - Suggestions (Light Bulb): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 5.05a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM6.343 14.243a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM12.95 14.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM10 14c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" /></svg>
        - Overall Feedback (Information Circle): <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
    `;

    return streamText(model, prompt);
};