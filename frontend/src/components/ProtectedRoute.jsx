import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'student') {
            return <Navigate to="/student" replace />;
        }

        if (user.role === 'staff') {
            return <Navigate to="/staff" replace />;
        }

        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;