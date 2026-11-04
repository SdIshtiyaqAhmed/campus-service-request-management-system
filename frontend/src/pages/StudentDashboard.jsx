import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRequests = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get('/requests');
                setRequests(response.data?.data?.requests || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load your service requests.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    const statistics = useMemo(() => {
        return {
            total: requests.length,
            open: requests.filter((request) => request.status === 'open').length,
            inProgress: requests.filter(
                (request) => request.status === 'in_progress'
            ).length,
            resolved: requests.filter(
                (request) =>
                    request.status === 'resolved' ||
                    request.status === 'closed'
            ).length,
        };
    }, [requests]);

    const recentRequests = useMemo(() => {
        return [...requests]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
    }, [requests]);

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="student-dashboard">
            <PageHeader
                title={`Welcome, ${user?.name || 'Student'}`}
                description="Track your campus service requests and follow their progress."
                action={
                    <Link to="/student/requests/new" className="primary-button">
                        New Request
                    </Link>
                }
            />

            <section className="dashboard-stats" aria-label="Request statistics">
                <StatCard
                    label="Total Requests"
                    value={statistics.total}
                    description="All requests you have submitted"
                />
                <StatCard
                    label="Open"
                    value={statistics.open}
                    description="Waiting for assignment"
                />
                <StatCard
                    label="In Progress"
                    value={statistics.inProgress}
                    description="Currently being handled"
                />
                <StatCard
                    label="Resolved"
                    value={statistics.resolved}
                    description="Resolved or closed requests"
                />
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h3>Recent Requests</h3>
                        <p>Your latest service requests</p>
                    </div>

                    <Link to="/student/requests" className="secondary-link">
                        View all
                    </Link>
                </div>

                {loading && (
                    <div className="dashboard-message">
                        Loading your requests...
                    </div>
                )}

                {!loading && error && (
                    <div className="dashboard-message dashboard-error">
                        {error}
                    </div>
                )}

                {!loading && !error && recentRequests.length === 0 && (
                    <div className="empty-state">
                        <h4>No service requests yet</h4>
                        <p>
                            Create a request when you need help with a campus
                            service.
                        </p>
                        <Link
                            to="/student/requests/new"
                            className="primary-button"
                        >
                            Create Your First Request
                        </Link>
                    </div>
                )}

                {!loading && !error && recentRequests.length > 0 && (
                    <div className="request-table-wrapper">
                        <table className="request-table">
                            <thead>
                                <tr>
                                    <th>Request</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Assigned To</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td>
                                            <Link
                                                to={`/student/requests/${request._id}`}
                                                className="request-title"
                                            >
                                                {request.title}
                                            </Link>
                                            <span className="request-location">
                                                {request.location || 'Location not specified'}
                                            </span>
                                        </td>

                                        <td>
                                            {request.category?.name || '—'}
                                        </td>

                                        <td>
                                            <PriorityBadge
                                                priority={request.priority}
                                            />
                                        </td>

                                        <td>
                                            <StatusBadge
                                                status={request.status}
                                            />
                                        </td>

                                        <td>{formatDate(request.createdAt)}</td>

                                        <td>
                                            {request.assignedTo?.name || (
                                                <span className="unassigned">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="dashboard-actions">
                <Link to="/student/requests/new" className="action-card">
                    <div>
                        <h4>Submit a Request</h4>
                        <p>Report an issue with a campus service.</p>
                    </div>
                    <span>?</span>
                </Link>

                <Link to="/student/requests" className="action-card">
                    <div>
                        <h4>View My Requests</h4>
                        <p>Review status, comments, and resolutions.</p>
                    </div>
                    <span>?</span>
                </Link>
            </section>
        </div>
    );
};

export default StudentDashboard;
