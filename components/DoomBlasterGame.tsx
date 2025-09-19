'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameState {
  score: number;
  gameOver: boolean;
  playerX: number;
  bullets: Array<{ x: number; y: number; id: number }>;
  enemies: Array<{ x: number; y: number; job: string; id: number }>;
  lastBulletTime: number;
  lastEnemyTime: number;
}

interface DoomBlasterGameProps {
  jobTitle: string;
  progress?: number;
  onGameEnd?: () => void;
}

export default function DoomBlasterGame({ jobTitle, progress = 0, onGameEnd }: DoomBlasterGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    score: 0,
    gameOver: false,
    playerX: 200,
    bullets: [],
    enemies: [],
    lastBulletTime: 0,
    lastEnemyTime: 0,
  });
  const animationRef = useRef<number | undefined>(undefined);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const jobEmojis: { [key: string]: string } = {
    'lawyer': '⚖️',
    'paralegal': '📋',
    'copywriter': '✍️',
    'writer': '✍️',
    'accountant': '🧮',
    'driver': '🚛',
    'truck': '🚛',
    'teacher': '👩‍🏫',
    'engineer': '⚙️',
    'developer': '💻',
    'designer': '🎨',
    'manager': '👔',
    'sales': '💼',
    'marketing': '📈',
    'default': '🤖'
  };

  const getJobEmoji = (job: string): string => {
    const jobLower = job.toLowerCase();
    for (const [key, emoji] of Object.entries(jobEmojis)) {
      if (jobLower.includes(key)) return emoji;
    }
    return jobEmojis.default;
  };

  const spawnEnemy = () => {
    const gameState = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = Math.random() * (canvas.width - 40) + 20;
    const jobEmoji = getJobEmoji(jobTitle);
    
    gameState.enemies.push({
      x,
      y: -40,
      job: jobEmoji,
      id: Date.now() + Math.random()
    });
  };

  const fireBullet = () => {
    const gameState = gameStateRef.current;
    const now = Date.now();
    
    if (now - gameState.lastBulletTime < 200) return; // Rate limit
    
    gameState.bullets.push({
      x: gameState.playerX + 20,
      y: 180,
      id: Date.now()
    });
    gameState.lastBulletTime = now;
  };

  const updateGame = useCallback(() => {
    const gameState = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || gameState.gameOver) return;

    // Move player
    if (keys.has('ArrowLeft') && gameState.playerX > 0) {
      gameState.playerX -= 5;
    }
    if (keys.has('ArrowRight') && gameState.playerX < canvas.width - 40) {
      gameState.playerX += 5;
    }

    // Spawn enemies
    const now = Date.now();
    if (now - gameState.lastEnemyTime > 1500) {
      spawnEnemy();
      gameState.lastEnemyTime = now;
    }

    // Move bullets
    gameState.bullets = gameState.bullets.filter(bullet => {
      bullet.y -= 8;
      return bullet.y > -10;
    });

    // Move enemies
    gameState.enemies = gameState.enemies.filter(enemy => {
      enemy.y += 2;
      return enemy.y < canvas.height + 40;
    });

    // Check collisions
    gameState.bullets.forEach((bullet, bulletIndex) => {
      gameState.enemies.forEach((enemy, enemyIndex) => {
        const distance = Math.sqrt(
          Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        if (distance < 25) {
          gameState.score++;
          gameState.bullets.splice(bulletIndex, 1);
          gameState.enemies.splice(enemyIndex, 1);
        }
      });
    });

    // Check if enemies reached bottom
    gameState.enemies.forEach(enemy => {
      if (enemy.y > canvas.height - 20) {
        gameState.gameOver = true;
      }
    });

    drawGame();
    animationRef.current = requestAnimationFrame(updateGame);
  }, []);

  const drawGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const gameState = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Draw player
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(gameState.playerX, canvas.height - 40, 40, 20);
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(gameState.playerX + 15, canvas.height - 50, 10, 10);

    // Draw bullets
    ctx.fillStyle = '#ef4444';
    gameState.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 4, 8);
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.job, enemy.x, enemy.y);
    });

    // Draw score
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);

    // Draw game over
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        fireBullet();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        setKeys(prev => new Set(prev).add(e.code));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        setKeys(prev => {
          const newKeys = new Set(prev);
          newKeys.delete(e.code);
          return newKeys;
        });
      }
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      if (x < canvas.width / 2) {
        setKeys(prev => new Set(prev).add('ArrowLeft'));
      } else {
        setKeys(prev => new Set(prev).add('ArrowRight'));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setKeys(new Set());
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.clear();
        if (x < canvas.width / 2) {
          newKeys.add('ArrowLeft');
        } else {
          newKeys.add('ArrowRight');
        }
        return newKeys;
      });
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchmove', handleTouchMove);

    // Start game loop
    animationRef.current = requestAnimationFrame(updateGame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateGame]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🎮 Doom Blaster Lite</h3>
        <p className="text-gray-600 mb-2">Blast the AI job bots while we analyze your doom...</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Analyzing: {jobTitle}</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Searching...</span>
            <span>Analyzing...</span>
            <span>Complete!</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Use ← → keys or touch to move, SPACE to shoot
        </p>
      </div>
      
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-blue-50 to-green-50"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          💡 Tip: The more bots you blast, the safer your job might be! 🎯
        </p>
      </div>
    </div>
  );
}
