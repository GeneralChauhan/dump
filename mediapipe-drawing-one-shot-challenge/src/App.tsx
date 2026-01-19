import { useState, useCallback, useEffect } from "react";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { CameraOverlay } from "./components/CameraOverlay";
import { Toolbar } from "./components/Toolbar";
import { Cursor } from "./components/Cursor";
import { useGestureTracking } from "./hooks/useGestureTracking";
import { ocrService } from "./services/ocrService";

function App() {
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize OCR service
  useEffect(() => {
    ocrService.initialize().catch(console.error);
    return () => {
      ocrService.terminate().catch(console.error);
    };
  }, []);

  const handleConvertToText = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Get canvas image
      const drawingCanvas = (window as any).drawingCanvas;
      if (!drawingCanvas) {
        console.error("Drawing canvas not available");
        return;
      }

      const imageData = drawingCanvas.getCanvasImage();
      if (!imageData) {
        console.error("Failed to get canvas image");
        return;
      }

      console.log("Converting handwriting to text...");

      // Recognize text using OCR
      const recognizedText = await ocrService.recognizeText(imageData);

      if (recognizedText && recognizedText.trim()) {
        console.log("Recognized text:", recognizedText);
        // Render the recognized text on canvas
        drawingCanvas.renderText(recognizedText);
      } else {
        console.log("No text recognized");
        alert("No text could be recognized. Try writing more clearly.");
      }
    } catch (error) {
      console.error("OCR conversion failed:", error);
      alert("Failed to convert handwriting to text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const { gestureState, handleHandTracking } = useGestureTracking();

  const handleClearComplete = useCallback(() => {
    setShouldClear(false);
  }, []);

  const handleReset = useCallback(() => {
    setShouldClear(true);
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
  }, []);

  const handleToolChange = useCallback((eraser: boolean) => {
    setIsEraser(eraser);
  }, []);

  const handleUndo = useCallback(() => {
    const drawingCanvas = (window as any).drawingCanvas;
    if (drawingCanvas && drawingCanvas.undo) {
      drawingCanvas.undo();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Camera Overlay with Hand Tracking */}
      <CameraOverlay onHandTracking={handleHandTracking} />

      {/* Drawing Canvas */}
      <DrawingCanvas
        color={color}
        strokeWidth={strokeWidth}
        isEraser={isEraser}
        shouldClear={shouldClear}
        onClearComplete={handleClearComplete}
      />

      {/* Floating Toolbar */}
      <Toolbar
        color={color}
        strokeWidth={strokeWidth}
        isEraser={isEraser}
        onColorChange={handleColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
        onToolChange={handleToolChange}
        onReset={handleReset}
        onConvertToText={handleConvertToText}
        isProcessing={isProcessing}
        onUndo={handleUndo}
      />

      {/* Gesture Cursor */}
      <Cursor
        x={gestureState.cursorPosition.x}
        y={gestureState.cursorPosition.y}
        color={isEraser ? "#ff6b6b" : color}
        size={Math.max(strokeWidth, 12)}
        isPinching={gestureState.isPinching}
        isVisible={gestureState.isVisible}
      />

      {/* OCR Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg font-medium text-gray-800">
                Converting to text...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
