import { useEffect, useRef, useState } from 'react';
import { compareUpdates, DEFAULT_SETTINGS, isSettingsUpdate, readSavedUpdate, STORAGE_KEY, type Language, type Settings, type SettingsUpdate } from './settings';

const copy: Record<Language, { name: string; title: string; body: string; tip: string }> = {
  en: { name: 'English', title: 'Your workspace, your way.', body: 'Choose the look and reading size that feels comfortable. Updates travel to your other open tabs automatically.', tip: 'Your preferences are saved on this device.' },
  hi: { name: 'हिन्दी', title: 'आपका कार्यक्षेत्र, आपकी पसंद।', body: 'अपनी पसंद का रूप और पढ़ने का आकार चुनें। बदलाव आपके दूसरे खुले टैब में अपने आप पहुँचेंगे।', tip: 'आपकी पसंद इस डिवाइस पर सहेजी जाती है।' },
  es: { name: 'Español', title: 'Tu espacio, a tu manera.', body: 'Elige el aspecto y el tamaño de lectura que prefieras. Los cambios se actualizan automáticamente en tus otras pestañas abiertas.', tip: 'Tus preferencias se guardan en este dispositivo.' },
  fr: { name: 'Français', title: 'Votre espace, à votre façon.', body: 'Choisissez le thème et la taille de lecture qui vous conviennent. Les changements sont transmis automatiquement à vos autres onglets ouverts.', tip: 'Vos préférences sont enregistrées sur cet appareil.' },
};

function createTabId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  // Read storage before the first render so the page never flashes default styling.
  const [initialUpdate] = useState<SettingsUpdate>(() => readSavedUpdate() ?? {
    settings: DEFAULT_SETTINGS, timestamp: 0, tabId: 'initial',
  });
  const [settings, setSettings] = useState<Settings>(initialUpdate.settings);
  // A ref tracks the newest version without causing a render by itself.
  const currentUpdate = useRef<SettingsUpdate>(initialUpdate);
  const [tabId] = useState(createTabId);
  const [channelAvailable, setChannelAvailable] = useState(false);

  useEffect(() => {
    // Both tabs in the same origin can use this channel; storage is our fallback.
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('settings-sync-v1');
    setChannelAvailable(channel !== null);

    function acceptUpdate(update: SettingsUpdate) {
      if (compareUpdates(update, currentUpdate.current) <= 0) return; // Ignore duplicates and stale messages.
      currentUpdate.current = update;
      setSettings(update.settings);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(update)); } catch { /* The live tab still works if storage is unavailable. */ }
    }

    if (channel) channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isSettingsUpdate(event.data)) acceptUpdate(event.data);
    };

    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const received: unknown = JSON.parse(event.newValue);
        if (isSettingsUpdate(received)) acceptUpdate(received);
      } catch { /* Ignore broken cross-tab data rather than crashing. */ }
    }
    window.addEventListener('storage', handleStorage);
    return () => { channel?.close(); window.removeEventListener('storage', handleStorage); };
  }, []);

  function updateSettings(changes: Partial<Settings>) {
    const nextUpdate: SettingsUpdate = {
      settings: { ...settings, ...changes },
      // Keep a new local edit ahead of any version already seen, even if the clock repeats or moves back.
      timestamp: Math.max(Date.now(), currentUpdate.current.timestamp + 1),
      tabId,
    };
    // A local edit becomes active immediately, then is saved and sent to peers.
    setSettings(nextUpdate.settings);
    currentUpdate.current = nextUpdate;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUpdate)); } catch { /* Sync in open tabs can still work without persistence. */ }
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('settings-sync-v1');
      channel.postMessage(nextUpdate);
      channel.close();
    }
  }

  const text = copy[settings.language];
  return (
    <main className={settings.darkMode ? 'app dark' : 'app'} style={{ '--reading-size': `${settings.fontSize}px` } as React.CSSProperties}>
      <header className="topbar"><a className="brand" href="#top" aria-label="Settings Sync home"><span className="brand-mark">↗</span><span>sync<span className="brand-light">space</span></span></a><div className="live-status"><span className="live-dot" />{channelAvailable ? 'Live across your tabs' : 'Storage sync mode'}</div></header>
      <section className="hero" id="top"><div className="eyebrow"><span className="eyebrow-line" /> A LITTLE MORE YOU</div><h1>One setting.<br /><span>Every tab.</span></h1><p className="hero-copy">Make your space feel right. Your preferences follow along, instantly, wherever you have this page open.</p><div className="tab-pills"><span className="pulse" /> Changes sync in real time <span className="pill-divider">·</span> Saved on this device</div></section>
      <section className="settings-layout" aria-label="Settings and preview">
        <div className="panel settings-panel"><div className="panel-heading"><div><div className="eyebrow small">YOUR PREFERENCES</div><h2>Make it yours</h2></div><span className="sliders-icon">☷</span></div>
          <div className="setting-row"><div className="setting-label"><span className="setting-icon moon">☾</span><div><strong>Dark appearance</strong><small>Give your eyes a softer view</small></div></div><button className={`switch ${settings.darkMode ? 'on' : ''}`} type="button" role="switch" aria-checked={settings.darkMode} aria-label="Dark appearance" onClick={() => updateSettings({ darkMode: !settings.darkMode })}><span /></button></div>
          <div className="setting-row"><label className="setting-label" htmlFor="language"><span className="setting-icon language-icon">文</span><span><strong>Language</strong><small>Choose your preferred language</small></span></label><select id="language" value={settings.language} onChange={(event) => updateSettings({ language: event.target.value as Language })}>{Object.entries(copy).map(([code, item]) => <option value={code} key={code}>{item.name}</option>)}</select></div>
          <div className="setting-row font-row"><div className="setting-label"><span className="setting-icon type-icon">Aa</span><div><strong>Reading size</strong><small>Find your comfortable size</small></div></div><div className="font-control"><div className="font-values"><span>12 px</span><strong>{settings.fontSize} px</strong><span>24 px</span></div><input aria-label="Reading size" type="range" min="12" max="24" value={settings.fontSize} onChange={(event) => updateSettings({ fontSize: Number(event.target.value) })} /></div></div>
          <div className="sync-note"><span>⌁</span><p><strong>Always in sync</strong><br />Open this page in another tab to see your changes travel.</p></div>
        </div>
        <div className="preview-column"><div className="preview-caption"><span>LIVE PREVIEW</span><span className="preview-dot" /> updates as you edit</div><article className="preview-card"><div className="preview-top"><span className="preview-logo">s.</span><span className="preview-language">{text.name} <span>⌄</span></span></div><div className="preview-content"><span className="preview-tag">A FRESH START</span><h3>{text.title}</h3><p>{text.body}</p><button type="button" className="preview-button">Explore your space <span>→</span></button></div><div className="preview-footer"><span className="preview-avatar">S</span><span>{text.tip}</span></div></article><div className="preview-footnote"><span>✳</span> This preview reflects your current settings</div></div>
      </section>
      <footer><span>Made for the way you work.</span><span className="footer-right">LOCAL FIRST <i /> MULTI-TAB READY</span></footer>
    </main>
  );
}
