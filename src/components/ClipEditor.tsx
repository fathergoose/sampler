import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";
import { Clip } from "./Clips";
import { Dispatch, SetStateAction } from "react";
import ClipList from "./ClipList";
interface ClipEditorProps {
  arrayBuffer: ArrayBuffer | null;
  currentClip: Clip;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
  playClip: () => void;
}
export default function ClipEditor({
  arrayBuffer,
  currentClip,
  setCurrentClip,
  playClip,
}: ClipEditorProps) {
  return arrayBuffer ? (
    <>
      <ClipList />
      <Waveform
        {...{
          arrayBuffer,
          currentClip,
          setCurrentClip,
          playClip,
        }}
      />
      <ClipParameters {...{ currentClip, setCurrentClip }} />
    </>
  ) : (
    <>Select a sample</>
  );
}
