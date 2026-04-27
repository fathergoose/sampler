import Waveform from "./Waveform";
import ClipParameters from "./ClipParameters";

export default function ClipEditor({
  arrayBuffer,
}: {
  arrayBuffer: ArrayBuffer | null;
}) {
  return arrayBuffer ? (
    <>
      <Waveform arrayBuffer={arrayBuffer} />
      <ClipParameters />
    </>
  ) : (
    <>Select a sample</>
  );
}
