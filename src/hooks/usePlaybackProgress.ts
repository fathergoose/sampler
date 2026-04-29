import { Chart as ChartJS, Plugin } from "chart.js";
import { RefObject, useEffect, useMemo, useRef } from "react";

export function usePlaybackSweep(chartRef: RefObject<ChartJS | null>) {
  const sweepXRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const stop = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    startTimeRef.current = null;
    sweepXRef.current = null;
  };

  const start = (startAt: number, endAt: number, onStart: () => void) => {
    stop();
    const duration = (endAt - startAt) * 1_000;

    const animate = (timestamp: number) => {
      const chart = chartRef.current;
      if (!chart) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const startX = chart.scales.x.getPixelForValue(startAt);
      const endX = chart.scales.x.getPixelForValue(endAt);
      sweepXRef.current = startX + progress * (endX - startX);
      chart.draw();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        stop();
      }
    };

    onStart();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Clean up on unmount
  useEffect(() => stop, []);

  const plugin: Plugin<"line"> = useMemo(
    () => ({
      id: "playback",
      afterDraw: (chart) => {
        if (sweepXRef.current === null) return;
        const { ctx } = chart;
        const { top, bottom } = chart.chartArea;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sweepXRef.current, top);
        ctx.lineTo(sweepXRef.current, bottom);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      },
    }),
    [],
  );

  return { plugin, start, stop };
}
