const request = require('supertest');
const app = require('../src/app');

const api = request(app);

describe('Feedback API', () => {
    let adminToken;
    let studentToken;
    let otherStudentToken;
    let staffToken;
    let requestId;
    let categoryId;

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

        const staffLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'staff@test.com',
                password: 'StaffPassword123!'
            });

        expect(staffLogin.statusCode).toBe(200);
        staffToken = staffLogin.body.data.token;

        const otherStudentLogin = await api
            .post('/api/v1/auth/register')
            .send({
                name: 'Other Feedback Student',
                email: `feedback-other-${Date.now()}@test.com`,
                password: 'StudentPassword123!'
            });

        expect(otherStudentLogin.statusCode).toBe(201);
        otherStudentToken = otherStudentLogin.body.data.token;

        const categoriesResponse = await api
            .get('/api/v1/categories')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(categoriesResponse.statusCode).toBe(200);

        const categories = categoriesResponse.body.data.categories;

        categoryId = categories[0]._id || categories[0].id;

        const requestResponse = await api
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'Feedback Test Request',
                description: 'Request created for feedback API testing',
                category: categoryId,
                priority: 'medium',
                location: 'Test Location'
            });

        expect(requestResponse.statusCode).toBe(201);

        requestId =
            requestResponse.body.data.request._id ||
            requestResponse.body.data.request.id;
    });

    test('POST feedback should require authentication', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .send({
                rating: 5,
                comment: 'Good service'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET request feedback should require authentication', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/feedback`);

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET all feedback should reject students', async () => {
        const response = await api
            .get('/api/v1/feedback')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('GET all feedback should allow admins', async () => {
        const response = await api
            .get('/api/v1/feedback')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.feedback)).toBe(true);
    });

    test('Invalid rating should be rejected', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                rating: 6,
                comment: 'Invalid rating'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('Another student should not be allowed to submit feedback', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${otherStudentToken}`)
            .send({
                rating: 5,
                comment: 'Unauthorized feedback'
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('Staff should not be allowed to submit feedback', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                rating: 5,
                comment: 'Staff feedback'
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('Student should not submit feedback while request is open', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                rating: 5,
                comment: 'Too early'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('Admin should assign the request to staff', async () => {
        const staffMe = await api
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(staffMe.statusCode).toBe(200);

        const staffId = staffMe.body.data.user.id;

        const response = await api
            .patch(`/api/v1/requests/${requestId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                staffId
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Staff should move the request to in_progress', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                status: 'in_progress'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Staff should resolve the request', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                status: 'resolved',
                resolution: 'Issue resolved successfully during testing'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Student should be able to submit feedback', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                rating: 5,
                comment: 'Excellent service'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.feedback.rating).toBe(5);
        expect(response.body.data.feedback.comment).toBe('Excellent service');
    });

    test('Student should be able to retrieve submitted feedback', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.feedback.rating).toBe(5);
    });

    test('Duplicate feedback should be rejected', async () => {
        const response = await api
            .post(`/api/v1/requests/${requestId}/feedback`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                rating: 4,
                comment: 'Second feedback'
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test('Admin should be able to retrieve the submitted feedback', async () => {
        const response = await api
            .get('/api/v1/feedback')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const submittedFeedback = response.body.data.feedback.find(
            (item) =>
                item.request &&
                (
                    item.request._id === requestId ||
                    item.request.id === requestId
                )
        );

        expect(submittedFeedback).toBeDefined();
        expect(submittedFeedback.rating).toBe(5);
    });
});
