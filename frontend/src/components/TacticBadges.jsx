const TACTIC_STYLES = {
  Fear: "bg-red-50 text-red-700 border-red-200",
  Urgency: "bg-orange-50 text-orange-700 border-orange-200",
  Impersonation: "bg-purple-50 text-purple-700 border-purple-200",
  "Financial Pressure": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Credential Request": "bg-pink-50 text-pink-700 border-pink-200",
  "Trust Building": "bg-blue-50 text-blue-700 border-blue-200",
  Authority: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Social Proof": "bg-teal-50 text-teal-700 border-teal-200",
  Scarcity: "bg-amber-50 text-amber-700 border-amber-200",
};

const TACTIC_ICONS = {
  Fear: "😨",
  Urgency: "⏰",
  Impersonation: "🎭",
  "Financial Pressure": "💰",
  "Credential Request": "🔐",
  "Trust Building": "🤝",
  Authority: "👮",
  "Social Proof": "👥",
  Scarcity: "⌛",
};

export default function TacticBadges({ tactics }) {
  if (!tactics || tactics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tactics.map((t) => (
        <span
          key={t}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
            TACTIC_STYLES[t] || "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {TACTIC_ICONS[t] || "•"} {t}
        </span>
      ))}
    </div>
  );
}