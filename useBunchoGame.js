import { useState, useEffect, useCallback } from 'react';

const storage =
  typeof window !== 'undefined'
    ? (window.storage ?? {
        get: async () => ({ value: localStorage.getItem('buncho-2d-v1') }),
        set: async (_, v) => localStorage.setItem('buncho-2d-v1', v),
        delete: async () => localStorage.removeItem('buncho-2d-v1')
      })
    : null;

export default function useBunchoGame() {
  const [gameState, setGameState] = useState({
    name: '名無しの文鳥',
    hunger: 80,
    happiness: 80,
    health: 100,
    energy: 100,
    cleanliness: 100,
    age: 0,
    color: 'sakura',
    lastUpdate: Date.now(),
    totalFeeds: 0,
    totalPets: 0,
    totalBaths: 0,
    totalPlays: 0,
    level: 1,
    exp: 0,
    coins: 100,
    inventory: { seeds: 10, treats: 3 },
    isSleeping: false,
    theme: 'day'
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState('文鳥があなたを見ています…');
  const [notification, setNotification] = useState(null);

  const saveGame = useCallback(async (state) => {
    if (!storage) return;
    await storage.set('buncho-2d-v1', JSON.stringify(state));
  }, []);

  const loadGame = useCallback(async () => {
    if (!storage) return;
    const result = await storage.get('buncho-2d-v1');
    if (result?.value) {
      const saved = JSON.parse(result.value);
      setGameState({ ...saved, lastUpdate: Date.now() });
      setMessage(`${saved.name}がお帰りを待っていました！`);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    if (!isLoaded) return;
    const iv = setInterval(() => {
      setGameState(prev => {
        const ns = {
          ...prev,
          hunger: Math.max(0, prev.hunger - 0.08),
          happiness: Math.max(0, prev.happiness - 0.04),
          energy: prev.isSleeping
            ? Math.min(100, prev.energy + 0.15)
            : Math.max(0, prev.energy - 0.03),
          cleanliness: Math.max(0, prev.cleanliness - 0.02),
          age: prev.age + 1,
          lastUpdate: Date.now()
        };
        return ns;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isLoaded]);

  return {
    gameState,
    setGameState,
    message,
    setMessage,
    notification,
    setNotification,
    saveGame,
    isLoaded
  };
}
