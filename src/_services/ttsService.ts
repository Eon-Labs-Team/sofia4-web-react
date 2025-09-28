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

    console.log('🔧 Configurando TTS Service:', {
      envProvider: provider,
      hasElevenLabsKey: !!elevenLabsApiKey,
      keyLength: elevenLabsApiKey?.length
    });

    // Default to native if no provider specified or ElevenLabs key missing
    if (!provider) {
      console.log('✅ Sin provider especificado, usando Native TTS');
      return { provider: 'native' };
    }

    if (provider === 'elevenlabs' && !elevenLabsApiKey) {
      console.warn('⚠️ ElevenLabs selected but no API key provided. Falling back to native TTS.');
      return { provider: 'native' };
    }

    const finalConfig = {
      provider,
      elevenLabsApiKey
    };

    console.log('✅ Configuración final TTS:', {
      provider: finalConfig.provider,
      hasKey: !!finalConfig.elevenLabsApiKey
    });

    return finalConfig;
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
    console.log('🎵 TTS Service - playText llamado:', {
      provider: this.config.provider,
      hasElevenLabsKey: !!this.config.elevenLabsApiKey,
      textLength: text.length,
      voiceId,
      options
    });

    try {
      if (this.config.provider === 'elevenlabs') {
        console.log('🎵 Usando ElevenLabs TTS');
        return await elevenLabsTTSService.playText(text, voiceId, options);
      } else {
        console.log('🎵 Usando Native TTS (mejorado)');
        return await nativeTTSService.playText(text, voiceId, options);
      }
    } catch (error) {
      console.error(`❌ TTS Error (${this.config.provider}):`, error);
      
      // Fallback to native TTS if ElevenLabs fails
      if (this.config.provider === 'elevenlabs') {
        console.warn('⚠️ ElevenLabs failed, falling back to native TTS');
        try {
          return await nativeTTSService.playText(text, voiceId, options);
        } catch (nativeError) {
          console.error('❌ Native TTS also failed:', nativeError);
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
   * Force switch to native TTS (useful for debugging)
   */
  forceNativeTTS(): void {
    console.log('🔧 Forzando cambio a Native TTS');
    this.config = { provider: 'native' };
    console.log('✅ Cambiado a Native TTS');
  }

  /**
   * Debug method to test native TTS directly
   */
  async debugNativeTTS(text: string = "Hola, soy Sofía. Esta es una prueba directa del TTS nativo mejorado."): Promise<void> {
    console.log('🧪 DEBUG: Probando Native TTS directamente...');
    
    try {
      // Call native service directly
      await nativeTTSService.speak(text);
      console.log('✅ DEBUG: Native TTS funcionando correctamente');
    } catch (error) {
      console.error('❌ DEBUG: Error en Native TTS:', error);
    }
  }

  /**
   * Test Spanish voices (Native TTS only)
   */
  async testSpanishVoices(sampleText?: string): Promise<void> {
    if (this.config.provider === 'native') {
      return await nativeTTSService.testSpanishVoices(sampleText);
    } else {
      console.warn('Voice testing is only available with native TTS');
    }
  }

  /**
   * Get detailed Spanish voices info (Native TTS only)
   */
  async getSpanishVoicesInfo(): Promise<Array<{name: string, lang: string, isLocal: boolean, gender: string, isRecommended: boolean}> | null> {
    if (this.config.provider === 'native') {
      return await nativeTTSService.getSpanishVoicesInfo();
    } else {
      console.warn('Spanish voices info is only available with native TTS');
      return null;
    }
  }

  /**
   * Set preferred voice by name (Native TTS only)
   */
  async setPreferredVoice(voiceName: string): Promise<boolean> {
    if (this.config.provider === 'native') {
      return await nativeTTSService.setPreferredVoice(voiceName);
    } else {
      console.warn('Voice preference is only available with native TTS');
      return false;
    }
  }

  /**
   * Reset to automatic voice selection (Native TTS only)
   */
  async resetToAutoVoice(): Promise<void> {
    if (this.config.provider === 'native') {
      return await nativeTTSService.resetToAutoVoice();
    } else {
      console.warn('Auto voice reset is only available with native TTS');
    }
  }

  /**
   * Adjust TTS voice parameters (Native TTS only)
   */
  setVoiceParameters(rate?: number, pitch?: number, volume?: number): void {
    if (this.config.provider === 'native') {
      if (rate !== undefined) nativeTTSService.setRate(rate);
      if (pitch !== undefined) nativeTTSService.setPitch(pitch);
      if (volume !== undefined) nativeTTSService.setVolume(volume);
      console.log('🎛️ Parámetros de voz actualizados:', { rate, pitch, volume });
    } else {
      console.warn('Voice parameter adjustment is only available with native TTS');
    }
  }

  /**
   * Get current voice parameters (Native TTS only)
   */
  getVoiceParameters(): { rate: number, pitch: number, volume: number } | null {
    if (this.config.provider === 'native') {
      return {
        rate: nativeTTSService.getRate(),
        pitch: nativeTTSService.getPitch(),
        volume: nativeTTSService.getVolume()
      };
    } else {
      console.warn('Voice parameters are only available with native TTS');
      return null;
    }
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