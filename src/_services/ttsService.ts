import elevenLabsTTSService from './elevenLabsTTSService';
import nativeTTSService from './nativeTTSService';

export type TTSProvider = 'elevenlabs' | 'native';

interface TTSConfig {
  provider: TTSProvider;
  elevenLabsApiKey?: string;
}

class TTSService {
  private config: TTSConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): TTSConfig {
    const provider = import.meta.env.VITE_TTS_PROVIDER as TTSProvider;
    const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    // Default to native if no provider specified or ElevenLabs key missing
    if (!provider) {
      return { provider: 'native' };
    }

    if (provider === 'elevenlabs' && !elevenLabsApiKey) {
      console.warn('ElevenLabs selected but no API key provided. Falling back to native TTS.');
      return { provider: 'native' };
    }

    return {
      provider,
      elevenLabsApiKey
    };
  }

  /**
   * Get current TTS provider
   */
  getCurrentProvider(): TTSProvider {
    return this.config.provider;
  }

  /**
   * Check if TTS is available
   */
  isAvailable(): boolean {
    if (this.config.provider === 'elevenlabs') {
      return !!this.config.elevenLabsApiKey;
    }
    return nativeTTSService.isSupported();
  }

  /**
   * Play text using the configured TTS provider
   */
  async playText(
    text: string, 
    voiceId?: string,
    options?: any
  ): Promise<HTMLAudioElement> {
    try {
      if (this.config.provider === 'elevenlabs') {
        return await elevenLabsTTSService.playText(text, voiceId, options);
      } else {
        return await nativeTTSService.playText(text, voiceId, options);
      }
    } catch (error) {
      console.error(`TTS Error (${this.config.provider}):`, error);
      
      // Fallback to native TTS if ElevenLabs fails
      if (this.config.provider === 'elevenlabs') {
        console.warn('ElevenLabs failed, falling back to native TTS');
        try {
          return await nativeTTSService.playText(text, voiceId, options);
        } catch (nativeError) {
          console.error('Native TTS also failed:', nativeError);
          throw nativeError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Stop current TTS playback
   */
  stop(): void {
    if (this.config.provider === 'elevenlabs') {
      // ElevenLabs uses audio elements, we'll need to track them separately
      // For now, just log
      console.log('Stopping ElevenLabs TTS (handled by audio element)');
    } else {
      nativeTTSService.stop();
    }
  }

  /**
   * Pause current TTS playback  
   */
  pause(): void {
    if (this.config.provider === 'native') {
      nativeTTSService.pause();
    }
    // ElevenLabs uses audio elements which handle pause/resume natively
  }

  /**
   * Resume paused TTS playback
   */
  resume(): void {
    if (this.config.provider === 'native') {
      nativeTTSService.resume();
    }
    // ElevenLabs uses audio elements which handle pause/resume natively
  }

  /**
   * Check if TTS is currently playing
   */
  isPlaying(): boolean {
    if (this.config.provider === 'native') {
      return nativeTTSService.isCurrentlyPlaying();
    }
    // For ElevenLabs, this would need to be tracked by the audio element
    return false;
  }

  /**
   * Get available voices (if supported)
   */
  async getVoices(): Promise<any[]> {
    if (this.config.provider === 'elevenlabs') {
      try {
        return await elevenLabsTTSService.getVoices();
      } catch (error) {
        console.warn('Could not fetch ElevenLabs voices:', error);
        return [];
      }
    } else {
      return await nativeTTSService.getVoices();
    }
  }

  /**
   * Download audio (ElevenLabs only)
   */
  async downloadAudio(
    text: string, 
    filename?: string,
    voiceId?: string,
    options?: any
  ): Promise<void> {
    if (this.config.provider === 'elevenlabs') {
      return await elevenLabsTTSService.downloadAudio(text, filename, voiceId, options);
    } else {
      console.warn('Audio download is not supported with native TTS');
    }
  }

  /**
   * Get provider-specific settings
   */
  getProviderInfo(): { provider: TTSProvider; hasApiKey: boolean; supported: boolean } {
    return {
      provider: this.config.provider,
      hasApiKey: !!this.config.elevenLabsApiKey,
      supported: this.isAvailable()
    };
  }

  /**
   * Synthesize speech without playing (ElevenLabs only)
   */
  async synthesizeSpeech(
    text: string,
    voiceId?: string,
    options?: any
  ): Promise<ArrayBuffer | null> {
    if (this.config.provider === 'elevenlabs') {
      return await elevenLabsTTSService.synthesizeSpeech(text, voiceId, options);
    }
    
    console.warn('Speech synthesis (without playing) is not supported with native TTS');
    return null;
  }
}

export default new TTSService();