import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/useAuth', () => ({
    useAuth: () => mockUseAuth()
}));

const renderProtectedRoute = (user, allowedRoles, path = '/protected') => {
    mockUseAuth.mockReturnValue({
        user,
        loading: false
    });

    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route
                    element={
                        <ProtectedRoute allowedRoles={allowedRoles} />
                    }
                >
                    <Route
                        path="/protected"
                        element={<div>Protected Content</div>}
                    />
                </Route>

                <Route
                    path="/login"
                    element={<div>Login Page</div>}
                />

                <Route
                    path="/student"
                    element={<div>Student Page</div>}
                />

                <Route
                    path="/staff"
                    element={<div>Staff Page</div>}
                />

                <Route
                    path="/admin"
                    element={<div>Admin Page</div>}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute', () => {
    test('shows loading state while authentication is loading', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true
        });

        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('redirects unauthenticated users to login', () => {
        renderProtectedRoute(null, ['student']);

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('allows a student to access a student route', () => {
        renderProtectedRoute(
            {
                role: 'student'
            },
            ['student']
        );

        expect(
            screen.getByText('Protected Content')
        ).toBeInTheDocument();
    });

    test('redirects a student away from an admin route', () => {
        renderProtectedRoute(
            {
                role: 'student'
            },
            ['admin']
        );

        expect(
            screen.getByText('Student Page')
        ).toBeInTheDocument();
    });

    test('allows a staff member to access a staff route', () => {
        renderProtectedRoute(
            {
                role: 'staff'
            },
            ['staff']
        );

        expect(
            screen.getByText('Protected Content')
        ).toBeInTheDocument();
    });

    test('redirects a staff member away from an admin route', () => {
        renderProtectedRoute(
            {
                role: 'staff'
            },
            ['admin']
        );

        expect(
            screen.getByText('Staff Page')
        ).toBeInTheDocument();
    });

    test('allows an admin to access an admin route', () => {
        renderProtectedRoute(
            {
                role: 'admin'
            },
            ['admin']
        );

        expect(
            screen.getByText('Protected Content')
        ).toBeInTheDocument();
    });

    test('redirects an admin away from a student route', () => {
        renderProtectedRoute(
            {
                role: 'admin'
            },
            ['student']
        );

        expect(
            screen.getByText('Admin Page')
        ).toBeInTheDocument();
    });
});
