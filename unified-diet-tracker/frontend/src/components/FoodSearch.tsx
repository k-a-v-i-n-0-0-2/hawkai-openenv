import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Minus, ChevronRight, Flame, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  region?: string;
  category?: string;
  is_vegetarian?: boolean;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  serving_size_g: number;
  serving_description: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
}

interface FoodSearchProps {
  slotName: string;
  date: string;
  onClose: () => void;
  onLogged: () => void;
}

export default function FoodSearch({ slotName, date, onClose, onLogged }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [unit, setUnit] = useState<'serving' | 'gram'>('serving');
  const [amount, setAmount] = useState(1);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load popular foods on mount
  useEffect(() => {
    searchFoods('');
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const searchFoods = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods/search?q=${encodeURIComponent(q)}&limit=20`);
      const json = await res.json();
      if (json.success) {
        setResults(json.results);
      }
    } catch (err) {
      console.error('Food search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchFoods(val), 300);
  };

  const handleLogFood = async () => {
    if (!selectedFood || logging) return;
    setLogging(true);
    
    // Calculate servings for backend
    const servingsPayload = unit === 'serving' ? amount : amount / selectedFood.serving_size_g;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/tracker/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: selectedFood.id,
          slot_name: slotName,
          servings: servingsPayload,
          date: date,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLogSuccess(true);
        setTimeout(() => {
          onLogged();
          setLogSuccess(false);
          setSelectedFood(null); // Go back to search list instead of closing
          setQuery(''); // Reset query to show default list
          searchFoods('');
        }, 1000);
      }
    } catch (err) {
      console.error('Log food error:', err);
    } finally {
      setLogging(false);
    }
  };

  // Food detail view
  if (selectedFood) {
    const multiplier = unit === 'serving' ? amount : amount / selectedFood.serving_size_g;
    const cal = Math.round(selectedFood.calories_per_serving * multiplier);
    const pro = Math.round(selectedFood.protein_per_serving * multiplier);
    const carb = Math.round(selectedFood.carbs_per_serving * multiplier);
    const fat = Math.round(selectedFood.fat_per_serving * multiplier);
    const totalGrams = unit === 'serving' ? Math.round(selectedFood.serving_size_g * amount) : amount;

    return createPortal(
      <div className="fixed inset-0 z-[70] flex flex-col bg-[#0a0a0a] animate-slideUp">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3.5 bg-[#1A1B1E] border-b border-white/5">
          <button onClick={() => setSelectedFood(null)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white truncate">{selectedFood.name}</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {selectedFood.brand || selectedFood.region || 'Food'} • {slotName}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Calorie hero */}
          <div className="bg-[#1A1B1E] rounded-3xl p-6 border border-white/5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FF6B00]/20 flex items-center justify-center border border-[#FF6B00]/30 mx-auto mb-3">
              <Flame className="w-7 h-7 text-[#FF6B00]" />
            </div>
            <p className="text-4xl font-black text-white">{cal}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Calories</p>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Protein', value: pro, color: '#00E5FF', unit: 'g' },
              { label: 'Carbs', value: carb, color: '#FF6B00', unit: 'g' },
              { label: 'Fat', value: fat, color: '#B388FF', unit: 'g' },
            ].map(m => (
              <div key={m.label} className="bg-[#1A1B1E] rounded-2xl p-4 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-xl font-black" style={{ color: m.color }}>{m.value}{m.unit}</p>
              </div>
            ))}
          </div>

          {/* Serving selector */}
          <div className="bg-[#1A1B1E] rounded-3xl p-5 border border-white/5 relative">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Measure</p>
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => { setUnit('serving'); setAmount(1); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${unit === 'serving' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Servings
                </button>
                <button
                  onClick={() => { setUnit('gram'); setAmount(Math.round(selectedFood.serving_size_g)); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${unit === 'gram' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Grams
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setAmount(Math.max(unit === 'serving' ? 0.25 : 5, amount - (unit === 'serving' ? 0.5 : 10)))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <div className="text-center w-24">
                <p className="text-3xl font-black text-white">{amount}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                  {unit === 'serving' ? `${totalGrams}g total` : 'grams'}
                </p>
              </div>
              <button
                onClick={() => setAmount(amount + (unit === 'serving' ? 0.5 : 10))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
            {unit === 'serving' && (
              <p className="text-[10px] text-gray-600 text-center mt-3">{selectedFood.serving_description}</p>
            )}
          </div>
        </div>

        {/* Log button */}
        <div className="px-4 py-4 bg-[#1A1B1E] border-t border-white/5">
          <button
            onClick={handleLogFood}
            disabled={logging || logSuccess}
            className={`w-full py-4 rounded-full text-white text-sm font-bold transition-all ${
              logSuccess
                ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : 'bg-gradient-to-r from-[#FF6B00] to-[#ea580c] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] active:translate-y-0'
            }`}
          >
            {logSuccess ? '✅ Logged!' : logging ? 'Logging...' : `Add to ${slotName} — ${cal} kcal`}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Search view
  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0a0a0a] animate-slideUp">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3.5 bg-[#1A1B1E] border-b border-white/5">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">Add to {slotName}</h2>
          <p className="text-[10px] font-bold text-[#FF6B00] tracking-wider uppercase">50,000+ Indian Foods</p>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-4 py-3 bg-[#1A1B1E]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search foods... (e.g. idli, paneer, rice)"
            className="w-full pl-11 pr-10 py-3 rounded-full border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-[#FF6B00] transition-colors placeholder:text-gray-600"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); searchFoods(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading && results.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-bold">No foods found</p>
            <p className="text-[10px] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => { setSelectedFood(food); setUnit('serving'); setAmount(1); setLogSuccess(false); }}
                className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left active:bg-white/10"
              >
                {/* Veg/Non-veg indicator */}
                <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 ${food.is_vegetarian ? 'border-green-500' : 'border-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${food.is_vegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{food.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {food.serving_description} • {food.region || 'India'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#FF6B00]">{Math.round(food.calories_per_serving)}</p>
                  <p className="text-[9px] text-gray-600 font-bold">kcal</p>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
