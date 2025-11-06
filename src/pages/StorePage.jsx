import "./StorePage.css";
import { useNavigate } from "react-router-dom";

export default function StorePage() {
  const navigate = useNavigate();

  const goToHeadwear = () => {
    navigate("/headwear");
  };

  return (
    <div className="store-page">
      {/* Top Bar */}
      <div className="store-header">
        <button className="back-btn">←</button>
        <div className="seed-count">
          <span>🌱</span> 199
        </div>
      </div>

      {/* Title */}
      <h1 className="store-title">Store</h1>

      {/* Customization Section */}
      <div className="store-section">
        <h2 className="section-title">Character Customization</h2>

        <div className="decor-grid">

          {/* ✅ Clickable Headwear */}
          <div
            className="decor-item"
            onClick={goToHeadwear}
            role="button"
            tabIndex={0}
          >
            <div className="decor-icon"></div>
            <span className="decor-name">Headwear</span>
            <span className="decor-progress">0 / 10</span>
          </div>

          {/* ✅ Other Items (not wired yet) */}
          <div className="decor-item" role="button" tabIndex={0}>
            <div className="decor-icon"></div>
            <span className="decor-name">Glasses</span>
            <span className="decor-progress">0 / 10</span>
          </div>

          <div className="decor-item" role="button" tabIndex={0}>
            <div className="decor-icon"></div>
            <span className="decor-name">Clothing</span>
            <span className="decor-progress">0 / 10</span>
          </div>
        </div>
      </div>

      {/* Future Sections */}
      <div className="store-section">
        <h2 className="section-title">Coming Soon</h2>
        <p className="placeholder-text">More customization items are on the way!</p>
      </div>
    </div>
  );
}
