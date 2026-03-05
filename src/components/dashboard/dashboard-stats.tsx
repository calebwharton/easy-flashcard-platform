type DashboardStatsProps = {
  deckCount: number;
  totalCards: number;
};

export function DashboardStats({ deckCount, totalCards }: DashboardStatsProps) {
  const statItems = [
    { label: "Decks", value: deckCount },
    { label: "Cards", value: totalCards },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {statItems.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
