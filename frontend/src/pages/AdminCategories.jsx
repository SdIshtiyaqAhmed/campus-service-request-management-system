import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './AdminCategories.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');

    const loadCategories = async () => {
        setError('');

        try {
            const response = await api.get('/categories');

            setCategories(
                response.data.data.categories || []
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to load categories.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCategories();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Category name is required.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await api.post('/categories', {
                name: trimmedName,
                description: description.trim()
            });

            setCategories((current) => [
                ...current,
                response.data.data.category
            ]);

            setName('');
            setDescription('');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to create category.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = (category) => {
        setError('');
        setEditingId(category._id);
        setEditName(category.name);
        setEditDescription(category.description || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditDescription('');
    };

    const handleUpdate = async (category) => {
        const trimmedName = editName.trim();

        if (!trimmedName) {
            setError('Category name cannot be empty.');
            return;
        }

        setUpdatingId(category._id);
        setError('');

        try {
            const response = await api.put(
                `/categories/${category._id}`,
                {
                    name: trimmedName,
                    description: editDescription.trim()
                }
            );

            const updatedCategory =
                response.data.data.category;

            setCategories((current) =>
                current.map((item) =>
                    item._id === updatedCategory._id
                        ? updatedCategory
                        : item
                )
            );

            cancelEditing();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to update category.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Delete the "${category.name}" category?`
        );

        if (!confirmed) {
            return;
        }

        setUpdatingId(category._id);
        setError('');

        try {
            await api.delete(`/categories/${category._id}`);

            setCategories((current) =>
                current.filter(
                    (item) => item._id !== category._id
                )
            );

            if (editingId === category._id) {
                cancelEditing();
            }
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to delete category.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <section className="page-container">
                <div className="loading-state">
                    Loading categories...
                </div>
            </section>
        );
    }

    return (
        <section className="page-container admin-categories-page">
            <PageHeader
                title="Manage Categories"
                description="Create and maintain service categories used by campus requests."
            />

            {error && (
                <div className="alert alert-error" role="alert">
                    {error}
                </div>
            )}

            <div className="category-layout">
                <section className="category-form-card">
                    <div className="section-heading">
                        <div>
                            <h3>Add Category</h3>
                            <p>
                                Create a category for new service
                                requests.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate}>
                        <div className="form-field">
                            <label htmlFor="category-name">
                                Name
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. IT Services"
                                maxLength={100}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="category-description">
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe the type of requests handled by this category."
                                maxLength={500}
                                rows={5}
                                disabled={submitting}
                            />

                            <div className="character-count">
                                {description.length}/500
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Adding...'
                                : 'Add Category'}
                        </button>
                    </form>
                </section>

                <section className="category-list-card">
                    <div className="section-heading">
                        <div>
                            <h3>Service Categories</h3>
                            <p>
                                {categories.length}{' '}
                                {categories.length === 1
                                    ? 'category'
                                    : 'categories'}{' '}
                                configured.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={loadCategories}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>

                    {categories.length === 0 ? (
                        <div className="empty-state">
                            <h3>No categories found</h3>
                            <p>
                                Create your first service category
                                using the form.
                            </p>
                        </div>
                    ) : (
                        <div className="category-list">
                            {categories.map((category) => {
                                const editing =
                                    editingId === category._id;

                                const updating =
                                    updatingId === category._id;

                                return (
                                    <article
                                        className="category-item"
                                        key={category._id}
                                    >
                                        {editing ? (
                                            <div className="category-edit-form">
                                                <div className="form-field">
                                                    <label
                                                        htmlFor={`edit-name-${category._id}`}
                                                    >
                                                        Name
                                                    </label>

                                                    <input
                                                        id={`edit-name-${category._id}`}
                                                        type="text"
                                                        value={editName}
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditName(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        maxLength={
                                                            100
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    />
                                                </div>

                                                <div className="form-field">
                                                    <label
                                                        htmlFor={`edit-description-${category._id}`}
                                                    >
                                                        Description
                                                    </label>

                                                    <textarea
                                                        id={`edit-description-${category._id}`}
                                                        value={
                                                            editDescription
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditDescription(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        maxLength={
                                                            500
                                                        }
                                                        rows={4}
                                                        disabled={
                                                            updating
                                                        }
                                                    />
                                                </div>

                                                <div className="category-actions">
                                                    <button
                                                        type="button"
                                                        className="button button-primary"
                                                        onClick={() =>
                                                            handleUpdate(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    >
                                                        {updating
                                                            ? 'Saving...'
                                                            : 'Save Changes'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="button button-secondary"
                                                        onClick={
                                                            cancelEditing
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="category-content">
                                                    <div className="category-icon">
                                                        {category.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <h4>
                                                            {
                                                                category.name
                                                            }
                                                        </h4>

                                                        <p>
                                                            {category.description ||
                                                                'No description provided.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="category-actions">
                                                    <button
                                                        type="button"
                                                        className="button button-secondary"
                                                        onClick={() =>
                                                            startEditing(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="button button-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    >
                                                        {updating
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
};

export default AdminCategories;
