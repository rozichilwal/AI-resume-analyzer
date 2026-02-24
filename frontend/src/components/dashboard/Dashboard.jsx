import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import api from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import React from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/analysis/dashboard');
            setDashboardData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resumeId) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;

        try {
            await api.delete(`/resume/${resumeId}`);
            fetchDashboard(); // Refresh data
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete resume');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader size="large" />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const { statistics, scoreTrend, recentResumes } = dashboardData;

    // Chart data
    const chartData = {
        labels: scoreTrend.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
            {
                label: 'ATS Score',
                data: scoreTrend.map((item) => item.score),
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Score Trend',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <div className="text-sm text-gray-600">Total Resumes</div>
                    <div className="text-3xl font-bold text-primary-600">{statistics.totalResumes}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-gray-600">Analyzed</div>
                    <div className="text-3xl font-bold text-success">{statistics.analyzedResumes}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-gray-600">Average Score</div>
                    <div className="text-3xl font-bold text-warning">{statistics.averageScore}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-gray-600">Highest Score</div>
                    <div className="text-3xl font-bold text-success">{statistics.highestScore}</div>
                </div>
            </div>

            {/* Score Trend Chart */}
            {scoreTrend.length > 0 && (
                <div className="card">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}

            {/* Recent Resumes Table */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recent Resumes</h2>
                {recentResumes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Filename
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ATS Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentResumes.map((resume) => (
                                    <tr key={resume._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {resume.filename}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {resume.jobRole}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {resume.analysis?.atsScore ? (
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${resume.analysis.atsScore >= 75
                                                            ? 'bg-green-100 text-green-800'
                                                            : resume.analysis.atsScore >= 50
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {resume.analysis.atsScore}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Not analyzed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(resume.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => navigate(`/analysis/${resume._id}`)}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resume._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No resumes uploaded yet</p>
                        <button onClick={() => navigate('/upload')} className="mt-4 btn-primary">
                            Upload Your First Resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
