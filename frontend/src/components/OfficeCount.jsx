export default function OfficeCount({ progress }) {
  if (!progress) return '—';

  return (
    <div>
      <p>
        {progress.cleared} / {progress.total}
      </p>
      {progress.flagged > 0 && (
        <p className="text-xs font-medium text-red-700">{progress.flagged} flagged</p>
      )}
    </div>
  );
}