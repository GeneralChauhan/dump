import Tesseract from 'tesseract.js';

export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  async recognizeText(imageData: string): Promise<string> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      const { data } = await this.worker.recognize(imageData);
      return data.text.trim();
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw error;
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();

