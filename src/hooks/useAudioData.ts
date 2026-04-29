import decode from "audio-decode";
import { useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
}

const SAMPLE_RATE = 44_100;
const DOWNSAMPLE_FACTOR = 100;

export function useAudioData(arrayBuffer: ArrayBuffer) {
  const [chartData, setChartData] = useState<Point[]>([]);

  useEffect(() => {
    const processData = async () => {
      const { channelData } = await decode(arrayBuffer);
      const samplesPerSecond = SAMPLE_RATE / DOWNSAMPLE_FACTOR;
      const dsData: number[] = [];
      let acc = 0;

      channelData[0].forEach((val, idx) => {
        acc += Math.abs(val);
        if ((idx + 1) % DOWNSAMPLE_FACTOR === 0) {
          dsData.push(acc / DOWNSAMPLE_FACTOR);
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

  return chartData;
}
