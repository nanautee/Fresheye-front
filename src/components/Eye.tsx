"use client";

import { useEffect, useState } from "react";

export default function Eye({
  size = 220,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPx((e.clientX / window.innerWidth - 0.5) * 8);
      setPy((e.clientY / window.innerHeight - 0.5) * 6);
    };
    window.addEventListener("mousemove", onMove);
    let bt: number | undefined;
    const iv = window.setInterval(() => {
      setBlink(true);
      bt = window.setTimeout(() => setBlink(false), 140);
    }, 9000);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearInterval(iv);
      if (bt) window.clearTimeout(bt);
    };
  }, []);

  return (
    <div
      className={`eye ${blink ? "is-blink" : ""} ${className}`}
      style={
        {
          width: size,
          height: Math.round(size * 0.35),
          "--px": `${px}px`,
          "--py": `${py}px`,
        } as React.CSSProperties
      }
      aria-hidden
    >
      {/* Contour lines — thin golden arcs */}
      <div className="contour c-out" />
      <div className="contour c-main" />
      <div className="contour c-in" />

      {/* Soft ambient glow */}
      <div className="eye-glow-soft" />

      {/* Iris */}
      <div className="eye-iris">
        <div className="iris-rad" />
        <div className="iris-rings" />
        <div className="iris-glow" />
        <div className="eye-pupil" />
        <div className="glint glint-a" />
        <div className="glint glint-b" />
      </div>

      {/* Corner ticks */}
      <div className="tick tk-l" />
      <div className="tick tk-r" />
      <div className="tick tk-t" />
      <div className="tick tk-b" />
    </div>
  );
}
