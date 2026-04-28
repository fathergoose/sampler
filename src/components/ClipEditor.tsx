import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";
import { Clip } from "./Clips";
interface ClipEditorProps {
  arrayBuffer: ArrayBuffer | null;
  currentClip: Clip;
  setCurrentClip: React.Dispatch<React.SetStateAction<Clip>>;
}
export default function ClipEditor({
  arrayBuffer,
  currentClip,
  setCurrentClip,
}: ClipEditorProps) {
  return arrayBuffer ? (
    <>
      <Waveform {...{ arrayBuffer, currentClip }} />
      <ClipParameters {...{ currentClip, setCurrentClip }} />
    </>
  ) : (
    <>Select a sample</>
  );
}
