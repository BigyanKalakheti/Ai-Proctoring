require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./Admin'); // adjust this path to match your project

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_proctoring';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedAdmin() {
  try {
    const email = 'admin@example.com';

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin already exists.');
      return process.exit();
    }

    const admin = new Admin({
      username: 'adminuser',
      email,
      password: 'Password123!', // will be hashed by the pre-save hook
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully.');
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedAdmin();
