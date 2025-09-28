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
    rate: 0.8,     // Velocidad m�s lenta para mayor claridad
    pitch: 1.2,    // Tono ligeramente m�s alto para voz femenina
    volume: 0.9,   // Volumen �ptimo
    lang: 'es-MX'  // Espa�ol de M�xico como idioma principal
  };
  private _currentUtterance: SpeechSynthesisUtterance | null = null;
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
   * Detect if a voice name suggests female gender
   */
  private detectGender(voiceName: string): 'female' | 'male' | 'unknown' {
    const name = voiceName.toLowerCase();
    
    // Indicators of female voices
    const femaleIndicators = [
      'female', 'mujer', 'woman',
      // Nombres españoles femeninos
      'maria', 'carmen', 'lucia', 'sofia', 'elena', 'ana', 'paula', 'monica', 'sabina',
      'helena', 'paloma', 'ines', 'esperanza', 'dolores', 'remedios', 'francisca',
      // Nombres mexicanos femeninos
      'paulina', 'angelica', 'marisol', 'guadalupe', 'fernanda', 'alejandra', 'veronica',
      'adriana', 'cristina', 'beatriz', 'rosa', 'rocio', 'marlene', 'silvia',
      // Patrones de voces del sistema
      'voice 2', 'voz 2', 'voice2', 'voz2', // Some systems use numbers for female voices
      'woman', 'female voice', 'voz femenina', 'mujer'
    ];
    
    const maleIndicators = [
      'male', 'hombre', 'man',
      'carlos', 'miguel', 'juan', 'antonio', 'jose', 'francisco', 'manuel', 'diego',
      'voice 1', 'voz 1', 'voice1', 'voz1' // Some systems use numbers for male voices
    ];
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return 'female';
    }
    
    if (maleIndicators.some(indicator => name.includes(indicator))) {
      return 'male';
    }
    
    return 'unknown';
  }

  /**
   * Get the best Spanish voice available
   */
  async getBestSpanishVoice(): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getVoices();
    
    console.log('<� Voces disponibles:', voices.map(v => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      gender: this.detectGender(v.name)
    })));
    
    // 1. PRIORIDAD ABSOLUTA: Buscar voces femeninas mexicanas (es-MX)
    const femaleMXVoices = voices.filter(v => {
      const isMX = v.lang === 'es-MX';
      const isFemale = this.detectGender(v.name) === 'female';
      return isMX && isFemale;
    });
    
    if (femaleMXVoices.length > 0) {
      console.log('🎵 Seleccionada voz femenina mexicana (PRIORIDAD):', femaleMXVoices[0].name);
      return femaleMXVoices[0];
    }
    
    // 2. Buscar cualquier voz mexicana (es-MX)
    const mxVoices = voices.filter(v => v.lang === 'es-MX');
    if (mxVoices.length > 0) {
      console.log('🎵 Seleccionada voz mexicana:', mxVoices[0].name);
      return mxVoices[0];
    }
    
    // 3. Fallback: Buscar voces femeninas españolas
    const femaleSpanishVoices = voices.filter(v => {
      const isSpanish = v.lang.startsWith('es');
      const isFemale = this.detectGender(v.name) === 'female';
      return isSpanish && isFemale;
    });
    
    if (femaleSpanishVoices.length > 0) {
      console.log('🎵 Seleccionada voz femenina española (fallback):', femaleSpanishVoices[0].name);
      return femaleSpanishVoices[0];
    }

    // 2. Priority order para voces espa�olas regulares
    const priorities = [
      'es-ES', 'es-MX', 'es-AR', 'es-CL', 'es-CO', 'es-VE', 'es-PE', 'es-UY'
    ];

    // Buscar voces premium/naturales primero
    for (const lang of priorities) {
      const premiumVoices = voices.filter(v => 
        v.lang === lang && 
        (v.name.toLowerCase().includes('premium') ||
         v.name.toLowerCase().includes('natural') ||
         v.name.toLowerCase().includes('neural') ||
         v.name.toLowerCase().includes('enhanced'))
      );
      
      if (premiumVoices.length > 0) {
        console.log('<� Seleccionada voz premium:', premiumVoices[0].name);
        return premiumVoices[0];
      }
    }

    // 3. Voces regulares por prioridad
    for (const lang of priorities) {
      const voice = voices.find(v => v.lang === lang);
      if (voice) {
        console.log('<� Seleccionada voz regular:', voice.name, '(' + lang + ')');
        return voice;
      }
    }

    // 4. Fallback a cualquier voz espa�ola
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      console.log('<� Seleccionada voz espa�ola gen�rica:', spanishVoice.name);
      return spanishVoice;
    }

    // 5. �ltimo recurso
    console.log('� No se encontraron voces espa�olas, usando voz por defecto');
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

        // Set options para voz m�s natural
        utterance.rate = mergedOptions.rate || 0.8;   // M�s lenta para claridad
        utterance.pitch = mergedOptions.pitch || 1.2; // Tono m�s agradable
        utterance.volume = mergedOptions.volume || 0.9; // Volumen claro
        utterance.lang = mergedOptions.lang || 'es-MX'; // Priorizar español mexicano
        
        console.log('<� Configuraci�n TTS aplicada:', {
          voice: utterance.voice?.name,
          lang: utterance.lang,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume
        });

        // Event listeners
        utterance.onstart = () => {
          this.isPlaying = true;
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this._currentUtterance = null;
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this._currentUtterance = null;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Store current utterance and start speaking
        this._currentUtterance = utterance;
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
    _voiceOptions?: any, // For compatibility, not used in native TTS
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
      this._currentUtterance = null;
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
    return this.defaultOptions.rate || 0.8;
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
    return this.defaultOptions.pitch || 1.2;
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
    return this.defaultOptions.volume || 0.9;
  }

  /**
   * Set speech volume
   */
  setVolume(volume: number): void {
    this.defaultOptions.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Test different Spanish voices with sample text
   */
  async testSpanishVoices(sampleText: string = "Hola, soy Sof�a, tu asistente inteligente."): Promise<void> {
    const voices = await this.getVoices();
    const spanishVoices = voices.filter(v => v.lang.startsWith('es')).slice(0, 5);
    
    console.log('<� Probando voces espa�olas disponibles...');
    
    for (let i = 0; i < spanishVoices.length; i++) {
      const voice = spanishVoices[i];
      const gender = this.detectGender(voice.name);
      
      console.log(`=
 Voz ${i + 1}: ${voice.name} (${voice.lang}) - ${gender}`);
      
      // Pausa antes de cada voz
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        await this.speak(`Voz n�mero ${i + 1}. ${sampleText}`, {
          voice: voice,
          rate: 0.8,
          pitch: gender === 'female' ? 1.2 : 1.0,
          volume: 0.9
        });
        
        // Pausa despu�s de cada voz
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`L Error con voz ${voice.name}:`, error);
      }
    }
    
    console.log(' Prueba de voces completada');
  }

  /**
   * Get detailed information about available Spanish voices
   */
  async getSpanishVoicesInfo(): Promise<Array<{
    name: string;
    lang: string;
    isLocal: boolean;
    gender: string;
    isRecommended: boolean;
  }>> {
    const voices = await this.getVoices();
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
    
    return spanishVoices.map(v => {
      const gender = this.detectGender(v.name);
      const isRecommended = gender === 'female' || 
                          v.lang === 'es-ES' || 
                          v.name.toLowerCase().includes('premium') ||
                          v.name.toLowerCase().includes('natural');
      
      return {
        name: v.name,
        lang: v.lang,
        isLocal: v.localService,
        gender,
        isRecommended
      };
    });
  }

  /**
   * Set specific voice by name
   */
  async setPreferredVoice(voiceName: string): Promise<boolean> {
    const voices = await this.getVoices();
    const selectedVoice = voices.find(v => v.name === voiceName);
    
    if (selectedVoice) {
      this.defaultOptions.voice = selectedVoice;
      console.log('<� Voz preferida establecida:', selectedVoice.name);
      
      // Test the selected voice
      await this.speak("He configurado esta voz como tu voz preferida.", {
        voice: selectedVoice
      });
      
      return true;
    }
    
    console.warn('� Voz no encontrada:', voiceName);
    return false;
  }

  /**
   * Reset to best automatic voice selection
   */
  async resetToAutoVoice(): Promise<void> {
    this.defaultOptions.voice = undefined;
    const bestVoice = await this.getBestSpanishVoice();
    
    if (bestVoice) {
      console.log('= Restablecida selecci�n autom�tica:', bestVoice.name);
      await this.speak("He restablecido la selecci�n autom�tica de voz.", {
        voice: bestVoice
      });
    }
  }

  /**
   * Download audio (not supported in native TTS, returns empty function)
   */
  async downloadAudio(): Promise<void> {
    console.warn('Download audio is not supported with native TTS');
  }
}

export default new NativeTTSService();