// Optimized AI prompts for resume analysis

const generateResumeAnalysisPrompt = (resumeText, jobRole) => {
    return `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume for a ${jobRole} position.

Resume Content:
${resumeText}

Provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "atsScore": <number between 0-100>,
  "formatScore": <number between 0-20>,
  "keywordScore": <number between 0-30>,
  "skillsScore": <number between 0-25>,
  "experienceScore": <number between 0-15>,
  "grammarScore": <number between 0-10>,
  "skills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "grammarIssues": ["issue1", "issue2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "professionalSummary": "A brief professional summary of the candidate"
}

Scoring Criteria:
- formatScore (20%): Resume structure, sections, formatting consistency
- keywordScore (30%): Industry-specific keywords, job role alignment
- skillsScore (25%): Technical and soft skills relevant to ${jobRole}
- experienceScore (15%): Work history relevance and progression
- grammarScore (10%): Language quality, spelling, grammar

Important:
1. Be specific and actionable in suggestions
2. List only skills actually found in the resume
3. Suggest missing skills critical for ${jobRole}
4. Identify real grammar issues, not stylistic preferences
5. Keep the professional summary concise (2-3 sentences)
6. Ensure all scores add up to the atsScore`;
};

const generateSkillExtractionPrompt = (resumeText, jobRole) => {
    return `Extract all technical and soft skills from this resume for a ${jobRole} position.

Resume:
${resumeText}

Return ONLY a JSON object in this exact format:
{
  "technicalSkills": ["skill1", "skill2", ...],
  "softSkills": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "frameworks": ["framework1", "framework2", ...]
}`;
};

const generateJobMatchPrompt = (resumeText, jobDescription) => {
    return `Compare this resume with the job description and calculate the match percentage.

Resume:
${resumeText}

Job Description:
${jobDescription}

Analyze and return ONLY a JSON object in this format:
{
  "matchPercentage": <number between 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}

Focus on:
1. Skills match
2. Experience alignment
3. Required qualifications
4. Preferred qualifications
5. Technical requirements`;
};

const generateGrammarCheckPrompt = (resumeText) => {
    return `Review this resume for grammar, spelling, and clarity issues.

Resume:
${resumeText}

Return ONLY a JSON array of issues found:
[
  "Issue 1 description and location",
  "Issue 2 description and location",
  ...
]

If no issues found, return an empty array: []`;
};

const generateImprovementPrompt = (resumeText, jobRole, currentScore) => {
    return `This resume scored ${currentScore}/100 for a ${jobRole} position. Provide specific, actionable improvements.

Resume:
${resumeText}

Return ONLY a JSON object:
{
  "priorityImprovements": ["improvement1", "improvement2", ...],
  "contentSuggestions": ["suggestion1", "suggestion2", ...],
  "formattingSuggestions": ["suggestion1", "suggestion2", ...],
  "estimatedScoreIncrease": <number>
}`;
};

module.exports = {
    generateResumeAnalysisPrompt,
    generateSkillExtractionPrompt,
    generateJobMatchPrompt,
    generateGrammarCheckPrompt,
    generateImprovementPrompt
};
