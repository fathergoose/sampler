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
import { Chart } from "react-chartjs-2";
import decode from "audio-decode";

import { getRelativePosition } from "chart.js/helpers";
import { precisionRound } from "../utilities/MathHelpers";
import { useEffect, useMemo, useState, useRef, type MouseEvent } from "react";

export default function Waveform({
  arrayBuffer,
}: {
  arrayBuffer: ArrayBuffer;
}) {
  const chartRef = useRef<ChartJS>(null);
  const overlays = useRef<{ x: number; y: number }[]>([]);
  const [xaxis, setXaxis] = useState<number[]>([]);
  const [dsData, setDsData] = useState<number[]>([]);

  useEffect(() => {
    const processData = async () => {
      console.log(arrayBuffer);
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
      const xaxis = dsData.map((_value, index) => {
        return index / samplesPerSecond;
      });
      console.log("xaxiz: " + xaxis);
      setDsData(dsData);
      setXaxis(xaxis);
    };
    processData();
  }, [arrayBuffer]);

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;

    if (!chart) return;

    const position = getRelativePosition(event.nativeEvent, chart);
    const xValue = chart.scales.x.getLabelForValue(
      chart.scales.x.getValueForPixel(position.x) ?? 0,
    );
    console.log(`time: ${xValue}`);
    overlays.current.push(position);
    chart.draw();
  };

  const playStartDrawPI: Plugin<"line"> = useMemo(
    () => ({
      id: "playStart",
      afterDraw: (chart: ChartJS) => {
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;

        overlays.current.forEach(({ x, y: _y }) => {
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
                callback: function (val, _index) {
                  return precisionRound(
                    this.getLabelForValue(val as number),
                    2,
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
  );
}
