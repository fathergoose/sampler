import { Clip } from "./Clips";
import { useEffect, useState } from "react";

interface ClipParametersProps {
  currentClip: Clip;
  setCurrentClip: React.Dispatch<React.SetStateAction<Clip>>;
}

export default function ClipParameters({
  currentClip,
  setCurrentClip,
}: ClipParametersProps) {
  const [startAt, setStartAt] = useState(currentClip.startAt.toString());
  const [endAt, setEndAt] = useState(currentClip.endAt.toString());
  useEffect(() => {
    setStartAt(currentClip.startAt.toString());
    setEndAt(currentClip.endAt.toString());
  }, [currentClip.startAt, currentClip.endAt]);
  return (
    <>
      <label>Start</label>
      <input
        type="text"
        value={startAt}
        onChange={(e) => {
          setStartAt(e.target.value);
          const val = parseFloat(e.target.value);
          if (val) setCurrentClip({ ...currentClip, startAt: val });
        }}
      />
      <label>End</label>
      <input
        type="text"
        value={endAt}
        onChange={(e) => {
          setEndAt(e.target.value);
          const val = parseFloat(e.target.value);
          if (val) setCurrentClip({ ...currentClip, endAt: val });
        }}
      />
    </>
  );
}
