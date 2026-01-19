import React, { useRef, useEffect } from 'react';

interface CameraOverlayProps {
  onHandTracking: (landmarks: any) => void;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ onHandTracking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeCamera = async () => {
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;
      
      if (!videoElement || !canvasElement) {
        console.warn('Video or canvas element not available');
        return;
      }

      try {
        // Load MediaPipe scripts dynamically
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Load MediaPipe scripts in order
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        if (!isMounted) return;
        
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
        if (!isMounted) return;
        
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        if (!isMounted) return;
        
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        if (!isMounted) return;

        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isMounted) return;

        // Access MediaPipe from global scope
        const { Hands } = (window as any);
        const { Camera } = (window as any);

        if (!Hands || !Camera) {
          throw new Error('MediaPipe libraries not loaded correctly');
        }

        // Initialize Hands
        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            onHandTracking(results.multiHandLandmarks[0]);
          }
        });

        if (!isMounted) return;
        handsRef.current = hands;

        // Check video element still exists before initializing camera
        if (!videoRef.current) {
          console.error('Video element no longer available');
          return;
        }

        // Initialize Camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720
        });

        if (!isMounted) return;
        cameraRef.current = camera;
        await camera.start();

      } catch (error) {
        console.error('Failed to initialize camera:', error);
        
        if (!isMounted) return;
        
        // Fallback: try to initialize basic camera without MediaPipe
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 1280, 
              height: 720,
              facingMode: 'user'
            } 
          });
          
          if (!isMounted || !videoRef.current) {
            // Stop the stream if component unmounted
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch((playError) => {
            console.error('Failed to play video:', playError);
          });
        } catch (fallbackError) {
          console.error('Failed to acquire camera feed:', fallbackError);
        }
      }
    };

    initializeCamera();

    return () => {
      isMounted = false;
      
      // Stop camera first to prevent it from trying to send frames
      if (cameraRef.current && typeof cameraRef.current.stop === 'function') {
        try {
          cameraRef.current.stop();
        } catch (error) {
          console.warn('Error stopping camera:', error);
        }
      }
      
      // Clean up video stream
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.warn('Error stopping video stream:', error);
        }
      }
      
      // Close hands last
      if (handsRef.current && typeof handsRef.current.close === 'function') {
        try {
          handsRef.current.close();
        } catch (error) {
          console.warn('Error closing hands:', error);
        }
      }
      
      // Clear refs
      cameraRef.current = null;
      handsRef.current = null;
    };
  }, [onHandTracking]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-10 z-0"
        style={{ transform: 'scaleX(-1)' }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-5"
        style={{ transform: 'scaleX(-1)' }}
      />
    </>
  );
};