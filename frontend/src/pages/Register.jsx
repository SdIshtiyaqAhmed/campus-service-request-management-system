import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import siteConfig from '../config/siteConfig';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            await api.post('/auth/register', form);

            setSuccess('Registration successful. Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'Registration failed. Please try again.';

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-brand">
                    <img
                        src={siteConfig.branding.logo}
                        alt={`${siteConfig.institution.name} logo`}
                        className="auth-brand-logo"
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.nextElementSibling.style.display =
                                'flex';
                        }}
                    />

                    <span
                        className="auth-brand-mark"
                        style={{ display: 'none' }}
                        aria-hidden="true"
                    >
                        {siteConfig.institution.shortName.slice(0, 2)}
                    </span>

                    <span>{siteConfig.application.name}</span>
                </div>

                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>
                        Register as a{' '}
                        {siteConfig.terminology.student.toLowerCase()} to
                        submit and track{' '}
                        {siteConfig.terminology.requests.toLowerCase()}.
                    </p>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="form-success" role="status">
                        {success}
                    </p>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            autoComplete="name"
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                            autoComplete="new-password"
                            disabled={submitting}
                        />
                        <span className="field-hint">
                            Use at least 8 characters.
                        </span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            name="department"
                            type="text"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science"
                            required
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button auth-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Creating Account...'
                            : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
};

export default Register;

