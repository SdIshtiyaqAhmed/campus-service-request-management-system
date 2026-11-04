import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import CreateRequest from './CreateRequest';
import api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

const categories = [
    {
        _id: 'category-classroom',
        name: 'Classroom',
        isActive: true
    },
    {
        _id: 'category-it',
        name: 'IT Services',
        isActive: true
    }
];

describe('CreateRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        api.get.mockResolvedValue({
            data: {
                data: {
                    categories
                }
            }
        });
    });

    test('renders the request form after loading categories', async () => {
        render(
            <MemoryRouter>
                <CreateRequest />
            </MemoryRouter>
        );

        expect(
            await screen.findByRole('heading', {
                name: 'Create Service Request'
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(/Request Title/)
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(/Description/)
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(/Category/)
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(/Priority/)
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(/Location/)
        ).toBeInTheDocument();

        expect(
            screen.getByRole('option', {
                name: 'Classroom'
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('option', {
                name: 'IT Services'
            })
        ).toBeInTheDocument();
    });

    test('submits a service request successfully', async () => {
        api.post.mockResolvedValue({
            data: {
                success: true
            }
        });

        render(
            <MemoryRouter>
                <CreateRequest />
            </MemoryRouter>
        );

        await screen.findByRole('heading', {
            name: 'Create Service Request'
        });

        fireEvent.change(screen.getByLabelText(/Request Title/), {
            target: {
                value: 'Projector not working'
            }
        });

        fireEvent.change(screen.getByLabelText(/Description/), {
            target: {
                value: 'The projector is not displaying anything.'
            }
        });

        fireEvent.change(screen.getByLabelText(/Category/), {
            target: {
                value: 'category-classroom'
            }
        });

        fireEvent.change(screen.getByLabelText(/Priority/), {
            target: {
                value: 'high'
            }
        });

        fireEvent.change(screen.getByLabelText(/Location/), {
            target: {
                value: 'Block C, Room 204'
            }
        });

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Submit Request'
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/requests', {
                title: 'Projector not working',
                description: 'The projector is not displaying anything.',
                category: 'category-classroom',
                priority: 'high',
                location: 'Block C, Room 204'
            });

            expect(mockNavigate).toHaveBeenCalledWith(
                '/student/requests'
            );
        });
    });

    test('displays an API error when request creation fails', async () => {
        api.post.mockRejectedValue({
            response: {
                data: {
                    message: 'Unable to create request.'
                }
            }
        });

        render(
            <MemoryRouter>
                <CreateRequest />
            </MemoryRouter>
        );

        await screen.findByRole('heading', {
            name: 'Create Service Request'
        });

        fireEvent.change(screen.getByLabelText(/Request Title/), {
            target: {
                value: 'Test request'
            }
        });

        fireEvent.change(screen.getByLabelText(/Description/), {
            target: {
                value: 'This is a test request description.'
            }
        });

        fireEvent.change(screen.getByLabelText(/Category/), {
            target: {
                value: 'category-it'
            }
        });

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Submit Request'
            })
        );

        expect(
            await screen.findByRole('alert')
        ).toHaveTextContent('Unable to create request.');

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
