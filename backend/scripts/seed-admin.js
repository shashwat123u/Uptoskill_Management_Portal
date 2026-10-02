import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User.js';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@uptoskill.com';
    const existing = await User.findOne({ email, role: 'admin' });
    if (existing) {
      console.log('✅ Admin already exists:');
      console.log('   Email   :', existing.email);
      console.log('   FullName:', existing.fullName);
      console.log('   Role    :', existing.role);
      console.log('   Password: Admin@1234');
      console.log('   _id     :', existing._id);
    } else {
      const admin = await User.create({
        fullName: 'Portal Admin',
        email,
        password: 'Admin@1234',
        role: 'admin',
        mobileNo: '9999999999',
      });
      console.log('✅ Admin created successfully!');
      console.log('   Email   :', admin.email);
      console.log('   FullName:', admin.fullName);
      console.log('   Role    :', admin.role);
      console.log('   Password: Admin@1234');
      console.log('   _id     :', admin._id);
    }

    await mongoose.disconnect();
    console.log('\nDone — you can now login with the credentials above.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}
seedAdmin();
