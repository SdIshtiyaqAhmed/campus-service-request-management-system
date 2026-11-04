import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import './AdminRequests.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
];

const PRIORITY_OPTIONS = [
    { value: 'all', label: 'All priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [staff, setStaff] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [assigning, setAssigning] = useState('');
    const [assignmentTarget, setAssignmentTarget] = useState(null);
    const [selectedAssignments, setSelectedAssignments] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [requestsResponse, usersResponse] =
                    await Promise.all([
                        api.get('/requests'),
                        api.get('/admin/users')
                    ]);

                if (!cancelled) {
                    setRequests(
                        requestsResponse.data.data.requests || []
                    );

                    const users =
                        usersResponse.data.data.users || [];

                    setStaff(
                        users.filter(
                            (user) =>
                                user.role === 'staff' &&
                                user.isActive
                        )
                    );
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        'Unable to load admin request data.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(() => {
        const categoryMap = new Map();

        requests.forEach((request) => {
            const category = request.category;

            if (category?._id && category?.name) {
                categoryMap.set(category._id, category.name);
            }
        });

        return Array.from(categoryMap.entries()).map(
            ([value, label]) => ({
                value,
                label
            })
        );
    }, [requests]);

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();

        return requests.filter((request) => {
            const studentName =
                request.createdBy?.name?.toLowerCase() || '';

            const studentEmail =
                request.createdBy?.email?.toLowerCase() || '';

            const title =
                request.title?.toLowerCase() || '';

            const category =
                request.category?.name?.toLowerCase() || '';

            const location =
                request.location?.toLowerCase() || '';

            const matchesSearch =
                !query ||
                title.includes(query) ||
                studentName.includes(query) ||
                studentEmail.includes(query) ||
                category.includes(query) ||
                location.includes(query);

            const matchesStatus =
                statusFilter === 'all' ||
                request.status === statusFilter;

            const matchesPriority =
                priorityFilter === 'all' ||
                request.priority === priorityFilter;

            const matchesCategory =
                categoryFilter === 'all' ||
                request.category?._id === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory
            );
        });
    }, [
        requests,
        search,
        statusFilter,
        priorityFilter,
        categoryFilter
    ]);

    const statistics = useMemo(
        () => ({
            total: requests.length,
            open: requests.filter(
                (request) => request.status === 'open'
            ).length,
            inProgress: requests.filter(
                (request) => request.status === 'in_progress'
            ).length,
            resolved: requests.filter(
                (request) => request.status === 'resolved'
            ).length,
            closed: requests.filter(
                (request) => request.status === 'closed'
            ).length
        }),
        [requests]
    );

    const handleAssign = (requestId) => {
        const targetRequest = requests.find(
            (request) => request._id === requestId
        );

        if (!targetRequest) {
            return;
        }

        const staffId = selectedAssignments[requestId];

        if (!staffId) {
            return;
        }

        const targetStaff = staff.find(
            (member) =>
                String(member.id) === String(staffId)
        );

        if (!targetStaff) {
            return;
        }

        setAssignmentTarget({
            requestId,
            staffId,
            currentStaff:
                targetRequest.assignedTo?.name ||
                'Not assigned',
            newStaff: targetStaff.name
        });
    };
    const confirmAssignment = async () => {
        if (!assignmentTarget) {
            return;
        }

        setError('');
        setAssigning(assignmentTarget.requestId);

        try {
            const response = await api.patch(
                `/requests/${assignmentTarget.requestId}/assign`,
                { staffId: assignmentTarget.staffId }
            );

            const updatedRequest =
                response.data.data.request;

            setRequests((current) =>
                current.map((request) =>
                    request._id === updatedRequest._id
                        ? updatedRequest
                        : request
                )
            );

            setSelectedAssignments((current) => {
                const next = { ...current };
                delete next[assignmentTarget.requestId];
                return next;
            });

            setAssignmentTarget(null);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to assign request.'
            );
        } finally {
            setAssigning('');
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setCategoryFilter('all');
    };

    if (loading) {
        return (
            <section className="page-container">
                <div className="loading-state">
                    Loading requests...
                </div>
            </section>
        );
    }

    return (
        <section className="page-container admin-requests-page">
            <PageHeader
                title="Service Requests"
                description="Review, filter, and assign campus service requests."
            />

            {error && (
                <div className="alert alert-error" role="alert">
                    {error}
                </div>
            )}

            <div className="stats-grid">
                <div className="admin-request-stat">
                    <span className="admin-request-stat-label">
                        Total Requests
                    </span>
                    <strong>{statistics.total}</strong>
                </div>

                <div className="admin-request-stat">
                    <span className="admin-request-stat-label">
                        Open
                    </span>
                    <strong>{statistics.open}</strong>
                </div>

                <div className="admin-request-stat">
                    <span className="admin-request-stat-label">
                        In Progress
                    </span>
                    <strong>{statistics.inProgress}</strong>
                </div>

                <div className="admin-request-stat">
                    <span className="admin-request-stat-label">
                        Resolved
                    </span>
                    <strong>{statistics.resolved}</strong>
                </div>

                <div className="admin-request-stat">
                    <span className="admin-request-stat-label">
                        Closed
                    </span>
                    <strong>{statistics.closed}</strong>
                </div>
            </div>

            <div className="admin-requests-toolbar">
                <div className="search-field">
                    <label htmlFor="request-search">
                        Search requests
                    </label>
                    <input
                        id="request-search"
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search title, student, category..."
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="status-filter">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-field">
                    <label htmlFor="priority-filter">
                        Priority
                    </label>
                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(event.target.value)
                        }
                    >
                        {PRIORITY_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-field">
                    <label htmlFor="category-filter">
                        Category
                    </label>
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.value}
                                value={category.value}
                            >
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    className="button button-secondary filter-clear-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>
            </div>

            <div className="results-summary">
                <span>
                    Showing{' '}
                    <strong>{filteredRequests.length}</strong>{' '}
                    of <strong>{requests.length}</strong> requests
                </span>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <h3>No requests found</h3>
                    <p>
                        Try changing your search or filters.
                    </p>

                    <button
                        type="button"
                        className="button button-secondary"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Request</th>
                                    <th>Student</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned Staff</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRequests.map(
                                    (request) => (
                                        <tr key={request._id}>
                                            <td>
                                                <Link
                                                    className="request-title-link"
                                                    to={`/admin/requests/${request._id}`}
                                                >
                                                    {request.title}
                                                </Link>

                                                {request.location && (
                                                    <span className="request-location">
                                                        {request.location}
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <div className="person-cell">
                                                    <strong>
                                                        {request.createdBy
                                                            ?.name ||
                                                            'Unknown'}
                                                    </strong>

                                                    {request.createdBy
                                                        ?.email && (
                                                        <span>
                                                            {request.createdBy.email}
                                                        </span>
                                                    )}
                                                </div>
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
                                                    status={
                                                        request.status
                                                    }
                                                />
                                            </td>

                                                  <td>
          {['open', 'assigned', 'in_progress'].includes(
              request.status
          ) ? (
              <div className="assignment-cell">
                  <select
                      className="assign-select"
                      value={
                          selectedAssignments[request._id] ||
                          request.assignedTo?._id ||
                          ''
                      }
                      disabled={
                          assigning === request._id
                      }
                      onChange={(event) =>
                          setSelectedAssignments((current) => ({
                              ...current,
                              [request._id]: event.target.value
                          }))
                      }
                  >
                      <option value="">
                          Select staff
                      </option>

                      {staff.map((member) => (
                          <option
                              key={member.id}
                              value={member.id}
                          >
                              {member.name} —{' '}
                              {member.department ||
                                  'No department'}
                          </option>
                      ))}
                  </select>

                  <button
                      type="button"
                      className="button button-primary assignment-action-button"
                      onClick={() =>
                          handleAssign(request._id)
                      }
                      disabled={
                          assigning === request._id ||
                          !selectedAssignments[request._id]
                      }
                  >
                      {assigning === request._id
                          ? 'Assigning...'
                          : request.assignedTo
                              ? 'Reassign'
                              : 'Assign'}
                  </button>
              </div>
          ) : (
              <span className="assigned-person">
                  {request.assignedTo?.name ||
                      'Not assigned'}
              </span>
          )}
      </td>

                                            <td>
                                                {request.createdAt
                                                    ? new Date(
                                                          request.createdAt
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </td>

                                            <td>
                                                <Link
                                                    className="table-action-link"
                                                    to={`/admin/requests/${request._id}`}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        {assignmentTarget && (
            <ConfirmDialog
                title={
                    assignmentTarget.currentStaff === 'Not assigned'
                        ? 'Confirm Assignment'
                        : 'Confirm Reassignment'
                }
                currentStaff={assignmentTarget.currentStaff}
                newStaff={assignmentTarget.newStaff}
                confirmLabel={
                    assignmentTarget.currentStaff === 'Not assigned'
                        ? 'Confirm Assignment'
                        : 'Confirm Reassignment'
                }
                confirming={
                    assigning === assignmentTarget.requestId
                }
                onCancel={() => {
                    if (!assigning) {
                        setSelectedAssignments((current) => {
                const next = { ...current };
                delete next[assignmentTarget.requestId];
                return next;
            });

            setAssignmentTarget(null);
                    }
                }}
                onConfirm={confirmAssignment}
            />
        )}

        </section>
    );
};

export default AdminRequests;














