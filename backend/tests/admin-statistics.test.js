const request = require('supertest');
const app = require('../src/app');

const api = request(app);

describe('Admin Statistics API', () => {
    let adminToken;
    let studentToken;

    beforeAll(async () => {
        const adminLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@campus.local',
                password: 'AdminPassword123!'
            });

        expect(adminLogin.statusCode).toBe(200);
        adminToken = adminLogin.body.data.token;

        const studentLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'student@test.com',
                password: 'StudentPassword123!'
            });

        expect(studentLogin.statusCode).toBe(200);
        studentToken = studentLogin.body.data.token;
    });

    test('GET /api/v1/admin/statistics should require authentication', async () => {
        const response = await api
            .get('/api/v1/admin/statistics');

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/statistics should reject students', async () => {
        const response = await api
            .get('/api/v1/admin/statistics')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/statistics should allow admins', async () => {
        const response = await api
            .get('/api/v1/admin/statistics')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const { users, requests, feedback } = response.body.data;

        expect(users).toBeDefined();
        expect(requests).toBeDefined();
        expect(feedback).toBeDefined();
    });

    test('Statistics should contain user counts', async () => {
        const response = await api
            .get('/api/v1/admin/statistics')
            .set('Authorization', `Bearer ${adminToken}`);

        const { users } = response.body.data;

        expect(typeof users.total).toBe('number');
        expect(typeof users.active).toBe('number');
        expect(typeof users.inactive).toBe('number');
        expect(users.total).toBeGreaterThanOrEqual(3);

        expect(users.byRole).toBeDefined();
        expect(typeof users.byRole.student).toBe('number');
        expect(typeof users.byRole.staff).toBe('number');
        expect(typeof users.byRole.admin).toBe('number');
    });

    test('Statistics should contain request counts', async () => {
        const response = await api
            .get('/api/v1/admin/statistics')
            .set('Authorization', `Bearer ${adminToken}`);

        const { requests } = response.body.data;

        expect(typeof requests.total).toBe('number');
        expect(typeof requests.resolved).toBe('number');
        expect(typeof requests.closed).toBe('number');

        expect(requests.byStatus).toBeDefined();
        expect(requests.byPriority).toBeDefined();
        expect(requests.byCategory).toBeDefined();
    });

    test('Statistics should contain feedback metrics', async () => {
        const response = await api
            .get('/api/v1/admin/statistics')
            .set('Authorization', `Bearer ${adminToken}`);

        const { feedback } = response.body.data;

        expect(typeof feedback.total).toBe('number');
        expect(typeof feedback.averageRating).toBe('number');
        expect(feedback.averageRating).toBeGreaterThanOrEqual(0);
        expect(feedback.averageRating).toBeLessThanOrEqual(5);
    });
});
