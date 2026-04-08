import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Minus, ChevronRight, Flame, ArrowLeft, Share2, AlertCircle, BookOpen, Wheat, Droplets, Dna } from 'lucide-react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';
import { getFoodImage, getFoodPlaceholder } from '../utils/foodUtils';

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
  is_ai_enriched?: boolean;
  iron_per_100g?: number;
  calcium_per_100g?: number;
  vit_a_per_100g?: number;
  vit_c_per_100g?: number;
  potassium_per_100g?: number;
  measures?: Record<string, number>;
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
  const [unit, setUnit] = useState<string>('serving');
  const [amount, setAmount] = useState(1);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSelectFood = async (food: FoodItem) => {
    setSelectedFood(food);
    setUnit('serving');
    setAmount(1);

    if (food.is_ai_enriched) return;

    setEnriching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_id: food.id })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedFood(prev => {
           if (prev?.id === food.id) {
               return { ...prev, ...json.enriched, is_ai_enriched: true };
           }
           return prev;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnriching(false);
    }
  };

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
    
    // Calculate total grams explicitly
    const baseWeights: Record<string, number> = {
       serving: selectedFood.serving_size_g,
       gram: 1,
       ...(selectedFood.measures || {})
    };
    const unitWeight = baseWeights[unit] || selectedFood.serving_size_g;
    const quantityG = amount * unitWeight;
    const servingsPayload = quantityG / selectedFood.serving_size_g;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/tracker/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: selectedFood.id,
          slot_name: slotName,
          servings: servingsPayload,
          quantity_g: quantityG,
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
    const baseWeights: Record<string, number> = {
      serving: selectedFood.serving_size_g,
      gram: 1,
      ...(selectedFood.measures || {})
    };
    
    // Only map options that have a valid >0 weight
    const allUnits = Object.entries(baseWeights)
      .filter(([_, w]) => w > 0)
      .map(([name]) => name);

    const currentUnitWeight = baseWeights[unit] || selectedFood.serving_size_g;
    const totalGrams = Math.round(amount * currentUnitWeight);
    const multiplier100g = totalGrams / 100;
    
    const cal = Math.round(selectedFood.calories_per_100g * multiplier100g);
    const pro = Math.round(selectedFood.protein_per_100g * multiplier100g);
    const carb = Math.round(selectedFood.carbs_per_100g * multiplier100g);
    const fat = Math.round(selectedFood.fat_per_100g * multiplier100g);
    
    const iron = Math.round((selectedFood.iron_per_100g || 0) * multiplier100g);
    const calcium = Math.round((selectedFood.calcium_per_100g || 0) * multiplier100g);
    const potassium = Math.round((selectedFood.potassium_per_100g || 0) * multiplier100g);
    const vit_c = Math.round((selectedFood.vit_c_per_100g || 0) * multiplier100g);

    return createPortal(
      <div className="fixed inset-0 z-[70] flex flex-col bg-[#f0f2f5] dark:bg-[#0a0a0a] animate-slideUp overflow-hidden">
        {/* Navigation */}
        <header className="flex items-center justify-between px-6 py-4 bg-transparent">
          <button onClick={() => setSelectedFood(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 text-gray-500">
            <Share2 className="w-6 h-6 cursor-pointer hover:text-[#FF6B00]" />
            <AlertCircle className="w-6 h-6 cursor-pointer hover:text-red-500" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="max-w-md mx-auto space-y-6">
            
            {/* Hero Image Section */}
            <div className="relative rounded-[32px] overflow-hidden aspect-[16/9] shadow-2xl group border border-black/10 dark:border-white/10 bg-[#1A1B1E] flex items-center justify-center">
              <img 
                src={getFoodImage(selectedFood.id, selectedFood.name, 'hero') || getFoodPlaceholder(selectedFood.name)} 
                alt={selectedFood.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).src = getFoodPlaceholder(selectedFood.name) }}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h2 className="text-2xl font-black text-white leading-tight">{selectedFood.name}</h2>
              </div>
              <button className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 text-white hover:bg-black/60 transition-all active:scale-95">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Recipe</span>
              </button>
            </div>

            {/* Selectors Section */}
            <div className="bg-white dark:bg-[#1A1B1E] rounded-[32px] p-6 border dark:border-white/5 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                {/* Quantity */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Quantity</label>
                  <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-white/5 rounded-2xl p-2 border dark:border-white/5">
                    <button 
                      onClick={() => setAmount(Math.max(unit === 'serving' ? 0.25 : 5, amount - (unit === 'serving' ? 0.5 : 10)))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm text-gray-500 hover:text-black dark:text-white transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black">{amount}</span>
                    <button 
                      onClick={() => setAmount(amount + (unit === 'serving' ? 0.5 : 10))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm text-gray-500 hover:text-black dark:text-white transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Measure Dropdown */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Measure</label>
                  <div className="relative">
                    <select 
                      value={unit} 
                      onChange={(e) => { setUnit(e.target.value); setAmount(1); }}
                      className="w-full appearance-none bg-[#f8fafc] dark:bg-white/5 rounded-2xl p-3 pl-4 pr-10 border dark:border-white/10 group transition-all outline-none font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider focus:border-[#FF6B00]/40"
                    >
                      {allUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Card */}
            <div className="space-y-4">
              <h3 className="text-sm font-black dark:text-white tracking-wide pl-2 uppercase">Macronutrients Breakdown</h3>
              <div className="bg-white dark:bg-[#1A1B1E] rounded-[40px] p-8 border dark:border-white/5 shadow-lg space-y-6">
                
                {/* Calories Display */}
                <div className="flex justify-between items-center border-b dark:border-white/5 pb-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Calories</label>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-gray-800 dark:text-white">{cal}</span>
                      <span className="text-lg font-bold text-gray-400 leading-none">Cal</span>
                    </div>
                  </div>
                  <div className="bg-[#f0f9ff] dark:bg-[#00E5FF]/10 text-[#00E5FF] px-4 py-1.5 rounded-full border border-[#00E5FF]/20 text-[11px] font-black uppercase tracking-widest">
                    Net wt: {totalGrams} g
                  </div>
                </div>

                {/* Macro List */}
                <div className="space-y-5">
                  {[
                    { label: 'Proteins', value: pro, icon: Dna, color: 'text-indigo-500' },
                    { label: 'Fats', value: fat, icon: Droplets, color: 'text-amber-500' },
                    { label: 'Carbs', value: carb, icon: Wheat, color: 'text-[#FF6B00]' },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110`}>
                          <m.icon className={`w-5 h-5 ${m.color}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{m.label}</span>
                      </div>
                      <span className="text-sm font-black dark:text-white">{m.value} g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#f0f2f5] dark:from-[#0a0a0a] via-[#f0f2f5] dark:via-[#0a0a0a] to-transparent">
          <button
            onClick={handleLogFood}
            disabled={logging || logSuccess}
            className={`w-full py-5 rounded-[24px] text-white text-base font-black tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2 ${
              logSuccess
                ? 'bg-green-500 shadow-[0_15px_30px_rgba(34,197,94,0.3)]'
                : 'bg-[#1e6154] hover:bg-[#164c42] shadow-[0_15px_30px_rgba(30,97,84,0.3)]'
            }`}
          >
            {logSuccess ? 'Added Perfectly' : logging ? 'Logging...' : `Add to ${slotName}`}
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
                onClick={() => { setLogSuccess(false); handleSelectFood(food); }}
                className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-white/5 transition-colors text-left active:bg-white/10"
              >
                {/* Food Image with Overlapping Veg/Non-veg indicator */}
                <div className="relative shrink-0">
                  <img 
                    src={getFoodImage(food.id, food.name, 'thumb') || getFoodPlaceholder(food.name)} 
                    alt={food.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg bg-[#1A1B1E]"
                    onError={(e) => { (e.target as HTMLImageElement).src = getFoodPlaceholder(food.name) }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1A1B1E] border-2 flex items-center justify-center ${food.is_vegetarian ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${food.is_vegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
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
