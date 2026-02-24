import React from 'react';
const ScoreCard = ({ score, filename }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'text-success border-success bg-success/10';
        if (score >= 50) return 'text-warning border-warning bg-warning/10';
        return 'text-danger border-danger bg-danger/10';
    };

    const getScoreLabel = () => {
        if (score >= 75) return 'Excellent';
        if (score >= 50) return 'Good';
        return 'Needs Improvement';
    };

    return (
        <div className={`card border-2 ${getScoreColor()} text-center`}>
            <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="opacity-20"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute">
                    <div className="text-4xl font-bold">{score}</div>
                    <div className="text-sm">/ 100</div>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-lg font-semibold">{getScoreLabel()}</p>
                <p className="text-sm opacity-75">ATS Score</p>
                {filename && (
                    <p className="text-xs mt-2 opacity-60 truncate" title={filename}>
                        {filename}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ScoreCard;
