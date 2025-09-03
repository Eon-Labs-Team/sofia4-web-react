interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples?: any[];
  category: string;
  fine_tuning: {
    language?: string;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings?: {
    stability?: number;
    similarity_boost?: number;
  };
  sharing?: {
    status: string;
  };
  high_quality_base_model_ids: string[];
}

interface ElevenLabsTTSRequest {
  text: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

class ElevenLabsTTSService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly defaultVoiceId = 'kcQkGnn0HAT2JRDQ4Ljp'; // Bella voice
  private readonly defaultModelId = 'eleven_multilingual_v2';

  private getApiKey(): string {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_ELEVENLABS_API_KEY not found in environment variables');
    }
    return apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': this.getApiKey(),
    };
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.getApiKey(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('ElevenLabs getVoices error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error getting voices');
    }
  }

  async synthesizeSpeech(
    text: string, 
    voiceId: string = this.defaultVoiceId,
    options: Partial<ElevenLabsTTSRequest> = {}
  ): Promise<ArrayBuffer> {
    try {
      const requestBody: ElevenLabsTTSRequest = {
        text,
        model_id: options.model_id || this.defaultModelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
          ...options.voice_settings,
        },
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('ElevenLabs synthesizeSpeech error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error synthesizing speech');
    }
  }

  async playText(
    text: string, 
    voiceId?: string,
    options?: Partial<ElevenLabsTTSRequest>
  ): Promise<HTMLAudioElement> {
    try {
      const audioBuffer = await this.synthesizeSpeech(text, voiceId, options);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      // Clean up URL when audio finishes or errors
      audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl));
      audio.addEventListener('error', () => URL.revokeObjectURL(audioUrl));
      
      await audio.play();
      return audio;
    } catch (error) {
      console.error('ElevenLabs playText error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error playing text');
    }
  }

  async downloadAudio(
    text: string, 
    filename: string = 'speech.mp3',
    voiceId?: string,
    options?: Partial<ElevenLabsTTSRequest>
  ): Promise<void> {
    try {
      const audioBuffer = await this.synthesizeSpeech(text, voiceId, options);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      
      const url = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ElevenLabs downloadAudio error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error downloading audio');
    }
  }
}

export default new ElevenLabsTTSService();