require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./Admin'); // adjust this path as necessary

const {
  MONGODB_URI,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_USERNAME) {
  console.error('❌ Missing required environment variables.');
  process.exit(1);
}

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
    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('⚠️ Admin already exists.');
      return;
    }

    const admin = new Admin({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // will be hashed by your schema pre-save hook
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
