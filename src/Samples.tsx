import { useEffect, useMemo, useState, useRef, type MouseEvent } from "react";
import "./Samples.css";
import Control from "./Control";
import decode from "audio-decode";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Plugin,
} from "chart.js";
import { Chart, getDatasetAtEvent } from "react-chartjs-2";

import { getRelativePosition } from "chart.js/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
);

interface Sample {
  id: number;
  name: string;
  path: string;
  source: string;
  created: string;
}

interface LineProps {
  options: ChartOptions<"line">;
  data: ChartData<"line">;
}

const audioContext = new window.AudioContext();
export default function SampleList({ samples }: { samples: Sample[] }) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [xaxis, setXaxis] = useState<number[]>([]);
  const [dsData, setDsData] = useState<number[]>([]);
  const url = currentSample?.path
    ? `http://localhost:3000/${currentSample.path}`
    : null;

  const play = () => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.loop = false;
    source.start();
  };

  useEffect(() => {
    const loadAudio = async () => {
      if (url) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          let { channelData, sampleRate } = await decode(arrayBuffer);
          let dsData = [] as number[];
          let acc = 0;

          const downsampleRate = 100;
          const samplesPerSecond = sampleRate / downsampleRate;
          channelData[0].forEach((val, idx) => {
            acc += Math.abs(val);
            if ((idx + 1) % downsampleRate === 0) {
              dsData.push(acc / downsampleRate);
              acc = 0;
            }
          });
          console.log(`dsData length: ${dsData.length}`);
          const xaxis = dsData.map((_value, index) => {
            return index / samplesPerSecond;
          });
          setDsData(dsData);
          setXaxis(xaxis);
          console.log(xaxis);
          console.log(sampleRate);
          console.log(samplesPerSecond);

          // const audioContext = new window.AudioContext();
          // const analyzer = audioContext.createAnalyser();
          // analyzer.fftSize = 2048;
          // const bufferLength = analyzer.frequencyBinCount;
          // const dataArray = new Uint8Array(bufferLength);
          const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          // source.connect(analyzer);
          setAudioBuffer(decodedBuffer);
        } catch (error) {
          console.error("Error loading the audio: ", error);
        }
      }
    };

    loadAudio();
  }, [url]);

  const chartRef = useRef<ChartJS>(null);
  const overlays = useRef<{ x: number; y: number }[]>([]);

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;

    if (!chart) return;

    console.log(getRelativePosition(event.nativeEvent, chart));

    const position = getRelativePosition(event.nativeEvent, chart);
    overlays.current.push(position);
    chart.draw();
  };

  const playStartDrawPI: Plugin<"line"> = useMemo(
    () => ({
      id: "playStart",
      afterDraw: (chart: ChartJS) => {
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;

        overlays.current.forEach(({ x, y }) => {
          ctx.save();
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x, bottom);
          ctx.stroke();
          // ctx.restore();
        });
      },
    }),
    [],
  );

  return (
    <div className="samplesComponent">
      <div className="samplesWrapper">
        Current Sample: {currentSample ? currentSample.name : "none"}
        <div className="sampleList">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className={
                sample.id === currentSample?.id
                  ? "sampleListSelected"
                  : "sampleListItem"
              }
              onClick={(e) => setCurrentSample(sample)}
            >
              {sample.name}
            </div>
          ))}
        </div>
        <div>
          <Chart
            plugins={[playStartDrawPI]}
            type="line"
            ref={chartRef}
            onClick={onClick}
            options={{
              scales: {
                x: {
                  ticks: {
                    callback: function (val, index) {
                      return (
                        Math.round(
                          Number.parseFloat(
                            this.getLabelForValue(val as number),
                          ) * 100,
                        ) / 100
                      );
                    },
                  },
                },
              },
            }}
            data={{
              labels: xaxis,
              datasets: [{ label: "sample", data: dsData, pointStyle: false }],
            }}
          />
        </div>
        <div className="player">
          Audio loaded: {audioBuffer ? <Control handleClick={play} /> : "No"}
        </div>
      </div>
    </div>
  );
}
