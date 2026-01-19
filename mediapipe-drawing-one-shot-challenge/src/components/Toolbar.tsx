import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';

// Custom SVG icon components to avoid ad-blocker issues
const LineSquiggle = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"/>
  </svg>
);

const Pen = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

const Eraser = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/>
    <path d="m5.082 11.09 8.828 8.828"/>
  </svg>
);

const RotateCcw = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const X = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

const Type = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const Undo = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

interface ToolbarProps {
  color: string;
  strokeWidth: number;
  isEraser: boolean;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onToolChange: (isEraser: boolean) => void;
  onReset: () => void;
  onConvertToText?: () => void;
  isProcessing?: boolean;
  onUndo?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  color,
  strokeWidth,
  isEraser,
  onColorChange,
  onStrokeWidthChange,
  onToolChange,
  onReset,
  onConvertToText,
  isProcessing = false,
  onUndo,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeWidth, setShowStrokeWidth] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const strokeWidthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (strokeWidthRef.current && !strokeWidthRef.current.contains(event.target as Node)) {
        setShowStrokeWidth(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        {/* Color Picker Button */}
        <div className="relative flex items-center justify-center" ref={colorPickerRef}>
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowStrokeWidth(false);
            }}
            className="w-5 h-5 rounded-full hover:shadow-md transition-shadow"
            style={{ backgroundColor: color }}
          />
          
          {showColorPicker && (
            <div className="absolute top-14 left-0 z-50">
              <div className="bg-white rounded-lg shadow-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Choose Color</span>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <SketchPicker
                  color={color}
                  onChange={(colorResult) => onColorChange(colorResult.hex)}
                  disableAlpha
                />
              </div>
            </div>
          )}
        </div>

        {/* Stroke Width Button */}
        <div className="relative" ref={strokeWidthRef}>
          <button
            onClick={() => {
              setShowStrokeWidth(!showStrokeWidth);
              setShowColorPicker(false);
            }}
            className="w-10 h-10 bg-white rounded-lg hover:shadow-md transition-shadow flex items-center justify-center"
          >
            <LineSquiggle size={20} className="text-gray-600" />
          </button>

          {showStrokeWidth && (
            <div className="absolute top-14 left-0 z-50">
              <div className="bg-white rounded-lg shadow-xl p-4 w-64">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Stroke Width</span>
                  <button
                    onClick={() => setShowStrokeWidth(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={strokeWidth}
                    onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-center">
                    <div
                      className="rounded-full"
                      style={{
                        width: `${Math.max(strokeWidth, 4)}px`,
                        height: `${Math.max(strokeWidth, 4)}px`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {strokeWidth}px
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pen Button */}
        <button
          onClick={() => onToolChange(false)}
          className={`w-10 h-10 rounded-lg hover:shadow-md transition-all flex items-center justify-center ${
            !isEraser ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          <Pen size={20} className="text-gray-600" />
        </button>

        {/* Eraser Button */}
        <button
          onClick={() => onToolChange(true)}
          className={`w-10 h-10 rounded-lg hover:shadow-md transition-all flex items-center justify-center ${
            isEraser ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          <Eraser size={20} className="text-gray-600" />
        </button>

        {/* Undo Button */}
        {onUndo && (
          <button
            onClick={onUndo}
            className="w-10 h-10 bg-white rounded-lg hover:shadow-md transition-shadow flex items-center justify-center"
            title="Undo (Ctrl+Z / Cmd+Z)"
          >
            <Undo size={20} className="text-gray-600" />
          </button>
        )}

        {/* Convert to Text Button */}
        {onConvertToText && (
          <button
            onClick={onConvertToText}
            disabled={isProcessing}
            className={`w-10 h-10 rounded-lg hover:shadow-md transition-all flex items-center justify-center ${
              isProcessing ? 'bg-blue-100 cursor-not-allowed' : 'bg-white'
            }`}
            title="Convert handwriting to text"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            ) : (
              <Type size={20} className="text-gray-600" />
            )}
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-10 h-10 bg-white rounded-lg hover:shadow-md transition-shadow flex items-center justify-center"
          title="Clear canvas"
        >
          <RotateCcw size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};