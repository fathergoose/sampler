import { Clip } from "./Clips";

interface ClipEnvelopeParams {
  currentClip: Clip | null;
  patchClip: (updates: Partial<Clip>) => Promise<void>;
}
export default function ClipEnvelope({
  currentClip,
  patchClip,
}: ClipEnvelopeParams) {
  return (
    <div>
      <label>
        Attack:{" "}
        <input
          type="range"
          min={0}
          max={2}
          step={0.0001}
          value={
            typeof currentClip?.envelope.attack === "number"
              ? currentClip.envelope.attack
              : 0
          }
          onChange={(e) => {
            if (currentClip)
              patchClip({
                envelope: {
                  ...currentClip.envelope,
                  ...{ attack: parseFloat(e.target.value) },
                },
              });
          }}
        />
      </label>
      <label>
        Decay:{" "}
        <input
          type="range"
          min={0}
          max={2}
          step={0.0001}
          value={
            typeof currentClip?.envelope.decay === "number"
              ? currentClip.envelope.decay
              : 0
          }
          onChange={(e) => {
            if (currentClip)
              patchClip({
                envelope: {
                  ...currentClip.envelope,
                  ...{ decay: parseFloat(e.target.value) },
                },
              });
          }}
        />
      </label>
      <label>
        Sustain:{" "}
        <input
          type="range"
          className="verticalSlider"
          min={0}
          max={1}
          step={0.0001}
          value={
            typeof currentClip?.envelope.sustain === "number"
              ? currentClip.envelope.sustain
              : 1
          }
          onChange={(e) => {
            if (currentClip)
              patchClip({
                envelope: {
                  ...currentClip.envelope,
                  ...{ sustain: parseFloat(e.target.value) },
                },
              });
          }}
        />
      </label>
      <label>
        Release:{" "}
        <input
          type="range"
          min={0}
          max={2}
          step={0.0001}
          value={
            typeof currentClip?.envelope.release === "number"
              ? currentClip.envelope.release
              : 0
          }
          onChange={(e) => {
            if (currentClip)
              patchClip({
                envelope: {
                  ...currentClip.envelope,
                  ...{ release: parseFloat(e.target.value) },
                },
              });
          }}
        />
      </label>
    </div>
  );
}
