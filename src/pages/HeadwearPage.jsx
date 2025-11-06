import "./HeadwearPage.css";
import { useNavigate } from "react-router-dom";

export default function HeadwearPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="headwear-page">
      {/* Top Bar */}
      <div className="hw-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <div className="seed-count">
          <span>🌱</span> 199
        </div>
      </div>

      {/* Title */}
      <div className="hw-title">
        Character Customization
      </div>

      {/* Grid */}
      <div className="hw-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div className="hw-item" key={i} role="button" tabIndex="0">
            <div className="image-placeholder" />
            <p className="item-name">Text Here</p>
            <p className="price">
              🌱 99
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
