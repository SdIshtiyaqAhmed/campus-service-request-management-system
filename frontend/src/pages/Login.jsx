import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import siteConfig from '../config/siteConfig';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
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
        setSubmitting(true);

        try {
            const user = await login(form.email, form.password);

            if (user.role === 'student') {
                navigate('/student');
            } else if (user.role === 'staff') {
                navigate('/staff');
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'Login failed. Please check your email and password.';

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
                    <h1>Welcome back</h1>
                    <p>
                        Sign in to manage your{' '}
                        {siteConfig.terminology.requests.toLowerCase()}.
                    </p>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button auth-submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {siteConfig.support.enabled &&
                    siteConfig.support.showContactOnLogin &&
                    siteConfig.support.email && (
                        <div className="auth-support">
                            <span>Need help?</span>
                            <a
                                href={`mailto:${siteConfig.support.email}`}
                            >
                                {siteConfig.support.email}
                            </a>
                        </div>
                    )}

                {siteConfig.authentication.registration.enabled && (
                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create an account</Link>
                    </p>
                )}
            </section>
        </main>
    );
};

export default Login;


