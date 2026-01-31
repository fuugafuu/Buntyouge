import { useState, useEffect } from 'react';
import useBunchoGame from './useBunchoGame';
import BunchoSVG from './BunchoSVG';

export default function Buncho2DGame() {
  const {
    gameState,
    setGameState,
    message,
    setMessage,
    isLoaded
  } = useBunchoGame();

  const [animFrame, setAnimFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setAnimFrame(f => (f + 1) % 60), 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() < 0.3 && !gameState.isSleeping) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [gameState.isSleeping]);

  if (!isLoaded) return <div>Loading...</div>;

  const colors = {
    head: '#1a1a1a',
    body: '#7a7a7a'
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <BunchoSVG
        colors={colors}
        action={null}
        sleeping={gameState.isSleeping}
        animFrame={animFrame}
        isBlinking={isBlinking}
      />
      <p>{message}</p>
    </div>
  );
}
