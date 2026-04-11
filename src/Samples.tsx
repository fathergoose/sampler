import { useEffect, useState } from "react";
import "./Samples.css";
import Control from "./Control";

interface Sample {
  id: number;
  name: string;
  path: string;
  source: string;
  created: string;
}
export default function SampleList({ samples }: { samples: Sample[] }) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const url = currentSample?.path
    ? `http://localhost:3000/${currentSample.path}`
    : null;

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
      if (url) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new window.AudioContext();
          const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(decodedBuffer);
        } catch (error) {
          console.error("Error loading the audio: ", error);
        }
      }
    };

    loadAudio();
  }, [url]);

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
        <div className="player">
          Audio loaded: {audioBuffer ? <Control handleClick={play} /> : "No"}
        </div>
      </div>
    </div>
  );
}
