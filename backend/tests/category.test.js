const request = require('supertest');
const app = require('../src/app');

const api = request(app);

const testCategoryName = `Test Category ${Date.now()}`;

describe('Category API', () => {
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

    test('GET /api/v1/categories should require authentication', async () => {
        const response = await api
            .get('/api/v1/categories');

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/categories should allow authenticated students', async () => {
        const response = await api
            .get('/api/v1/categories')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.categories)).toBe(true);
    });

    test('POST /api/v1/categories should allow admins', async () => {
        const response = await api
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: testCategoryName,
                description: 'Category created during API testing'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.category.name).toBe(testCategoryName);
    });

    test('POST /api/v1/categories should reject duplicate category names', async () => {
        const response = await api
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: testCategoryName,
                description: 'Duplicate category'
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/categories should reject students', async () => {
        const response = await api
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                name: 'Student Category',
                description: 'Should not be created'
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });
});
