import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Trophy,
  RotateCcw,
  HelpCircle,
  X,
  Gamepad2,
  Target,
  Award,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

// SafeIcon component for dynamic icon rendering
const SafeIcon = ({ name, size = 24, className = '', color }) => {
  const icons = {
    play: Play,
    pause: Pause,
    trophy: Trophy,
    'rotate-ccw': RotateCcw,
    'help-circle': HelpCircle,
    x: X,
    gamepad2: Gamepad2,
    target: Target,
    award: Award,
    'chevron-right': ChevronRight,
    star: Star,
    zap: Zap
  };

  const IconComponent = icons[name] || HelpCircle;
  return <IconComponent size={size} className={className} color={color} />;
};

// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 34;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_SPEED = 3;

// Leaderboard functions
const getLeaderboard = () => {
  const data = localStorage.getItem('flappyLeaderboard');
  return data ? JSON.parse(data) : [];
};

const saveScore = (score) => {
  const leaderboard = getLeaderboard();
  const newEntry = {
    score,
    date: new Date().toLocaleDateString('ru-RU'),
    id: Date.now()
  };
  const updated = [...leaderboard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem('flappyLeaderboard', JSON.stringify(updated));
  return updated;
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('menu'); // menu, game, rules, leaderboard

  // Game state
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const lb = getLeaderboard();
    return lb.length > 0 ? lb[0].score : 0;
  });
  const [leaderboard, setLeaderboard] = useState([]);

  // Game refs for animation loop
  const birdRef = useRef({ y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 });
  const pipesRef = useRef([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // Set pixelated rendering
    ctx.imageSmoothingEnabled = false;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#60A5FA');
    gradient.addColorStop(1, '#93C5FD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(80 + (frameCountRef.current * 0.5) % (GAME_WIDTH + 100) - 50, 80, 25, 0, Math.PI * 2);
    ctx.arc(110 + (frameCountRef.current * 0.5) % (GAME_WIDTH + 100) - 50, 70, 30, 0, Math.PI * 2);
    ctx.arc(140 + (frameCountRef.current * 0.5) % (GAME_WIDTH + 100) - 50, 80, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(250 + (frameCountRef.current * 0.3) % (GAME_WIDTH + 100) - 50, 120, 20, 0, Math.PI * 2);
    ctx.arc(275 + (frameCountRef.current * 0.3) % (GAME_WIDTH + 100) - 50, 110, 25, 0, Math.PI * 2);
    ctx.arc(300 + (frameCountRef.current * 0.3) % (GAME_WIDTH + 100) - 50, 120, 20, 0, Math.PI * 2);
    ctx.fill();

    // Update bird physics
    if (gameState === 'playing') {
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;
      birdRef.current.rotation = Math.min(Math.max(birdRef.current.velocity * 3, -30), 90);

      // Generate pipes
      frameCountRef.current++;
      if (frameCountRef.current % 100 === 0) {
        const minHeight = 50;
        const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight - 100;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        pipesRef.current.push({
          x: GAME_WIDTH,
          topHeight,
          passed: false
        });
      }

      // Update pipes
      pipesRef.current = pipesRef.current.filter(pipe => {
        pipe.x -= PIPE_SPEED;

        // Check score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
          pipe.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);
        }

        return pipe.x > -PIPE_WIDTH;
      });

      // Check collisions
      const birdRect = {
        left: 100 - BIRD_SIZE/2 + 4,
        right: 100 + BIRD_SIZE/2 - 4,
        top: birdRef.current.y - BIRD_SIZE/2 + 4,
        bottom: birdRef.current.y + BIRD_SIZE/2 - 4
      };

      // Ground collision
      if (birdRef.current.y + BIRD_SIZE/2 >= GAME_HEIGHT - 20) {
        setGameState('gameover');
      }

      // Pipe collision
      pipesRef.current.forEach(pipe => {
        const topPipe = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: 0,
          bottom: pipe.topHeight
        };
        const bottomPipe = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: pipe.topHeight + PIPE_GAP,
          bottom: GAME_HEIGHT
        };

        if (birdRect.left < topPipe.right && birdRect.right > topPipe.left &&
            birdRect.top < topPipe.bottom && birdRect.bottom > topPipe.top) {
          setGameState('gameover');
        }
        if (birdRect.left < bottomPipe.right && birdRect.right > bottomPipe.left &&
            birdRect.top < bottomPipe.bottom && birdRect.bottom > bottomPipe.top) {
          setGameState('gameover');
        }
      });
    }

    // Draw pipes
    pipesRef.current.forEach(pipe => {
      // Top pipe
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      pipeGradient.addColorStop(0, '#22C55E');
      pipeGradient.addColorStop(0.5, '#4ADE80');
      pipeGradient.addColorStop(1, '#16A34A');

      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

      // Pipe cap
      ctx.fillStyle = '#15803D';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);

      // Bottom pipe
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.topHeight - PIPE_GAP);

      // Pipe cap bottom
      ctx.fillStyle = '#15803D';
      ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 30);
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 20, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#D97706');
    groundGradient.addColorStop(1, '#92400E');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);

    // Ground pattern
    ctx.fillStyle = '#B45309';
    for (let i = 0; i < GAME_WIDTH; i += 40) {
      ctx.fillRect(i - (frameCountRef.current * PIPE_SPEED) % 40, GAME_HEIGHT - 20, 5, 20);
    }

    // Draw bird
    ctx.save();
    ctx.translate(100, birdRef.current.y);
    ctx.rotate((birdRef.current.rotation * Math.PI) / 180);

    // Bird body
    const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, BIRD_SIZE/2);
    birdGradient.addColorStop(0, '#FCD34D');
    birdGradient.addColorStop(0.7, '#F59E0B');
    birdGradient.addColorStop(1, '#D97706');

    ctx.fillStyle = birdGradient;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
    ctx.fill();

    // Bird outline
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(28, 8);
    ctx.lineTo(12, 14);
    ctx.closePath();
    ctx.fill();

    // Wing
    const wingOffset = gameState === 'playing' && frameCountRef.current % 10 < 5 ? -5 : 0;
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.ellipse(-8 + wingOffset, 8, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Continue loop
    if (gameState !== 'gameover') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, score]);

  // Start game loop
  useEffect(() => {
    if (currentView === 'game') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentView, gameLoop]);

  // Jump function
  const jump = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === 'playing') {
      birdRef.current.velocity = JUMP_STRENGTH;
    }
  }, [gameState]);

  // Reset game
  const resetGame = useCallback(() => {
    if (score > 0) {
      const newLeaderboard = saveScore(score);
      setLeaderboard(newLeaderboard);
    }
    birdRef.current = { y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 };
    pipesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameState('ready');
  }, [score]);

  // Load leaderboard on mount
  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Menu View
  const MenuView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex flex-col items-center justify-center p-4 overflow-hidden relative"
    >
      {/* Animated background clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-40 h-20 bg-white/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ x: [0, 120, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-60 left-1/3 w-36 h-18 bg-white/35 rounded-full blur-xl"
        />
      </div>

      {/* Logo and Title */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mb-8 relative"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 border-4 border-white">
          <SafeIcon name="gamepad2" size={56} className="text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-4 border-dashed border-white/30 rounded-full"
        />
      </motion.div>

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-6xl md:text-7xl font-black text-white mb-2 text-center drop-shadow-lg"
        style={{ WebkitTextStroke: '2px #ea580c' }}
      >
        FLAPPY BIRD
      </motion.h1>

      <motion.p
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-white font-bold mb-10 drop-shadow-md"
      >
        Яркая мультяшная аркада 🎮
      </motion.p>

      {/* Menu Buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <button
          onClick={() => setCurrentView('game')}
          className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <SafeIcon name="play" size={28} />
          ИГРАТЬ
        </button>

        <button
          onClick={() => setCurrentView('rules')}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <SafeIcon name="help-circle" size={24} />
          Правила
        </button>

        <button
          onClick={() => {
            setLeaderboard(getLeaderboard());
            setCurrentView('leaderboard');
          }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-yellow-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <SafeIcon name="trophy" size={24} />
          Топ игроков
        </button>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-10 opacity-60"
      >
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <SafeIcon name="star" size={32} className="text-yellow-700" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute top-32 right-10 opacity-60"
      >
        <div className="w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
          <SafeIcon name="zap" size={24} className="text-pink-700" />
        </div>
      </motion.div>
    </motion.div>
  );

  // Game View
  const GameView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-300 flex flex-col items-center justify-center p-4"
    >
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          onClick={() => {
            setCurrentView('menu');
            setGameState('ready');
            setScore(0);
          }}
          className="bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all"
        >
          <SafeIcon name="chevron-right" size={24} className="rotate-180" />
        </button>

        <div className="flex gap-4">
          <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <SafeIcon name="target" size={20} className="text-blue-500" />
            <span className="font-black text-xl text-gray-800">{score}</span>
          </div>
          <div className="bg-yellow-400/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <SafeIcon name="trophy" size={20} className="text-yellow-800" />
            <span className="font-black text-xl text-yellow-900">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
        <canvas
          ref={canvasRef}
          onClick={jump}
          onTouchStart={(e) => {
            e.preventDefault();
            jump();
          }}
          className="game-canvas cursor-pointer block touch-manipulation"
          style={{ width: '100%', maxWidth: GAME_WIDTH, height: 'auto', aspectRatio: '2/3' }}
        />

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs w-full mx-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon name="x" size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Game Over!</h2>
              <p className="text-gray-600 mb-4">Score: <span className="font-bold text-blue-500 text-xl">{score}</span></p>
              {score > highScore && (
                <p className="text-yellow-500 font-bold mb-4 animate-pulse">🎉 New Record!</p>
              )}
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <SafeIcon name="rotate-ccw" size={20} />
                Играть снова
              </button>
            </div>
          </motion.div>
        )}

        {/* Ready to start overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-white text-2xl font-black drop-shadow-lg mb-2">Коснись чтобы лететь!</p>
              <p className="text-white/80 text-lg drop-shadow-md">Tap to fly</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile controls hint */}
      <p className="mt-4 text-white/80 text-sm font-medium md:hidden">
        Коснитесь экрана для прыжка
      </p>
    </motion.div>
  );

  // Rules View
  const RulesView = () => (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-gradient-to-b from-blue-500 to-cyan-400 p-4 md:p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentView('menu')}
            className="bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all"
          >
            <SafeIcon name="chevron-right" size={24} className="rotate-180" />
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
            Как играть
          </h1>
          <div className="w-12" />
        </div>

        {/* Rules Cards */}
        <div className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <SafeIcon name="zap" size={28} className="text-yellow-800" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-2">1. Управление</h3>
                <p className="text-gray-600 leading-relaxed">
                  Коснитесь экрана или нажмите пробел, чтобы птица взмахнула крыльями и подлетела вверх.
                  Отпустите - и птица начнет падать под действием гравитации.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <SafeIcon name="target" size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-2">2. Цель игры</h3>
                <p className="text-gray-600 leading-relaxed">
                  Проползайте между зелеными трубами, не касаясь их.
                  Каждая успешно пройденная пара труб приносит 1 очко.
                  Сложность постепенно увеличивается!
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <SafeIcon name="award" size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-2">3. Таблица лидеров</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ваши лучшие результаты автоматически сохраняются.
                  Соревнуйтесь с друзьями за место в топ-10!
                  Можете ли вы набрать 100 очков?
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-300 rounded-2xl p-6 border-4 border-yellow-500"
        >
          <h4 className="text-xl font-black text-yellow-900 mb-3 flex items-center gap-2">
            <SafeIcon name="star" size={24} />
            Советы про
          </h4>
          <ul className="space-y-2 text-yellow-900 font-semibold">
            <li>• Не спешите - найдите свой ритм</li>
            <li>• Короткие тапы лучше длинных</li>
            <li>• Следите за следующей трубой заранее</li>
            <li>• Не отвлекайтесь на счет во время игры!</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );

  // Leaderboard View
  const LeaderboardView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 p-4 md:p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentView('menu')}
            className="bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all"
          >
            <SafeIcon name="chevron-right" size={24} className="rotate-180" />
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg flex items-center gap-3">
            <SafeIcon name="trophy" size={40} className="text-yellow-300" />
            Топ игроков
          </h1>
          <div className="w-12" />
        </div>

        {/* Leaderboard List */}
        <div className="bg-white/95 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header row */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 flex items-center font-black text-white">
            <div className="w-16 text-center">#</div>
            <div className="flex-1">Игрок</div>
            <div className="w-24 text-right">Очки</div>
          </div>

          {/* Scores */}
          <div className="max-h-[60vh] overflow-y-auto">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <SafeIcon name="target" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Пока нет рекордов</p>
                <p className="text-sm mt-2">Сыграйте первым!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 flex items-center border-b border-gray-100 ${
                    index === 0 ? 'bg-yellow-50' :
                    index === 1 ? 'bg-gray-50' :
                    index === 2 ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="w-16 text-center">
                    {index === 0 ? (
                      <span className="text-3xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-3xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-3xl">🥉</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Игрок {entry.id.toString().slice(-4)}</p>
                    <p className="text-xs text-gray-500">{entry.date}</p>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-2xl font-black text-blue-600">{entry.score}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Clear button */}
        {leaderboard.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              localStorage.removeItem('flappyLeaderboard');
              setLeaderboard([]);
            }}
            className="mt-6 mx-auto block text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            Очистить таблицу
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  // Main render
  return (
    <div className="no-select overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'menu' && <MenuView key="menu" />}
        {currentView === 'game' && <GameView key="game" />}
        {currentView === 'rules' && <RulesView key="rules" />}
        {currentView === 'leaderboard' && <LeaderboardView key="leaderboard" />}
      </AnimatePresence>
    </div>
  );
}

export default App;