const STYLES = {
  SAFE: "bg-green-50 text-safe border-green-200",
  SUSPICIOUS: "bg-amber-50 text-suspicious border-amber-200",
  HIGH_RISK: "bg-red-50 text-danger border-red-200",
};

const EMOJI = {
  SAFE: "🟢",
  SUSPICIOUS: "🟡",
  HIGH_RISK: "🔴",
};

export default function RiskBadge({ level, score }) {
  const style = STYLES[level] || "bg-gray-50 text-gray-600 border-gray-200";
  const emoji = EMOJI[level] || "⚪";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      {emoji} {level?.replace("_", " ")}
      {typeof score === "number" && (
        <span className="font-mono font-semibold ml-0.5">— {score}/100</span>
      )}
    </span>
  );
}