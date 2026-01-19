declare module '@mediapipe/hands' {
  export class Hands {
    constructor(config: any);
    setOptions(options: any): void;
    onResults(callback: (results: any) => void): void;
    send(data: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: any);
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any[],
    options?: any
  ): void;
  
  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    options?: any
  ): void;
  
  export const HAND_CONNECTIONS: any[];
}