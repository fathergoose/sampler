/* eslint-disable no-fallthrough */
import decode from "audio-decode";
import { Chart as ChartJS, Plugin } from "chart.js";
import { Chart } from "react-chartjs-2";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { precisionRound } from "../utilities/MathHelpers";
import { Clip } from "./Clips";

interface DragState {
  isDragging: boolean;
  line: keyof Pick<Clip, "startAt" | "endAt">;
}
interface WaveformProps {
  arrayBuffer: ArrayBuffer;
  currentClip: Clip;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
  playClip: () => void;
}
interface Point {
  x: number;
  y: number;
}

export default function Waveform({
  arrayBuffer,
  currentClip,
  setCurrentClip,
  playClip,
}: WaveformProps) {
  const sampleRate = 44_100;
  const downsampleFactor = 100;
  const dragState = useRef<DragState>({
    isDragging: false,
    line: "startAt",
  });
  const overlays = useRef<{ startAt: number; endAt: number } | null>(null);
  const [chartData, setChartData] = useState<Point[]>([]);
  const currentClipRef = useRef(currentClip);
  const sweepXRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    currentClipRef.current = currentClip;
    if (chartRef?.current) chartRef.current?.update();
  }, [currentClip]);

  useEffect(() => {
    const processData = async () => {
      let { channelData } = await decode(arrayBuffer);
      let dsData = [] as number[];
      let acc = 0;

      const samplesPerSecond = sampleRate / downsampleFactor;
      channelData[0].forEach((val, idx) => {
        acc += Math.abs(val);
        if ((idx + 1) % downsampleFactor === 0) {
          dsData.push(acc / downsampleFactor);
          acc = 0;
        }
      });
      setChartData(
        dsData.map((value, index) => ({
          x: index / samplesPerSecond,
          y: value,
        })),
      );
    };
    processData();
  }, [arrayBuffer]);

  const startEndMarkersPlugin: Plugin<"line"> = useMemo(
    () => ({
      id: "startend",
      beforeEvent: (chart: ChartJS, args) => {
        const HIT_TOLLERANCE = 5;

        const isNear = (a: number, b: number) =>
          Math.abs(a - b) <= HIT_TOLLERANCE;
        const { event } = args;
        const { left, right } = chart.chartArea;

        switch (event.type) {
          case "mousedown":
            if (isNear(event.x ?? 0, overlays.current?.startAt ?? -Infinity)) {
              dragState.current.isDragging = true;
              dragState.current.line = "startAt";
            } else if (
              isNear(event.x ?? 0, overlays.current?.endAt ?? Infinity)
            ) {
              dragState.current.isDragging = true;
              dragState.current.line = "endAt";
            }
            break;

          // @ts-ignore
          case "mouseout":
            if (!dragState.current.isDragging) break;
          case "mouseup":
            if (dragState.current?.isDragging && event.x && overlays.current) {
              const updatedClip = {
                ...currentClipRef.current,
                [dragState.current.line]:
                  chart.scales.x.getValueForPixel(
                    overlays.current[dragState.current.line],
                  ) ?? 0,
              };
              console.log("updated Clip " + JSON.stringify(updatedClip));
              setCurrentClip(updatedClip);
            }
            dragState.current.isDragging = false;
            break;

          case "mousemove":
            if (overlays.current && dragState.current?.isDragging && event.x) {
              if (dragState.current.line === "startAt") {
                if (overlays.current.endAt > event.x) {
                  overlays.current.startAt =
                    event.x <= left ? left : event.x >= right ? right : event.x;
                }
              } else if (dragState.current.line === "endAt") {
                if (overlays.current.startAt < event.x) {
                  overlays.current.endAt =
                    event.x <= left ? left : event.x >= right ? right : event.x;
                }
              }
            }
            chart.draw();
            break;
        }
      },
      afterDraw: (chart: ChartJS) => {
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;
        const drawLine = (x: number | undefined) => {
          if (!x) return;
          ctx.save();
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
          ctx.restore();
        };
        drawLine(overlays.current?.startAt);
        drawLine(overlays.current?.endAt);
      },
      afterUpdate: (chart) => {
        if (!chart.scales?.x) return;
        const { startAt, endAt } = currentClipRef.current;
        const startX = chart.scales.x.getPixelForValue(startAt);
        const endX = chart.scales.x.getPixelForValue(endAt);
        overlays.current = {
          startAt: startX,
          endAt: endX,
        };
      },
    }),
    [setCurrentClip],
  );

  const stopSweep = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimeRef.current = null;
    sweepXRef.current = null;
  };

  const startPlaybackPositionSweep = () => {
    const duration = (currentClip.endAt - currentClip.startAt) * 1_000; // ms to sweep

    const animate = (timestamp: number) => {
      const chart = chartRef.current;
      if (!chart) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate x position across the chart
      const startX = chart.scales.x.getPixelForValue(currentClip.startAt);
      const endX = chart.scales.x.getPixelForValue(currentClip.endAt);
      sweepXRef.current = startX + progress * (endX - startX);
      chart.draw();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        stopSweep();
      }
    };

    playClip();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Clean up on unmount by running stopSweep()
  useEffect(() => () => stopSweep(), []);
  const animatePlaybackPlugin: Plugin<"line"> = useMemo(
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

  return (
    <div>
      <Chart
        plugins={[startEndMarkersPlugin, animatePlaybackPlugin]}
        type="line"
        ref={chartRef}
        options={{
          events: ["mousemove", "mousedown", "mouseup", "mouseout"],
          scales: {
            x: {
              type: "linear",
              ticks: {
                callback: (val) => precisionRound(val as number, 2),
              },
            },
          },
        }}
        data={{
          datasets: [{ label: "sample", data: chartData, pointStyle: false }],
        }}
      />
      <button onClick={startPlaybackPositionSweep}>Play</button>
    </div>
  );
}
