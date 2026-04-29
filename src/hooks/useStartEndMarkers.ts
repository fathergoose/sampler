import { Chart as ChartJS, Plugin } from "chart.js";
import { Dispatch, RefObject, SetStateAction, useMemo, useRef } from "react";
import { Clip } from "../components/Clips";

interface DragState {
  isDragging: boolean;
  line: keyof Pick<Clip, "startAt" | "endAt">;
}

// Pixel positions of the start/end marker lines on the canvas
interface MarkerOverlays {
  startAt: number;
  endAt: number;
}

const HIT_TOLERANCE = 5;

const isNear = (a: number, b: number) => Math.abs(a - b) <= HIT_TOLERANCE;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function useStartEndMarkers(
  currentClipRef: RefObject<Clip>,
  setCurrentClip: Dispatch<SetStateAction<Clip>>,
): Plugin<"line"> {
  const dragState = useRef<DragState>({ isDragging: false, line: "startAt" });
  const overlays = useRef<MarkerOverlays | null>(null);

  return useMemo(
    () => ({
      id: "startend",

      afterUpdate: (chart) => {
        if (!chart.scales?.x) return;
        const { startAt, endAt } = currentClipRef.current;
        overlays.current = {
          startAt: chart.scales.x.getPixelForValue(startAt),
          endAt: chart.scales.x.getPixelForValue(endAt),
        };
      },

      beforeEvent: (chart: ChartJS, args) => {
        const { event } = args;
        const { left, right } = chart.chartArea;
        const x = event.x ?? 0;

        switch (event.type) {
          case "mousedown":
            if (isNear(x, overlays.current?.startAt ?? -Infinity)) {
              dragState.current = { isDragging: true, line: "startAt" };
            } else if (isNear(x, overlays.current?.endAt ?? Infinity)) {
              dragState.current = { isDragging: true, line: "endAt" };
            }
            break;

          // @ts-ignore — intentional fallthrough from mouseout to mouseup
          case "mouseout":
            if (!dragState.current.isDragging) break;
          // falls through to mouseup when dragging out of canvas

          case "mouseup":
            if (dragState.current.isDragging && overlays.current) {
              const pixelValue = overlays.current[dragState.current.line];
              setCurrentClip({
                ...currentClipRef.current,
                [dragState.current.line]:
                  chart.scales.x.getValueForPixel(pixelValue) ?? 0,
              });
            }
            dragState.current.isDragging = false;
            break;

          case "mousemove":
            if (dragState.current.isDragging && overlays.current && event.x) {
              const clamped = clamp(event.x, left, right);
              const { line } = dragState.current;
              const isValid =
                line === "startAt"
                  ? clamped < overlays.current.endAt
                  : clamped > overlays.current.startAt;

              if (isValid) overlays.current[line] = clamped;
              chart.draw();
            }
            break;
        }
      },

      afterDraw: (chart: ChartJS) => {
        if (!overlays.current) return;
        const { ctx } = chart;
        const { top, bottom } = chart.chartArea;

        const drawLine = (x: number) => {
          ctx.save();
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
          ctx.restore();
        };

        drawLine(overlays.current.startAt);
        drawLine(overlays.current.endAt);
      },
    }),
    [currentClipRef, setCurrentClip],
  );
}
