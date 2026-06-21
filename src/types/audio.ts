export type SoundEffectType = 'correct' | 'incorrect' | 'level-complete' | 'button-click';

export interface AudioManager {
  playChant(tableNum: number, lineNum: number): Promise<void>;
  playEffect(effectType: SoundEffectType): void;
  startBackgroundMusic(): void;
  stopBackgroundMusic(): void;
  muteForVoiceInput(isMuted: boolean): void;
  preloadChants(tableNum: number): Promise<void>;
  isPlayingChant(): boolean;
  getMasterVolume(): number;
  setMasterVolume(level: number): void;
}
