import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { useAuth } from './context/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/StudentDashboard';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';

import StaffDashboard from './pages/StaffDashboard';
import AssignedRequests from './pages/AssignedRequests';
import StaffRequestDetails from './pages/StaffRequestDetails';

import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminRequestDetails from './pages/AdminRequestDetails';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';

const DashboardRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (user?.role === 'student') {
        return <Navigate to="/student" replace />;
    }

    if (user?.role === 'staff') {
        return <Navigate to="/staff" replace />;
    }

    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>

                    <Route
                        path="/dashboard"
                        element={<DashboardRedirect />}
                    />

                    {/* Student */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route
                            path="/student/requests"
                            element={<MyRequests />}
                        />
                        <Route
                            path="/student/requests/new"
                            element={<CreateRequest />}
                        />
                        <Route
                            path="/student/requests/:id"
                            element={<RequestDetails />}
                        />
                    </Route>

                    {/* Staff */}
                    <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                        <Route path="/staff" element={<StaffDashboard />} />
                        <Route
                            path="/staff/requests"
                            element={<AssignedRequests />}
                        />
                        <Route
                            path="/staff/requests/:id"
                            element={<StaffRequestDetails />}
                        />
                    </Route>

                    {/* Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route
                            path="/admin/requests"
                            element={<AdminRequests />}
                        />
                        <Route
                            path="/admin/requests/:id"
                            element={<AdminRequestDetails />}
                        />
                        <Route
                            path="/admin/users"
                            element={<AdminUsers />}
                        />
                        <Route
                            path="/admin/categories"
                            element={<AdminCategories />}
                        />
                    </Route>

                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;




