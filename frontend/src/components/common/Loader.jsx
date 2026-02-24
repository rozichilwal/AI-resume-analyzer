import React from 'react';
const Loader = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-8 h-8 border-2',
        medium: 'w-12 h-12 border-3',
        large: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
            ></div>
        </div>
    );
};

export default Loader;
