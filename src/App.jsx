import './App.css';
import ProctoringEventListener from './components/ProctoringEventListener';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealTimeFaceVerification from './components/FaceDetection';

function App() {
  return (
    <div>
      {/* Proctoring logic: fullscreen, tab switch, mic detection */}
      <ProctoringEventListener />

      {/* Face recognition component with toast alerts */}
      {/* <FaceVerificationComponent /> */}
      <RealTimeFaceVerification/>
    </div>
  );
}

export default App;
