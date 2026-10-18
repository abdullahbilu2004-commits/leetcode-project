const styles = {
  Easy: "text-easy bg-easy/10 border-easy/30",
  Medium: "text-medium bg-medium/10 border-medium/30",
  Hard: "text-hard bg-hard/10 border-hard/30",
};
export default function DifficultyBadge({ level }) {
  if (!level) return <span className="text-xs text-muted">Unknown</span>;
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles[level] || ""}`}>{level}</span>;
}
