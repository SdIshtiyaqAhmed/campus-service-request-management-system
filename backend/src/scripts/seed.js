require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const adminData = {
    name: 'System Administrator',
    email: 'admin@campus.local',
    password: 'AdminPassword123!',
    role: 'admin',
    department: 'Administration'
};

const staffData = {
    name: 'Test Staff',
    email: 'staff@test.com',
    password: 'StaffPassword123!',
    role: 'staff',
    department: 'IT Services'
};

const studentData = {
    name: 'Test Student',
    email: 'student@test.com',
    password: 'StudentPassword123!',
    role: 'student',
    department: 'Computer Science'
};

const categories = [
    {
        name: 'IT Services',
        description: 'Computer, network, software, and technical support services'
    },
    {
        name: 'Electrical',
        description: 'Electrical equipment, wiring, lighting, and power-related issues'
    },
    {
        name: 'Plumbing',
        description: 'Water supply, drainage, taps, pipes, and plumbing issues'
    },
    {
        name: 'Hostel',
        description: 'Hostel facilities, rooms, common areas, and related services'
    },
    {
        name: 'Library',
        description: 'Library facilities, equipment, resources, and related services'
    },
    {
        name: 'Classroom',
        description: 'Classroom infrastructure, equipment, and maintenance issues'
    },
    {
        name: 'Facilities',
        description: 'General campus facilities and maintenance services'
    }
];

const syncUser = async (userData) => {
    const existingUser = await User.findOne({
        email: userData.email
    }).select('+password');

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    if (existingUser) {
        existingUser.name = userData.name;
        existingUser.password = hashedPassword;
        existingUser.role = userData.role;
        existingUser.department = userData.department;
        existingUser.isActive = true;

        await existingUser.save();

        console.log(`User synchronized: ${userData.email}`);
        return;
    }

    await User.create({
        ...userData,
        password: hashedPassword
    });

    console.log(`User created: ${userData.email}`);
};

const seedDatabase = async () => {
    try {
        await connectDB();

        await syncUser(adminData);
        await syncUser(staffData);
        await syncUser(studentData);

        for (const categoryData of categories) {
            const existingCategory = await Category.findOne({
                name: categoryData.name
            });

            if (!existingCategory) {
                await Category.create(categoryData);
                console.log(`Category created: ${categoryData.name}`);
            } else {
                console.log(`Category already exists: ${categoryData.name}`);
            }
        }

        console.log('Database seeding completed successfully.');
    } catch (error) {
        console.error(`Database seeding failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seedDatabase();
