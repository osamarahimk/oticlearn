
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `scanned_notes_${Date.now()}.png`, { type: 'image/png' });
            onCapture(file);
          }
        }, 'image/png', 0.9);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden relative">
      {error ? (
        <div className="text-white text-center p-6">
          <X className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p>{error}</p>
          <button onClick={onCancel} className="mt-4 text-sm text-gray-400 hover:text-white">Close</button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 w-full flex items-center justify-center gap-8">
            <button 
              onClick={onCancel} 
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all"
            >
              <X size={24} />
            </button>
            
            <button 
              onClick={captureImage} 
              className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center relative group"
            >
              <div className="w-12 h-12 bg-white rounded-full group-hover:scale-90 transition-transform" />
            </button>

            <button 
              onClick={() => { /* Toggle camera if needed */ }} 
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-50 cursor-not-allowed"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};