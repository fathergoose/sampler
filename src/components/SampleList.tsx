import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Clip, Sample } from "./Clips";
import "./Clips.css";

interface SampleListParams {
  currentClip: Clip;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
}

export default function ({ currentClip, setCurrentClip }: SampleListParams) {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    const getSamples = async () => {
      const result = await fetch("http://localhost:3000/api/samples/all");
      const body = await result.json();
      setSamples(body);
    };
    getSamples();
    return () => {
      return;
    };
  }, []);

  return (
    <div className="sampleList">
      {samples?.map((sample) => (
        <div
          key={sample.id}
          className={
            sample.id === currentClip.sample?.id
              ? "sampleListSelected"
              : "sampleListItem"
          }
          onClick={() => setCurrentClip({ ...currentClip, sample })}
        >
          {sample.name}
        </div>
      ))}
    </div>
  );
}
