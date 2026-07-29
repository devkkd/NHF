import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
await mongoose.connect(process.env.MONGO_URI);
const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
if (existing) { console.log('Admin already exists'); process.exit(0); }
await User.create({ name: process.env.ADMIN_NAME || 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
console.log('Admin created:', process.env.ADMIN_EMAIL);
await mongoose.disconnect();
