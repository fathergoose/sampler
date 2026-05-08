import { useEffect, useState } from "react";
import "./Clips.css";
import ClipList from "./ClipList";
import useInitialNullState from "../hooks/useInitialNullState";

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
import useDebouncedClipPatch from "../hooks/useDebouncedClipPatch";

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

export interface PlayState {
  isPlaying: boolean;
  playHead: number;
}

const audioContext = new window.AudioContext();

export default function Clips() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [clipList, setClipList] = useState<Clip[]>([]);
  const [currentClip, setCurrentClip] = useInitialNullState<Clip>();

  const path = currentClip && currentClip.sample?.path;
  const fileUrl = path ? `/${path}` : null;

  const playClip = () => {
    if (currentClip) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.loop = false;
      source.start(0, currentClip.startAt, currentClip.endAt);
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      if (fileUrl) {
        try {
          const response = await fetch(fileUrl);
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
  }, [fileUrl]);

  const { queue: queuePatch } = useDebouncedClipPatch(currentClip?.id);

  const patchClip = async (updates: Partial<Clip>): Promise<void> => {
    if (currentClip) {
      setCurrentClip((prev): Clip => (prev ? { ...prev, ...updates } : prev));
      setClipList(
        clipList.map((clip) =>
          clip.id === currentClip.id ? { ...currentClip, ...updates } : clip,
        ),
      );
      queuePatch(updates);
    }
  };

  return (
    <div className="clipsComponent">
      <div className="samplesWrapper">
        <div className="clipList">
          <ClipList
            {...{ clipList, setClipList, currentClip, setCurrentClip }}
          />
        </div>
        <div className="clipEditor">
          <ClipEditor
            {...{
              arrayBuffer,
              currentClip,
              patchClip,
              playClip,
            }}
          />
        </div>
      </div>
      {/* WARNING: Remove before deployment */}
      <div>
        <pre style={{ textAlign: "left", whiteSpace: "pre-line" }}>
          {JSON.stringify(currentClip, null, 2).replace(/, /g, "\n")}
        </pre>
      </div>
    </div>
  );
}
