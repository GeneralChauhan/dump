'use client';

import { useEffect, useState } from 'react';
import ChartExample from '@/components/ChartExample';

export default function Home() {
  return (
    <main style={{ padding: '2rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
          Celeris Charts - Next.js Example
        </h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          This is a Next.js example app for testing the Celeris charts web package.
        </p>
        <ChartExample />
      </div>
    </main>
  );
}

