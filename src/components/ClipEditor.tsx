import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";
import { Clip } from "./Clips";
import SampleList from "./SampleList";
import ClipEnvelope from "./ClipEnvelope";
import FilterControl from "./FilterControl";

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
        <ClipEnvelope {...{ currentClip, patchClip }} />
        <FilterControl {...{ currentClip, patchClip }} />
      </div>
    </>
  );
}
