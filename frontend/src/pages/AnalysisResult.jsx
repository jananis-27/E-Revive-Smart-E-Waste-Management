import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import AnalysisCards from "../components/AnalysisCards";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAnalysis } from "../services/wasteService";
import { getErrorMessage } from "../utils/format";

export default function AnalysisResult() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(state?.analysis || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (analysis) return;
    getAnalysis(id).then(setAnalysis).catch((e) => setError(getErrorMessage(e)));
  }, [id, analysis]);

  if (error) return <div className="container narrow"><div className="alert alert-error">{error}</div><button className="btn btn-outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</button></div>;
  if (!analysis) return <div className="container"><LoadingSpinner text="Loading analysis..." /></div>;

  const image = analysis.image || state?.preview;

  return (
    <div className="container narrow">
      <div className="center-head">
        <h1>Analysis Results</h1>
        <p className="muted">Here is what our Machine Learning model found.</p>
      </div>

      {analysis.demo && (
        <div className="alert alert-warn">
          <FlaskConical size={16} /> <span><strong>Demo result:</strong> this is placeholder content, not a real Machine Learning prediction.</span>
        </div>
      )}

      {image && <div className="result-image"><img src={image} alt="Uploaded e-waste" /></div>}

      <AnalysisCards analysis={analysis} />

      <div className="result-actions">
        <button className="btn btn-primary btn-block" onClick={() => navigate("/schedule-pickup", { state: { analysisId: analysis.id } })}>
          Proceed to Schedule Pickup
        </button>
        <button className="btn btn-outline btn-block" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}
