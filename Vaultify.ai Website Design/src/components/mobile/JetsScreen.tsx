import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import { normalizeJetListing, JetListing } from '../../lib/normalisers/jets';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, MapPin, Clock, Users, ShieldCheck } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useAuth } from '../../lib/useAuth';

interface CityResult { code?: string; name?: string; country?: string }

const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="w-full text-center py-10 text-[#F5F5F0]/60">
    <p className="text-lg mb-2">{title}</p>
    {subtitle && <p className="text-sm text-[#F5F5F0]/40">{subtitle}</p>}
  </div>
);

function JetCard({ item, onSelect }: { item: JetListing; onSelect: (item: JetListing) => void }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-[#D4AF7A]/40 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[#F5F5F0] font-semibold">
          <Plane size={18} />
          <span>{item.title || 'Jet'}</span>
        </div>
        {item.isEmptyLeg && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#D4AF7A]/20 text-[#D4AF7A]">Empty Leg</span>
        )}
      </div>
      <div className="text-sm text-[#F5F5F0]/70 mb-2">{item.route || '—'}</div>
      <div className="flex items-center gap-3 text-xs text-[#F5F5F0]/60">
        <span className="flex items-center gap-1"><Clock size={12} /> {item.meta?.depTime || '—'}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {item.seats ?? '—'} seats</span>
      </div>
      <div className="mt-3 text-[#D4AF7A] font-semibold">{item.priceDisplay || 'On request'}</div>
    </button>
  );
}

export function JetsScreen() {
  const { user } = useAuth();
  const [emptyLegs, setEmptyLegs] = useState<JetListing[]>([]);
  const [charterResults, setCharterResults] = useState<JetListing[]>([]);
  const [loadingEmpty, setLoadingEmpty] = useState(false);
  const [loadingCharter, setLoadingCharter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<JetListing | null>(null);

  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromCity, setFromCity] = useState<CityResult | null>(null);
  const [toCity, setToCity] = useState<CityResult | null>(null);
  const [date, setDate] = useState('');
  const [pax, setPax] = useState('4');
  const [cityOptions, setCityOptions] = useState<CityResult[]>([]);
  const [cityLoading, setCityLoading] = useState(false);

  useEffect(() => {
    const loadEmptyLegs = async () => {
      try {
        setLoadingEmpty(true);
        setError(null);
        const resp = await apiGet<{ listings?: any[]; offers?: any[] }>('/jets/search/empty-legs', {
          currencyType: 'USD',
          pageNum: 1,
          pageSize: 12,
        });
        const list = (resp.listings || []).map(normalizeJetListing);
        setEmptyLegs(list);
      } catch (err: any) {
        setError('Could not load empty legs');
        setEmptyLegs([]);
      } finally {
        setLoadingEmpty(false);
      }
    };
    loadEmptyLegs();
  }, []);

  const fetchCities = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q || q.length < 3) return;
        try {
          setCityLoading(true);
          const resp = await apiGet<{ results?: CityResult[] }>('/jets/locations/cities', { q });
          setCityOptions(resp.results || []);
        } catch (_e) {
          setCityOptions([]);
        } finally {
          setCityLoading(false);
        }
      }, 300),
    []
  );

  const runCharterSearch = async () => {
    setLoadingCharter(true);
    setError(null);
    try {
      const trips = [
        {
          depCity: fromCity?.code || fromQuery,
          arrCity: toCity?.code || toQuery,
          depTime: date,
          pax,
        },
      ];
      const resp = await apiPost<{ listings?: any[]; offers?: any[] }>('/jets/search/charter', {
        currencyType: 'USD',
        queryType: 'city',
        tripType: 'one-way',
        trips,
      });
      setCharterResults((resp.listings || []).map(normalizeJetListing));
    } catch (err: any) {
      setError('Search failed');
      setCharterResults([]);
    } finally {
      setLoadingCharter(false);
    }
  };

  const handleInquiry = async (item: JetListing) => {
    if (!user) {
      setError('Please log in to submit a request.');
      return;
    }
    try {
      const name = user.displayName || 'Guest User';
      const [firstName, ...rest] = name.split(' ');
      const lastName = rest.join(' ') || 'Client';
      const email = user.email || 'client@example.com';
      const body = item.isEmptyLeg
        ? {
            emptyLegId: item.meta?.vendorRefId || item.id,
            firstName,
            lastName,
            email,
            phoneAreaCode: '',
            phoneNumber: '',
            depTime: item.meta?.depTime,
            message: 'Vaultfy app inquiry',
          }
        : {
            firstName,
            lastName,
            email,
            tripType: 'one-way',
            message: 'Vaultfy app charter inquiry',
            trips: [
              {
                depCity: item.meta?.depCity || item.route?.split('→')[0]?.trim(),
                arrCity: item.meta?.arrCity || item.route?.split('→')[1]?.trim(),
                depTime: item.meta?.depTime || date,
                pax,
              },
            ],
            aircraftList: [item.meta || item],
          };
      const endpoint = item.isEmptyLeg ? '/jets/inquiries/empty-leg' : '/jets/inquiries/charter';
      await apiPost(endpoint, body, { requireAuth: true });
      setSelected(null);
      alert('Inquiry submitted to Jetbay.');
    } catch (err: any) {
      setError('Could not submit inquiry');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#F5F5F0]/50">Jets</p>
          <h2 className="text-xl font-semibold text-[#F5F5F0]">Empty Legs</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#F5F5F0]/60">
          <ShieldCheck size={14} /> Internal API
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 gap-3">
        {loadingEmpty && <div className="animate-pulse h-24 rounded-2xl bg-white/5" />}
        {!loadingEmpty && emptyLegs.length === 0 && <EmptyState title="No empty legs right now" subtitle="Check back soon or run a charter search." />}
        {!loadingEmpty && emptyLegs.map((item) => <JetCard key={item.id} item={item} onSelect={setSelected} />)}
      </div>

      <div className="pt-2">
        <h3 className="text-lg text-[#F5F5F0] mb-2">Charter Search</h3>
        <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#F5F5F0]/60">From</label>
              <Input
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  fetchCities(e.target.value);
                }}
                placeholder="City or airport"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#F5F5F0]/60">To</label>
              <Input
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  fetchCities(e.target.value);
                }}
                placeholder="City or airport"
              />
            </div>
          </div>
          {cityLoading && <div className="text-xs text-[#F5F5F0]/50">Searching cities...</div>}
          {cityOptions.length > 0 && (
            <div className="text-xs text-[#F5F5F0]/80 space-y-1">
              {cityOptions.slice(0, 5).map((c) => (
                <button
                  key={`${c.code}-${c.name}`}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-white/10"
                  onClick={() => {
                    if (!fromCity) {
                      setFromCity(c);
                      setFromQuery(c.name || c.code || '');
                    } else {
                      setToCity(c);
                      setToQuery(c.name || c.code || '');
                    }
                    setCityOptions([]);
                  }}
                >
                  {c.name || c.code} {c.country ? `(${c.country})` : ''}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#F5F5F0]/60">Departure</label>
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#F5F5F0]/60">Passengers</label>
              <Input type="number" min={1} value={pax} onChange={(e) => setPax(e.target.value)} />
            </div>
          </div>
          <Button disabled={loadingCharter} onClick={runCharterSearch} className="w-full bg-[#D4AF7A] text-black">
            {loadingCharter ? 'Searching…' : 'Search charter'}
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-lg text-[#F5F5F0] mb-2">Charter Results</h3>
        <div className="grid grid-cols-1 gap-3">
          {loadingCharter && <div className="animate-pulse h-24 rounded-2xl bg-white/5" />}
          {!loadingCharter && charterResults.length === 0 && <EmptyState title="No results yet" subtitle="Run a charter search to see options." />}
          {!loadingCharter && charterResults.map((item) => <JetCard key={item.id} item={item} onSelect={setSelected} />)}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <Sheet open onOpenChange={(v) => !v && setSelected(null)}>
            <SheetContent side="bottom" className="bg-[#0B0B0B] text-white border-t border-white/10 max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2 text-white">
                  <Plane size={16} />
                  <span>{selected.route}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <MapPin size={14} /> {selected.meta?.depCity || '—'} → {selected.meta?.arrCity || '—'}
                </div>
                <div className="text-xs text-white/60 flex items-center gap-2">
                  <Clock size={14} /> {selected.meta?.depTime || '—'}
                </div>
                <div className="text-xs text-white/60 flex items-center gap-2">
                  <Users size={14} /> {selected.seats ?? '—'} seats
                </div>
                <div className="text-lg text-[#D4AF7A] font-semibold">{selected.priceDisplay}</div>
              </div>
              <Button className="mt-4 w-full bg-[#D4AF7A] text-black" onClick={() => handleInquiry(selected)}>
                Request this jet
              </Button>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

// simple debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
