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
let secondStaffToken;
let secondStaffId;
let reassignmentRequestId;

describe('Request API', () => {
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

        expect(staffMe.statusCode).toBe(200);
        staffId = staffMe.body.data.user.id;

        const secondStaffLogin = await api
    .post('/api/v1/auth/login')
    .send({
        email: 'staff2@test.com',
        password: 'StaffPassword123!'
    });

expect(secondStaffLogin.statusCode).toBe(200);
secondStaffToken = secondStaffLogin.body.data.token;

const secondStaffMe = await api
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${secondStaffToken}`);

expect(secondStaffMe.statusCode).toBe(200);
secondStaffId = secondStaffMe.body.data.user.id;

const studentLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'student@test.com',
                password: 'StudentPassword123!'
            });

        expect(studentLogin.statusCode).toBe(200);
        studentToken = studentLogin.body.data.token;

        const otherStudentLogin = await api
            .post('/api/v1/auth/register')
            .send({
                name: 'Other Test Student',
                email: 'otherstudent@test.com',
                password: 'StudentPassword123!'
            });

        if (otherStudentLogin.statusCode === 201) {
            otherStudentToken = otherStudentLogin.body.data.token;
        } else {
            const existingLogin = await api
                .post('/api/v1/auth/login')
                .send({
                    email: 'otherstudent@test.com',
                    password: 'StudentPassword123!'
                });

            expect(existingLogin.statusCode).toBe(200);
            otherStudentToken = existingLogin.body.data.token;
        }

        const categories = await api
            .get('/api/v1/categories')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(categories.statusCode).toBe(200);
        expect(categories.body.data.categories.length).toBeGreaterThan(0);

        const category = categories.body.data.categories.find(
            (item) => item.name === 'IT Services'
        );

        expect(category).toBeDefined();
        categoryId = category._id || category.id;
    });

    test('POST /api/v1/requests should require authentication', async () => {
        const response = await api
            .post('/api/v1/requests')
            .send({
                title: 'Test request',
                description: 'This request should not be created',
                category: categoryId
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/requests should allow students to create requests', async () => {
        const response = await api
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'Test Wi-Fi Request',
                description: 'The campus Wi-Fi is not working in the test area.',
                category: categoryId,
                priority: 'high',
                location: 'Computer Science Block'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

        const createdRequest = response.body.data.request;

        expect(createdRequest.title).toBe('Test Wi-Fi Request');
        expect(createdRequest.status).toBe('open');
        expect(createdRequest.priority).toBe('high');

        requestId = createdRequest._id || createdRequest.id;
    });

    test('GET /api/v1/requests should return the student requests', async () => {
        const response = await api
            .get('/api/v1/requests')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.requests)).toBe(true);

        const foundRequest = response.body.data.requests.find(
            (item) => (item._id || item.id) === requestId
        );

        expect(foundRequest).toBeDefined();
    });

    test('GET /api/v1/requests/:id should allow the request owner', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect((response.body.data.request._id || response.body.data.request.id))
            .toBe(requestId);
    });

    test('GET /api/v1/requests/:id should reject another student', async () => {
        const response = await api
            .get(`/api/v1/requests/${requestId}`)
            .set('Authorization', `Bearer ${otherStudentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/requests should reject staff users', async () => {
        const response = await api
            .post('/api/v1/requests')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                title: 'Staff Request',
                description: 'Staff should not create student requests.',
                category: categoryId
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('PUT /api/v1/requests/:id should allow the owner to update an open request', async () => {
        const response = await api
            .put(`/api/v1/requests/${requestId}`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'Updated Test Wi-Fi Request',
                priority: 'urgent'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.request.title)
            .toBe('Updated Test Wi-Fi Request');
        expect(response.body.data.request.priority)
            .toBe('urgent');
    });

    test('PATCH /api/v1/requests/:id/assign should allow admin assignment', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                staffId
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.request.status).toBe('assigned');
    });

    test('PATCH /api/v1/requests/:id/assign should allow admin reassignment', async () => {
    const createResponse = await api
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
            title: 'Reassignment Test Request',
            description: 'This request is used to test staff reassignment.',
            category: categoryId,
            priority: 'medium',
            location: 'Reassignment Test Area'
        });

    expect(createResponse.statusCode).toBe(201);

    reassignmentRequestId =
        createResponse.body.data.request._id ||
        createResponse.body.data.request.id;

    const initialAssignment = await api
        .patch(`/api/v1/requests/${reassignmentRequestId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            staffId
        });

    expect(initialAssignment.statusCode).toBe(200);

    const response = await api
        .patch(`/api/v1/requests/${reassignmentRequestId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            staffId: secondStaffId
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
        'Service request reassigned successfully'
    );
    expect(response.body.data.request.status).toBe('assigned');

    const assignedStaff =
        response.body.data.request.assignedTo._id ||
        response.body.data.request.assignedTo.id;

    expect(assignedStaff).toBe(secondStaffId);
});

test('PATCH /api/v1/requests/:id/assign should reject assigning the same staff member', async () => {
    const response = await api
        .patch(`/api/v1/requests/${reassignmentRequestId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            staffId: secondStaffId
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
        'already assigned to this staff member'
    );
});


test('PATCH /api/v1/requests/:id/assign should reject students', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/assign`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                staffId
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('PATCH /api/v1/requests/:id/status should allow assigned staff to start work', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                status: 'in_progress'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.request.status).toBe('in_progress');
    });

    test('PATCH /api/v1/requests/:id/status should allow staff to resolve the request', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
                status: 'resolved',
                resolution: 'Wi-Fi configuration was corrected and connectivity restored.'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.request.status).toBe('resolved');
        expect(response.body.data.request.resolution)
            .toBe('Wi-Fi configuration was corrected and connectivity restored.');
    });

    test('PATCH /api/v1/requests/:id/close should allow the student to close a resolved request', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/close`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.request.status).toBe('closed');
    });

    test('PATCH /api/v1/requests/:id/close should reject another student', async () => {
        const response = await api
            .patch(`/api/v1/requests/${requestId}/close`)
            .set('Authorization', `Bearer ${otherStudentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/requests should allow admin to view all requests', async () => {
        const response = await api
            .get('/api/v1/requests')
            .set('Authorization', `Bearer ${secondStaffToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.requests)).toBe(true);
    });
});












