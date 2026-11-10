import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Komponen CursorDotTrail (referensi & perilaku Framer):
 * https://framer.com/m/CursorDotTrail-ZDqFAE.js@iLyzK205nNCuHNDP5Nsc
 *
 * Mengikuti pointer dengan fisika spring-friction, jejak titik (dot trail)
 * dengan gradien halus, dan morphing menjadi ring saat hover elemen interaktif.
 * Aksesibilitas: nonaktif pada touchscreen dan prefers-reduced-motion.
 */
export default function CursorDotTrail({
  color = '#F0442D',
  colorInverted = '#FFFFFF',
  size = 9,
  hoverSize = 34,
  borderWidth = 1.5,
  spring = 0.25,
  friction = 0.55,
  trailDuration = 220,
  transitionSpeed = 0.2,
}) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  const pointsRef = useRef(/** @type {Array<{ x: number, y: number, age: number }>} */ ([]));
  const ballRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(0);
  const lastTimeRef = useRef(0);
  const radiusRef = useRef(size / 2);
  const fillOpacityRef = useRef(1);
  const strokeOpacityRef = useRef(0);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // 1. Cek dukungan pointer dan reduced-motion (Requirement 3).
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (!isBrowser) return;

    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');
    setMounted(true);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const centerX = w / 2;
      const centerY = h / 2;
      if (!ballRef.current.x && !ballRef.current.y) {
        ballRef.current = { x: centerX, y: centerY };
      }
      if (!targetRef.current.x && !targetRef.current.y) {
        targetRef.current = { x: centerX, y: centerY };
      }
    };
    resize();

    const onMouseMove = (e) => {
      isVisibleRef.current = true;
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      pointsRef.current = [];
    };

    const onMouseEnter = (e) => {
      isVisibleRef.current = true;
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const lerp = (from, to, amt) => from + (to - from) * amt;

    const animate = () => {
      const now = performance.now();
      const dt = Math.min(now - (lastTimeRef.current || now), 33);
      lastTimeRef.current = now;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (!isVisibleRef.current) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      // Fisika pergerakan spring-friction (Framer)
      const dx = targetRef.current.x - ballRef.current.x;
      const dy = targetRef.current.y - ballRef.current.y;
      velocityRef.current.x += dx * spring;
      velocityRef.current.y += dy * spring;
      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;
      ballRef.current.x += velocityRef.current.x;
      ballRef.current.y += velocityRef.current.y;

      // Jejak titik (dot trail)
      pointsRef.current.push({ x: ballRef.current.x, y: ballRef.current.y, age: 0 });
      for (let i = 0; i < pointsRef.current.length; i++) {
        pointsRef.current[i].age += dt;
      }
      pointsRef.current = pointsRef.current.filter((p) => p.age < trailDuration);

      // Deteksi elemen di bawah kursor
      const el = document.elementFromPoint(targetRef.current.x, targetRef.current.y);

      // Invert color bila berada di atas section gelap / button kontras
      const isDarkSection = !!el?.closest('.dark, [data-theme="malam"], .code');
      const isAccentBg = !!el?.closest('.btn--accent, .panel__idx--accent, .tag--accent, mark');
      const currentColor = isAccentBg ? '#FFFFFF' : isDarkSection ? colorInverted : color;

      // Render gradien jejak (dot trail)
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
        for (let i = 1; i < pointsRef.current.length; i++) {
          const p = pointsRef.current[i];
          ctx.lineTo(p.x, p.y);
        }
        const oldest = pointsRef.current[0];
        const newest = pointsRef.current[pointsRef.current.length - 1];
        const oldestOpacity = Math.max(0, 1 - oldest.age / trailDuration);
        const gradient = ctx.createLinearGradient(oldest.x, oldest.y, newest.x, newest.y);
        gradient.addColorStop(0, hexToRgba(currentColor, oldestOpacity * 0.25));
        gradient.addColorStop(1, hexToRgba(currentColor, 0.85));

        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(2, size / 3.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Deteksi elemen interaktif untuk morphing ring (Framer)
      const isRing = !!el?.closest(
        'a, button, [role~="button"], input[type="checkbox"], input[type="radio"], .switch, .rule__label, .text-btn, .icon-btn, .btn',
      );
      const isTextarea = !!el?.closest('textarea, input[type="text"], [contenteditable="true"]');

      let targetRadius = size / 2;
      let targetFill = 1;
      let targetStroke = 0;

      if (isTextarea) {
        // Pada area ketik: dot mengecil dan transparan agar kursor I-beam teks native terlihat jelas
        targetRadius = 2.5;
        targetFill = 0.35;
        targetStroke = 0;
      } else if (isRing) {
        // Pada elemen interaktif: membesar menjadi ring halus
        targetRadius = hoverSize / 2;
        targetFill = 0;
        targetStroke = 1;
      }

      radiusRef.current = lerp(radiusRef.current, targetRadius, transitionSpeed);
      fillOpacityRef.current = lerp(fillOpacityRef.current, targetFill, transitionSpeed);
      strokeOpacityRef.current = lerp(strokeOpacityRef.current, targetStroke, transitionSpeed);

      // Gambar kursor (dot atau ring)
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, Math.max(0.1, radiusRef.current), 0, Math.PI * 2);

      if (strokeOpacityRef.current > 0.01) {
        ctx.strokeStyle = hexToRgba(currentColor, strokeOpacityRef.current);
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }
      if (fillOpacityRef.current > 0.01) {
        ctx.fillStyle = hexToRgba(currentColor, fillOpacityRef.current);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mounted, color, colorInverted, size, hoverSize, borderWidth, spring, friction, trailDuration, transitionSpeed]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />,
    document.body,
  );
}

function hexToRgba(color, alpha) {
  if (!color) return `rgba(240, 68, 45, ${alpha})`;
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*[^)]+\)/, (_, r, g, b) => `rgba(${r},${g},${b},${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    const body = color.slice(4, -1);
    return `rgba(${body},${alpha})`;
  }
  if (color.startsWith('#')) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else if (color.length >= 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(240, 68, 45, ${alpha})`;
}
