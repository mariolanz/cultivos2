

import React, { useRef, useEffect, useState } from 'react';

const CameraModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const openCamera = async () => {
      if (isOpen) {
        setError('');
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          currentStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos en tu navegador.");
        }
      }
    };
    openCamera();

    // Cleanup function
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };
  
  const handleClose = () => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
      }
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-2">
      <div className="bg-surface p-4 rounded-lg max-w-4xl w-full flex flex-col max-h-full overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md mb-4 flex-1 object-contain"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        <div className="flex justify-center gap-4 flex-shrink-0">
          <button onClick={handleClose} className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold">Cerrar</button>
          <button onClick={handleCapture} className="px-6 py-2 rounded bg-primary hover:bg-primary-dark text-white font-semibold" disabled={!!error}>Capturar Foto</button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;