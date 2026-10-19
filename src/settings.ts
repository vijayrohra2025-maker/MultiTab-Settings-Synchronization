export type Language = 'en' | 'hi' | 'es' | 'fr';
export interface Settings { darkMode: boolean; language: Language; fontSize: number; }
export interface SettingsUpdate { settings: Settings; timestamp: number; tabId: string; }
export const STORAGE_KEY = 'multi-tab-settings-v1';
export const DEFAULT_SETTINGS: Settings = { darkMode: false, language: 'en', fontSize: 16 };

export function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.darkMode === 'boolean'
    && (candidate.language === 'en' || candidate.language === 'hi' || candidate.language === 'es' || candidate.language === 'fr')
    && typeof candidate.fontSize === 'number' && Number.isFinite(candidate.fontSize)
    && candidate.fontSize >= 12 && candidate.fontSize <= 24;
}

export function isSettingsUpdate(value: unknown): value is SettingsUpdate {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return isSettings(candidate.settings) && typeof candidate.timestamp === 'number'
    && Number.isFinite(candidate.timestamp) && typeof candidate.tabId === 'string' && candidate.tabId.length > 0;
}

// Compare timestamp first; the tab ID gives equal-time writes a stable winner.
export function compareUpdates(left: SettingsUpdate, right: SettingsUpdate): number {
  if (left.timestamp !== right.timestamp) return left.timestamp - right.timestamp;
  return left.tabId.localeCompare(right.tabId);
}

export function readSavedUpdate(): SettingsUpdate | null {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    if (!savedText) return null;
    const saved: unknown = JSON.parse(savedText);
    return isSettingsUpdate(saved) ? saved : null;
  } catch {
    // Storage can be blocked or corrupted. Defaults let the app still start.
    return null;
  }
}
