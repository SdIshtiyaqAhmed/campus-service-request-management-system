import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <main>
            <h1>Campus Service Management</h1>

            <h2>Dashboard</h2>

            <p>Welcome, {user?.name}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>

            <button type="button" onClick={handleLogout}>
                Logout
            </button>
        </main>
    );
};

export default Dashboard;
