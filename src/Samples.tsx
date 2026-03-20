import { useEffect, useState } from "react";
import Control from "./Control";

interface Sample {
  title: string;
  url: string;
}
export default function SampleList({ samples }: { samples: Sample[] }) {
  const url = samples[0]?.url;
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const play = () => {
    const audioContext = new window.AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.loop = false;
    source.start();
  };

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new window.AudioContext();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
      } catch (error) {
        console.error("Error loading the audioooo: ", error);
      }
    };

    loadAudio();
  }, [url]);

  return (
    <div>
      Audio loaded: {audioBuffer ? <Control handleClick={play} /> : "No"}
    </div>
  );
}
