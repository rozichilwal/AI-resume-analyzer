import jsPDF from 'jspdf';

export const generatePDF = (resume) => {
    const doc = new jsPDF();
    const { analysis, filename, jobRole } = resume;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Primary color
    doc.text('AI Resume Analysis Report', 20, 20);

    // Resume Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Resume: ${filename}`, 20, 35);
    doc.text(`Job Role: ${jobRole}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);

    // ATS Score
    doc.setFontSize(16);
    doc.text('ATS Score', 20, 65);
    doc.setFontSize(32);
    doc.setTextColor(analysis.atsScore >= 75 ? 16 : analysis.atsScore >= 50 ? 245 : 220,
        analysis.atsScore >= 75 ? 185 : analysis.atsScore >= 50 ? 158 : 38,
        analysis.atsScore >= 75 ? 129 : analysis.atsScore >= 50 ? 11 : 38);
    doc.text(`${analysis.atsScore}/100`, 20, 80);

    // Score Breakdown
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Score Breakdown:', 20, 95);
    doc.setFontSize(11);
    let yPos = 105;
    [
        { label: 'Format', score: analysis.formatScore, max: 20 },
        { label: 'Keywords', score: analysis.keywordScore, max: 30 },
        { label: 'Skills', score: analysis.skillsScore, max: 25 },
        { label: 'Experience', score: analysis.experienceScore, max: 15 },
        { label: 'Grammar', score: analysis.grammarScore, max: 10 },
    ].forEach((item) => {
        doc.text(`${item.label}: ${item.score}/${item.max}`, 25, yPos);
        yPos += 7;
    });

    // Skills Found
    yPos += 5;
    doc.setFontSize(14);
    doc.text('Skills Found:', 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    if (analysis.skills && analysis.skills.length > 0) {
        const skillsText = analysis.skills.join(', ');
        const splitSkills = doc.splitTextToSize(skillsText, 170);
        doc.text(splitSkills, 25, yPos);
        yPos += splitSkills.length * 5 + 5;
    }

    // Missing Skills
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
        doc.setFontSize(14);
        doc.text('Missing Skills:', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        const missingText = analysis.missingSkills.join(', ');
        const splitMissing = doc.splitTextToSize(missingText, 170);
        doc.text(splitMissing, 25, yPos);
        yPos += splitMissing.length * 5 + 5;
    }

    // New page for suggestions if needed
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    // Suggestions
    if (analysis.suggestions && analysis.suggestions.length > 0) {
        doc.setFontSize(14);
        doc.text('Improvement Suggestions:', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        analysis.suggestions.forEach((suggestion, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            const splitSuggestion = doc.splitTextToSize(`${index + 1}. ${suggestion}`, 170);
            doc.text(splitSuggestion, 25, yPos);
            yPos += splitSuggestion.length * 5 + 3;
        });
    }

    // Professional Summary
    if (analysis.professionalSummary) {
        yPos += 5;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.text('Professional Summary:', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(analysis.professionalSummary, 170);
        doc.text(splitSummary, 25, yPos);
    }

    // Save PDF
    doc.save(`${filename.replace('.pdf', '')}_analysis.pdf`);
};
