import { getStatusLabel, getStatusTone } from '../../utils/status';
import Badge from './Badge';

export default function StatusBadge({ status, className }) {
  return (
    <Badge tone={getStatusTone(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}