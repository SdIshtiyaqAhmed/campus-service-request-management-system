const request = require('supertest');
const app = require('../src/app');

const api = request(app);

describe('Authentication API', () => {
    test('POST /api/v1/auth/register should reject missing fields', async () => {
        const response = await api
            .post('/api/v1/auth/register')
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/auth/login should reject invalid credentials', async () => {
        const response = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'nonexistent@test.com',
                password: 'WrongPassword123!'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/auth/me should reject unauthenticated requests', async () => {
        const response = await api
            .get('/api/v1/auth/me');

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
