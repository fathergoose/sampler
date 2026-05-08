import { Dispatch, SetStateAction, useEffect } from "react";
import { Clip } from "./Clips";

interface ClipProps {
  clipList: Clip[];
  setClipList: Dispatch<SetStateAction<Clip[]>>;
  currentClipId: number | null;
  setCurrentClipId: Dispatch<SetStateAction<number | null>>;
}
export default function ClipList({
  clipList,
  setClipList,
  currentClipId,
  setCurrentClipId,
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
                  clip.id === currentClipId ? "listSelected" : "listItem"
                }
                key={clip.id}
                onClick={() => setCurrentClipId(clip.id)}
              >
                {clip.name}:{clip.sample?.name}
              </div>
            ))
          : "No Clips loaded"}
      </div>
    </>
  );
}
