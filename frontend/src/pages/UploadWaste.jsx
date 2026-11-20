import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyzeImage } from "../services/wasteService";
import { getErrorMessage } from "../utils/format";

export default function UploadWaste() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const analysis = await analyzeImage(file, setProgress);
      navigate(`/analysis/${analysis.id}`, { state: { analysis, preview: URL.createObjectURL(file) } });
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      {loading && <LoadingSpinner overlay text={progress > 0 && progress < 100 ? `Uploading... ${progress}%` : "Analyzing your e-waste..."} />}
      <div className="center-head">
        <h1>Upload E-Waste</h1>
        <p className="muted">Take a photo of your electronic waste for Machine Learning-powered analysis.</p>
      </div>
      <div className="card upload-card">
        <ImageUpload file={file} onChange={setFile} disabled={loading} />
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={!file || loading} onClick={analyze}>
          Analyze E-Waste
        </button>
      </div>
    </div>
  );
}
