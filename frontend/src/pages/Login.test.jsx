import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Login from './Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(
            screen.getByText('Campus Service Management')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('heading', {
                name: 'Welcome back'
            })
        ).toBeInTheDocument();

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: 'Sign In' })
        ).toBeInTheDocument();
    });

    test('logs in a student and navigates to student dashboard', async () => {
        mockLogin.mockResolvedValue({
            role: 'student'
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Email'), {
            target: {
                value: 'student@test.com'
            }
        });

        fireEvent.change(screen.getByLabelText('Password'), {
            target: {
                value: 'StudentPassword123!'
            }
        });

        fireEvent.click(
            screen.getByRole('button', { name: 'Sign In' })
        );

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                'student@test.com',
                'StudentPassword123!'
            );

            expect(mockNavigate).toHaveBeenCalledWith('/student');
        });
    });

    test('displays login error when authentication fails', async () => {
        mockLogin.mockRejectedValue({
            response: {
                data: {
                    message: 'Invalid email or password.'
                }
            }
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Email'), {
            target: {
                value: 'wrong@test.com'
            }
        });

        fireEvent.change(screen.getByLabelText('Password'), {
            target: {
                value: 'wrongpassword'
            }
        });

        fireEvent.click(
            screen.getByRole('button', { name: 'Sign In' })
        );

        expect(
            await screen.findByRole('alert')
        ).toHaveTextContent('Invalid email or password.');
    });
});
