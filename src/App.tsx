/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowLeft, Play, X, RotateCcw } from 'lucide-react';

// Prime numbers up to 37
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

// Color mapping for primes
const PRIME_COLORS: Record<number, string> = {
  2: 'bg-blue-100 border-blue-400 text-blue-700',
  3: 'bg-red-100 border-red-400 text-red-700',
  5: 'bg-green-100 border-green-400 text-green-700',
  7: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  11: 'bg-purple-100 border-purple-400 text-purple-700',
  13: 'bg-pink-100 border-pink-400 text-pink-700',
  17: 'bg-indigo-100 border-indigo-400 text-indigo-700',
  19: 'bg-orange-100 border-orange-400 text-orange-700',
  23: 'bg-teal-100 border-teal-400 text-teal-700',
  29: 'bg-cyan-100 border-cyan-400 text-cyan-700',
  31: 'bg-lime-100 border-lime-400 text-lime-700',
  37: 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-700',
};

function getPrimeFactorization(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp > 1) {
    while (temp % d === 0) {
      factors.push(d);
      temp /= d;
    }
    d++;
    if (d * d > temp) {
      if (temp > 1) factors.push(temp);
      break;
    }
  }
  return factors.sort((a, b) => a - b);
}

type AnimationStep = 'idle' | 'factorizing' | 'cancelling' | 'result';

export default function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [numerator, setNumerator] = useState<number | null>(null);
  const [denominatorFactors, setDenominatorFactors] = useState<number[]>([]);
  const [step, setStep] = useState<AnimationStep>('idle');
  const [cancelledIndices, setCancelledIndices] = useState<{ num: number[]; den: number[] }>({ num: [], den: [] });

  const numeratorFactors = useMemo(() => (numerator ? getPrimeFactorization(numerator) : []), [numerator]);

  const handleInputSubmit = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val) && val > 0) {
      setNumerator(val);
      setDenominatorFactors([]);
      setStep('idle');
      setCancelledIndices({ num: [], den: [] });
    }
  };

  const addDenominatorFactor = (p: number) => {
    if (step !== 'idle') return;
    const newFactors = [...denominatorFactors, p].sort((a, b) => a - b);
    setDenominatorFactors(newFactors);
  };

  const removeDenominatorFactor = (index: number) => {
    if (step !== 'idle') return;
    const newFactors = [...denominatorFactors];
    newFactors.splice(index, 1);
    setDenominatorFactors(newFactors);
  };

  const startCalculation = async () => {
    if (denominatorFactors.length === 0) return;
    
    // Step 1: Show factorization
    setStep('factorizing');
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Cancelling animation
    setStep('cancelling');
    
    const numIndices: number[] = [];
    const denIndices: number[] = [];
    
    const tempNumFactors = [...numeratorFactors];
    const tempDenFactors = [...denominatorFactors];

    for (let i = 0; i < tempDenFactors.length; i++) {
      const factor = tempDenFactors[i];
      const numIdx = tempNumFactors.findIndex((f, idx) => f === factor && !numIndices.includes(idx));
      
      if (numIdx !== -1) {
        numIndices.push(numIdx);
        denIndices.push(i);
        setCancelledIndices({ num: [...numIndices], den: [...denIndices] });
        await new Promise(r => setTimeout(r, 600));
      }
    }

    // Step 3: Result
    await new Promise(r => setTimeout(r, 800));
    setStep('result');
  };

  const resetAll = () => {
    setNumerator(null);
    setInputValue('');
    setDenominatorFactors([]);
    setStep('idle');
    setCancelledIndices({ num: [], den: [] });
  };

  const resetDenominator = () => {
    setDenominatorFactors([]);
    setStep('idle');
    setCancelledIndices({ num: [], den: [] });
  };

  const denominatorValue = denominatorFactors.reduce((acc, curr) => acc * curr, 1);
  const isDivisor = numerator !== null && numerator % denominatorValue === 0;

  const remainingNumFactors = numeratorFactors.filter((_, i) => !cancelledIndices.num.includes(i));
  const remainingDenFactors = denominatorFactors.filter((_, i) => !cancelledIndices.den.includes(i));

  const resultNumerator = remainingNumFactors.reduce((acc, curr) => acc * curr, 1);
  const resultDenominator = remainingDenFactors.reduce((acc, curr) => acc * curr, 1);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">소인수분해를 이용한 약수 찾기</h1>
        </header>

        {/* Numerator Input Section */}
        {!numerator ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col items-center space-y-6"
          >
            <label className="text-lg font-medium text-stone-700">탐구할 자연수를 입력하세요</label>
            <div className="flex gap-2 w-full max-w-xs">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none text-xl text-center"
                placeholder="예: 12"
              />
              <button
                onClick={handleInputSubmit}
                className="bg-stone-800 text-white px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors font-semibold"
              >
                입력
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Fraction & Calculation Section */}
            <div className="flex flex-col items-center space-y-8 overflow-x-auto py-4">
              <div className="flex items-center gap-6 min-w-max">
                {/* Left Fraction: Number / Calculated Denominator */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold px-4 py-2">{numerator}</div>
                  <div className="w-full h-1 bg-stone-800 rounded-full my-2"></div>
                  <div className="text-3xl font-bold px-4 py-2 min-h-[60px] flex items-center">
                    {denominatorFactors.length === 0 ? "?" : denominatorValue}
                  </div>
                </div>

                <span className="text-3xl font-light text-stone-400">=</span>

                {/* Right Fraction: Factorized Numerator / Factorized Denominator (Cards) */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 px-4 min-h-[60px]">
                    {numeratorFactors.map((f, i) => (
                      <React.Fragment key={`anim-num-${i}`}>
                        <FactorCard 
                          value={f} 
                          isCancelled={cancelledIndices.num.includes(i)}
                        />
                        {i < numeratorFactors.length - 1 && <span className="text-stone-400">×</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="w-full h-1 bg-stone-800 rounded-full my-2"></div>
                  <div className="flex items-center gap-2 px-4 min-h-[60px]">
                    {denominatorFactors.length === 0 ? (
                      <span className="text-stone-300 italic text-sm">소수를 선택하세요</span>
                    ) : (
                      denominatorFactors.map((f, i) => (
                        <React.Fragment key={`anim-den-${i}`}>
                          <FactorCard 
                            value={f} 
                            onClick={() => removeDenominatorFactor(i)}
                            disabled={step !== 'idle'}
                            isCancelled={cancelledIndices.den.includes(i)}
                          />
                          {i < denominatorFactors.length - 1 && <span className="text-stone-400">×</span>}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>

                {/* Result Step */}
                <AnimatePresence>
                  {step === 'result' && (
                    <motion.div 
                      key="result-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-6"
                    >
                      <span className="text-3xl font-light text-stone-400">=</span>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold px-4 py-2">
                          {resultNumerator}
                        </div>
                        {resultDenominator !== 1 && (
                          <>
                            <div className="w-full h-1 bg-stone-800 rounded-full my-2"></div>
                            <div className="text-2xl font-bold px-4 py-2">
                              {resultDenominator}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="ml-4 px-6 py-3 rounded-2xl bg-stone-800 text-white font-bold">
                        {isDivisor ? "약수입니다! (자연수)" : "약수가 아닙니다. (분수)"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {step === 'idle' ? (
                <div className="flex gap-4">
                  <button
                    onClick={startCalculation}
                    disabled={denominatorFactors.length === 0}
                    className="flex items-center gap-2 bg-stone-800 text-white px-8 py-4 rounded-2xl hover:bg-stone-700 disabled:opacity-30 transition-all font-bold text-lg shadow-lg"
                  >
                    <Play size={20} fill="currentColor" />
                    계산하기
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 bg-stone-100 text-stone-600 px-6 py-3 rounded-2xl hover:bg-stone-200 transition-all font-bold"
                  >
                    <ArrowLeft size={18} />
                    다른 수 입력 (분자)
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={resetDenominator}
                    className="flex items-center gap-2 bg-white border-2 border-stone-800 text-stone-800 px-6 py-3 rounded-2xl hover:bg-stone-50 transition-all font-bold"
                  >
                    <RotateCcw size={18} />
                    분모 다시 입력
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 bg-stone-100 text-stone-600 px-6 py-3 rounded-2xl hover:bg-stone-200 transition-all font-bold"
                  >
                    <ArrowLeft size={18} />
                    다른 수 입력 (분자)
                  </button>
                </div>
              )}
            </div>

            {/* Prime Selection Panel */}
            {step === 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4"
              >
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider text-center">분모에 추가할 소수를 선택하세요</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {PRIMES.map(p => (
                    <button
                      key={p}
                      onClick={() => addDenominatorFactor(p)}
                      className={`
                        w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all
                        ${PRIME_COLORS[p] || 'bg-stone-100 border-stone-300 text-stone-600'}
                        hover:scale-110 active:scale-95 shadow-sm
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface FactorCardProps {
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  isCancelled?: boolean;
}

function FactorCard({ value, onClick, disabled, isCancelled }: FactorCardProps) {
  const colorClass = PRIME_COLORS[value] || 'bg-stone-100 border-stone-300 text-stone-600';
  
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg shadow-sm
        ${colorClass}
        ${onClick && !disabled ? 'cursor-pointer hover:brightness-95 active:scale-90' : ''}
        ${disabled ? 'cursor-default' : ''}
      `}
    >
      {value}
      {isCancelled && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '120%' }}
          className="absolute h-0.5 bg-stone-800 rotate-45 pointer-events-none"
        />
      )}
      {onClick && !disabled && (
        <div className="absolute -top-1 -right-1 bg-stone-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={8} />
        </div>
      )}
    </motion.div>
  );
}
