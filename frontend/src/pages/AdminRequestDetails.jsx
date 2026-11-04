import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import './AdminRequestDetails.css';

const AdminRequestDetails = () => {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [staff, setStaff] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignmentConfirmation, setAssignmentConfirmation] = useState(false);
    const [comment, setComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const [requestResponse, usersResponse, commentsResponse] =
                    await Promise.all([
                        api.get(`/requests/${id}`),
                        api.get('/admin/users'),
                        api.get(`/requests/${id}/comments`)
                    ]);

                if (!cancelled) {
                    setRequest(requestResponse.data.data.request);

                    const users =
                        usersResponse.data.data.users || [];

                    setStaff(
                        users.filter(
                            (user) =>
                                user.role === 'staff' &&
                                user.isActive
                        )
                    );

                    setComments(
                        commentsResponse.data.data.comments || []
                    );
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        'Unable to load request details.'
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
    }, [id]);

    const handleAssign = async () => {
        if (!selectedStaff) {
            return;
        }

        setAssignmentConfirmation(true);
    };

    const confirmAssignment = async () => {
        if (!selectedStaff) {
            return;
        }

        setError('');
        setAssigning(true);

        try {
            const response = await api.patch(
                `/requests/${id}/assign`,
                { staffId: selectedStaff }
            );

            setRequest(response.data.data.request);
            setSelectedStaff('');
            setAssignmentConfirmation(false);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to assign request.'
            );
        } finally {
            setAssigning(false);
        }
    };

    const handleComment = async (event) => {
        event.preventDefault();

        const message = comment.trim();

        if (!message) {
            return;
        }

        setError('');
        setPostingComment(true);

        try {
            const response = await api.post(
                `/requests/${id}/comments`,
                { message }
            );

            setComments((current) => [
                ...current,
                response.data.data.comment
            ]);

            setComment('');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to post comment.'
            );
        } finally {
            setPostingComment(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleString();
    };

    if (loading) {
        return (
            <section className="page-container">
                <div className="loading-state">
                    Loading request details...
                </div>
            </section>
        );
    }

    if (!request) {
        return (
            <section className="page-container">
                <div className="empty-state">
                    <h3>Request not found</h3>
                    <p>
                        The requested service request could not be
                        loaded.
                    </p>
                    <Link
                        className="button button-secondary"
                        to="/admin/requests"
                    >
                        Back to requests
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="page-container admin-request-details-page">
            <PageHeader
                title="Request Details"
                description="Review request information, assignment, progress, and communication."
            />

            <div className="back-link-wrapper">
                <Link to="/admin/requests" className="back-link">
                    ? Back to all requests
                </Link>
            </div>

            {error && (
                <div className="alert alert-error" role="alert">
                    {error}
                </div>
            )}

            <div className="request-details-grid">
                <main className="request-main-column">
                    <section className="details-card request-summary-card">
                        <div className="request-heading">
                            <div>
                                <span className="request-id">
                                    Request #{request._id.slice(-8)}
                                </span>

                                <h2>{request.title}</h2>
                            </div>

                            <div className="request-badges">
                                <StatusBadge
                                    status={request.status}
                                />
                                <PriorityBadge
                                    priority={request.priority}
                                />
                            </div>
                        </div>

                        <div className="details-divider" />

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span>Category</span>
                                <strong>
                                    {request.category?.name ||
                                        'Unknown'}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Location</span>
                                <strong>
                                    {request.location || 'Not provided'}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Created</span>
                                <strong>
                                    {formatDate(request.createdAt)}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Last Updated</span>
                                <strong>
                                    {formatDate(request.updatedAt)}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="details-card">
                        <div className="section-heading">
                            <h3>Description</h3>
                        </div>

                        <p className="request-description">
                            {request.description}
                        </p>
                    </section>

                    {request.resolution && (
                        <section className="details-card resolution-card">
                            <div className="section-heading">
                                <h3>Resolution</h3>
                            </div>

                            <p>{request.resolution}</p>
                        </section>
                    )}

                    <section className="details-card">
                        <div className="section-heading">
                            <h3>Request Timeline</h3>
                        </div>

                        <div className="timeline">
                            <div className="timeline-item completed">
                                <span className="timeline-marker">

                                </span>

                                <div>
                                    <strong>Request created</strong>
                                    <span>
                                        {formatDate(
                                            request.createdAt
                                        )}
                                    </span>
                                </div>
                            </div>

                            {request.assignedTo && (
                                <div className="timeline-item completed">
                                    <span className="timeline-marker">

                                    </span>

                                    <div>
                                        <strong>
                                            Assigned to{' '}
                                            {request.assignedTo.name}
                                        </strong>
                                        <span>
                                            {request.assignedTo
                                                .department ||
                                                'Staff member'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {[
                                'in_progress',
                                'resolved',
                                'closed'
                            ].includes(request.status) && (
                                <div className="timeline-item completed">
                                    <span className="timeline-marker">

                                    </span>

                                    <div>
                                        <strong>
                                            Work in progress
                                        </strong>
                                        <span>
                                            Request is being handled
                                        </span>
                                    </div>
                                </div>
                            )}

                            {['resolved', 'closed'].includes(
                                request.status
                            ) && (
                                <div className="timeline-item completed">
                                    <span className="timeline-marker">

                                    </span>

                                    <div>
                                        <strong>Request resolved</strong>
                                        <span>
                                            Resolution has been recorded
                                        </span>
                                    </div>
                                </div>
                            )}

                            {request.status === 'closed' && (
                                <div className="timeline-item completed">
                                    <span className="timeline-marker">

                                    </span>

                                    <div>
                                        <strong>Request closed</strong>
                                        <span>
                                            {formatDate(
                                                request.closedAt
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="details-card comments-card">
                        <div className="section-heading">
                            <div>
                                <h3>Comments</h3>
                                <span>
                                    {comments.length} comment
                                    {comments.length === 1
                                        ? ''
                                        : 's'}
                                </span>
                            </div>
                        </div>

                        {comments.length === 0 ? (
                            <p className="empty-comments">
                                No comments have been added yet.
                            </p>
                        ) : (
                            <div className="comments-list">
                                {comments.map((item) => (
                                    <article
                                        className="comment-item"
                                        key={item._id}
                                    >
                                        <div className="comment-header">
                                            <strong>
                                                {item.user?.name ||
                                                    'User'}
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    item.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <p>{item.message}</p>
                                    </article>
                                ))}
                            </div>
                        )}

                        <form
                            className="comment-form"
                            onSubmit={handleComment}
                        >
                            <label htmlFor="admin-comment">
                                Add comment
                            </label>

                            <textarea
                                id="admin-comment"
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                placeholder="Add an internal note or comment..."
                                rows="4"
                                maxLength="1000"
                            />

                            <div className="comment-form-footer">
                                <span>
                                    {comment.length}/1000
                                </span>

                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={
                                        postingComment ||
                                        !comment.trim()
                                    }
                                >
                                    {postingComment
                                        ? 'Posting...'
                                        : 'Add Comment'}
                                </button>
                            </div>
                        </form>
                    </section>
                </main>

                <aside className="request-side-column">
                    <section className="details-card">
                        <div className="section-heading">
                            <h3>Student</h3>
                        </div>

                        <div className="profile-card">
                            <div className="profile-avatar">
                                {(
                                    request.createdBy?.name ||
                                    'U'
                                )
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

                    <section className="details-card assignment-card">
                        <div className="section-heading">
                            <h3>Assignment</h3>
                        </div>

                        <div className="current-assignment">
                            <span>Currently assigned to</span>

                            <strong>
                                {request.assignedTo?.name ||
                                    'Not assigned'}
                            </strong>

                            {request.assignedTo?.department && (
                                <small>
                                    {request.assignedTo.department}
                                </small>
                            )}
                        </div>

                        {['open', 'assigned', 'in_progress'].includes(request.status) && (
                            <div className="assignment-form">
                                <label htmlFor="admin-staff">
                                    {request.assignedTo ? 'Change staff member' : 'Assign staff member'}
                                </label>

                                <select
                                    id="admin-staff"
                                    value={selectedStaff}
                                    onChange={(event) =>
                                        setSelectedStaff(
                                            event.target.value
                                        )
                                    }
                                    disabled={assigning}
                                >
                                    <option value="">
                                        Select staff member
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
                                    className="button button-primary"
                                    onClick={handleAssign}
                                    disabled={
                                        assigning ||
                                        !selectedStaff
                                    }
                                >
                                    {assigning
                                        ? 'Assigning...'
                                        : request.assignedTo ? 'Reassign Request' : 'Assign Request'}
                                </button>
                            </div>
                        )}

                        {request.status !== 'open' && (
                            <p className="assignment-note">
                                Assignment can only be changed while
                                the request is open.
                            </p>
                        )}
                    </section>

                    {request.feedback && (
                        <section className="details-card">
                            <div className="section-heading">
                                <h3>Feedback</h3>
                            </div>

                            <div className="feedback-summary">
                                <strong>
                                    Rating: {request.feedback.rating}/5
                                </strong>

                                {request.feedback.comment && (
                                    <p>
                                        {request.feedback.comment}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
                    {assignmentConfirmation && (
                <ConfirmDialog
                    title={
                        request.assignedTo
                            ? 'Confirm Reassignment'
                            : 'Confirm Assignment'
                    }
                    currentStaff={
                        request.assignedTo?.name ||
                        'Not assigned'
                    }
                    newStaff={
                        staff.find(
                            (member) =>
                                member.id === selectedStaff
                        )?.name || 'Selected staff member'
                    }
                    confirmLabel={
                        request.assignedTo
                            ? 'Confirm Reassignment'
                            : 'Confirm Assignment'
                    }
                    confirming={assigning}
                    onCancel={() => {
                        if (!assigning) {
                            setAssignmentConfirmation(false);
                        }
                    }}
                    onConfirm={confirmAssignment}
                />
            )}</section>
    );
};

export default AdminRequestDetails;









