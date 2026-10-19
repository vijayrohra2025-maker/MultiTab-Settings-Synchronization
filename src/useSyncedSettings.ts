import { useEffect, useRef, useState } from 'react';
import { compareUpdates, DEFAULT_SETTINGS, isSettingsUpdate, readSavedUpdate, STORAGE_KEY, type Settings, type SettingsUpdate } from './settings';

function createTabId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useSyncedSettings() {
  const [initialUpdate] = useState<SettingsUpdate>(() => readSavedUpdate() ?? { settings: DEFAULT_SETTINGS, timestamp: 0, tabId: 'initial' });
  const [settings, setSettings] = useState<Settings>(initialUpdate.settings);
  const currentUpdate = useRef<SettingsUpdate>(initialUpdate);
  const [tabId] = useState(createTabId);

  useEffect(() => {
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('settings-sync-v1');
    function acceptUpdate(update: SettingsUpdate) {
      if (compareUpdates(update, currentUpdate.current) <= 0) return;
      currentUpdate.current = update;
      setSettings(update.settings);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(update)); } catch { /* Live synchronization still works if storage is blocked. */ }
    }
    if (channel) channel.onmessage = (event: MessageEvent<unknown>) => { if (isSettingsUpdate(event.data)) acceptUpdate(event.data); };
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { const update: unknown = JSON.parse(event.newValue); if (isSettingsUpdate(update)) acceptUpdate(update); } catch { /* Ignore malformed stored data. */ }
    }
    window.addEventListener('storage', handleStorage);
    return () => { channel?.close(); window.removeEventListener('storage', handleStorage); };
  }, []);

  function updateSettings(changes: Partial<Settings>) {
    const update: SettingsUpdate = {
      settings: { ...currentUpdate.current.settings, ...changes },
      timestamp: Math.max(Date.now(), currentUpdate.current.timestamp + 1),
      tabId,
    };
    currentUpdate.current = update;
    setSettings(update.settings);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(update)); } catch { /* Keep the in-memory preference active. */ }
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('settings-sync-v1');
      channel.postMessage(update);
      channel.close();
    }
  }

  return { settings, updateSettings };
}
