const request = require('supertest');
const app = require('../src/app');

const api = request(app);

describe('Admin User Management API', () => {
    let adminToken;
    let studentToken;
    let staffToken;
    let studentId;

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
        studentId = studentLogin.body.data.user.id;

        const staffLogin = await api
            .post('/api/v1/auth/login')
            .send({
                email: 'staff@test.com',
                password: 'StaffPassword123!'
            });

        expect(staffLogin.statusCode).toBe(200);
        staffToken = staffLogin.body.data.token;
    });

    test('GET /api/v1/admin/users should require authentication', async () => {
        const response = await api
            .get('/api/v1/admin/users');

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/users should reject students', async () => {
        const response = await api
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/users should reject staff', async () => {
        const response = await api
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/users should allow admins', async () => {
        const response = await api
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.users)).toBe(true);

        const adminUser = response.body.data.users.find(
            (user) => user.email === 'admin@campus.local'
        );

        expect(adminUser).toBeDefined();
        expect(adminUser.password).toBeUndefined();
    });

    test('GET /api/v1/admin/users/:id should return a user', async () => {
        const response = await api
            .get(`/api/v1/admin/users/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('student@test.com');
        expect(response.body.data.user.password).toBeUndefined();
    });

    test('GET /api/v1/admin/users/:id should reject invalid IDs', async () => {
        const response = await api
            .get('/api/v1/admin/users/not-a-valid-id')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/v1/admin/users/:id should return 404 for unknown users', async () => {
        const response = await api
            .get('/api/v1/admin/users/507f1f77bcf86cd799439011')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test('PATCH /api/v1/admin/users/:id should allow admins to update users', async () => {
        const response = await api
            .patch(`/api/v1/admin/users/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                department: 'Student Services'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.department).toBe('Student Services');
    });

    test('PATCH /api/v1/admin/users/:id should reject invalid roles', async () => {
        const response = await api
            .patch(`/api/v1/admin/users/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                role: 'superadmin'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('PATCH /api/v1/admin/users/:id should reject self-deactivation', async () => {
        const adminResponse = await api
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        const adminUser = adminResponse.body.data.users.find(
            (user) => user.email === 'admin@campus.local'
        );

        const response = await api
            .patch(`/api/v1/admin/users/${adminUser.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                isActive: false
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
