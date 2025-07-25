import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  type: 'confetti' | 'sparkle';
}

interface ParticleEffectsProps {
  trigger: {
    type: 'win' | 'validMove' | null;
    position?: { x: number; y: number };
  };
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  const colors = {
    confetti: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'],
    sparkle: ['#FFD700', '#FFF', '#FFEB3B', '#FFE082']
  };

  const createConfetti = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = 3 + Math.random() * 4;
      const size = 4 + Math.random() * 8;
      
      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 3,
        size,
        color: colors.confetti[Math.floor(Math.random() * colors.confetti.length)],
        life: 1,
        maxLife: 120 + Math.random() * 60,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        type: 'confetti'
      });
    }

    return newParticles;
  };

  const createSparkles = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const velocity = 1 + Math.random() * 2;
      const size = 3 + Math.random() * 4;
      
      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        color: colors.sparkle[Math.floor(Math.random() * colors.sparkle.length)],
        life: 1,
        maxLife: 40 + Math.random() * 20,
        rotation: 0,
        rotationSpeed: 0,
        type: 'sparkle'
      });
    }

    return newParticles;
  };

  useEffect(() => {
    if (!trigger.type) return;

    const centerX = trigger.position?.x ?? window.innerWidth / 2;
    const centerY = trigger.position?.y ?? window.innerHeight / 2;

    let newParticles: Particle[] = [];

    if (trigger.type === 'win') {
      // Create confetti from multiple points across the screen
      for (let i = 0; i < 5; i++) {
        const x = (window.innerWidth / 6) * (i + 1);
        const y = window.innerHeight * 0.2;
        newParticles.push(...createConfetti(x, y));
      }
    } else if (trigger.type === 'validMove') {
      newParticles = createSparkles(centerX, centerY);
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [trigger]);

  useEffect(() => {
    const animate = () => {
      setParticles(prevParticles => {
        return prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2, // Gravity
            vx: particle.vx * 0.999, // Air resistance
            life: particle.life - 1,
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter(particle => particle.life > 0 && particle.y < window.innerHeight + 100);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        const scale = particle.type === 'sparkle' 
          ? Math.sin((particle.life / particle.maxLife) * Math.PI) 
          : 1;

        return (
          <div
            key={particle.id}
            className={`absolute ${
              particle.type === 'confetti' ? 'rounded-sm' : 'rounded-full'
            }`}
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: opacity,
              transform: `rotate(${particle.rotation}deg) scale(${scale})`,
              boxShadow: particle.type === 'sparkle' 
                ? `0 0 ${particle.size * 2}px ${particle.color}40` 
                : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleEffects;