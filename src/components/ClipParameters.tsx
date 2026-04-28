import { Clip } from "./Clips";
import { useState } from "react";

interface ClipParametersProps {
  currentClip: Clip;
  setCurrentClip: React.Dispatch<React.SetStateAction<Clip>>;
}

export default function ClipParameters({
  currentClip,
  setCurrentClip,
}: ClipParametersProps) {
  const [startAt, setStartAt] = useState(currentClip.startAt.toString());
  return (
    <>
      <label>Start</label>
      <input
        type="text"
        value={startAt}
        onChange={(e) => {
          // TODO: Add some validation failure feedback
          setStartAt(e.target.value);
          const val = parseFloat(e.target.value);
          if (val) setCurrentClip({ ...currentClip, startAt: val });
        }}
      />
      <label>End</label>
      <input type="text" value={currentClip.endAt} />
    </>
  );
}
