export default function RiskMeter({ probability }) {
  const pct = Math.round(probability * 100);
  const left = Math.min(Math.max(pct, 2), 98);
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`Estimated risk ${pct} percent`}>
      <div className="meter-marker" style={{ left: `${left}%` }}>
        <b>{pct}%</b>
        <i />
      </div>
      <div className="meter-track"><span /><span /><span /></div>
      <div className="meter-scale"><span>Low</span><span>Moderate</span><span>Higher</span></div>
    </div>
  );
}
