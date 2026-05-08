import { useState, useCallback, SetStateAction, Dispatch } from "react";

export default function useInitialNullState<T>(): [
  T | null,
  Dispatch<SetStateAction<T>>,
] {
  const [nullableT, setNullableT] = useState<T | null>(null);

  const setT = useCallback((s: T) => {
    setNullableT(s);
  }, []);

  return [nullableT, setT as Dispatch<SetStateAction<T>>];
}
