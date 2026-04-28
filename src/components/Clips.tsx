import { useEffect, useState } from "react";
import "./Clips.css";
import SampleList from "./SampleList";
import Control from "./Control";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
} from "chart.js";

import ClipEditor from "./ClipEditor";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
);

export interface Sample {
  id: number;
  name: string;
  path: string;
  source: string;
  created: string;
}

export interface Clip {
  id: number;
  name: string;
  startAt: number;
  endAt: number;
  gain: number;
  sample: Sample | null;
}
const initClip = {
  id: 1,
  name: "Kick 808",
  startAt: 0.1,
  endAt: 0.3,
  gain: 0,
  sample: null,
} as Clip;
const audioContext = new window.AudioContext();
export default function Clips() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip>(initClip);
  const path = currentClip.sample?.path;
  const url = path ? `http://localhost:3000/${path}` : null;

  const play = () => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.loop = false;
    source.start();
  };

  useEffect(() => {
    console.log(currentClip);
  }, [currentClip]);

  useEffect(() => {
    const loadAudio = async () => {
      if (url) {
        try {
          const response = await fetch(url);
          const ab = await response.arrayBuffer();
          setArrayBuffer(ab);
          const decodedBuffer = await audioContext.decodeAudioData(ab.slice(0));
          setAudioBuffer(decodedBuffer);
        } catch (error) {
          console.error("Error loading the audio: ", error);
        }
      }
    };

    loadAudio();
  }, [url]);

  return (
    <div className="clipsComponent">
      <div className="samplesWrapper">
        Current Sample: {currentClip.sample ? currentClip.sample.name : "none"}
        <SampleList {...{ currentClip, setCurrentClip }} />
        <ClipEditor {...{ arrayBuffer, currentClip, setCurrentClip }} />
        <div className="player">
          Audio loaded: {audioBuffer ? <Control handleClick={play} /> : "No"}
        </div>
      </div>
    </div>
  );
}
