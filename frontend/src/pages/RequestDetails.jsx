import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PageHeader from '../components/PageHeader';
import './RequestDetails.css';

const RequestDetails = () => {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    const [feedback, setFeedback] = useState(null);
    const [rating, setRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');

    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const [submittingComment, setSubmittingComment] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [closing, setClosing] = useState(false);

    const [error, setError] = useState('');
    const [commentError, setCommentError] = useState('');
    const [feedbackError, setFeedbackError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadRequest = async () => {
            try {
                const response = await api.get(`/requests/${id}`);

                if (!cancelled) {
                    setRequest(response.data.data.request);
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
                    setComments(response.data.data.comments || []);
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

        const loadFeedback = async () => {
            setFeedbackLoading(true);

            try {
                const response = await api.get(
                    `/requests/${id}/feedback`
                );

                if (!cancelled) {
                    setFeedback(response.data.data.feedback);
                }
            } catch (requestError) {
                if (!cancelled) {
                    if (requestError.response?.status === 404) {
                        setFeedback(null);
                    } else {
                        setFeedbackError(
                            requestError.response?.data?.message ||
                            'Unable to load feedback.'
                        );
                    }
                }
            } finally {
                if (!cancelled) {
                    setFeedbackLoading(false);
                }
            }
        };

        loadRequest();
        loadComments();
        loadFeedback();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleCloseRequest = async () => {
        if (closing) {
            return;
        }

        setError('');
        setClosing(true);

        try {
            const response = await api.patch(
                `/requests/${id}/close`
            );

            setRequest(response.data.data.request);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to close request.'
            );
        } finally {
            setClosing(false);
        }
    };

    const handleFeedbackSubmit = async (event) => {
        event.preventDefault();

        if (feedbackSubmitting) {
            return;
        }

        setFeedbackError('');
        setFeedbackSubmitting(true);

        try {
            const response = await api.post(
                `/requests/${id}/feedback`,
                {
                    rating: Number(rating),
                    comment: feedbackComment.trim(),
                }
            );

            setFeedback(response.data.data.feedback);
            setFeedbackComment('');
        } catch (requestError) {
            setFeedbackError(
                requestError.response?.data?.message ||
                'Unable to submit feedback.'
            );
        } finally {
            setFeedbackSubmitting(false);
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
                response.data.data.comment,
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
        const stages = [
            { label: 'Submitted', date: request.createdAt },
            {
                label: 'Assigned',
                date: request.assignedTo ? request.updatedAt : null,
            },
            {
                label: 'In Progress',
                date: null,
            },
            {
                label: 'Resolved',
                date: request.resolvedAt,
            },
            {
                label: 'Closed',
                date: request.closedAt,
            },
        ];

        const statusOrder = {
            open: 0,
            assigned: 1,
            in_progress: 2,
            resolved: 3,
            closed: 4,
        };

        const currentOrder = statusOrder[request.status] ?? 0;

        return (
            <div className="request-timeline">
                {stages.map((stage, index) => {
                    const completed = index <= currentOrder;

                    return (
                        <div
                            className={`timeline-step ${
                                completed ? 'timeline-completed' : ''
                            }`}
                            key={stage.label}
                        >
                            <div className="timeline-marker">
                                {completed ? '✓' : index + 1}
                            </div>

                            <div className="timeline-content">
                                <strong>{stage.label}</strong>

                                {stage.date && (
                                    <span>
                                        {formatDateTime(stage.date)}
                                    </span>
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
            <div className="request-details-page">
                <div className="details-state">
                    Loading request...
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="request-details-page">
                <div className="details-error" role="alert">
                    {error}
                </div>

                <Link
                    to="/student/requests"
                    className="secondary-button"
                >
                    Back to My Requests
                </Link>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="request-details-page">
                <div className="details-state">
                    Request not found.
                </div>
            </div>
        );
    }

    return (
        <div className="request-details-page">
            <Link
                to="/student/requests"
                className="back-link"
            >
                ← Back to My Requests
            </Link>

            {error && (
                <div className="details-error" role="alert">
                    {error}
                </div>
            )}

            <PageHeader
                title={request.title}
                description={`${request.category?.name || 'Service Request'} • ${
                    request.location || 'Location not specified'
                }`}
                action={
                    <div className="request-header-badges">
                        <PriorityBadge priority={request.priority} />
                        <StatusBadge status={request.status} />
                    </div>
                }
            />

            <section className="details-card">
                <div className="details-card-header">
                    <div>
                        <h3>Request Information</h3>
                        <p>
                            Current status and assignment details.
                        </p>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <StatusBadge status={request.status} />
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Priority</span>
                        <PriorityBadge priority={request.priority} />
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Category</span>
                        <strong>
                            {request.category?.name || 'Unknown'}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Assigned Staff</span>
                        <strong>
                            {request.assignedTo?.name || 'Not assigned'}
                        </strong>
                    </div>

                    <div className="detail-item detail-item-wide">
                        <span className="detail-label">Location</span>
                        <strong>
                            {request.location || 'Not specified'}
                        </strong>
                    </div>
                </div>
            </section>

            <section className="details-card">
                <div className="details-card-header">
                    <h3>Description</h3>
                </div>

                <p className="request-description">
                    {request.description}
                </p>
            </section>

            {request.resolution && (
                <section className="details-card resolution-card">
                    <div className="details-card-header">
                        <div>
                            <h3>Resolution</h3>
                            <p>
                                Details provided by the service team.
                            </p>
                        </div>
                    </div>

                    <p className="request-description">
                        {request.resolution}
                    </p>
                </section>
            )}

            <section className="details-card">
                <div className="details-card-header">
                    <div>
                        <h3>Request Timeline</h3>
                        <p>Track the progress of your request.</p>
                    </div>
                </div>

                {renderTimeline()}
            </section>

            <section className="details-card request-dates">
                <div className="detail-item">
                    <span className="detail-label">Created</span>
                    <strong>{formatDateTime(request.createdAt)}</strong>
                </div>

                {request.resolvedAt && (
                    <div className="detail-item">
                        <span className="detail-label">Resolved</span>
                        <strong>
                            {formatDateTime(request.resolvedAt)}
                        </strong>
                    </div>
                )}

                {request.closedAt && (
                    <div className="detail-item">
                        <span className="detail-label">Closed</span>
                        <strong>
                            {formatDateTime(request.closedAt)}
                        </strong>
                    </div>
                )}
            </section>

            {request.status === 'resolved' && (
                <section className="close-request-card">
                    <div>
                        <h3>Request Resolved</h3>
                        <p>
                            Please close the request after confirming that
                            the issue has been resolved.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleCloseRequest}
                        disabled={closing}
                    >
                        {closing ? 'Closing...' : 'Close Request'}
                    </button>
                </section>
            )}

            {request.status === 'closed' && (
                <section className="details-card">
                    <div className="details-card-header">
                        <div>
                            <h3>Feedback</h3>
                            <p>
                                Tell us about your experience with this
                                request.
                            </p>
                        </div>
                    </div>

                    {feedbackError && (
                        <div className="section-error" role="alert">
                            {feedbackError}
                        </div>
                    )}

                    {feedbackLoading ? (
                        <div className="section-state">
                            Loading feedback...
                        </div>
                    ) : feedback ? (
                        <div className="submitted-feedback">
                            <div className="feedback-rating">
                                <span className="rating-value">
                                    {feedback.rating}/5
                                </span>
                                <span className="rating-label">
                                    {feedback.rating === 5
                                        ? 'Excellent'
                                        : feedback.rating === 4
                                            ? 'Good'
                                            : feedback.rating === 3
                                                ? 'Average'
                                                : feedback.rating === 2
                                                    ? 'Poor'
                                                    : 'Very Poor'}
                                </span>
                            </div>

                            {feedback.comment && (
                                <p className="feedback-comment">
                                    “{feedback.comment}”
                                </p>
                            )}

                            {feedback.createdAt && (
                                <span className="feedback-date">
                                    Submitted{' '}
                                    {formatDateTime(feedback.createdAt)}
                                </span>
                            )}
                        </div>
                    ) : (
                        <form
                            className="feedback-form"
                            onSubmit={handleFeedbackSubmit}
                        >
                            <div className="form-field">
                                <label htmlFor="rating">
                                    Rating
                                </label>

                                <select
                                    id="rating"
                                    value={rating}
                                    onChange={(event) =>
                                        setRating(
                                            Number(event.target.value)
                                        )
                                    }
                                    disabled={feedbackSubmitting}
                                >
                                    <option value={5}>
                                        5 - Excellent
                                    </option>
                                    <option value={4}>
                                        4 - Good
                                    </option>
                                    <option value={3}>
                                        3 - Average
                                    </option>
                                    <option value={2}>
                                        2 - Poor
                                    </option>
                                    <option value={1}>
                                        1 - Very Poor
                                    </option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="feedback-comment">
                                    Comment
                                </label>

                                <textarea
                                    id="feedback-comment"
                                    value={feedbackComment}
                                    onChange={(event) =>
                                        setFeedbackComment(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Share your feedback about the service..."
                                    maxLength={2000}
                                    rows={4}
                                    disabled={feedbackSubmitting}
                                />
                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={feedbackSubmitting}
                            >
                                {feedbackSubmitting
                                    ? 'Submitting...'
                                    : 'Submit Feedback'}
                            </button>
                        </form>
                    )}
                </section>
            )}

            <section className="details-card comments-card">
                <div className="details-card-header">
                    <div>
                        <h3>Comments</h3>
                        <p>
                            Communication between you and the service
                            team.
                        </p>
                    </div>

                    <span className="comment-count">
                        {comments.length}
                    </span>
                </div>

                {commentError && (
                    <div className="section-error" role="alert">
                        {commentError}
                    </div>
                )}

                {commentsLoading ? (
                    <div className="section-state">
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
                    <h4>Add Comment</h4>

                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={comment}
                            onChange={(event) =>
                                setComment(event.target.value)
                            }
                            placeholder="Write a comment..."
                            maxLength={2000}
                            rows={4}
                            required
                            disabled={submittingComment}
                        />

                        <div className="comment-form-footer">
                            <span>{comment.length}/2000</span>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={submittingComment}
                            >
                                {submittingComment
                                    ? 'Adding...'
                                    : 'Add Comment'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default RequestDetails;



