import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PageHeader from '../components/PageHeader';
import './AssignedRequests.css';

const AssignedRequests = () => {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchRequests = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get('/requests');

                if (!cancelled) {
                    setRequests(
                        response.data?.data?.requests || []
                    );
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        'Unable to load assigned requests.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchRequests();

        return () => {
            cancelled = true;
        };
    }, []);

    const filteredRequests = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                !searchTerm ||
                request.title?.toLowerCase().includes(searchTerm) ||
                request.location?.toLowerCase().includes(searchTerm) ||
                request.category?.name
                    ?.toLowerCase()
                    .includes(searchTerm) ||
                request.createdBy?.name
                    ?.toLowerCase()
                    .includes(searchTerm) ||
                request.createdBy?.email
                    ?.toLowerCase()
                    .includes(searchTerm);

            const matchesStatus =
                statusFilter === 'all' ||
                request.status === statusFilter;

            const matchesPriority =
                priorityFilter === 'all' ||
                request.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [requests, search, statusFilter, priorityFilter]);

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
    };

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
        <div className="assigned-requests-page">
            <PageHeader
                title="Assigned Requests"
                description="Review and manage service requests assigned to you."
            />

            <section className="assigned-toolbar">
                <div className="assigned-search">
                    <label htmlFor="assigned-search">
                        Search
                    </label>

                    <input
                        id="assigned-search"
                        type="search"
                        placeholder="Search request, student, category or location..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <div className="assigned-filter">
                    <label htmlFor="assigned-status">
                        Status
                    </label>

                    <select
                        id="assigned-status"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">All statuses</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">
                            In Progress
                        </option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="assigned-filter">
                    <label htmlFor="assigned-priority">
                        Priority
                    </label>

                    <select
                        id="assigned-priority"
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

                {(search ||
                    statusFilter !== 'all' ||
                    priorityFilter !== 'all') && (
                    <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}
            </section>

            <div className="assigned-summary">
                <span>
                    Showing <strong>{filteredRequests.length}</strong>{' '}
                    of <strong>{requests.length}</strong> assigned
                    requests
                </span>
            </div>

            {loading && (
                <section className="assigned-state">
                    Loading assigned requests...
                </section>
            )}

            {!loading && error && (
                <section
                    className="assigned-state assigned-error"
                    role="alert"
                >
                    {error}
                </section>
            )}

            {!loading &&
                !error &&
                filteredRequests.length === 0 && (
                    <section className="assigned-empty">
                        {requests.length === 0 ? (
                            <>
                                <h3>No assigned requests</h3>
                                <p>
                                    Requests assigned to you will
                                    appear here.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3>No matching requests</h3>
                                <p>
                                    Try changing your search or filter
                                    criteria.
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

            {!loading &&
                !error &&
                filteredRequests.length > 0 && (
                    <section className="assigned-table-card">
                        <div className="assigned-table-wrapper">
                            <table className="assigned-table">
                                <thead>
                                    <tr>
                                        <th>Request</th>
                                        <th>Student</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request._id}>
                                            <td>
                                                <Link
                                                    to={`/staff/requests/${request._id}`}
                                                    className="assigned-title"
                                                >
                                                    {request.title}
                                                </Link>

                                                <span className="assigned-location">
                                                    {request.location ||
                                                        'No location'}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="assigned-student-name">
                                                    {request.createdBy?.name ||
                                                        'Unknown student'}
                                                </span>

                                                <span className="assigned-student-email">
                                                    {request.createdBy?.email ||
                                                        ''}
                                                </span>
                                            </td>

                                            <td>
                                                {request.category?.name ||
                                                    'Unknown'}
                                            </td>

                                            <td>
                                                <PriorityBadge
                                                    priority={
                                                        request.priority
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={request.status}
                                                />
                                            </td>

                                            <td>
                                                {formatDate(
                                                    request.createdAt
                                                )}
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
                    </section>
                )}
        </div>
    );
};

export default AssignedRequests;
