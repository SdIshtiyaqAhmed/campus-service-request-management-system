import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import siteConfig from '../config/siteConfig';
import './AppLayout.css';

const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getNavClass = ({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link';

    const dashboardPath =
        user?.role === 'student'
            ? '/student'
            : user?.role === 'staff'
                ? '/staff'
                : '/admin';

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink to="/dashboard" className="brand">
                    <img
                        src={siteConfig.branding.logo}
                        alt={`${siteConfig.institution.name} logo`}
                        className="brand-logo"
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.nextElementSibling.style.display =
                                'flex';
                        }}
                    />

                    <span
                        className="brand-mark"
                        style={{ display: 'none' }}
                        aria-hidden="true"
                    >
                        {siteConfig.institution.shortName.slice(0, 2)}
                    </span>

                    <span className="brand-text">
                        {siteConfig.application.name}
                    </span>
                </NavLink>

                <nav
                    className="top-nav"
                    aria-label="Main navigation"
                >
                    <NavLink
                        to={dashboardPath}
                        end
                        className={getNavClass}
                    >
                        Dashboard
                    </NavLink>

                    {user?.role === 'student' && (
                        <>
                            <NavLink
                                to="/student/requests"
                                end
                                className={getNavClass}
                            >
                                My {siteConfig.terminology.requests}
                            </NavLink>

                            <NavLink
                                to="/student/requests/new"
                                className={getNavClass}
                            >
                                New {siteConfig.terminology.request}
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'staff' && (
                        <NavLink
                            to="/staff/requests"
                            className={getNavClass}
                        >
                            Assigned {siteConfig.terminology.requests}
                        </NavLink>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <NavLink
                                to="/admin/requests"
                                className={getNavClass}
                            >
                                {siteConfig.terminology.requests}
                            </NavLink>

                            <NavLink
                                to="/admin/users"
                                className={getNavClass}
                            >
                                Users
                            </NavLink>

                            <NavLink
                                to="/admin/categories"
                                className={getNavClass}
                            >
                                Categories
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="user-menu">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.name}
                        </span>

                        <span className="user-role">
                            {user?.role}
                            {user?.department
                                ? ` - ${user.department}`
                                : ''}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
            <footer className="app-footer">
                <div className="app-footer-inner">
                    <div className="app-footer-brand">
                        <strong>{siteConfig.institution.name}</strong>

                        {siteConfig.institution.tagline && (
                            <span>
                                {siteConfig.institution.tagline}
                            </span>
                        )}
                    </div>

                    <div className="app-footer-contact">
                        {siteConfig.institution.contact.address && (
                            <span>
                                {siteConfig.institution.contact.address}
                            </span>
                        )}

                        {siteConfig.institution.contact.email && (
                            <a
                                href={`mailto:${siteConfig.institution.contact.email}`}
                            >
                                {siteConfig.institution.contact.email}
                            </a>
                        )}

                        {siteConfig.institution.contact.phone && (
                            <a
                                href={`tel:${siteConfig.institution.contact.phone}`}
                            >
                                {siteConfig.institution.contact.phone}
                            </a>
                        )}

                        {siteConfig.institution.contact.website && (
                            <a
                                href={siteConfig.institution.contact.website}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Website
                            </a>
                        )}
                    </div>

                    <div className="app-footer-meta">
                        <span>
                            Copyright {new Date().getFullYear()}{' '}
                            {siteConfig.institution.name}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;






