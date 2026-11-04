const request = require('supertest');
const app = require('../src/app');

const api = request(app);

let studentToken;
let otherStudentToken;
let adminToken;
let staffToken;

let categoryId;
let requestId;
let staffId;

describe('Comment API', () => {
    beforeAll(async () => {
        const adminLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@campus.local',
                password: 'AdminPassword123!'
            });

        expect(adminLogin.statusCode).toBe(200);
        adminToken = adminLogin.body.data.token;

        const staffLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'staff@test.com',
                password: 'StaffPassword123!'
            });

        expect(staffLogin.statusCode).toBe(200);
        staffToken = staffLogin.body.data.token;

        const staffMe = await api
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${staffToken}`);

        staffId = staffMe.body.data.user.id;

        const studentLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'student@test.com',
                password: 'StudentPassword123!'
            });

        expect(studentLogin.statusCode).toBe(200);
        studentToken = studentLogin.body.data.token;

        const otherStudentLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'otherstudent@test.com',
                password: 'StudentPassword123!'
            });

        expect(otherStudentLogin.statusCode).toBe(200);
        otherStudentToken = otherStudentLogin.body.data.token;

        const categories = await api
            .get('/api/v1/categories')
            .set('Authorization', `Bearer ${studentToken}`);

        const category = categories.body.data.categories.find(
            (item) => item.name === 'IT Services'
        );

        categoryId = category._id || category.id;

        const createdRequest = await api
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'Comment Test Request',
                description: 'Request created specifically for comment tests.',
                category: categoryId,
                priority: 'medium',
                location: 'Test Building'
            });

        expect(createdRequest.statusCode).toBe(201);

        requestId =
            createdRequest.body.data.request._id ||
            createdRequest.body.data.request.id;

        const assigned = await api
            .patch(`/api/v1/requests/${requestId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                staffId
            });

        expect(assigned.statusCode).toBe(200);
    });

    test('GET comments should require authentication', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/comments`);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('POST comment should require authentication', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/comments`)
            .send({
                message: 'Unauthenticated comment'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('Student should be able to create a comment on own request', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                message: 'Student comment for testing.'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.comment.message)
            .toBe('Student comment for testing.');
    });

    test('Staff assigned to the request should be able to create a comment', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                message: 'Staff comment for testing.'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.comment.message)
            .toBe('Staff comment for testing.');
    });

    test('Student should be able to view comments on own request', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.comments)).toBe(true);
        expect(response.body.data.comments.length).toBeGreaterThanOrEqual(2);
    });

    test('Admin should be able to view comments', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Another student should not be able to view the request comments', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${otherStudentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('Another student should not be able to create a comment', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${otherStudentToken}`)
            .send({
                message: 'Unauthorized comment'
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('Empty comment should be rejected', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/comments`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                message: ''
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
