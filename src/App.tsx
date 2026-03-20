import "./App.css";
import SampleList from "./Samples";

function App() {
  const samples = [
    {
      title: "scanner beep",
      url: "http://localhost:8000/scanner-beep.mp3",
    },
  ];
  return (
    <div className="App">
      <SampleList samples={samples} />
    </div>
  );
}

export default App;
