import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PageHeader from '../components/PageHeader';
import './MyRequests.css';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
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
                    'Unable to load your requests.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                !searchTerm ||
                request.title?.toLowerCase().includes(searchTerm) ||
                request.location?.toLowerCase().includes(searchTerm) ||
                request.category?.name?.toLowerCase().includes(searchTerm);

            const matchesStatus =
                statusFilter === 'all' ||
                request.status === statusFilter;

            const matchesPriority =
                priorityFilter === 'all' ||
                request.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [requests, search, statusFilter, priorityFilter]);

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
    };

    return (
        <div className="my-requests-page">
            <PageHeader
                title="My Requests"
                description="View and track all service requests you have submitted."
                action={
                    <Link
                        to="/student/requests/new"
                        className="primary-button"
                    >
                        New Request
                    </Link>
                }
            />

            <section className="requests-toolbar">
                <div className="search-field">
                    <label htmlFor="request-search">Search</label>
                    <input
                        id="request-search"
                        type="search"
                        placeholder="Search by title, category or location..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="status-filter">Status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="filter-field">
                    <label htmlFor="priority-filter">Priority</label>
                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(event.target.value)
                        }
                    >
                        <option value="all">All priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}
            </section>

            <div className="request-summary">
                <span>
                    Showing <strong>{filteredRequests.length}</strong> of{' '}
                    <strong>{requests.length}</strong> requests
                </span>
            </div>

            {loading && (
                <section className="requests-state">
                    <p>Loading your requests...</p>
                </section>
            )}

            {!loading && error && (
                <section className="requests-state requests-error">
                    <p role="alert">{error}</p>
                </section>
            )}

            {!loading && !error && filteredRequests.length === 0 && (
                <section className="requests-empty">
                    {requests.length === 0 ? (
                        <>
                            <h3>No requests yet</h3>
                            <p>
                                You have not submitted any campus service
                                requests.
                            </p>
                            <Link
                                to="/student/requests/new"
                                className="primary-button"
                            >
                                Create Your First Request
                            </Link>
                        </>
                    ) : (
                        <>
                            <h3>No matching requests</h3>
                            <p>
                                Try changing your search or filter criteria.
                            </p>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </>
                    )}
                </section>
            )}

            {!loading && !error && filteredRequests.length > 0 && (
                <section className="requests-table-card">
                    <div className="requests-table-wrapper">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>Request</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Assigned To</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td>
                                            <Link
                                                to={`/student/requests/${request._id}`}
                                                className="request-table-title"
                                            >
                                                {request.title}
                                            </Link>
                                            <span className="request-table-location">
                                                {request.location || 'No location'}
                                            </span>
                                        </td>

                                        <td>
                                            {request.category?.name || 'Unknown'}
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
                                            {request.assignedTo?.name || (
                                                <span className="not-assigned">
                                                    Not assigned
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <Link
                                                to={`/student/requests/${request._id}`}
                                                className="view-link"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default MyRequests;
