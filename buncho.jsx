import React, { useState, useEffect, useCallback } from ‘react’;

export default function Buncho2DGame() {
const [gameState, setGameState] = useState({
name: ‘名無しの文鳥’, hunger: 80, happiness: 80, health: 100, energy: 100, cleanliness: 100,
age: 0, color: ‘sakura’, lastUpdate: Date.now(),
totalFeeds: 0, totalPets: 0, totalBaths: 0, totalPlays: 0,
level: 1, exp: 0, coins: 100,
inventory: { seeds: 10, treats: 3 },
isSleeping: false, theme: ‘day’
});

const [message, setMessage] = useState(‘文鳥があなたを見ています…’);
const [showNameInput, setShowNameInput] = useState(false);
const [newName, setNewName] = useState(’’);
const [isLoaded, setIsLoaded] = useState(false);
const [currentAction, setCurrentAction] = useState(null);
const [showShop, setShowShop] = useState(false);
const [notification, setNotification] = useState(null);
const [animFrame, setAnimFrame] = useState(0);
const [isBlinking, setIsBlinking] = useState(false);

// Save/Load
const saveGame = useCallback(async (state) => {
try { await window.storage.set(‘buncho-2d-v1’, JSON.stringify(state)); } catch (e) {}
}, []);

const loadGame = useCallback(async () => {
try {
const result = await window.storage.get(‘buncho-2d-v1’);
if (result?.value) {
const saved = JSON.parse(result.value);
const mins = (Date.now() - saved.lastUpdate) / 60000;
setGameState({
…saved,
hunger: Math.max(0, saved.hunger - mins * 0.3),
happiness: Math.max(0, saved.happiness - mins * 0.2),
cleanliness: Math.max(0, saved.cleanliness - mins * 0.1),
energy: saved.isSleeping ? Math.min(100, saved.energy + mins * 0.5) : Math.max(0, saved.energy - mins * 0.05),
isSleeping: false, lastUpdate: Date.now()
});
setMessage(`${saved.name}がお帰りを待っていました！`);
}
} catch (e) {}
setIsLoaded(true);
}, []);

useEffect(() => { loadGame(); }, [loadGame]);

// Animation loop
useEffect(() => {
const interval = setInterval(() => {
setAnimFrame(f => (f + 1) % 60);
}, 100);
return () => clearInterval(interval);
}, []);

// Blinking
useEffect(() => {
const blinkInterval = setInterval(() => {
if (Math.random() < 0.3 && !gameState.isSleeping) {
setIsBlinking(true);
setTimeout(() => setIsBlinking(false), 150);
}
}, 2000);
return () => clearInterval(blinkInterval);
}, [gameState.isSleeping]);

// Game tick
useEffect(() => {
if (!isLoaded) return;
const iv = setInterval(() => {
setGameState(prev => {
const expNeeded = prev.level * 50;
let lvl = prev.level, exp = prev.exp, coins = prev.coins;
if (prev.exp >= expNeeded) {
lvl++; exp = prev.exp - expNeeded; coins += lvl * 10;
setNotification({ title: ‘レベルアップ！’, msg: `Lv.${lvl}`, coins: lvl * 10 });
setTimeout(() => setNotification(null), 2500);
}

```
    const ns = {
      ...prev,
      hunger: Math.max(0, prev.hunger - (prev.isSleeping ? 0.05 : 0.08)),
      happiness: Math.max(0, prev.happiness - (prev.isSleeping ? 0.02 : 0.04)),
      health: Math.max(0, Math.min(100, prev.health + (prev.hunger > 30 && prev.cleanliness > 30 ? 0.02 : -0.08))),
      energy: prev.isSleeping ? Math.min(100, prev.energy + 0.15) : Math.max(0, prev.energy - 0.03),
      cleanliness: Math.max(0, prev.cleanliness - 0.02),
      age: prev.age + 1, level: lvl, exp, coins, lastUpdate: Date.now()
    };
    
    if (prev.isSleeping && ns.energy >= 100) {
      ns.isSleeping = false;
      setMessage('おはよう！🌅');
    }
    if (ns.age % 30 === 0) saveGame(ns);
    return ns;
  });
}, 1000);
return () => clearInterval(iv);
```

}, [isLoaded, saveGame]);

// Color schemes based on photos
const colorSchemes = {
sakura: {
head: ‘#1a1a1a’,
cheek: ‘#ffffff’,
body: ‘#7a7a7a’,
belly: ‘#e8d8d0’,
wing: ‘#5a5a5a’,
tail: ‘#2a2a2a’,
beak: ‘#ff6b6b’,
eyeRing: ‘#ff5555’,
feet: ‘#ffb8b8’
},
white: {
head: ‘#fefefe’,
cheek: ‘#fefefe’,
body: ‘#faf8f5’,
belly: ‘#fff5f0’,
wing: ‘#f0f0f0’,
tail: ‘#e8e8e8’,
beak: ‘#ff7777’,
eyeRing: ‘#ff6666’,
feet: ‘#ffc0c0’
},
cinnamon: {
head: ‘#8b6914’,
cheek: ‘#fff5e6’,
body: ‘#c9a070’,
belly: ‘#f0e0d0’,
wing: ‘#b08050’,
tail: ‘#7b5414’,
beak: ‘#ffa080’,
eyeRing: ‘#ff7755’,
feet: ‘#ffc8b0’
},
silver: {
head: ‘#505050’,
cheek: ‘#f8f8f8’,
body: ‘#a8a8a8’,
belly: ‘#e0d8d0’,
wing: ‘#888888’,
tail: ‘#404040’,
beak: ‘#ff8080’,
eyeRing: ‘#ff6060’,
feet: ‘#ffb0b0’
}
};

const colors = colorSchemes[gameState.color] || colorSchemes.sakura;

// SVG Buncho Component
const BunchoSVG = ({ action, sleeping }) => {
const bounce = Math.sin(animFrame * 0.3) * 3;
const tilt = Math.sin(animFrame * 0.15) * 2;
const wingFlap = action === ‘play’ || action === ‘bath’ ? Math.sin(animFrame * 0.8) * 15 : Math.sin(animFrame * 0.1) * 2;
const headTilt = action === ‘pet’ ? Math.sin(animFrame * 0.5) * 8 : tilt;
const eyesClosed = sleeping || isBlinking || action === ‘pet’;

```
const jumpY = action === 'play' ? Math.abs(Math.sin(animFrame * 0.6)) * 20 : 0;
const eatBob = action === 'feed' ? Math.abs(Math.sin(animFrame * 1.2)) * 8 : 0;
const shake = action === 'bath' ? Math.sin(animFrame * 1.5) * 5 : 0;

return (
  <svg 
    viewBox="0 0 200 200" 
    style={{ 
      width: '100%', 
      maxWidth: '280px',
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
      transform: `translateY(${-bounce - jumpY + eatBob}px) rotate(${shake}deg)`,
      transition: 'transform 0.1s ease-out'
    }}
  >
    {/* Perch */}
    <ellipse cx="100" cy="175" rx="70" ry="8" fill="#8b6914" />
    <rect x="30" y="170" width="140" height="10" rx="5" fill="#a07818" />
    
    {/* Tail */}
    <g transform={`translate(100, 140) rotate(${-10 + tilt})`}>
      <path d={`M0,0 L-15,35 L-5,38 L5,38 L15,35 Z`} fill={colors.tail} />
      <path d={`M-8,5 L-12,32`} stroke={colors.wing} strokeWidth="1" opacity="0.5" />
      <path d={`M8,5 L12,32`} stroke={colors.wing} strokeWidth="1" opacity="0.5" />
    </g>

    {/* Feet */}
    <g transform="translate(85, 158)">
      <path d="M0,0 L-8,12 M0,0 L0,14 M0,0 L8,12" stroke={colors.feet} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
    <g transform="translate(115, 158)">
      <path d="M0,0 L-8,12 M0,0 L0,14 M0,0 L8,12" stroke={colors.feet} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>

    {/* Body */}
    <ellipse cx="100" cy="120" rx="45" ry="40" fill={colors.body} />
    
    {/* Belly */}
    <ellipse cx="100" cy="130" rx="32" ry="28" fill={colors.belly} />
    
    {/* Wings */}
    <g transform={`translate(55, 110) rotate(${-wingFlap})`}>
      <ellipse cx="0" cy="15" rx="12" ry="30" fill={colors.wing} />
      <path d="M-8,25 L-5,40 M-2,28 L0,45 M4,25 L8,42" stroke={colors.tail} strokeWidth="1.5" opacity="0.6" />
    </g>
    <g transform={`translate(145, 110) rotate(${wingFlap})`}>
      <ellipse cx="0" cy="15" rx="12" ry="30" fill={colors.wing} />
      <path d="M8,25 L5,40 M2,28 L0,45 M-4,25 L-8,42" stroke={colors.tail} strokeWidth="1.5" opacity="0.6" />
    </g>

    {/* Head */}
    <g transform={`rotate(${headTilt}, 100, 70)`}>
      <circle cx="100" cy="70" r="38" fill={colors.head} />
      
      {/* Cheek patches (for sakura/silver) */}
      {(gameState.color === 'sakura' || gameState.color === 'silver') && (
        <>
          <ellipse cx="72" cy="78" rx="18" ry="16" fill={colors.cheek} />
          <ellipse cx="128" cy="78" rx="18" ry="16" fill={colors.cheek} />
        </>
      )}
      
      {/* Eye rings */}
      <circle cx="80" cy="65" r="12" fill={colors.eyeRing} />
      <circle cx="120" cy="65" r="12" fill={colors.eyeRing} />
      
      {/* Eyes */}
      {eyesClosed ? (
        <>
          <path d="M72,65 Q80,70 88,65" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M112,65 Q120,70 128,65" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="80" cy="65" r="8" fill="#0a0505" />
          <circle cx="120" cy="65" r="8" fill="#0a0505" />
          <circle cx="83" cy="62" r="3" fill="white" />
          <circle cx="123" cy="62" r="3" fill="white" />
          <circle cx="77" cy="67" r="1.5" fill="white" />
          <circle cx="117" cy="67" r="1.5" fill="white" />
        </>
      )}
      
      {/* Beak */}
      <g transform={`translate(100, 82) rotate(${eatBob > 0 ? Math.sin(animFrame * 2) * 5 : 0})`}>
        <ellipse cx="0" cy="-2" rx="12" ry="8" fill={colors.beak} />
        <ellipse cx="0" cy="4" rx="10" ry="5" fill={colors.beak} opacity="0.85" />
        <path d="M-8,-2 Q0,2 8,-2" stroke="#00000020" strokeWidth="1" fill="none" />
      </g>
    </g>

    {/* Sleep Zzz */}
    {sleeping && (
      <g>
        <text x="150" y="40" fontSize="18" fill="#6a6aff" fontWeight="bold" opacity={0.5 + Math.sin(animFrame * 0.2) * 0.5}>Z</text>
        <text x="165" y="25" fontSize="14" fill="#6a6aff" fontWeight="bold" opacity={0.5 + Math.sin(animFrame * 0.2 + 1) * 0.5}>z</text>
        <text x="175" y="15" fontSize="10" fill="#6a6aff" fontWeight="bold" opacity={0.5 + Math.sin(animFrame * 0.2 + 2) * 0.5}>z</text>
      </g>
    )}

    {/* Action effects */}
    {action === 'feed' && (
      <g>
        {[0,1,2].map(i => (
          <circle 
            key={i}
            cx={85 + i * 15} 
            cy={160 - (animFrame * 2 + i * 20) % 40} 
            r="3" 
            fill="#d4a574"
            opacity={1 - ((animFrame * 2 + i * 20) % 40) / 40}
          />
        ))}
      </g>
    )}

    {action === 'pet' && (
      <g>
        {[0,1,2].map(i => (
          <text 
            key={i}
            x={60 + i * 35} 
            y={30 + Math.sin(animFrame * 0.3 + i) * 10}
            fontSize="16"
            opacity={0.6 + Math.sin(animFrame * 0.3 + i) * 0.4}
          >💕</text>
        ))}
      </g>
    )}

    {action === 'play' && (
      <g>
        {[0,1,2,3].map(i => (
          <text 
            key={i}
            x={50 + i * 35} 
            y={20 + Math.abs(Math.sin(animFrame * 0.4 + i * 0.8)) * 25}
            fontSize="14"
          >✨</text>
        ))}
      </g>
    )}

    {action === 'bath' && (
      <g>
        {[0,1,2,3,4].map(i => (
          <circle 
            key={i}
            cx={70 + i * 15 + Math.sin(animFrame * 0.5 + i) * 5} 
            cy={140 + (animFrame * 3 + i * 15) % 50}
            r={2 + Math.random()}
            fill="#88ccff"
            opacity={1 - ((animFrame * 3 + i * 15) % 50) / 50}
          />
        ))}
      </g>
    )}
  </svg>
);
```

};

// Actions
const feedBuncho = () => {
if (gameState.isSleeping) { setMessage(‘Zzz…寝てるよ…’); return; }
if (gameState.inventory.seeds <= 0) { setMessage(‘シードがない！’); return; }
setCurrentAction(‘feed’);
setTimeout(() => setCurrentAction(null), 2000);
setGameState(prev => {
const ns = { …prev, hunger: Math.min(100, prev.hunger + 20), happiness: Math.min(100, prev.happiness + 3), totalFeeds: prev.totalFeeds + 1, exp: prev.exp + 2, inventory: { …prev.inventory, seeds: prev.inventory.seeds - 1 }, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage([‘もぐもぐ…おいしい！🌾’, ‘ピヨ♪ありがとう！’, ‘カリカリ…最高！’][Math.floor(Math.random() * 3)]);
};

const petBuncho = () => {
if (gameState.isSleeping) { setMessage(‘すやすや…💤’); return; }
setCurrentAction(‘pet’);
setTimeout(() => setCurrentAction(null), 2000);
setGameState(prev => {
const ns = { …prev, happiness: Math.min(100, prev.happiness + 12), totalPets: prev.totalPets + 1, exp: prev.exp + 1, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage([‘ピヨピヨ♪うれしい！’, ‘もっとなでて〜💕’, ‘きもちいい…’][Math.floor(Math.random() * 3)]);
};

const playWithBuncho = () => {
if (gameState.isSleeping) { setMessage(‘寝てるよ…’); return; }
if (gameState.energy < 20) { setMessage(‘疲れてる…’); return; }
setCurrentAction(‘play’);
setTimeout(() => setCurrentAction(null), 2500);
setGameState(prev => {
const ns = { …prev, happiness: Math.min(100, prev.happiness + 20), energy: Math.max(0, prev.energy - 15), hunger: Math.max(0, prev.hunger - 5), totalPlays: prev.totalPlays + 1, exp: prev.exp + 3, coins: prev.coins + 2, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage([‘わーい！楽しい！🎉’, ‘もっと遊ぼう！’][Math.floor(Math.random() * 2)]);
};

const bathBuncho = () => {
if (gameState.isSleeping) { setMessage(‘寝てるよ…’); return; }
setCurrentAction(‘bath’);
setTimeout(() => setCurrentAction(null), 2500);
setGameState(prev => {
const ns = { …prev, cleanliness: 100, happiness: Math.min(100, prev.happiness + 10), energy: Math.max(0, prev.energy - 5), totalBaths: prev.totalBaths + 1, exp: prev.exp + 2, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage([‘バシャバシャ！💦’, ‘きれいになった〜’][Math.floor(Math.random() * 2)]);
};

const toggleSleep = () => {
setGameState(prev => {
const ns = { …prev, isSleeping: !prev.isSleeping, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage(gameState.isSleeping ? ‘おはよう！🌅’ : ‘おやすみ…💤’);
};

const giveTreat = () => {
if (gameState.inventory.treats <= 0) { setMessage(‘おやつがない！’); return; }
setGameState(prev => {
const ns = { …prev, happiness: Math.min(100, prev.happiness + 25), hunger: Math.min(100, prev.hunger + 10), inventory: { …prev.inventory, treats: prev.inventory.treats - 1 }, exp: prev.exp + 5, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage(‘わーい！おやつ！🍬’);
};

const buyItem = (item, price, amount) => {
if (gameState.coins < price) { setMessage(‘コインが足りない…’); return; }
setGameState(prev => {
const ns = { …prev, coins: prev.coins - price, inventory: { …prev.inventory, [item]: prev.inventory[item] + amount }, lastUpdate: Date.now() };
saveGame(ns); return ns;
});
setMessage(‘買ったよ！🛒’);
};

const changeColor = (color) => {
setGameState(prev => { const ns = { …prev, color, lastUpdate: Date.now() }; saveGame(ns); return ns; });
const names = { sakura: ‘桜’, white: ‘白’, cinnamon: ‘シナモン’, silver: ‘シルバー’ };
setMessage(`${names[color]}文鳥になった！✨`);
};

const changeTheme = (theme) => {
setGameState(prev => { const ns = { …prev, theme, lastUpdate: Date.now() }; saveGame(ns); return ns; });
};

const renameBuncho = () => {
if (newName.trim()) {
setGameState(prev => { const ns = { …prev, name: newName.trim(), lastUpdate: Date.now() }; saveGame(ns); return ns; });
setMessage(`名前が「${newName.trim()}」に！`);
setShowNameInput(false);
setNewName(’’);
}
};

const resetGame = async () => {
if (!confirm(‘リセットする？’)) return;
try { await window.storage.delete(‘buncho-2d-v1’); } catch(e){}
setGameState({ name: ‘名無しの文鳥’, hunger: 80, happiness: 80, health: 100, energy: 100, cleanliness: 100, age: 0, color: ‘sakura’, lastUpdate: Date.now(), totalFeeds: 0, totalPets: 0, totalBaths: 0, totalPlays: 0, level: 1, exp: 0, coins: 100, inventory: { seeds: 10, treats: 3 }, isSleeping: false, theme: ‘day’ });
setMessage(‘新しい文鳥が来た！🐣’);
};

const getAge = () => {
const d = Math.floor(gameState.age / 86400), h = Math.floor((gameState.age % 86400) / 3600), m = Math.floor((gameState.age % 3600) / 60);
return d > 0 ? `${d}日` : h > 0 ? `${h}時間` : `${m}分`;
};

const getMood = () => {
const avg = (gameState.hunger + gameState.happiness + gameState.health + gameState.energy + gameState.cleanliness) / 5;
return avg > 80 ? ‘😊’ : avg > 60 ? ‘🙂’ : avg > 40 ? ‘😴’ : ‘😢’;
};

if (!isLoaded) return (
<div style={{ width: ‘100%’, height: ‘100vh’, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, background: ‘linear-gradient(180deg, #e8f4f8 0%, #f5ebe0 50%, #d5c4a1 100%)’, fontFamily: ‘system-ui’ }}>
<div style={{ textAlign: ‘center’ }}>
<div style={{ fontSize: ‘4rem’, animation: ‘bounce 1s infinite’ }}>🐦</div>
<div style={{ color: ‘#5d4037’, fontSize: ‘1.2rem’ }}>読み込み中…</div>
</div>
<style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
</div>
);

const isDark = gameState.theme === ‘night’;
const bgGradient = isDark
? ‘linear-gradient(180deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)’
: gameState.theme === ‘sunset’
? ‘linear-gradient(180deg, #ff9966 0%, #ff7744 50%, #ffaa77 100%)’
: ‘linear-gradient(180deg, #e8f4f8 0%, #f5ebe0 50%, #d5c4a1 100%)’;
const textColor = isDark ? ‘#e0e0e0’ : ‘#5d4037’;
const cardBg = isDark ? ‘rgba(40,40,60,0.9)’ : ‘rgba(255,255,255,0.92)’;

return (
<div style={{ width: ‘100%’, minHeight: ‘100vh’, background: bgGradient, fontFamily: “‘Segoe UI’, system-ui, sans-serif”, color: textColor, overflow: ‘hidden’ }}>

```
  {notification && (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: 'white', padding: '1.5rem 2.5rem', borderRadius: '1.5rem', textAlign: 'center', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'popIn 0.3s ease' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{notification.title}</div>
      <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{notification.msg}</div>
      {notification.coins && <div style={{ marginTop: '0.5rem' }}>+{notification.coins} 💰</div>}
    </div>
  )}

  {/* Header */}
  <div style={{ padding: '0.8rem 1rem', background: cardBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,105,20,0.12)'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🐦</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {gameState.name}
            <button onClick={() => setShowNameInput(!showNameInput)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.7 }}>✏️</button>
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Lv.{gameState.level} | {getAge()} | {getMood()}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>💰 {gameState.coins}</div>
        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>EXP: {gameState.exp}/{gameState.level * 50}</div>
      </div>
    </div>
    {showNameInput && (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="新しい名前" maxLength={10} style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', border: '2px solid rgba(139,105,20,0.3)', fontSize: '0.9rem', background: 'white' }} />
        <button onClick={renameBuncho} style={{ padding: '0.4rem 1rem', borderRadius: '1rem', border: 'none', background: '#8b6914', color: 'white', cursor: 'pointer' }}>決定</button>
      </div>
    )}
  </div>

  {/* Buncho Display */}
  <div 
    style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '1rem',
      minHeight: '220px',
      cursor: 'pointer'
    }}
    onClick={petBuncho}
  >
    <BunchoSVG action={currentAction} sleeping={gameState.isSleeping} />
  </div>

  {/* Message */}
  <div style={{ textAlign: 'center', padding: '0.7rem 1rem', background: cardBg, margin: '0 0.8rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>💬 「{message}」</p>
  </div>

  {/* Stats */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem', padding: '0.6rem', maxWidth: '500px', margin: '0 auto' }}>
    {[
      { l: '空腹', v: gameState.hunger, c: '#ef6c00', i: '🍚' },
      { l: '幸福', v: gameState.happiness, c: '#d81b60', i: '💖' },
      { l: '健康', v: gameState.health, c: '#388e3c', i: '💪' },
      { l: '元気', v: gameState.energy, c: '#1976d2', i: '⚡' },
      { l: '清潔', v: gameState.cleanliness, c: '#00897b', i: '✨' }
    ].map(s => (
      <div key={s.l} style={{ background: cardBg, borderRadius: '0.8rem', padding: '0.5rem 0.3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem' }}>{s.i}</div>
        <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>{s.l}</div>
        <div style={{ height: '5px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', margin: '0.3rem 0.2rem', overflow: 'hidden' }}>
          <div style={{ width: `${s.v}%`, height: '100%', background: s.c, borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>{Math.round(s.v)}%</div>
      </div>
    ))}
  </div>

  {/* Actions */}
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', padding: '0.6rem' }}>
    {[
      { l: '🍚 えさ', a: feedBuncho, c: 'linear-gradient(135deg,#ff9800,#ef6c00)' },
      { l: '✋ なでる', a: petBuncho, c: 'linear-gradient(135deg,#ec407a,#d81b60)' },
      { l: '🎾 遊ぶ', a: playWithBuncho, c: 'linear-gradient(135deg,#66bb6a,#388e3c)' },
      { l: '💦 水浴び', a: bathBuncho, c: 'linear-gradient(135deg,#42a5f5,#1976d2)' },
      { l: gameState.isSleeping ? '☀️ 起こす' : '💤 寝かす', a: toggleSleep, c: 'linear-gradient(135deg,#ab47bc,#7b1fa2)' }
    ].map(b => (
      <button key={b.l} onClick={b.a} disabled={currentAction !== null} style={{ padding: '0.65rem 1.1rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '1.5rem', border: 'none', background: b.c, color: 'white', cursor: currentAction ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: currentAction ? 0.7 : 1 }}>
        {b.l}
      </button>
    ))}
  </div>

  {/* Inventory & Shop */}
  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '0.5rem' }}>
    <button onClick={giveTreat} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', border: 'none', background: '#ff7043', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
      🍬 おやつ ({gameState.inventory.treats})
    </button>
    <button onClick={() => setShowShop(!showShop)} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', border: `2px solid ${isDark ? '#888' : '#8b6914'}`, background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '0.85rem' }}>
      🛒 ショップ
    </button>
  </div>

  {showShop && (
    <div style={{ background: cardBg, margin: '0 0.8rem', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 0.7rem', fontSize: '1rem', textAlign: 'center' }}>🛒 ショップ</h3>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => buyItem('seeds', 30, 10)} style={{ padding: '0.45rem 0.9rem', borderRadius: '1rem', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#333' }}>
          🌾 シード×10 (30💰)
        </button>
        <button onClick={() => buyItem('treats', 50, 3)} style={{ padding: '0.45rem 0.9rem', borderRadius: '1rem', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#333' }}>
          🍬 おやつ×3 (50💰)
        </button>
      </div>
      <div style={{ marginTop: '0.6rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
        所持: 🌾{gameState.inventory.seeds} 🍬{gameState.inventory.treats}
      </div>
    </div>
  )}

  {/* Color & Theme */}
  <div style={{ padding: '0.7rem', textAlign: 'center' }}>
    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0 0 0.4rem' }}>羽の色</p>
    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { id: 'sakura', l: '桜文鳥', c: '#7a7a7a', t: '#fff' },
        { id: 'white', l: '白文鳥', c: '#fefefe', t: '#333', border: '#ccc' },
        { id: 'cinnamon', l: 'シナモン', c: '#c9a070', t: '#fff' },
        { id: 'silver', l: 'シルバー', c: '#a8a8a8', t: '#fff' }
      ].map(col => (
        <button key={col.id} onClick={() => changeColor(col.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', border: gameState.color === col.id ? '3px solid #5d4037' : `2px solid ${col.border || '#ddd'}`, background: col.c, color: col.t, cursor: 'pointer', fontSize: '0.8rem' }}>
          {col.l}
        </button>
      ))}
    </div>
    
    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0.7rem 0 0.4rem' }}>背景</p>
    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
      {[
        { id: 'day', l: '☀️ 昼' },
        { id: 'sunset', l: '🌅 夕' },
        { id: 'night', l: '🌙 夜' }
      ].map(th => (
        <button key={th.id} onClick={() => changeTheme(th.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', border: gameState.theme === th.id ? '2px solid #5d4037' : '1px solid #ccc', background: cardBg, color: textColor, cursor: 'pointer', fontSize: '0.8rem' }}>
          {th.l}
        </button>
      ))}
    </div>
  </div>

  {/* Footer */}
  <div style={{ padding: '0.7rem', textAlign: 'center', fontSize: '0.75rem', opacity: 0.6, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,105,20,0.1)'}` }}>
    <p style={{ margin: '0.2rem 0' }}>🍚 {gameState.totalFeeds} | ✋ {gameState.totalPets} | 🎾 {gameState.totalPlays} | 💦 {gameState.totalBaths}</p>
    <button onClick={resetGame} style={{ marginTop: '0.4rem', padding: '0.4rem 1rem', border: '1px solid #ccc', borderRadius: '1rem', background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '0.75rem' }}>
      🔄 リセット
    </button>
  </div>

  <style>{`
    @keyframes popIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.8); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
  `}</style>
</div>
```

);
}
