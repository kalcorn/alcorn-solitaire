import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

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
  trigger: boolean;
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  const lastTriggerRef = useRef(false);

  const colors = useMemo(() => ({
    confetti: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'],
    sparkle: ['#FFD700', '#FFF', '#FFEB3B', '#FFE082']
  }), []);

  const createConfetti = useCallback((centerX: number, centerY: number) => {
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
  }, [colors.confetti]);

  const createSparkles = useCallback((centerX: number, centerY: number) => {
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
  }, [colors.sparkle]);

  useEffect(() => {
    if (!trigger || trigger === lastTriggerRef.current) return;
    
    lastTriggerRef.current = trigger;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let newParticles: Particle[] = [];

    // Create sparkles for valid moves
    newParticles = createSparkles(centerX, centerY);

    setParticles(prev => [...prev, ...newParticles]);
  }, [trigger, createSparkles]);

  // Win effect is handled separately in useGameAnimations
  useEffect(() => {
    if (trigger) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create confetti for win effect
      const confettiParticles = createConfetti(centerX, centerY);
      setParticles(prev => [...prev, ...confettiParticles]);
    }
  }, [trigger, createConfetti]);

  useEffect(() => {
    const animate = () => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles
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

        // Continue animation only if there are particles left
        if (updatedParticles.length > 0) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = 0;
        }

        return updatedParticles;
      });
    };

    // Start animation when particles are added
    const hasParticles = particles.length > 0;
    if (hasParticles && animationFrameRef.current === 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [particles.length]); // Include particles.length in dependencies

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