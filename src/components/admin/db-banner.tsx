export function DbBanner() {
  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Database not connected.</strong> Admin data and changes need a live
      PostgreSQL database. Set <code>DATABASE_URL</code> in <code>.env</code>, then run{" "}
      <code>npx prisma migrate dev</code> and <code>npm run db:seed</code>.
    </div>
  );
}
