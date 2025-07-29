# 🛡️ AI Proctoring & Exam Management System

A full-stack, real-time AI proctoring and online exam management platform. Built with **React**, **Vite**, **face-api.js**, **MediaPipe**, **Express**, and **MongoDB**. The system provides secure online exams with live face verification, behavioral monitoring, violation logging, and robust admin/user dashboards.

---

## 🚀 Features

### For Admins
- **Dashboard**: Overview of users, exams, results, and violations
- **User Management**: Add, edit, and manage users
- **Exam Management**: Create, edit, and schedule exams
- **Results & Reports**: View exam results and proctoring violation logs

### For Users
- **Exam Portal**: Take assigned exams with real-time proctoring
- **Face Verification**: Live face recognition using webcam
- **Proctoring Event Detection**: Detects tab switch, fullscreen exit, window blur, and high microphone volume
- **Violation Logging**: All suspicious events are logged and sent to the backend
- **Live Feedback**: Audio, vibration, and toast notifications for proctoring events

---

## 🛠️ Technologies Used

### Frontend
- React, Vite, Tailwind CSS
- face-api.js, @mediapipe/face_detection
- react-toastify, lucide-react, react-webcam

### Backend
- Node.js, Express, MongoDB (Mongoose)
- JWT Auth, Helmet, CORS, Multer, Morgan

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/BigyanKalakheti/Ai-Proctoring.git
cd Ai-Proctoring
```

### 2. Setup the Backend
```bash
cd server
npm install
# Create a .env file with MONGODB_URI and JWT_SECRET
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
# Download face-api.js models and place in public/models/
# (see below for details)
npm run dev
```

### 4. Download FaceAPI Models
Download the following models from [face-api.js GitHub](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in `client/public/models/`:
- `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model-weights_manifest.json`
- `tiny_face_detector_model-weights_manifest.json`

**Folder structure:**
```
client/public/models/
  face_landmark_68_model-weights_manifest.json
  face_recognition_model-weights_manifest.json
  tiny_face_detector_model-weights_manifest.json
  ... (other model files)
```

---

## 🧑‍💻 Usage Instructions

### Admin Flow
1. Visit `/admin/login` and log in as admin
2. Access dashboard, manage users, exams, and view results/violations

### User Flow
1. Visit `/login` and log in as a user
2. Start assigned exam
3. Allow webcam and microphone access for proctoring
4. Complete the exam; violations (tab switch, fullscreen exit, etc.) are logged automatically

### Proctoring Events Detected
- Face not detected / multiple faces / unauthorized face
- Tab switch or window blur
- Exiting fullscreen
- High microphone volume (possible talking)

All violations are logged and visible to admins in the dashboard.

---

## 📁 Project Structure
```
AI-procotoring/
  client/      # React frontend (Vite, face-api.js, proctoring UI)
    src/
      components/
        Dashboard.jsx
        DashboardLayout.jsx
        ExamManagement.jsx
        exams/
          ExamHeader.jsx
          ExamPortal.jsx
          ...
        user/
          FaceDetection.jsx
          ProctoringEventListener.jsx
          ...
      contexts/
      services/
      utils/
    public/models/   # Face recognition models
    ...
  server/      # Express backend (API, MongoDB, auth, violations)
    models/
    routes/
    middleware/
    server.js
    ...
  README.md
```

---

## ✅ Future Improvements
- Multi-user enrollment and face database
- Spoof detection (anti-photo attack)
- Export logs as PDF/CSV
- More granular violation severity and analytics
- Admin dashboard enhancements

---

## 🧑 Author
**Bigyan Kalakheti**  
*Cybersecurity & AI Enthusiast*

---

## 📄 License
This project is licensed under the MIT License.
