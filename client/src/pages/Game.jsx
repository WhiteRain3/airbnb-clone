import { Bomb, Gift, Play, Trophy, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const Game = () => {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [items, setItems] = useState([]);
  const [basketPos, setBasketPos] = useState(50);
  const [gameOverReason, setGameOverReason] = useState(null); // 'time' arba 'bomb'
  
  const gameAreaRef = useRef(null);
  const requestRef = useRef();
  const lastSpawnTime = useRef(0);
  const startTime = useRef(0);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setItems([]);
    setGameOverReason(null);
    setIsPlaying(true);
    startTime.current = performance.now();
    lastSpawnTime.current = performance.now();
  };

  const updateGame = (time) => {
    if (!isPlaying) return;

    // 1. Skaičiuojame laiką
    const elapsed = (time - startTime.current) / 1000;
    const remaining = Math.max(0, 15 - elapsed);
    setTimeLeft(remaining.toFixed(1));

    if (remaining <= 0) {
      setGameOverReason('time');
      setIsPlaying(false);
      return;
    }

    // 2. Sunkumo faktorius (didėja kas sekundę)
    const difficulty = 1 + (elapsed * 0.1); 

    // 3. Daiktų generavimas
    if (time - lastSpawnTime.current > (600 / difficulty)) {
      setItems(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * 90 + 5,
        y: -5,
        type: Math.random() > 0.25 ? 'point' : 'bomb',
        speed: (Math.random() * 0.5 + 0.5) * difficulty
      }]);
      lastSpawnTime.current = time;
    }

    // 4. Daiktų judėjimas ir susidūrimas
    setItems(prev => {
      const newItems = prev.map(item => ({ ...item, y: item.y + item.speed }));
      
      let filteredItems = [];
      for (let item of newItems) {
        // Susidūrimo detekcija (namukas yra ties y: 85)
        if (item.y > 80 && item.y < 88 && Math.abs(item.x - basketPos) < 8) {
          if (item.type === 'bomb') {
            setGameOverReason('bomb');
            setIsPlaying(false);
            return prev; // Stabdom procesą
          } else {
            setScore(s => s + 10);
            continue; // Daiktas „pagautas“, jo nebeįtraukiam į sąrašą
          }
        }
        if (item.y < 105) filteredItems.push(item);
      }
      return filteredItems;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, basketPos]);

  const handleMouseMove = (e) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketPos(Math.min(Math.max(x, 5), 95));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-center select-none">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center justify-center gap-2">
          MARBNB DASH <Zap className="text-yellow-500 fill-yellow-500" size={32} />
        </h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">
          Išvenk bombų ir gauk nuolaidą
        </p>
      </div>

      <div 
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        className={`relative h-[500px] bg-white rounded-[2.5rem] border-[6px] shadow-2xl overflow-hidden transition-all duration-300 ${
          isPlaying ? 'cursor-none border-slate-100' : 'cursor-default border-white'
        }`}
      >
        {/* Žaidimo būsenos langas */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-md z-20 p-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center animate-in zoom-in duration-300">
              {gameOverReason ? (
                <>
                  {gameOverReason === 'bomb' ? (
                    <div className="p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
                      <Bomb size={48} />
                    </div>
                  ) : (
                    <Trophy className="text-yellow-500 mb-4" size={60} />
                  )}
                  
                  <h2 className="text-3xl font-black text-slate-900 mb-1">
                    {gameOverReason === 'bomb' ? 'BUM! Žaidimas baigtas' : 'Laikas baigėsi!'}
                  </h2>
                  <p className="text-slate-500 font-bold mb-6">Galutinis rezultatas: {score}</p>
                  
                  {score >= 50 && gameOverReason === 'time' ? (
                    <div className="mb-6 p-5 bg-emerald-500 text-white rounded-3xl shadow-lg shadow-emerald-200">
                      <p className="text-[10px] font-black uppercase opacity-80 mb-1">Nuolaidos kodas:</p>
                      <p className="text-2xl font-black tracking-[0.3em]">DASH50</p>
                    </div>
                  ) : score < 50 && (
                    <p className="mb-6 text-rose-500 font-bold text-sm bg-rose-50 px-4 py-2 rounded-full italic">
                      Reikia bent 50 taškų nuolaidai!
                    </p>
                  )}
                </>
              ) : (
                <div className="mb-6 text-center">
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl">🎁 +10</div>
                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">💣 GAME OVER</div>
                  </div>
                  <p className="text-slate-400 text-sm font-medium italic">Valdyk namuką pele</p>
                </div>
              )}

              <button 
                onClick={startGame}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-300 flex items-center gap-3"
              >
                <Play size={20} fill="currentColor" /> {gameOverReason ? 'Bandyti vėl' : 'Pradėti'}
              </button>
            </div>
          </div>
        )}

        {/* Aktyvus žaidimas */}
        {isPlaying && (
          <>
            <div className="absolute top-6 inset-x-0 flex justify-center gap-8 z-10">
              <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-2xl shadow-sm border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase mr-2">Score</span>
                <span className="text-xl font-black text-slate-800">{score}</span>
              </div>
              <div className={`bg-white/90 backdrop-blur px-6 py-2 rounded-2xl shadow-sm border border-slate-100 transition-colors ${timeLeft < 5 ? 'text-rose-500 animate-pulse' : ''}`}>
                <span className="text-xs font-black text-slate-400 uppercase mr-2">Time</span>
                <span className="text-xl font-black">{timeLeft}s</span>
              </div>
            </div>

            {items.map(item => (
              <div 
                key={item.id}
                className="absolute text-4xl drop-shadow-md"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translateX(-50%)' }}
              >
                {item.type === 'point' ? '🎁' : '💣'}
              </div>
            ))}

            <div 
              className="absolute bottom-10 w-20 h-12 bg-rose-500 rounded-2xl shadow-2xl flex items-center justify-center text-3xl border-b-[6px] border-rose-700 transition-transform duration-75"
              style={{ left: `${basketPos}%`, transform: 'translateX(-50%)' }}
            >
              🏠
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-12 text-[11px] font-black text-slate-400 uppercase tracking-widest">
        <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full"><Gift size={16} className="text-emerald-500"/> Rink dovanas</span>
        <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full"><Bomb size={16} className="text-rose-500"/> Venk bombų</span>
      </div>
    </div>
  );
};

export default Game;