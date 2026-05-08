import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Clip, Sample } from "./Clips";
import "./Clips.css";

interface SampleListProps {
  currentClip: Clip | null;
  patchClip: (updates: Partial<Clip>) => Promise<void>;
}

export default function SampleList({
  currentClip,
  patchClip,
}: SampleListProps) {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    const getSamples = async () => {
      const result = await fetch("/api/samples/all");
      const body = await result.json();
      setSamples(body);
    };
    getSamples();
    return () => {
      return;
    };
  }, []);

  return (
    <>
      <h1>Samples</h1>
      <div className="sampleList">
        {samples?.map((sample) => (
          <div
            key={sample.id}
            className={
              sample.id === currentClip?.sample?.id
                ? "listSelected"
                : "listItem"
            }
            onClick={() => currentClip && patchClip({ ...currentClip, sample })}
          >
            {sample.name}
          </div>
        ))}
      </div>
    </>
  );
}
