export default function Control({ handleClick }: { handleClick: () => void }) {
  return <div onClick={handleClick}>Play</div>;
}
