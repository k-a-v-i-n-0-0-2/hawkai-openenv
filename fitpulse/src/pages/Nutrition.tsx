import { useState, useEffect } from 'react';
import { Flame, Utensils, Coffee, Apple, Search, Plus, Trash2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import PageTransition from '../components/PageTransition';
import FoodSearch from '../components/FoodSearch';
import { API_BASE_URL } from '../config';
import NutritionLoader from '../components/NutritionLoader';
import { format } from 'date-fns';
import { getFoodImage, getFoodPlaceholder } from '../utils/foodUtils';

interface MealItem {
  id: number;
  food_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealSlot {
  items: MealItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  is_default: boolean;
}

interface NutritionData {
  meals: Record<string, MealSlot>;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    iron: number;
    calcium: number;
    vit_a: number;
    vit_c: number;
    potassium: number;
  };
  goals: {
    calorie_goal: number;
    protein_goal: number;
    carbs_goal: number;
    fat_goal: number;
  };
  goal_status: string;
  calorie_percentage: number;
}

export default function Nutrition() {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NutritionData | null>(null);
  const [selectedDate] = useState(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tracker/day/${dateStr}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [selectedDate]);

  const removeFood = async (logId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tracker/remove/${logId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchNutrition();
      }
    } catch (err) {
      console.error('Remove food error:', err);
    }
  };

  const caloriesRemaining = data ? Math.max(0, data.goals.calorie_goal - data.totals.calories) : 0;

  if (loading && !data) {
    return (
      <PageTransition className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <NutritionLoader />
      </PageTransition>
    );
  }

  const mealCards = [
    { name: 'Breakfast', icon: Coffee, bgColor: 'bg-[#FF6B00]/20', iconColor: 'text-[#FF6B00]', borderColor: 'border-[#FF6B00]/30' },
    { name: 'Lunch', icon: Utensils, bgColor: 'bg-[#00E5FF]/20', iconColor: 'text-[#00E5FF]', borderColor: 'border-[#00E5FF]/30' },
    { name: 'Dinner', icon: Utensils, bgColor: 'bg-[#B388FF]/20', iconColor: 'text-[#B388FF]', borderColor: 'border-[#B388FF]/30' },
    { name: 'Snacks', icon: Apple, bgColor: 'bg-[#00E5FF]/20', iconColor: 'text-[#00E5FF]', borderColor: 'border-[#00E5FF]/30' }
  ];

  return (
    <PageTransition className="min-h-screen bg-[#0a0a0a] pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-40">
        <h1 className="text-2xl font-black tracking-[0.1em] text-white">NUTRITION</h1>
        <button onClick={() => setActiveSlot('Breakfast')} className="w-10 h-10 rounded-full bg-[#1A1B1E] flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors">
          <Search className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Date Selector */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm font-bold">{format(selectedDate, 'EEEE, MMM d')}</p>
          <p className="text-[10px] font-bold text-[#FF6B00] tracking-[0.2em] uppercase mt-1">DAILY LOG</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1A1B1E] rounded-full p-1 border border-white/5">
          <button className="px-4 py-1.5 rounded-full text-gray-500 text-[10px] font-bold tracking-wider uppercase hover:text-white transition-colors">YEST</button>
          <button className="px-4 py-1.5 rounded-full bg-[#3A2010] text-[#FF6B00] text-[10px] font-bold tracking-wider uppercase">TODAY</button>
        </div>
      </div>

      {/* Calories Summary */}
      <div className="px-6 mb-8">
        <div className="bg-[#1A1B1E] rounded-[32px] p-6 border border-white/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">CALORIES REMAINING</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{caloriesRemaining.toLocaleString()}</span>
                <span className="text-sm font-bold text-gray-500">kcal</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${data?.goal_status === 'red' ? 'bg-red-500/20 border-red-500/30' : 'bg-[#FF0055]/20 border-[#FF0055]/30'}`}>
              <Flame className={`w-6 h-6 ${data?.goal_status === 'red' ? 'text-red-500' : 'text-[#FF0055]'}`} />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">GOAL</p>
              <p className="font-bold">{data?.goals.calorie_goal || 2000}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">FOOD</p>
              <p className="font-bold">{data?.totals.calories || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">REMAINING</p>
              <p className="font-bold text-[#FF6B00]">{caloriesRemaining}</p>
            </div>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
            <div className={`h-full rounded-full transition-all duration-500 ${data?.goal_status === 'red' ? 'bg-red-500' : 'bg-[#FF0055]'}`} style={{ width: `${Math.min(100, data?.calorie_percentage || 0)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Macros</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'PROTEIN', val: data?.totals.protein || 0, goal: data?.goals.protein_goal || 1, color: '#00E5FF' },
            { name: 'CARBS', val: data?.totals.carbs || 0, goal: data?.goals.carbs_goal || 1, color: '#FF6B00' },
            { name: 'FAT', val: data?.totals.fat || 0, goal: data?.goals.fat_goal || 1, color: '#B388FF' }
          ].map((m) => {
            const pct = (m.val / m.goal) * 100;
            return (
              <div key={m.name} className="bg-[#1A1B1E] rounded-3xl p-4 border border-white/5 text-center">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{m.name}</h4>
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="transition-all duration-1000" style={{ color: m.color }} strokeDasharray={`${Math.min(100, pct)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-bold">{Math.round(m.val)}g</span>
                  </div>
                </div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">/ {m.goal}g</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Micros */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Micros (AI Estimated)</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Fiber', val: data?.totals.fiber || 0, goal: 30, unit: 'g', color: '#10B981' },
            { name: 'Iron', val: data?.totals.iron || 0, goal: 18, unit: 'mg', color: '#EF4444' },
            { name: 'Calcium', val: data?.totals.calcium || 0, goal: 1000, unit: 'mg', color: '#FCD34D' },
            { name: 'Potassium', val: data?.totals.potassium || 0, goal: 3500, unit: 'mg', color: '#8B5CF6' }
          ].map((m) => {
            const pct = Math.min(100, Math.max(0, (m.val / m.goal) * 100));
            return (
              <div key={m.name} className="bg-[#1A1B1E] rounded-3xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{m.name}</h4>
                  <p className="text-sm font-bold text-white"><span style={{color: m.color}}>{Math.round(m.val)}</span><span className="text-[10px] text-gray-500">/{m.goal}{m.unit}</span></p>
                </div>
                <div className="w-10 h-10 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="transition-all duration-1000" style={{ color: m.color }} strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meals */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Meals</h3>
          <button onClick={() => setActiveSlot('Breakfast')} className="text-[10px] font-bold text-[#FF6B00] tracking-[0.2em] uppercase">SEARCH FOOD</button>
        </div>
        
        <div className="space-y-4">
          {mealCards.map((card) => {
            const mealData = data?.meals[card.name];
            const hasItems = mealData && mealData.items.length > 0;

            return (
              <div key={card.name} className={`bg-[#1A1B1E] rounded-3xl p-5 border ${hasItems ? 'border-white/5' : 'border-white/5 border-dashed opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center border ${card.borderColor}`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{card.name}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {hasItems ? `${Math.round(mealData.totals.calories)} kcal` : 'Track your meal'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSlot(card.name)}
                    className={`w-11 h-11 relative z-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${hasItems ? 'bg-white/5 hover:bg-white/10' : 'bg-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]'}`}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                {hasItems && (
                  <div className="space-y-3 mt-4">
                    {mealData.items.map((item) => {
                      const foodImg = getFoodImage(item.food_id);
                      return (
                        <div key={item.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img 
                              src={foodImg} 
                              alt={item.food_name}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10"
                              onError={(e) => { (e.target as HTMLImageElement).src = getFoodPlaceholder(item.food_name) }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-200 truncate">{item.food_name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                {Math.round(item.protein)}g Protein • {Math.round(item.carbs)}g Carbs
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-black text-white">{Math.round(item.calories)}</span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase">kcal</span>
                            <button
                              onClick={() => removeFood(item.id)}
                              className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all ml-1"
                            >
                              <Trash2 className="w-4 h-4 text-red-500/70" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Food Search Panel — opens when clicking "+" on a meal card */}
      {activeSlot && (
        <FoodSearch
          slotName={activeSlot}
          date={dateStr}
          onClose={() => setActiveSlot(null)}
          onLogged={() => fetchNutrition()}
        />
      )}

      {!activeSlot && <BottomNav />}
    </PageTransition>
  );
}
