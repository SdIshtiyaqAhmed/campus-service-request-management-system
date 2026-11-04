import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './CreateRequest.css';

const CreateRequest = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
    });

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                setError('');

                const response = await api.get('/categories');

                setCategories(
                    (response.data?.data?.categories || []).filter(
                        (category) => category.isActive
                    )
                );
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    'Unable to load service categories.'
                );
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await api.post('/requests', form);
            navigate('/student/requests');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to create service request.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCategory = categories.find(
        (category) => category._id === form.category
    );

    if (loadingCategories) {
        return (
            <div className="create-request-page">
                <div className="form-state">
                    <p>Loading service categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-request-page">
            <PageHeader
                title="Create Service Request"
                description="Submit a request for a campus service or facility issue."
            />

            {error && (
                <div className="request-form-error" role="alert">
                    {error}
                </div>
            )}

            <section className="request-form-card">
                <form onSubmit={handleSubmit} className="request-form">
                    <div className="form-section">
                        <div className="form-section-header">
                            <h3>Request Details</h3>
                            <p>
                                Provide enough information for the service team
                                to understand the issue.
                            </p>
                        </div>

                        <div className="form-field">
                            <label htmlFor="title">
                                Request Title
                                <span className="required-mark">*</span>
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={200}
                                placeholder="e.g. Projector not working"
                                required
                            />

                            <span className="field-hint">
                                Use a short, descriptive title.
                            </span>
                        </div>

                        <div className="form-field">
                            <label htmlFor="description">
                                Description
                                <span className="required-mark">*</span>
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                maxLength={5000}
                                rows={7}
                                placeholder="Describe the issue, what happened, and any relevant details..."
                                required
                            />

                            <div className="field-meta">
                                <span className="field-hint">
                                    Include useful details that can help staff
                                    resolve the issue.
                                </span>

                                <span className="character-count">
                                    {form.description.length}/5000
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">
                            <h3>Classification</h3>
                            <p>
                                Select the category and priority that best
                                describe your request.
                            </p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="category">
                                    Category
                                    <span className="required-mark">*</span>
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select a category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category._id}
                                            value={category._id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedCategory?.description && (
                                    <span className="field-hint">
                                        {selectedCategory.description}
                                    </span>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="priority">
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>

                                <span className="field-hint">
                                    Choose urgent only when the issue requires
                                    immediate attention.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">
                            <h3>Location</h3>
                            <p>
                                Tell the service team where the issue is
                                located.
                            </p>
                        </div>

                        <div className="form-field">
                            <label htmlFor="location">
                                Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={form.location}
                                onChange={handleChange}
                                maxLength={300}
                                placeholder="e.g. Block A, Room 204"
                            />

                            <span className="field-hint">
                                Include the building, block, room, floor, or
                                other useful location details.
                            </span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link
                            to="/student/requests"
                            className="secondary-button"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Submitting...'
                                : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default CreateRequest;
