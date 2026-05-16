import { Clip, ClipParameters } from "./Clips";

interface FilterControlParams {
  currentClip: Clip | null;
  patchClip: (updates: Partial<ClipParameters>) => Promise<void>;
}
export default function FilterControl({
  currentClip,
  patchClip,
}: FilterControlParams) {
  /*
   * frequency
   * detune
   * Q
   * gain
   * type
   */
  const minHz = 20;
  const maxHz = 22_000;

  const mindB = 0.1;
  const maxdB = 20;
  return (
    <>
      <label>
        Cutoff:
        <input
          type="range"
          min={0}
          max={1_000}
          step={1}
          value={
            typeof currentClip?.filter.frequency === "number"
              ? (Math.log(currentClip.filter.frequency / minHz) /
                  Math.log(maxHz / minHz)) *
                1_000
              : maxHz
          }
          onChange={(e) => {
            if (currentClip) {
              const position = parseInt(e.target.value);
              const frequency = minHz * (maxHz / minHz) ** (position / 1_000);
              patchClip({
                filter: {
                  ...currentClip.filter,
                  ...{ frequency },
                },
              });
            }
          }}
        />
      </label>
      <label>
        Resonance:
        <input
          type="range"
          min={0}
          max={1_000}
          step={1}
          value={
            typeof currentClip?.filter.Q === "number"
              ? (Math.log(currentClip.filter.Q / mindB) /
                  Math.log(maxdB / mindB)) *
                1_000
              : 1
          }
          onChange={(e) => {
            if (currentClip) {
              const position = parseInt(e.target.value);
              const Q = mindB * (maxdB / mindB) ** (position / 1_000);
              patchClip({
                filter: {
                  ...currentClip.filter,
                  ...{ Q },
                },
              });
            }
          }}
        />
      </label>
    </>
  );
}
