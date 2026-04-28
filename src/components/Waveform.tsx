import { Chart as ChartJS, Plugin } from "chart.js";
import { Chart } from "react-chartjs-2";
import decode from "audio-decode";

import { precisionRound } from "../utilities/MathHelpers";
import { useEffect, useMemo, useState, useRef } from "react";
import { Clip } from "./Clips";

interface DragState {
  isDragging: boolean;
  line: keyof Pick<Clip, "startAt" | "endAt">;
  // lineX: number;
}
interface WaveformProps {
  arrayBuffer: ArrayBuffer;
  currentClip: Clip;
}
interface Point {
  x: number;
  y: number;
}

export default function Waveform({ arrayBuffer, currentClip }: WaveformProps) {
  const sampleRate = 44_100;
  const downsampleFactor = 100;
  const chartRef = useRef<ChartJS>(null);
  const dragState = useRef<DragState>({
    isDragging: false,
    // lineX: 0,
    line: "startAt",
  });
  const overlays = useRef<{ startX: number; endX: number } | null>(null);
  const [chartData, setChartData] = useState<Point[]>([]);

  // Mirrors the currentClip prop into a ref so the plugin can always
  // read the latest value without needing it as a useMemo dependency
  const currentClipRef = useRef(currentClip);
  useEffect(() => {
    currentClipRef.current = currentClip;
    chartRef.current?.update(); // ← tell Chart.js to re-run its update cycle
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

  const playStartDrawPI: Plugin<"line"> = useMemo(
    () => ({
      id: "playStart",
      beforeEvent: (_chart: ChartJS, args) => {
        const HIT_TOLLERANCE = 5;

        const isNear = (a: number, b: number) =>
          Math.abs(a - b) <= HIT_TOLLERANCE;
        const event = args.event;

        if (event.type === "mousedown") {
          if (isNear(event.x ?? 0, overlays.current?.startX ?? -Infinity)) {
            dragState.current.isDragging = true;
            dragState.current.line = "startAt";
          } else if (isNear(event.x ?? 0, overlays.current?.endX ?? Infinity)) {
            dragState.current.isDragging = true;
            dragState.current.line = "endAt";
          }
        }

        if (event.type === "mouseup") {
          dragState.current.isDragging = false;
        }

        if (overlays.current && dragState.current) {
          if (dragState.current.isDragging && event.type === "mousemove") {
            if (dragState.current.line === "startAt") {
              // dragState.current.lineX = event.x ?? 0;
              overlays.current.startX = event.x ?? 0;
            } else if (dragState.current.line === "endAt") {
              // dragState.current.lineX = event.x ?? 0;
              overlays.current.endX = event.x ?? 0;
            }
          }
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
        drawLine(overlays.current?.startX);
        drawLine(overlays.current?.endX);
      },
      afterUpdate: (chart) => {
        if (!chart.scales?.x) return;
        const { startAt, endAt } = currentClipRef.current;
        const startX = chart.scales.x.getPixelForValue(startAt);
        const endX = chart.scales.x.getPixelForValue(endAt);
        overlays.current = {
          startX,
          endX,
        };
      },
    }),
    [],
  );

  return (
    <div>
      <Chart
        plugins={[playStartDrawPI]}
        type="line"
        ref={chartRef}
        options={{
          events: [
            "mousemove",
            "mouseout",
            "click",
            "touchstart",
            "touchmove",
            "touchend",
            "mousedown",
            "mouseup",
          ],
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
    </div>
  );
}
