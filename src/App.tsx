import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Language } from './settings';
import { useSyncedSettings } from './useSyncedSettings';
import VtopDemo from './VtopDemo';

const copy: Record<Language, { name: string; title: string; body: string; tip: string }> = {
  en: { name: 'English', title: 'Your workspace, your way.', body: 'Choose the look and text size that feels comfortable. Updates travel to your other open tabs automatically.', tip: 'Your preferences are saved on this device.' },
  hi: { name: 'हिन्दी', title: 'आपका कार्यक्षेत्र, आपकी पसंद।', body: 'अपनी पसंद का रूप और पढ़ने का आकार चुनें। बदलाव आपके दूसरे खुले टैब में अपने आप पहुँचेंगे।', tip: 'आपकी पसंद इस डिवाइस पर सहेजी जाती है।' },
  es: { name: 'Español', title: 'Tu espacio, a tu manera.', body: 'Elige el aspecto y el tamaño de lectura que prefieras. Los cambios se actualizan automáticamente en tus otras pestañas abiertas.', tip: 'Tus preferencias se guardan en este dispositivo.' },
  fr: { name: 'Français', title: 'Votre espace, à votre façon.', body: 'Choisissez le thème et la taille de lecture qui vous conviennent. Les changements sont transmis automatiquement à vos autres onglets ouverts.', tip: 'Vos préférences sont enregistrées sur cet appareil.' },
  de: { name: 'Deutsch', title: 'Dein Bereich, ganz nach deinem Geschmack.', body: 'Wähle das Design und die Schriftgröße, die dir gefallen. Änderungen werden automatisch mit deinen anderen offenen Tabs synchronisiert.', tip: 'Deine Einstellungen werden auf diesem Gerät gespeichert.' },
};

export default function App() {
  const { settings, updateSettings } = useSyncedSettings();
  const [channelAvailable, setChannelAvailable] = useState(false);
  const [saveStatus, setSaveStatus] = useState(() => localStorage.getItem('multi-tab-settings-v1') ? 'Loaded from this device' : 'Using starter settings');

  useEffect(() => {
    // Both tabs in the same origin can use this channel; storage is our fallback.
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('settings-sync-v1');
    setChannelAvailable(channel !== null);

    return () => { channel?.close(); };
  }, []);

  function changeSettings(changes: Parameters<typeof updateSettings>[0]) { updateSettings(changes); setSaveStatus('Saved on this device'); }
  function openVtopDemo() { window.open('/vtop-demo', '_blank'); }
  const page = window.location.pathname.replace(/\/$/, '');
  if (page === '/vtop-demo') return <VtopDemo settings={settings} />;

  const text = copy[settings.language];
  return (
    <main className={settings.darkMode ? 'app dark' : 'app'} style={{ '--reading-size': `${settings.fontSize}px` } as React.CSSProperties}>
      <header className="topbar"><a className="brand" href="#top" aria-label="Settings Sync home"><span className="brand-mark">↗</span><span>sync<span className="brand-light">space</span></span></a><div className="header-right"><span className="save-status"><span className="save-icon">✓</span>{saveStatus}</span><div className="live-status"><span className="live-dot" />{channelAvailable ? 'Tabs connected' : 'Storage sync mode'}</div></div></header>
      <div className="hero-layout"><section className="hero" id="top"><div className="hero-project-badge"><span>✳</span> Multi-Tab Settings Synchronization</div><h1>One setting.<br /><span>Every tab.</span></h1><p className="hero-mantra">What you saved is what you see.</p><p className="hero-copy">Your preferences follow you, instantly, wherever you have this page open.</p><div className="hero-benefits"><article><span>ϟ</span><div><strong>Real-time sync</strong><small>Updates across open tabs</small></div></article><article><span>▤</span><div><strong>Saved on device</strong><small>Works after restart</small></div></article><article><span>▣</span><div><strong>All tabs in sync</strong><small>Preferences stay aligned</small></div></article></div><button className="hero-vtop-button" onClick={openVtopDemo}>Open VTOP Demo <span>↗</span></button></section>
      <SyncArtwork /></div>
      <section className="dashboard-grid" aria-label="Settings and VTOP demo">
        <div className="panel settings-panel"><div className="panel-heading"><div><div className="eyebrow small">YOUR PREFERENCES</div><h2>Make it yours</h2><p className="panel-description">Personalize the way this page looks and reads.</p></div><button className="reset-button" type="button" onClick={() => changeSettings(DEFAULT_SETTINGS)}>Reset</button></div>
          <div className="setting-row"><div className="setting-label"><span className="setting-icon moon">☾</span><div><strong>Dark appearance</strong><small>Give your eyes a softer view</small></div></div><button className={`switch ${settings.darkMode ? 'on' : ''}`} type="button" role="switch" aria-checked={settings.darkMode} aria-label="Dark appearance" onClick={() => changeSettings({ darkMode: !settings.darkMode })}><span /></button></div>
          <div className="setting-row"><label className="setting-label" htmlFor="language"><span className="setting-icon language-icon">文</span><span><strong>Language</strong><small>Choose your preferred language</small></span></label><select id="language" value={settings.language} onChange={(event) => changeSettings({ language: event.target.value as Language })}>{Object.entries(copy).map(([code, item]) => <option value={code} key={code}>{item.name}</option>)}</select></div>
          <div className="setting-row font-row"><div className="setting-label"><span className="setting-icon type-icon">Aa</span><div><strong>Text size</strong><small>Find your comfortable size</small></div></div><div className="font-control"><div className="font-values"><span>12 px</span><strong>{settings.fontSize} px</strong><span>24 px</span></div><input aria-label="Text size" type="range" min="12" max="24" value={settings.fontSize} onChange={(event) => changeSettings({ fontSize: Number(event.target.value) })} /></div></div>
          <div className="preset-section"><div className="preset-heading"><span className="preset-heading-icon">✦</span><div><strong>Quick presets</strong><small>Switch your whole setup in one click</small></div></div><div className="preset-list"><button className={!settings.darkMode && settings.language === 'en' && settings.fontSize === 16 ? 'preset-option selected' : 'preset-option'} type="button" aria-pressed={!settings.darkMode && settings.language === 'en' && settings.fontSize === 16} onClick={() => changeSettings({ darkMode: false, language: 'en', fontSize: 16 })}><span className="preset-icon balanced">☾</span><span><strong>Balanced</strong><small>Light · 16 px</small></span></button><button className={settings.darkMode && settings.language === 'en' && settings.fontSize === 18 ? 'preset-option selected' : 'preset-option'} type="button" aria-pressed={settings.darkMode && settings.language === 'en' && settings.fontSize === 18} onClick={() => changeSettings({ darkMode: true, language: 'en', fontSize: 18 })}><span className="preset-icon focus">☾</span><span><strong>Night focus</strong><small>Dark · 18 px</small></span></button><button className={!settings.darkMode && settings.language === 'en' && settings.fontSize === 20 ? 'preset-option selected' : 'preset-option'} type="button" aria-pressed={!settings.darkMode && settings.language === 'en' && settings.fontSize === 20} onClick={() => changeSettings({ darkMode: false, language: 'en', fontSize: 20 })}><span className="preset-icon reading">▣</span><span><strong>Easy reading</strong><small>Light · 20 px</small></span></button></div></div>
        </div>
        <div className="dashboard-side">
          <section className="sync-banner"><span className="sync-banner-icon">◉</span><div><strong><i /> Synchronization active</strong><small>Changes are automatically shared across all open tabs.</small></div><span className="sync-wave">⌁</span></section>
          <section className="vtop-feature-section"><div className="preview-caption"><span>STUDENT PORTAL PREVIEW</span></div><div className="vtop-launch-card"><div className="vtop-launch-heading"><span className="vtop-launch-logo">V</span><div><strong>VTOP Student Portal Demo</strong><small>Preview your selected preferences on a student portal demo.</small></div></div><button className="vtop-open-button" type="button" onClick={openVtopDemo}>Open VTOP Demo <span>↗</span></button><div className="vtop-benefit-row"><article><span>▣</span><div><strong>Opens in a new tab</strong><small>Applies your preferences</small></div></article><article><span>◉</span><div><strong>Live preview</strong><small>Theme, language, text size</small></div></article><article><span>ϟ</span><div><strong>Stays in sync</strong><small>Updates in real time</small></div></article></div></div></section>
          <section className="settings-summary-section"><div className="summary-heading"><div><strong>Current settings summary</strong><small>These preferences will be applied to the demo.</small></div><span className="saved-device-badge">✓　Saved on this device</span></div><div className="quick-summary" aria-label="Current preference summary"><div className="summary-card"><span className="summary-icon">◐</span><div><small>APPEARANCE</small><strong>{settings.darkMode ? 'Dark mode' : 'Light mode'}</strong></div></div><div className="summary-card"><span className="summary-icon">文</span><div><small>LANGUAGE</small><strong>{text.name}</strong></div></div><div className="summary-card"><span className="summary-icon">Aa</span><div><small>TEXT SIZE</small><strong>{settings.fontSize} pixels</strong></div></div></div></section>
        </div>
      </section>
      <footer><span>Made for the way you work.</span><span className="footer-right">LOCAL FIRST <i /> MULTI-TAB READY</span></footer>
    </main>
  );
}

function SyncArtwork() {
  return <div className="sync-art" aria-label="Settings syncing between three browser tabs" role="img">
    <div className="sync-art-orbit" />
    <div className="sync-art-center">⟳</div>
    <span className="sync-art-spark spark-one">✦</span><span className="sync-art-spark spark-two">✦</span><span className="sync-art-spark spark-three">✦</span>
    <div className="sync-tab sync-tab-left"><div className="sync-tab-bar"><i /><i /><i /></div><div className="sync-tab-title">Tab 1<br /><strong>Settings</strong></div><div className="sync-tab-widgets"><b>◐</b><span><i /><i /></span><span><i /><i /></span></div><small>Dark mode　·　English　·　16px</small></div>
    <div className="sync-tab sync-tab-main"><div className="sync-tab-bar"><i /><i /><i /></div><div className="sync-tab-title">Tab 2<br /><strong>VTOP Demo</strong></div><div className="sync-tab-widgets"><b>◐</b><span><i /><i /></span><b>文</b><span><i /><i /></span></div><small>Dark mode　·　English　·　16px</small></div>
    <div className="sync-tab sync-tab-right"><div className="sync-tab-bar"><i /><i /><i /></div><div className="sync-tab-title">Tab 3<br /><strong>Another tab</strong></div><div className="sync-tab-widgets"><b>◐</b><span><i /><i /></span><span><i /><i /></span></div><small>Dark mode　·　English　·　16px</small></div>
  </div>;
}
