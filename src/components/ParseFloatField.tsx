import { useState, useEffect } from "react";

interface ParseFloatFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

export default function ParseFloatField({
  label,
  value,
  onChange,
}: ParseFloatFieldProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <>
      <label>{label}</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) onChange(val);
        }}
      />
    </>
  );
}
