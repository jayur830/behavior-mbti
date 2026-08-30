'use client';

import { useEffect, useRef } from 'react';

export default function AmbientCursorBlob() {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const blob2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 3;
    let currentX = mouseX;
    let currentY = mouseY;
    let currentX2 = mouseX;
    let currentY2 = mouseY;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const animate = () => {
      // Smooth linear interpolation (lerp)
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      // Second secondary blob with different delay
      currentX2 += (mouseX - currentX2) * 0.04;
      currentY2 += (mouseY - currentY2) * 0.04;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate3d(${currentX2}px, ${currentY2}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700 select-none"
    >
      {/* Primary dynamic cursor-follow blob */}
      <div
        ref={blobRef}
        className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full blur-[90px] sm:h-[600px] sm:w-[600px] sm:blur-[140px] will-change-transform opacity-30 dark:opacity-25 bg-[radial-gradient(circle,rgba(201,243,107,0.85)_0%,rgba(16,185,129,0.35)_50%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(201,243,107,0.7)_0%,rgba(52,211,153,0.3)_50%,transparent_75%)]"
        style={{
          transform: 'translate3d(50vw, 30vh, 0) translate(-50%, -50%)',
        }}
      />

      {/* Secondary softer lagging ambient blob */}
      <div
        ref={blob2Ref}
        className="absolute left-0 top-0 h-[350px] w-[350px] rounded-full blur-[100px] sm:h-[500px] sm:w-[500px] sm:blur-[160px] will-change-transform opacity-25 dark:opacity-20 bg-[radial-gradient(circle,rgba(251,191,36,0.6)_0%,rgba(201,243,107,0.25)_50%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(230,168,0,0.5)_0%,rgba(16,185,129,0.2)_50%,transparent_75%)]"
        style={{
          transform: 'translate3d(50vw, 30vh, 0) translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
