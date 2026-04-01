function SummaryCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="summary-card" style={{ "--accent": color }}>
      <div className="sc-top">
        <div className="sc-icon" style={{ background: color + "22", color }}>
          {icon}
        </div>
        <div>
          <p className="sc-title">{title}</p>
          <p className="sc-sub">{subtitle}</p>
        </div>
      </div>
      <div className="sc-value">{value}</div>
    </div>
  );
}
export default SummaryCard;
