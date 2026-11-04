import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './AdminUsers.css';

const ROLE_OPTIONS = [
    { value: 'all', label: 'All roles' },
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' }
];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const loadUsers = async () => {
        setError('');

        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data.users || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to load users.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const updateUser = async (id, changes) => {
        setError('');
        setUpdatingId(id);

        try {
            const response = await api.patch(
                `/admin/users/${id}`,
                changes
            );

            const updatedUser = response.data.data.user;

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === updatedUser.id
                        ? updatedUser
                        : user
                )
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'Unable to update user.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRoleChange = (user, event) => {
        const role = event.target.value;

        if (role === user.role) {
            return;
        }

        updateUser(user.id, { role });
    };

    const handleDepartmentChange = (user, event) => {
        const department = event.target.value;

        if (department === (user.department || '')) {
            return;
        }

        updateUser(user.id, { department });
    };

    const handleActiveChange = (user, event) => {
        updateUser(user.id, {
            isActive: event.target.checked
        });
    };

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const name = user.name?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            const department =
                user.department?.toLowerCase() || '';

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                department.includes(query);

            const matchesRole =
                roleFilter === 'all' ||
                user.role === roleFilter;

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive);

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [users, search, roleFilter, statusFilter]);

    const statistics = useMemo(
        () => ({
            total: users.length,
            active: users.filter((user) => user.isActive).length,
            inactive: users.filter((user) => !user.isActive).length,
            students: users.filter(
                (user) => user.role === 'student'
            ).length,
            staff: users.filter(
                (user) => user.role === 'staff'
            ).length,
            admins: users.filter(
                (user) => user.role === 'admin'
            ).length
        }),
        [users]
    );

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
    };

    if (loading) {
        return (
            <section className="page-container">
                <div className="loading-state">
                    Loading users...
                </div>
            </section>
        );
    }

    return (
        <section className="page-container admin-users-page">
            <PageHeader
                title="Manage Users"
                description="Manage campus accounts, roles, departments, and account status."
            />

            {error && (
                <div className="alert alert-error" role="alert">
                    {error}
                </div>
            )}

            <div className="stats-grid admin-user-stats">
                <div className="admin-user-stat">
                    <span>Total Users</span>
                    <strong>{statistics.total}</strong>
                </div>

                <div className="admin-user-stat">
                    <span>Active</span>
                    <strong>{statistics.active}</strong>
                </div>

                <div className="admin-user-stat">
                    <span>Inactive</span>
                    <strong>{statistics.inactive}</strong>
                </div>

                <div className="admin-user-stat">
                    <span>Students</span>
                    <strong>{statistics.students}</strong>
                </div>

                <div className="admin-user-stat">
                    <span>Staff</span>
                    <strong>{statistics.staff}</strong>
                </div>

                <div className="admin-user-stat">
                    <span>Admins</span>
                    <strong>{statistics.admins}</strong>
                </div>
            </div>

            <div className="users-toolbar">
                <div className="user-search-field">
                    <label htmlFor="user-search">
                        Search users
                    </label>

                    <input
                        id="user-search"
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search name, email, department..."
                    />
                </div>

                <div className="user-filter-field">
                    <label htmlFor="role-filter">
                        Role
                    </label>

                    <select
                        id="role-filter"
                        value={roleFilter}
                        onChange={(event) =>
                            setRoleFilter(event.target.value)
                        }
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="user-filter-field">
                    <label htmlFor="user-status-filter">
                        Status
                    </label>

                    <select
                        id="user-status-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All statuses
                        </option>
                        <option value="active">
                            Active
                        </option>
                        <option value="inactive">
                            Inactive
                        </option>
                    </select>
                </div>

                <button
                    type="button"
                    className="button button-secondary"
                    onClick={clearFilters}
                >
                    Clear
                </button>

                <button
                    type="button"
                    className="button button-secondary"
                    onClick={loadUsers}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            <div className="users-results">
                Showing{' '}
                <strong>{filteredUsers.length}</strong> of{' '}
                <strong>{users.length}</strong> users
            </div>

            {filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <h3>No users found</h3>
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
                <div className="users-table-card">
                    <div className="table-wrapper">
                        <table className="data-table users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => {
                                    const updating =
                                        updatingId === user.id;

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">
                                                        {(
                                                            user.name ||
                                                            'U'
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {user.name}
                                                        </strong>

                                                        <span>
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <select
                                                    className="user-control"
                                                    value={user.role}
                                                    onChange={(event) =>
                                                        handleRoleChange(
                                                            user,
                                                            event
                                                        )
                                                    }
                                                    disabled={updating}
                                                >
                                                    <option value="student">
                                                        Student
                                                    </option>

                                                    <option value="staff">
                                                        Staff
                                                    </option>

                                                    <option value="admin">
                                                        Admin
                                                    </option>
                                                </select>
                                            </td>

                                            <td>
                                                <input
                                                    className="user-control department-input"
                                                    type="text"
                                                    value={
                                                        user.department ||
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        setUsers(
                                                            (currentUsers) =>
                                                                currentUsers.map(
                                                                    (
                                                                        currentUser
                                                                    ) =>
                                                                        currentUser.id ===
                                                                        user.id
                                                                            ? {
                                                                                  ...currentUser,
                                                                                  department:
                                                                                      event
                                                                                          .target
                                                                                          .value
                                                                              }
                                                                            : currentUser
                                                                )
                                                        )
                                                    }
                                                    onBlur={(event) =>
                                                        handleDepartmentChange(
                                                            user,
                                                            event
                                                        )
                                                    }
                                                    disabled={updating}
                                                    placeholder="Department"
                                                />
                                            </td>

                                            <td>
                                                <label className="status-toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            user.isActive
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleActiveChange(
                                                                user,
                                                                event
                                                            )
                                                        }
                                                        disabled={
                                                            updating
                                                        }
                                                    />

                                                    <span>
                                                        {user.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminUsers;
