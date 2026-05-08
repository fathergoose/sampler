import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";
import { Clip } from "./Clips";
import { Dispatch, SetStateAction } from "react";
import SampleList from "./SampleList";

interface ClipEditorProps {
  arrayBuffer: ArrayBuffer | null;
  currentClip: Clip | null;
  patchClip: (updates: Partial<Clip>) => Promise<void>;
  playClip: () => void;
}
export default function ClipEditor({
  arrayBuffer,
  currentClip,
  patchClip,
  playClip,
}: ClipEditorProps) {
  return (
    <>
      <div className="sampleListWrapper">
        <SampleList {...{ currentClip, patchClip }} />
      </div>
      <div className="chartWrapper">
        {currentClip && arrayBuffer && (
          <Waveform
            {...{
              arrayBuffer,
              currentClip,
              patchClip,
              playClip,
            }}
          />
        )}
        <ClipParameters {...{ currentClip, patchClip }} />
      </div>
    </>
  );
}
