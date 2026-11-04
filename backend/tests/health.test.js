const request = require('supertest');

const app = require('../src/app');

describe('Health API', () => {
    test('GET /api/v1/health should return healthy status', async () => {
        const response = await request(app)
            .get('/api/v1/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('healthy');
    });
});