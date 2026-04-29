import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";
import { Clip, PlayState } from "./Clips";
import { Chart as ChartJS } from "chart.js";
import {
  Dispatch,
  Ref,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
interface ClipEditorProps {
  arrayBuffer: ArrayBuffer | null;
  currentClip: Clip;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
  playState: PlayState;
  setPlayState: Dispatch<SetStateAction<PlayState>>;
  playClip: () => void;
}
export default function ClipEditor({
  arrayBuffer,
  currentClip,
  setCurrentClip,
  playState,
  setPlayState,
  playClip,
}: ClipEditorProps) {
  return arrayBuffer ? (
    <>
      <Waveform
        {...{
          arrayBuffer,
          currentClip,
          setCurrentClip,
          playState,
          setPlayState,
          playClip,
        }}
      />
      <ClipParameters {...{ currentClip, setCurrentClip }} />
    </>
  ) : (
    <>Select a sample</>
  );
}
