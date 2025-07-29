// import React from 'react';
// import { Video, VideoOff } from 'lucide-react';

// export const VideoStream = () => {
//   const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);

//   return (
//     <div className="bg-gray-900 rounded-lg overflow-hidden">
//       <div className="aspect-video flex items-center justify-center relative">
//         {isVideoEnabled ? (
//           <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
//             <Video size={48} className="text-white opacity-70" />
//             <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
//               Camera Active
//             </div>
//           </div>
//         ) : (
//           <div className="w-full h-full bg-gray-700 flex items-center justify-center">
//             <VideoOff size={48} className="text-gray-400" />
//           </div>
//         )}
//       </div>
//       <div className="p-3 bg-gray-800">
//         <button
//           onClick={() => setIsVideoEnabled(!isVideoEnabled)}
//           className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//             isVideoEnabled
//               ? 'bg-red-600 hover:bg-red-700 text-white'
//               : 'bg-green-600 hover:bg-green-700 text-white'
//           }`}
//         >
//           {isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
//         </button>
//       </div>
//     </div>
//   );
// };


import React, { useState } from 'react';
import { Video, VideoOff } from 'lucide-react';
import RealTimeFaceVerification from '../user/FaceDetection' // adjust path accordingly
import ProctoringEventListener from '../user/ProctoringEventListener';

export const VideoStream = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden w-full max-w-md mx-auto">
      <div className="aspect-video flex items-center justify-center relative bg-black">
        {isVideoEnabled ? (
          <>
            {/* Render the real-time face verification component with video */}
            <RealTimeFaceVerification />
            <ProctoringEventListener/>
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              Camera Active & Face Verification Running
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <VideoOff size={48} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-800">
        <button
          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isVideoEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
      </div>
    </div>
  );
};
