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
      // TODO: Find real min and max values to use here
      setClipList(
        body.map(
          (c: Clip): Clip => ({
            ...c,
            ...{
              envelope: { attack: 0, decay: 0.5, sustain: 0, release: 0 },
              filter: {
                frequency: 22000,
                detune: 0,
                Q: 0,
                gain: 1,
                type: "lowpass",
              },
            },
          }),
        ),
      );
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
