import { STATUS_LABELS } from "../../utils/helpers";
import "./Statusbadge.css";

export default function StatusBadge({ status, themeColor }) {
  if (!status) return null;

  const style = themeColor
    ? {
        "--badge-color": "#000",
        "--badge-bg": themeColor,
        "--badge-border": themeColor,
      }
    : {};

  return (
    <span className="status-badge" style={style} data-status={status}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
