import { Clip } from "./Clips";
import ParseFloatField from "./ParseFloatField";

interface ClipParametersProps {
  currentClip: Clip | null;
  patchClip: (updates: Partial<Clip>) => Promise<void>;
}

export default function ClipParameters({
  currentClip,
  patchClip,
}: ClipParametersProps) {
  return (
    <>
      <ParseFloatField
        label="Start"
        value={currentClip?.startAt ?? 0}
        onChange={(val) => patchClip({ startAt: val })}
      />
      <ParseFloatField
        label="End"
        value={currentClip?.endAt ?? 0}
        onChange={(val) => patchClip({ endAt: val })}
      />
      <label>
        Gain:
        <input
          type="range"
          className="verticalSlider"
          min={0}
          max={1.25}
          step={0.0001}
          value={typeof currentClip?.gain === "number" ? currentClip.gain : 1}
          onChange={(e) => patchClip({ gain: parseFloat(e.target.value) })}
        />
      </label>
    </>
  );
}
