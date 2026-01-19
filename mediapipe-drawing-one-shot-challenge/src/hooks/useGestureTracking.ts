import { useState, useCallback, useRef } from 'react';

interface GestureState {
  cursorPosition: { x: number; y: number };
  isPinching: boolean;
  isVisible: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const useGestureTracking = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    cursorPosition: { x: 0, y: 0 },
    isPinching: false,
    isVisible: false,
  });

  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  
  // Smoothing parameters
  const smoothedPositionRef = useRef<Point | null>(null);
  const positionBufferRef = useRef<Point[]>([]);
  const SMOOTHING_FACTOR = 0.5; // Lower = more smoothing, higher = more responsive
  const BUFFER_SIZE = 3; // Number of positions to average

  const calculateDistance = (point1: any, point2: any): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const convertCoordinates = (landmark: any): { x: number; y: number } => {
    // Convert normalized coordinates to screen coordinates
    // Flip x-axis for mirrored effect
    const x = (1 - landmark.x) * window.innerWidth;
    const y = landmark.y * window.innerHeight;
    return { x, y };
  };

  const smoothPosition = (rawPosition: Point): Point => {
    // Add to buffer
    positionBufferRef.current.push(rawPosition);
    if (positionBufferRef.current.length > BUFFER_SIZE) {
      positionBufferRef.current.shift();
    }

    // Calculate moving average
    const avgPosition = {
      x: positionBufferRef.current.reduce((sum, p) => sum + p.x, 0) / positionBufferRef.current.length,
      y: positionBufferRef.current.reduce((sum, p) => sum + p.y, 0) / positionBufferRef.current.length,
    };

    // Apply exponential smoothing
    if (smoothedPositionRef.current === null) {
      smoothedPositionRef.current = avgPosition;
    } else {
      smoothedPositionRef.current = {
        x: smoothedPositionRef.current.x + SMOOTHING_FACTOR * (avgPosition.x - smoothedPositionRef.current.x),
        y: smoothedPositionRef.current.y + SMOOTHING_FACTOR * (avgPosition.y - smoothedPositionRef.current.y),
      };
    }

    return smoothedPositionRef.current;
  };

  const handleHandTracking = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) {
      setGestureState((prev) => ({ ...prev, isVisible: false }));
      if (isDrawingRef.current) {
        (window as any).drawingCanvas?.stopDrawing();
        isDrawingRef.current = false;
      }
      // Reset smoothing when hand is not detected
      smoothedPositionRef.current = null;
      positionBufferRef.current = [];
      return;
    }

    // Get key landmarks for gesture detection
    const indexTip = landmarks[8];  // Index finger tip
    const thumbTip = landmarks[4];  // Thumb tip
    const indexMcp = landmarks[5];  // Index finger MCP joint

    // Convert index finger tip to screen coordinates
    const rawPosition = convertCoordinates(indexTip);
    
    // Apply smoothing to reduce jitter from hand tremors
    const smoothedPos = smoothPosition(rawPosition);

    // Calculate pinch gesture (distance between thumb and index finger tips)
    const pinchDistance = calculateDistance(indexTip, thumbTip);
    const isPinching = pinchDistance < 0.05; // Threshold for pinch detection

    // Update gesture state with smoothed position
    setGestureState({
      cursorPosition: smoothedPos,
      isPinching,
      isVisible: true,
    });

    // Handle drawing logic
    const drawingCanvas = (window as any).drawingCanvas;
    if (!drawingCanvas) return;

    if (isPinching) {
      if (!isDrawingRef.current) {
        // Start drawing with smoothed position
        drawingCanvas.startDrawing(smoothedPos.x, smoothedPos.y);
        isDrawingRef.current = true;
      } else {
        // Continue drawing with smoothed position
        drawingCanvas.draw(smoothedPos.x, smoothedPos.y);
      }
    } else {
      if (isDrawingRef.current) {
        // Stop drawing
        drawingCanvas.stopDrawing();
        isDrawingRef.current = false;
      }
    }

    lastPositionRef.current = smoothedPos;
  }, []);

  return {
    gestureState,
    handleHandTracking,
  };
};