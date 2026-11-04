import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadStatistics = async () => {
            try {
                const response = await api.get('/admin/statistics');

                if (!cancelled) {
                    setStatistics(response.data.data);
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        'Unable to load dashboard statistics.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(loadStatistics, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    if (loading) {
        return (
            <section className="page-container">
                <div className="loading-state">
                    Loading dashboard...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="page-container">
                <div className="alert alert-error" role="alert">
                    {error}
                </div>
            </section>
        );
    }

    if (!statistics) {
        return (
            <section className="page-container">
                <div className="empty-state">
                    <h3>No statistics available</h3>
                    <p>
                        Dashboard statistics could not be loaded.
                    </p>
                </div>
            </section>
        );
    }

    const { users, requests, feedback } = statistics;

    return (
        <section className="page-container admin-dashboard-page">
            <PageHeader
                title="Admin Dashboard"
                description="Overview of users, service requests, and feedback."
            />

            <div className="dashboard-section">
                <div className="section-title-row">
                    <div>
                        <h3>Request Overview</h3>
                        <p>Current service request activity.</p>
                    </div>
                </div>

                <div className="stats-grid admin-stats-grid">
                    <StatCard
                        label="Total Requests"
                        value={requests.total}
                    />

                    <StatCard
                        label="Open"
                        value={requests.byStatus.open || 0}
                    />

                    <StatCard
                        label="In Progress"
                        value={
                            requests.byStatus.in_progress || 0
                        }
                    />

                    <StatCard
                        label="Resolved"
                        value={requests.resolved}
                    />

                    <StatCard
                        label="Closed"
                        value={requests.closed}
                    />
                </div>
            </div>

            <div className="dashboard-columns">
                <section className="dashboard-card">
                    <div className="section-title-row">
                        <div>
                            <h3>Requests by Status</h3>
                            <p>Distribution across the workflow.</p>
                        </div>
                    </div>

                    <div className="distribution-list">
                        {Object.entries(requests.byStatus).map(
                            ([status, count]) => (
                                <div
                                    className="distribution-row"
                                    key={status}
                                >
                                    <div className="distribution-label">
                                        <StatusBadge status={status} />
                                    </div>

                                    <strong>{count}</strong>
                                </div>
                            )
                        )}
                    </div>
                </section>

                <section className="dashboard-card">
                    <div className="section-title-row">
                        <div>
                            <h3>Requests by Priority</h3>
                            <p>Current priority distribution.</p>
                        </div>
                    </div>

                    <div className="distribution-list">
                        {Object.entries(requests.byPriority).map(
                            ([priority, count]) => (
                                <div
                                    className="distribution-row"
                                    key={priority}
                                >
                                    <div className="distribution-label">
                                        <PriorityBadge
                                            priority={priority}
                                        />
                                    </div>

                                    <strong>{count}</strong>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </div>

            <section className="dashboard-card">
                <div className="section-title-row">
                    <div>
                        <h3>Requests by Category</h3>
                        <p>
                            Number of requests submitted for each
                            service category.
                        </p>
                    </div>
                </div>

                {Object.keys(requests.byCategory).length === 0 ? (
                    <p className="no-data">
                        No category data available.
                    </p>
                ) : (
                    <div className="category-grid">
                        {Object.entries(requests.byCategory).map(
                            ([category, count]) => (
                                <div
                                    className="category-item"
                                    key={category}
                                >
                                    <span>{category}</span>
                                    <strong>{count}</strong>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            <div className="dashboard-columns">
                <section className="dashboard-card">
                    <div className="section-title-row">
                        <div>
                            <h3>User Overview</h3>
                            <p>Current user account distribution.</p>
                        </div>
                    </div>

                    <div className="stats-grid compact-stats-grid">
                        <StatCard
                            label="Total Users"
                            value={users.total}
                        />

                        <StatCard
                            label="Active"
                            value={users.active}
                        />

                        <StatCard
                            label="Inactive"
                            value={users.inactive}
                        />
                    </div>

                    <div className="role-list">
                        <div>
                            <span>Students</span>
                            <strong>
                                {users.byRole.student || 0}
                            </strong>
                        </div>

                        <div>
                            <span>Staff</span>
                            <strong>
                                {users.byRole.staff || 0}
                            </strong>
                        </div>

                        <div>
                            <span>Admins</span>
                            <strong>
                                {users.byRole.admin || 0}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="dashboard-card">
                    <div className="section-title-row">
                        <div>
                            <h3>Feedback</h3>
                            <p>Student feedback summary.</p>
                        </div>
                    </div>

                    <div className="feedback-summary">
                        <div className="feedback-stat">
                            <span>Total Feedback</span>
                            <strong>{feedback.total}</strong>
                        </div>

                        <div className="feedback-stat">
                            <span>Average Rating</span>
                            <strong>
                                {feedback.total > 0
                                    ? Number(
                                          feedback.averageRating
                                      ).toFixed(2)
                                    : '—'}
                                {feedback.total > 0 && (
                                    <small>/ 5</small>
                                )}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default AdminDashboard;
