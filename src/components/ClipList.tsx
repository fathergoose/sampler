import { useEffect, useState } from "react";
import { Clip } from "./Clips";

export default function ClipList() {
  const [clips, setClips] = useState<Clip[]>();
  useEffect(() => {
    const getClips = async () => {
      const result = await fetch("/api/clips/all");
      const body = await result.json();
      setClips(body);
    };
    getClips();
    return () => {
      return;
    };
  }, []);

  return (
    <div>
      {clips && clips.length > 0
        ? clips?.map((clip) => (
            <div key={clip.id}>
              {clip.name}, {clip.startAt}, {clip.endAt}, {clip.gain}
            </div>
          ))
        : "No Clips loaded"}
    </div>
  );
}
