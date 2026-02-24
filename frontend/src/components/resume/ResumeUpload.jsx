import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ErrorMessage from '../common/ErrorMessage';
import Loader from '../common/Loader';
import React from 'react';

const JOB_ROLES = [
    'General',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
];

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [jobRole, setJobRole] = useState('General');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (selectedFile) => {
        setError('');

        if (!selectedFile) return;

        // Validate file type
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        // Validate file size (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobRole', jobRole);

        try {
            const response = await api.post('/resume/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Navigate to analysis page
            navigate(`/analysis/${response.data.resume._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Resume</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <ErrorMessage message={error} onClose={() => setError('')} />

                    {/* Job Role Selection */}
                    <div>
                        <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-2">
                            Target Job Role
                        </label>
                        <select
                            id="jobRole"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="input-field"
                        >
                            {JOB_ROLES.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="mt-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="text-primary-600 hover:text-primary-500 font-medium">
                                    Upload a file
                                </span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                />
                            </label>
                            <span className="text-gray-600"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF up to 5MB</p>
                        {file && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800 font-medium">{file.name}</p>
                                <p className="text-xs text-green-600">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader size="small" />
                                <span className="ml-2">Uploading...</span>
                            </>
                        ) : (
                            'Upload and Analyze'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResumeUpload;
