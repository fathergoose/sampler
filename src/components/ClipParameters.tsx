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
      <ParseFloatField
        label="Gain"
        value={currentClip?.gain ?? 0}
        onChange={(val) =>
          patchClip({ gain: val <= 0 ? 0 : val >= 1.25 ? 1.25 : val })
        }
      />
    </>
  );
}
