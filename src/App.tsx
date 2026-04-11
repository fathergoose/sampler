import {useState, useEffect} from 'react';
import "./App.css";
import SampleList from "./Samples";

function App() {
  const [samples, setSamples] = useState([])
  useEffect(() => {
    const getSamples = async () => {
      const result = await fetch('http://localhost:3000/api/samples/all');
      const body = await result.json();
      console.log(body);
      setSamples(body);
    }
  
    getSamples();
    return () => {
      return
    }
  }, [])
  
  return (
    <div className="App">
      <SampleList samples={samples} />
    </div>
  );
}

export default App;
