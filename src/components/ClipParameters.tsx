import { Clip } from "./Clips";
import ParseFloatField from "./ParseFloatField";

interface ClipParametersProps {
  currentClip: Clip;
  setCurrentClip: React.Dispatch<React.SetStateAction<Clip>>;
}

export default function ClipParameters({
  currentClip,
  setCurrentClip,
}: ClipParametersProps) {
  return (
    <>
      <ParseFloatField
        label="Start"
        value={currentClip.startAt}
        onChange={(val) => setCurrentClip({ ...currentClip, startAt: val })}
      />
      <ParseFloatField
        label="End"
        value={currentClip.endAt}
        onChange={(val) => setCurrentClip({ ...currentClip, endAt: val })}
      />
    </>
  );
}
