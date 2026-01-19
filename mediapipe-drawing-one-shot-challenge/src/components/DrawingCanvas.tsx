import React, { useRef, useEffect, useCallback } from 'react';

interface DrawingCanvasProps {
  color: string;
  strokeWidth: number;
  isEraser: boolean;
  shouldClear: boolean;
  onClearComplete: () => void;
  onConvertToText?: () => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  color,
  strokeWidth,
  isEraser,
  shouldClear,
  onClearComplete,
  onConvertToText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const textElementsRef = useRef<{ text: string; x: number; y: number; fontSize: number }[]>([]);
  
  // History management for undo
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.imageSmoothingEnabled = true;
    };

    resizeCanvas();
    contextRef.current = context;
    
    // Initialize history with blank canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [imageData];
    historyStepRef.current = 0;

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    // Get current canvas state
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Remove any states after current step (for redo functionality)
    historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    
    // Add new state
    historyRef.current.push(imageData);
    historyStepRef.current = historyRef.current.length - 1;
    
    // Limit history to 50 states to prevent memory issues
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyStepRef.current--;
    }
  }, []);

  useEffect(() => {
    if (shouldClear && canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Save clear state to history
      saveToHistory();
      onClearComplete();
    }
  }, [shouldClear, onClearComplete, saveToHistory]);

  const undo = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    if (historyStepRef.current <= 0) return; // Nothing to undo
    
    historyStepRef.current--;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (historyStepRef.current >= 0) {
      // Restore previous state
      context.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    } else {
      // Clear canvas if we're at the beginning
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = useCallback((x: number, y: number) => {
    if (!contextRef.current) return;
    
    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    contextRef.current.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = strokeWidth;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  }, [color, strokeWidth, isEraser]);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !contextRef.current || !lastPointRef.current) return;
    
    // Use quadratic curves for smoother lines
    const midX = (lastPointRef.current.x + x) / 2;
    const midY = (lastPointRef.current.y + y) / 2;
    
    contextRef.current.quadraticCurveTo(
      lastPointRef.current.x,
      lastPointRef.current.y,
      midX,
      midY
    );
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(midX, midY);
    
    lastPointRef.current = { x, y };
  }, []);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current || !contextRef.current) return;
    
    isDrawingRef.current = false;
    lastPointRef.current = null;
    contextRef.current.closePath();
    
    // Save to history after completing a stroke
    saveToHistory();
  }, [saveToHistory]);

  const getCanvasImage = useCallback((): string | null => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL('image/png');
  }, []);

  const renderText = useCallback((text: string, x?: number, y?: number) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    const fontSize = Math.min(canvas.width, canvas.height) / 20;
    context.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Position text in center if not specified
    const textX = x ?? canvas.width / 2;
    const textY = y ?? canvas.height / 2;
    
    // Handle multi-line text
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.5;
    const startY = textY - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      context.fillText(line, textX, startY + index * lineHeight);
    });
    
    // Store text element
    textElementsRef.current.push({ text, x: textX, y: textY, fontSize });
  }, [color]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo]);

  // Expose drawing methods for MediaPipe integration
  useEffect(() => {
    (window as any).drawingCanvas = {
      startDrawing,
      draw,
      stopDrawing,
      getCanvasImage,
      renderText,
      undo,
    };
  }, [startDrawing, draw, stopDrawing, getCanvasImage, renderText, undo]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ touchAction: 'none' }}
    />
  );
};