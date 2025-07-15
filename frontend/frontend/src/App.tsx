import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Editor from './components/Editor';
import Main from './components/Main';
import Report from './components/Report';

const report = {
  "Type of Crack": "The uploaded image reveals a thin, vertical crack extending downward in a mostly straight path. This pattern is consistent with a longitudinal crack typically found in walls or pavements due to tensile stress.",
  
  "Likely Cause": "The most probable cause of this crack is thermal expansion and contraction over time, combined with foundational settling. Minor shifts in the structure or fluctuations in temperature can create stress lines like this.",
  
  "Severity Level": "This is a minor to moderate crack. It does not yet exhibit branching, spalling, or significant width, but its length and location suggest that progression is possible if not addressed. Moisture intrusion might already be occurring.",
  
  "Recommended Next Step": "Seal the crack with a flexible filler or epoxy resin designed for structural cracks. Monitor over the next few months for any changes in size or direction. Consider a professional inspection if worsening is noticed.",
  
  "Preventive Measures": "Maintain consistent indoor humidity levels, reinforce structural supports if needed, and regularly inspect walls for early signs of stress. Ensure proper drainage around the structure to prevent moisture-related expansion."
}


function App() {
  const [reportData, setReportData] = useState<{ image: string; report: any } | null>(null);

  return (
    <>
      {!reportData ? (
        <Main onReportReady={setReportData} />
      ) : (
        <Report image={reportData.image} report={reportData.report} onBack={() => setReportData(null)} />
      )}
    </>
  );
}

export default App;
