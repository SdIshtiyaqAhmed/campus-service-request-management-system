import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import './StaffDashboard.css';

const StaffDashboard = () => {
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
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    'Unable to load assigned requests.'
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
            assigned: requests.filter(
                (request) => request.status === 'assigned'
            ).length,
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
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="staff-dashboard">
            <PageHeader
                title={`Welcome, ${user?.name || 'Staff'}`}
                description="Review and manage service requests assigned to you."
                action={
                    <Link
                        to="/staff/requests"
                        className="primary-button"
                    >
                        View Assigned Requests
                    </Link>
                }
            />

            <section
                className="dashboard-stats"
                aria-label="Assigned request statistics"
            >
                <StatCard
                    label="Total Assigned"
                    value={statistics.total}
                    description="Requests currently assigned to you"
                />

                <StatCard
                    label="Assigned"
                    value={statistics.assigned}
                    description="Waiting to be started"
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
                        <h3>Recent Assigned Requests</h3>
                        <p>
                            The latest requests assigned to your account.
                        </p>
                    </div>

                    <Link
                        to="/staff/requests"
                        className="secondary-link"
                    >
                        View all
                    </Link>
                </div>

                {loading && (
                    <div className="dashboard-message">
                        Loading assigned requests...
                    </div>
                )}

                {!loading && error && (
                    <div
                        className="dashboard-message dashboard-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && recentRequests.length === 0 && (
                    <div className="empty-state">
                        <h4>No assigned requests</h4>
                        <p>
                            Requests assigned to you will appear here.
                        </p>
                    </div>
                )}

                {!loading && !error && recentRequests.length > 0 && (
                    <div className="request-table-wrapper">
                        <table className="request-table">
                            <thead>
                                <tr>
                                    <th>Request</th>
                                    <th>Student</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td>
                                            <Link
                                                to={`/staff/requests/${request._id}`}
                                                className="request-title"
                                            >
                                                {request.title}
                                            </Link>

                                            <span className="request-location">
                                                {request.location ||
                                                    'Location not specified'}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="student-name">
                                                {request.createdBy?.name ||
                                                    'Unknown student'}
                                            </span>

                                            <span className="student-email">
                                                {request.createdBy?.email ||
                                                    ''}
                                            </span>
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

                                        <td>
                                            {formatDate(request.createdAt)}
                                        </td>

                                        <td>
                                            <Link
                                                to={`/staff/requests/${request._id}`}
                                                className="view-link"
                                            >
                                                Open
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="dashboard-actions">
                <Link
                    to="/staff/requests"
                    className="action-card"
                >
                    <div>
                        <h4>Assigned Requests</h4>
                        <p>
                            View all requests currently assigned to you.
                        </p>
                    </div>

                    <span>?</span>
                </Link>

                <div className="action-card action-card-static">
                    <div>
                        <h4>Department</h4>
                        <p>
                            {user?.department || 'Department not specified'}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StaffDashboard;
