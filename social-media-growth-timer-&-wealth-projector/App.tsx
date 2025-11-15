import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Timer } from './types';
import { INITIAL_TIME_SECONDS, RATE_PER_MINUTE_VND, TIMER_CONFIGS } from './constants';
import TimerCard from './components/TimerCard';

const App: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>(() =>
    TIMER_CONFIGS.map(config => ({
      ...config,
      isRunning: false,
      timeLeft: INITIAL_TIME_SECONDS,
    }))
  );
  
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [years, setYears] = useState<number>(15);
  const [dailyRate, setDailyRate] = useState<number>(0.1);
  const [projectedValue, setProjectedValue] = useState<string | null>(null);
  
  const isAnyTimerRunning = useMemo(() => timers.some(t => t.isRunning), [timers]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isAnyTimerRunning) {
      interval = setInterval(() => {
        setTimers(prevTimers =>
          prevTimers.map(timer => {
            if (timer.isRunning && timer.timeLeft > 0) {
              return { ...timer, timeLeft: timer.timeLeft - 1 };
            }
            if (timer.isRunning && timer.timeLeft === 0) {
              return { ...timer, isRunning: false }; // Auto-stop at 0
            }
            return timer;
          })
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnyTimerRunning]);

  const handleToggleTimer = useCallback((id: number) => {
    setTimers(prevTimers =>
      prevTimers.map(timer =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
    // Reset calculations when a timer is started or paused after a calculation
    if (totalEarnings !== null) {
        setTotalEarnings(null);
        setProjectedValue(null);
    }
  }, [totalEarnings]);

  const handleStopAndCalculate = () => {
    setTimers(prevTimers => prevTimers.map(t => ({ ...t, isRunning: false })));
    
    const totalSecondsElapsed = timers.reduce((acc, timer) => {
      // Only count timers that were actually used in this session
      if (timer.timeLeft < INITIAL_TIME_SECONDS) {
        return acc + (INITIAL_TIME_SECONDS - timer.timeLeft);
      }
      return acc;
    }, 0);
    
    const totalMinutesElapsed = totalSecondsElapsed / 60;
    const earnings = totalMinutesElapsed * RATE_PER_MINUTE_VND;
    setTotalEarnings(earnings);
    setProjectedValue(null); // Clear previous projection
  };
  
  const handleCalculateProjection = () => {
    if (totalEarnings === null || totalEarnings <= 0) return;

    try {
      const P = totalEarnings;
      const r_percent = dailyRate;
      const n_days = years * 365;

      // Use BigInt for high-precision calculation of FV = P * [((1 + r)^n - 1) / r]
      if (r_percent === 0) {
        const A = BigInt(Math.round(P)) * BigInt(n_days);
        setProjectedValue(A.toString());
        return;
      }
      
      const precision = 100000000; // 8 decimal places for rate precision
      const precisionBig = BigInt(precision);

      const P_scaled = BigInt(Math.round(P * 100)); // Use cents to handle decimals in principal
      const r_scaled = BigInt(Math.round(r_percent * precision / 100));

      if (r_scaled === 0n) {
          const A = BigInt(Math.round(P)) * BigInt(n_days);
          setProjectedValue(A.toString());
          return;
      }
      
      const n_big = BigInt(n_days);
      const one_plus_r_scaled = precisionBig + r_scaled;
      
      // Calculate (one_plus_r_scaled / precisionBig) ^ n_big
      const term_num_pow_n = one_plus_r_scaled ** n_big;
      const term_den_pow_n = precisionBig ** n_big;
      
      // FV = P * [ (term_num_pow_n / term_den_pow_n - 1) / (r_scaled / precisionBig) ]
      // Rearrange to avoid division until the end:
      // FV = P * [ (term_num_pow_n - term_den_pow_n) / term_den_pow_n ] * [ precisionBig / r_scaled ]
      const numerator_part_1 = term_num_pow_n - term_den_pow_n;
      const final_numerator = P_scaled * numerator_part_1 * precisionBig;
      const final_denominator = 100n * term_den_pow_n * r_scaled; // 100n to convert back from cents

      const final_A = final_numerator / final_denominator;
      setProjectedValue(final_A.toString());

    } catch (e) {
      console.error("Calculation Error:", e);
      setProjectedValue("Calculation resulted in a number too large to display");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  const formatBigIntCurrency = (value: string): string => {
    if (!value || isNaN(Number(value.replace(/[^0-9]/g, '')))) return '0 ₫';
    // Add thousand separators (dot for Vietnamese style)
    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted} ₫`;
  };

  return (
    <div className="bg-[#1c1e21] min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-500">Social Media Growth Engine</h1>
          <p className="mt-2 text-lg text-slate-400">Track Your Work, Project Your Wealth</p>
          <p className="mt-1 text-md text-slate-300">An toàn đến từ sự hiểu biết</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {timers.map(timer => (
            <TimerCard key={timer.id} timer={timer} onToggle={handleToggleTimer} />
          ))}
        </div>
        
        <div className="bg-[#242526] rounded-xl shadow-lg p-6 border-2 border-gray-700 mb-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Master Control</h2>
            <button
              onClick={handleStopAndCalculate}
              disabled={!isAnyTimerRunning && totalEarnings === null}
              className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 disabled:bg-none disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#242526] focus:ring-pink-500"
            >
              Stop All & Calculate Earnings
            </button>
          </div>
        </div>
        
        {totalEarnings !== null && (
          <div className="bg-[#242526] rounded-xl shadow-lg p-6 border-2 border-pink-500/50">
            <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Financial Projection</h2>
             <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 flex-shrink-0">
                    <img src="https://i.postimg.cc/BvY4BmGP/truong-2.png" alt="Motivational" className="rounded-lg shadow-2xl w-full h-auto object-cover" />
                </div>
                <div className="w-full md:w-2/3">
                    <div className="text-center mb-6">
                      <p className="text-slate-400 text-lg">Total Earnings From This Session:</p>
                      <p className="text-4xl font-bold text-green-400 mt-2">{formatCurrency(totalEarnings)}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
                      <div>
                        <label htmlFor="years" className="block mb-2 font-semibold text-slate-300 text-sm">Investment Duration (Years)</label>
                        <input
                          type="number"
                          id="years"
                          value={years}
                          onChange={e => setYears(Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                       <div>
                        <label htmlFor="dailyRate" className="block mb-2 font-semibold text-slate-300 text-sm">Daily Compound Interest (%)</label>
                        <input
                          type="number"
                          id="dailyRate"
                          value={dailyRate}
                          onChange={e => setDailyRate(Number(e.target.value))}
                          step="0.001"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <button 
                        onClick={handleCalculateProjection}
                        className="w-full h-12 px-6 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        Project Future Value
                      </button>
                    </div>

                    {projectedValue !== null && (
                      <div className="mt-6 text-center bg-[#1c1e21]/50 p-6 rounded-lg">
                        <p className="text-lg text-slate-400">If you earn this amount daily for {years} years with a {dailyRate}% daily interest:</p>
                        <p className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent mt-3 break-words">{formatBigIntCurrency(projectedValue)}</p>
                      </div>
                    )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;