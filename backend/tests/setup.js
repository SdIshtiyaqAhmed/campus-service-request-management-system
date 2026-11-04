const externalMongoUri = process.env.MONGODB_TEST_URI;

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../src/models/User');
const Category = require('../src/models/Category');

jest.setTimeout(30000);

let mongoServer;

const users = [
    {
        name: 'System Administrator',
        email: 'admin@campus.local',
        password: 'AdminPassword123!',
        role: 'admin',
        department: 'Administration'
    },
    {
        name: 'Test Staff',
        email: 'staff@test.com',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'IT Services'
    },
    {
        name: 'Second Test Staff',
        email: 'staff2@test.com',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'Facilities'
    },
    {
        name: 'Test Student',
        email: 'student@test.com',
        password: 'StudentPassword123!',
        role: 'student',
        department: 'Computer Science'
    },
        {
        name: 'Other Test Student',
        email: 'otherstudent@test.com',
        password: 'StudentPassword123!',
        role: 'student',
        department: 'Computer Science'
    }
];

const categories = [
    {
        name: 'IT Services',
        description:
            'Computer, network, software, and technical support services'
    },
    {
        name: 'Electrical',
        description:
            'Electrical equipment, wiring, lighting, and power-related issues'
    },
    {
        name: 'Plumbing',
        description:
            'Water supply, drainage, taps, pipes, and plumbing issues'
    },
    {
        name: 'Hostel',
        description:
            'Hostel facilities, rooms, common areas, and related services'
    },
    {
        name: 'Library',
        description:
            'Library facilities, equipment, resources, and related services'
    },
    {
        name: 'Classroom',
        description:
            'Classroom infrastructure, equipment, and maintenance issues'
    },
    {
        name: 'Facilities',
        description:
            'General campus facilities and maintenance services'
    }
];

const seedTestDatabase = async () => {
    for (const userData of users) {
        const password = await bcrypt.hash(userData.password, 12);

        await User.create({
            name: userData.name,
            email: userData.email,
            password,
            role: userData.role,
            department: userData.department,
            isActive: true
        });
    }

    await Category.insertMany(categories);
};

beforeAll(async () => {
    if (!externalMongoUri) {
        mongoServer = await MongoMemoryServer.create();
    }

    await mongoose.connect(externalMongoUri || mongoServer.getUri());

    await mongoose.connection.dropDatabase();

    await seedTestDatabase();
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    } finally {
        if (mongoServer) {
            await mongoServer.stop();
        }
    }
});