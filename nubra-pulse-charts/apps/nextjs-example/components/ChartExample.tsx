'use client';

import { useEffect, useState } from 'react';
import {
  getStartTime,
} from '@pulse/engine';

export default function ChartExample() {
  const [timeRange, setTimeRange] = useState<{
    startTime: Date;
    endTime: Date;
  } | null>(null);

  useEffect(() => {
    // Example: Get time range for 1 minute periodicity
    const startTimeMillis = getStartTime(1); // 1 minute interval
    const endTimeMillis = Date.now();
    
    setTimeRange({
      startTime: new Date(startTimeMillis),
      endTime: new Date(endTimeMillis),
    });
  }, []);

  return (
    <div
      style={{
        padding: '1.5rem',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
        Chart Example
      </h2>
      <div style={{ marginBottom: '1rem' }}>
        <p>
          <strong>Package Status:</strong> @pulse/engine is loaded and working
        </p>
        <p>
          <strong>Package Status:</strong> @pulse/web is available for chart rendering
        </p>
      </div>
      {timeRange && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            Time Range Example
          </h3>
          <p>
            <strong>Start Time:</strong>{' '}
            {timeRange.startTime.toLocaleString()}
          </p>
          <p>
            <strong>End Time:</strong> {timeRange.endTime.toLocaleString()}
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            This demonstrates the getStartTime function from @pulse/engine
            for a 1-minute periodicity interval.
          </p>
        </div>
      )}
      <div
        style={{
          marginTop: '2rem',
          padding: '2rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '2px dashed #ccc',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Chart rendering components will be implemented here using @pulse/web
        </p>
      </div>
    </div>
  );
}

