import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PageHeader from '../components/PageHeader';
import './StaffRequestDetails.css';

const StaffRequestDetails = () => {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [resolution, setResolution] = useState('');
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const [error, setError] = useState('');
    const [commentError, setCommentError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadRequest = async () => {
            try {
                const response = await api.get(`/requests/${id}`);
                const data = response.data?.data?.request;

                if (!cancelled) {
                    setRequest(data);
                    setResolution(data?.resolution || '');
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        'Unable to load request.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const loadComments = async () => {
            try {
                const response = await api.get(
                    `/requests/${id}/comments`
                );

                if (!cancelled) {
                    setComments(
                        response.data?.data?.comments || []
                    );
                }
            } catch (requestError) {
                if (!cancelled) {
                    setCommentError(
                        requestError.response?.data?.message ||
                        'Unable to load comments.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setCommentsLoading(false);
                }
            }
        };

        loadRequest();
        loadComments();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleStatusUpdate = async (nextStatus) => {
        setError('');

        if (nextStatus === 'resolved') {
            const trimmedResolution = resolution.trim();

            if (trimmedResolution.length < 5) {
                setError(
                    'Please provide a resolution of at least 5 characters.'
                );
                return;
            }
        }

        if (updating) {
            return;
        }

        setUpdating(true);

        try {
            const body = {
                status: nextStatus,
            };

            if (nextStatus === 'resolved') {
                body.resolution = resolution.trim();
            }

            const response = await api.patch(
                `/requests/${id}/status`,
                body
            );

            const updatedRequest =
                response.data?.data?.request;

            setRequest(updatedRequest);
            setResolution(updatedRequest?.resolution || '');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to update request status.'
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (submittingComment) {
            return;
        }

        const message = comment.trim();

        if (!message) {
            return;
        }

        setCommentError('');
        setSubmittingComment(true);

        try {
            const response = await api.post(
                `/requests/${id}/comments`,
                { message }
            );

            setComments((current) => [
                ...current,
                response.data?.data?.comment,
            ]);

            setComment('');
        } catch (requestError) {
            setCommentError(
                requestError.response?.data?.message ||
                'Unable to add comment.'
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDateTime = (date) => {
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const renderTimeline = () => {
        const statusOrder = {
            open: 0,
            assigned: 1,
            in_progress: 2,
            resolved: 3,
            closed: 4,
        };

        const stages = [
            {
                label: 'Submitted',
                description: 'Request submitted by student',
                date: request.createdAt,
            },
            {
                label: 'Assigned',
                description: 'Request assigned to service staff',
                date: request.assignedTo
                    ? request.updatedAt
                    : null,
            },
            {
                label: 'In Progress',
                description: 'Staff is working on the request',
                date: null,
            },
            {
                label: 'Resolved',
                description: 'Resolution has been recorded',
                date: request.resolvedAt,
            },
            {
                label: 'Closed',
                description: 'Student closed the request',
                date: request.closedAt,
            },
        ];

        const currentOrder =
            statusOrder[request.status] ?? 0;

        return (
            <div className="staff-request-timeline">
                {stages.map((stage, index) => {
                    const completed = index <= currentOrder;

                    return (
                        <div
                            className={`staff-timeline-item ${
                                completed ? 'completed' : ''
                            }`}
                            key={stage.label}
                        >
                            <span className="staff-timeline-dot" />

                            <div>
                                <strong>{stage.label}</strong>

                                <span>
                                    {stage.description}
                                </span>

                                {stage.date && (
                                    <time>
                                        {formatDateTime(stage.date)}
                                    </time>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="staff-request-page">
                <div className="staff-request-state">
                    Loading request...
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="staff-request-page">
                <div
                    className="staff-request-state staff-request-error"
                    role="alert"
                >
                    {error}
                </div>

                <Link
                    to="/staff/requests"
                    className="secondary-button"
                >
                    Back to Assigned Requests
                </Link>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="staff-request-page">
                <div className="staff-request-state">
                    Request not found.
                </div>
            </div>
        );
    }

    return (
        <div className="staff-request-page">
            <PageHeader
                title={request.title}
                description={`${request.category?.name || 'Service Request'} • ${
                    request.location || 'Location not specified'
                }`}
                action={
                    <Link
                        to="/staff/requests"
                        className="secondary-button"
                    >
                        Back to Assigned Requests
                    </Link>
                }
            />

            {error && (
                <div className="staff-request-alert" role="alert">
                    {error}
                </div>
            )}

            <div className="staff-request-grid">
                <main className="staff-request-main">
                    <section className="staff-request-card">
                        <div className="staff-request-card-header">
                            <div>
                                <h2>Request Details</h2>
                                <p>
                                    Submitted{' '}
                                    {formatDateTime(
                                        request.createdAt
                                    )}
                                </p>
                            </div>

                            <div className="staff-request-badges">
                                <StatusBadge
                                    status={request.status}
                                />
                                <PriorityBadge
                                    priority={request.priority}
                                />
                            </div>
                        </div>

                        <div className="staff-request-info-grid">
                            <div>
                                <span className="info-label">
                                    Category
                                </span>
                                <strong>
                                    {request.category?.name ||
                                        'Unknown'}
                                </strong>
                            </div>

                            <div>
                                <span className="info-label">
                                    Location
                                </span>
                                <strong>
                                    {request.location ||
                                        'Not specified'}
                                </strong>
                            </div>
                        </div>

                        <div className="staff-request-section">
                            <h3>Description</h3>

                            <p className="staff-request-description">
                                {request.description}
                            </p>
                        </div>
                    </section>

                    {request.resolution && (
                        <section className="staff-request-card">
                            <div className="staff-request-section-heading">
                                <div>
                                    <h2>Resolution</h2>
                                    <p>
                                        Resolution recorded for this
                                        request.
                                    </p>
                                </div>

                                <StatusBadge status="resolved" />
                            </div>

                            <p className="staff-request-description">
                                {request.resolution}
                            </p>
                        </section>
                    )}

                    {request.status === 'in_progress' && (
                        <section className="staff-request-card">
                            <div className="staff-request-section-heading">
                                <div>
                                    <h2>Resolve Request</h2>
                                    <p>
                                        Describe the work completed
                                        before marking the request
                                        resolved.
                                    </p>
                                </div>
                            </div>

                            <div className="resolution-form">
                                <label htmlFor="resolution">
                                    Resolution
                                </label>

                                <textarea
                                    id="resolution"
                                    value={resolution}
                                    onChange={(event) =>
                                        setResolution(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the work completed or solution provided..."
                                    maxLength={5000}
                                    rows={6}
                                    disabled={updating}
                                />

                                <div className="resolution-footer">
                                    <span>
                                        {resolution.length} / 5000
                                    </span>

                                    <button
                                        type="button"
                                        className="primary-button"
                                        disabled={updating}
                                        onClick={() =>
                                            handleStatusUpdate(
                                                'resolved'
                                            )
                                        }
                                    >
                                        {updating
                                            ? 'Resolving...'
                                            : 'Mark Resolved'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="staff-request-card comments-card">
                        <div className="staff-request-section-heading">
                            <div>
                                <h2>Comments</h2>
                                <p>
                                    Communication between you and the
                                    student.
                                </p>
                            </div>

                            <span className="comment-count">
                                {comments.length}
                            </span>
                        </div>

                        {commentError && (
                            <div
                                className="staff-request-alert"
                                role="alert"
                            >
                                {commentError}
                            </div>
                        )}

                        {commentsLoading ? (
                            <div className="comments-state">
                                Loading comments...
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="comments-empty">
                                No comments yet.
                            </div>
                        ) : (
                            <div className="comments-list">
                                {comments.map((item) => (
                                    <article
                                        className="comment-item"
                                        key={item._id}
                                    >
                                        <div className="comment-header">
                                            <div>
                                                <strong>
                                                    {item.user?.name ||
                                                        'Unknown User'}
                                                </strong>

                                                <span className="comment-role">
                                                    {item.user?.role ||
                                                        'unknown'}
                                                </span>
                                            </div>

                                            <time>
                                                {formatDateTime(
                                                    item.createdAt
                                                )}
                                            </time>
                                        </div>

                                        <p>{item.message}</p>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="add-comment">
                            <h3>Add Comment</h3>

                            <form
                                onSubmit={handleCommentSubmit}
                            >
                                <textarea
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Write a comment to the student..."
                                    maxLength={2000}
                                    rows={4}
                                    required
                                    disabled={submittingComment}
                                />

                                <div className="comment-form-footer">
                                    <span>
                                        {comment.length}/2000
                                    </span>

                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={
                                            submittingComment ||
                                            !comment.trim()
                                        }
                                    >
                                        {submittingComment
                                            ? 'Adding...'
                                            : 'Add Comment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </main>

                <aside className="staff-request-sidebar">
                    <section className="staff-request-card">
                        <h2>Student</h2>

                        <div className="student-profile">
                            <div className="student-avatar">
                                {(request.createdBy?.name ||
                                    'S')
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {request.createdBy?.name ||
                                        'Unknown student'}
                                </strong>

                                <span>
                                    {request.createdBy?.email ||
                                        'No email available'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="staff-request-card">
                        <h2>Request Timeline</h2>
                        {renderTimeline()}
                    </section>

                    {request.status === 'assigned' && (
                        <section className="staff-action-card">
                            <div>
                                <h2>Ready to start?</h2>
                                <p>
                                    Start working on this request to
                                    move it into progress.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="primary-button full-width"
                                disabled={updating}
                                onClick={() =>
                                    handleStatusUpdate(
                                        'in_progress'
                                    )
                                }
                            >
                                {updating
                                    ? 'Updating...'
                                    : 'Start Work'}
                            </button>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default StaffRequestDetails;
