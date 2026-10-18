const tone = (s) =>
  s === "Accepted" ? "text-easy"
  : ["Samples Passed", "Not graded", "Judge Error", "Executed"].includes(s) ? "text-medium" : "text-hard";
export default function StatusText({ status }) {
  return <span className={`font-medium ${tone(status)}`}>{status}</span>;
}
