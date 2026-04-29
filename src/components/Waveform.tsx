import { Chart as ChartJS } from "chart.js";
import { Chart } from "react-chartjs-2";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { precisionRound } from "../utilities/MathHelpers";
import { Clip } from "./Clips";
import { useAudioData } from "../hooks/useAudioData";
import { useStartEndMarkers } from "../hooks/useStartEndMarkers";
import { usePlaybackSweep } from "../hooks/usePlaybackProgress";

interface WaveformProps {
  arrayBuffer: ArrayBuffer;
  currentClip: Clip;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
  playClip: () => void;
}

export default function Waveform({
  arrayBuffer,
  currentClip,
  setCurrentClip,
  playClip,
}: WaveformProps) {
  const chartRef = useRef<ChartJS>(null);
  const currentClipRef = useRef(currentClip);

  useEffect(() => {
    currentClipRef.current = currentClip;
    chartRef.current?.update();
  }, [currentClip]);

  const chartData = useAudioData(arrayBuffer);
  const markersPlugin = useStartEndMarkers(currentClipRef, setCurrentClip);
  const { plugin: sweepPlugin, start: startSweep } = usePlaybackSweep(chartRef);

  return (
    <div>
      <Chart
        ref={chartRef}
        type="line"
        plugins={[markersPlugin, sweepPlugin]}
        options={{
          events: ["mousemove", "mousedown", "mouseup", "mouseout"],
          scales: {
            x: {
              type: "linear",
              ticks: { callback: (val) => precisionRound(val as number, 2) },
            },
          },
        }}
        data={{
          datasets: [{ label: "sample", data: chartData, pointStyle: false }],
        }}
      />
      <button
        onClick={() =>
          startSweep(currentClip.startAt, currentClip.endAt, playClip)
        }
      >
        Play
      </button>
    </div>
  );
}
