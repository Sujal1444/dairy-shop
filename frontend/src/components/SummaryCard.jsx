function SummaryCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="summary-card" style={{ "--accent": color }}>
      <div className="sc-glow" />
      <div className="sc-top">
        <div className="sc-icon" style={{ background: color + "22", color, boxShadow: `0 0 16px ${color}44` }}>
          {icon}
        </div>
        <span className="sc-badge" style={{ background: color + "18", color, border: `1px solid ${color}30` }}>
          Today
        </span>
      </div>
      <div className="sc-value">{value}</div>
      <div className="sc-footer">
        <p className="sc-title">{title}</p>
        <p className="sc-sub">{subtitle}</p>
      </div>
      <div className="sc-bar" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
    </div>
  );
}
export default SummaryCard;
