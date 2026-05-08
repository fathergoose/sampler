import { Dispatch, SetStateAction, useEffect } from "react";
import { Clip } from "./Clips";

interface ClipProps {
  clipList: Clip[];
  setClipList: Dispatch<SetStateAction<Clip[]>>;
  currentClip: Clip | null;
  setCurrentClip: Dispatch<SetStateAction<Clip>>;
}
export default function ClipList({
  clipList,
  setClipList,
  currentClip,
  setCurrentClip,
}: ClipProps) {
  useEffect(() => {
    const getClips = async () => {
      const result = await fetch("/api/clips/all");
      const body = await result.json();
      console.log(body);
      setClipList(body);
    };
    getClips();
    return () => {
      return;
    };
  }, [setClipList]);

  return (
    <>
      <h1>Clips</h1>
      <div className="clipList">
        {clipList.length > 0
          ? clipList?.map((clip) => (
              <div
                className={
                  clip.id === currentClip?.id ? "listSelected" : "listItem"
                }
                key={clip.id}
                onClick={() => setCurrentClip(clip)}
              >
                {clip.name}:{clip.sample?.name}
              </div>
            ))
          : "No Clips loaded"}
      </div>
    </>
  );
}
