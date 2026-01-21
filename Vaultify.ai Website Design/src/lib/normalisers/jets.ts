const genId = () => {
  const g = (globalThis as any).crypto;
  return g?.randomUUID ? g.randomUUID() : `jet-${Math.random().toString(36).slice(2, 10)}`;
};

export type JetListing = {
  id: string;
  title: string;
  route: string;
  priceDisplay: string;
  currency?: string;
  seats?: number;
  isEmptyLeg?: boolean;
  meta?: any;
};

export function normalizeJetListing(raw: any): JetListing {
  return {
    id: raw?.id || raw?.listingId || genId(),
    title: raw?.title || raw?.metadata?.aircraftName || 'Jet',
    route: raw?.routeSummary || raw?.metadata?.route || '—',
    priceDisplay: raw?.priceDisplay || 'On request',
    currency: raw?.currency,
    seats: raw?.seats,
    isEmptyLeg: Boolean(raw?.isEmptyLeg),
    meta: raw,
  };
}
