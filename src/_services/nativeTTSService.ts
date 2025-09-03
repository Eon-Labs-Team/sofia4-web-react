interface NativeTTSOptions {
  rate?: number;      // 0.1 to 10
  pitch?: number;     // 0 to 2  
  volume?: number;    // 0 to 1
  voice?: SpeechSynthesisVoice;
  lang?: string;
}

class NativeTTSService {
  private synthesis: SpeechSynthesis;
  private defaultOptions: NativeTTSOptions = {
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    lang: 'es-ES'
  };
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Check if TTS is supported by the browser
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let voices = this.synthesis.getVoices();
      
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Wait for voices to be loaded
        this.synthesis.onvoiceschanged = () => {
          voices = this.synthesis.getVoices();
          resolve(voices);
        };
      }
    });
  }

  /**
   * Get the best Spanish voice available
   */
  async getBestSpanishVoice(): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getVoices();
    
    // Priority order for Spanish voices
    const priorities = [
      'es-ES', 'es-MX', 'es-AR', 'es-CL', 'es-CO', 'es-VE', 'es-PE', 'es-UY'
    ];

    for (const lang of priorities) {
      const voice = voices.find(v => v.lang === lang);
      if (voice) return voice;
    }

    // Fallback to any Spanish voice
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) return spanishVoice;

    // Last fallback to any voice
    return voices[0] || null;
  }

  /**
   * Speak text using native browser TTS
   */
  async speak(text: string, options: NativeTTSOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    // Stop any current speech
    this.stop();

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    return new Promise(async (resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        if (mergedOptions.voice) {
          utterance.voice = mergedOptions.voice;
        } else {
          const bestVoice = await this.getBestSpanishVoice();
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }

        // Set options
        utterance.rate = mergedOptions.rate || 0.9;
        utterance.pitch = mergedOptions.pitch || 1;
        utterance.volume = mergedOptions.volume || 0.8;
        utterance.lang = mergedOptions.lang || 'es-ES';

        // Event listeners
        utterance.onstart = () => {
          this.isPlaying = true;
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this.currentUtterance = null;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Store current utterance and start speaking
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Play text with Promise return for compatibility with ElevenLabs service
   */
  async playText(
    text: string,
    voiceOptions?: any, // For compatibility, not used in native TTS
    options?: NativeTTSOptions
  ): Promise<HTMLAudioElement> {
    await this.speak(text, options);
    
    // Return a mock audio element for compatibility
    const mockAudio = document.createElement('audio') as HTMLAudioElement;
    return mockAudio;
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.isPlaying) {
      this.synthesis.cancel();
      this.isPlaying = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.isPlaying) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if TTS is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying && this.synthesis.speaking;
  }

  /**
   * Check if TTS is paused
   */
  isPaused(): boolean {
    return this.synthesis.paused;
  }

  /**
   * Get current speech rate
   */
  getRate(): number {
    return this.defaultOptions.rate || 0.9;
  }

  /**
   * Set speech rate
   */
  setRate(rate: number): void {
    this.defaultOptions.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Get current pitch
   */
  getPitch(): number {
    return this.defaultOptions.pitch || 1;
  }

  /**
   * Set speech pitch
   */
  setPitch(pitch: number): void {
    this.defaultOptions.pitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.defaultOptions.volume || 0.8;
  }

  /**
   * Set speech volume
   */
  setVolume(volume: number): void {
    this.defaultOptions.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Download audio (not supported in native TTS, returns empty function)
   */
  async downloadAudio(): Promise<void> {
    console.warn('Download audio is not supported with native TTS');
  }
}

export default new NativeTTSService();