import React, { useState, useEffect, useCallback } from 'react';
import { PixiSlotReels } from './components/PixiSlotReels';
import { SlotHeader } from './components/SlotHeader';
import { SlotControls } from './components/SlotControls';
import { PaytableModal } from './components/PaytableModal';
import { DashboardDrawer } from './components/DashboardDrawer';
import { WinCelebrationModal, CelebrationType } from './components/WinCelebrationModal';
import { JackpotBanners } from './components/JackpotBanners';
import { DesktopLeftWing, DesktopRightWing } from './components/DesktopWings';
import { DynamicTicker } from './components/DynamicTicker';
import { PharaohChestBonusModal } from './components/PharaohChestBonusModal';
import { LoadingScreen } from './components/LoadingScreen';
import { SymbolId, SpinResult, GameHistoryItem, GameStats, WinResult } from './types';
import { generateSlotGrid, evaluateSpin, BET_STEPS } from './data/slotConfig';
import { sound } from './services/soundEngine';
import { haptic } from './utils/haptics';

// Background & Frame generated images
import templeBg from './assets/images/cleopatra_temple_bg_1789482734602.jpg';
import slotFrameImg from './assets/images/cleopatra_slot_frame_1789482747217.jpg';
import cleopatraRecliningImg from './assets/images/cleopatra_mobile_reclining_transparent.png';

const STORAGE_KEYS = {
  BALANCE: 'cleopatra_slot_balance',
  STATS: 'cleopatra_slot_stats',
  HISTORY: 'cleopatra_slot_history',
};

const INITIAL_GRID: SymbolId[][] = [
  ['PHARAOH', 'SCARAB', 'CHEST'],
  ['WILD', 'ANUBIS', 'SCEPTER'],
  ['SCATTER', 'PHARAOH', 'BASTET'],
  ['EYE', 'COBRA', 'ANKH'],
  ['ANUBIS', 'WILD', 'LOTUS'],
];

export default function App() {
  // Game State
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return saved ? parseFloat(saved) : 1000.0;
  });

  const [currentBet, setCurrentBet] = useState<number>(1.0);
  const [activePaylinesCount, setActivePaylinesCount] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [autoSpinRemaining, setAutoSpinRemaining] = useState<number>(0);

  // Bonus & Free Spins State
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsAccumulatedWin, setFreeSpinsAccumulatedWin] = useState<number>(0);

  // Reels & Outcome State
  const [currentGrid, setCurrentGrid] = useState<SymbolId[][]>(INITIAL_GRID);
  const [pendingResult, setPendingResult] = useState<SpinResult | null>(null);
  const [activeWins, setActiveWins] = useState<WinResult[]>([]);
  const [lastWin, setLastWin] = useState<number>(0);
  const [activePaylinePreview, setActivePaylinePreview] = useState<number | null>(null);

  // Modals & Drawers
  const [isGameLoading, setIsGameLoading] = useState<boolean>(true);
  const [isPaytableOpen, setIsPaytableOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isChestBonusOpen, setIsChestBonusOpen] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<{
    type: CelebrationType;
    amount: number;
  } | null>(null);

  // Audio State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);

  // Session Statistics & History
  const [history, setHistory] = useState<GameHistoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    if (saved) return JSON.parse(saved);
    return {
      totalSpins: 0,
      totalBet: 0,
      totalWon: 0,
      netProfit: 0,
      biggestWin: 0,
      freeSpinsRoundsTriggered: 0,
      currentRtp: 96.5,
    };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
  }, [history]);

  // Audio Toggles & Ambient Loop
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    sound.setMusicEnabled(next);
  };

  useEffect(() => {
    if (musicEnabled) {
      sound.startAmbientMusic();
    } else {
      sound.stopAmbientMusic();
    }
  }, [musicEnabled]);

  // Main Spin Action
  const executeSpin = useCallback(() => {
    if (isSpinning) return;

    const isFreeSpin = freeSpinsRemaining > 0;

    // Check balance if normal spin
    if (!isFreeSpin && balance < currentBet) {
      alert('¡Saldo insuficiente! Usa el botón de recarga de pesos ($) en la parte superior.');
      setAutoSpinRemaining(0);
      return;
    }

    // Deduct bet if normal spin
    if (!isFreeSpin) {
      setBalance((prev) => parseFloat((prev - currentBet).toFixed(2)));
    }

    setIsSpinning(true);
    setActiveWins([]);
    setLastWin(0);

    // 1. Generate RNG grid & evaluate outcome
    const newGrid = generateSlotGrid();
    const result = evaluateSpin(newGrid, currentBet, isFreeSpin, activePaylinesCount);

    setCurrentGrid(newGrid);
    setPendingResult(result);
  }, [isSpinning, freeSpinsRemaining, balance, currentBet, activePaylinesCount]);

  // Callback when Pixi reels complete their 60 FPS spin and bounce animation
  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    if (!pendingResult) return;

    const result = pendingResult;
    const isFreeSpin = freeSpinsRemaining > 0;
    const betCost = isFreeSpin ? 0 : currentBet;
    const won = result.totalWin;
    const net = won - betCost;

    // Update balance
    setBalance((prev) => parseFloat((prev + won).toFixed(2)));
    setLastWin(won);
    setActiveWins(result.wins);

    // If free spins are active, track free spin count & total free spins winnings
    let nextFreeSpins = freeSpinsRemaining;
    if (isFreeSpin) {
      nextFreeSpins = freeSpinsRemaining - 1;
      setFreeSpinsRemaining(nextFreeSpins);
      setFreeSpinsAccumulatedWin((prev) => prev + won);
    }

    // Check how many Pharaoh's Chest symbols appeared across the 5x3 grid
    let chestCount = 0;
    for (let c = 0; c < currentGrid.length; c++) {
      for (let r = 0; r < currentGrid[c].length; r++) {
        if (currentGrid[c][r] === 'CHEST') {
          chestCount++;
        }
      }
    }

    // Check if free spins were triggered or re-triggered (3+ Pyramids)
    if (result.isFreeSpinsTriggered) {
      sound.playFreeSpinsFanfare();
      haptic.bigWin();
      setFreeSpinsRemaining((prev) => prev + 15);
      setCelebration({
        type: 'FREE_SPINS_TRIGGER',
        amount: won > 0 ? won : currentBet * 5,
      });
    } else if (chestCount >= 3) {
      if (autoSpinRemaining > 0) {
        setAutoSpinRemaining(0);
      }
      // Trigger Pharaoh's Treasure Chest Pick'em minigame!
      haptic.bigWin();
      setIsChestBonusOpen(true);
    } else if (won > 0) {
      const winMultiplier = won / currentBet;
      const isWildUsed = result.wins.some((w) => w.isWildSubstituted);

      if (winMultiplier >= 80 || result.wins.some((w) => w.symbolId === 'WILD' && w.matchCount === 5)) {
        sound.playWin(true, true);
        haptic.bigWin();
        setCelebration({ type: 'ULTRA_WIN', amount: won });
      } else if (winMultiplier >= 35) {
        sound.playWin(true, true);
        haptic.bigWin();
        setCelebration({ type: 'SUPER_WIN', amount: won });
      } else if (winMultiplier >= 15) {
        sound.playWin(true, true);
        haptic.bigWin();
        setCelebration({ type: 'MEGA_WIN', amount: won });
      } else if (winMultiplier >= 4 || (winMultiplier >= 2.5 && result.wins.length >= 2)) {
        sound.playWin(true, false);
        haptic.win();
        setCelebration({ type: 'BIG_WIN', amount: won });
      } else {
        sound.playWin(isWildUsed, false);
        haptic.win();
      }
    }

    // Update Session Statistics
    setStats((prev) => {
      const newTotalSpins = prev.totalSpins + 1;
      const newTotalBet = prev.totalBet + betCost;
      const newTotalWon = prev.totalWon + won;
      const newNetProfit = newTotalWon - newTotalBet;
      const newBiggestWin = Math.max(prev.biggestWin, won);
      const newRtp = newTotalBet > 0 ? (newTotalWon / newTotalBet) * 100 : 96.5;

      return {
        totalSpins: newTotalSpins,
        totalBet: parseFloat(newTotalBet.toFixed(2)),
        totalWon: parseFloat(newTotalWon.toFixed(2)),
        netProfit: parseFloat(newNetProfit.toFixed(2)),
        biggestWin: parseFloat(newBiggestWin.toFixed(2)),
        freeSpinsRoundsTriggered: prev.freeSpinsRoundsTriggered + (result.isFreeSpinsTriggered ? 1 : 0),
        currentRtp: parseFloat(newRtp.toFixed(1)),
      };
    });

    // Add to Spin History
    const historyItem: GameHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      bet: betCost,
      totalWin: won,
      net,
      isFreeSpinsRound: isFreeSpin,
      freeSpinsTriggered: result.isFreeSpinsTriggered,
      topWinMultiplier: result.wins.length > 0 ? Math.max(...result.wins.map((w) => w.totalMultiplier)) : 0,
      winCount: result.wins.length,
      highlightSymbol: result.wins[0]?.symbolId,
    };

    setHistory((prev) => [historyItem, ...prev.slice(0, 99)]);
    setPendingResult(null);

    // Auto Spin handling
    if (autoSpinRemaining > 0) {
      if (result.isFreeSpinsTriggered) {
        setAutoSpinRemaining(0);
      } else {
        setAutoSpinRemaining((prev) => prev - 1);
      }
    }
  }, [pendingResult, freeSpinsRemaining, currentBet, autoSpinRemaining, currentGrid]);

  // Auto Spin next spin loop
  useEffect(() => {
    if (autoSpinRemaining > 0 && !isSpinning && !celebration && !isChestBonusOpen) {
      const delay = turboMode ? 400 : 1100;
      const timer = setTimeout(() => {
        executeSpin();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [autoSpinRemaining, isSpinning, celebration, isChestBonusOpen, turboMode, executeSpin]);

  // Free Spins auto-continue loop
  useEffect(() => {
    if (freeSpinsRemaining > 0 && !isSpinning && !celebration && !isChestBonusOpen) {
      const delay = turboMode ? 500 : 1300;
      const timer = setTimeout(() => {
        executeSpin();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [freeSpinsRemaining, isSpinning, celebration, isChestBonusOpen, turboMode, executeSpin]);

  // Top Up Demo Credits
  const handleAddFunds = (amount: number) => {
    setBalance((prev) => parseFloat((prev + amount).toFixed(2)));
  };

  // Reset Session Stats
  const handleResetStats = () => {
    setStats({
      totalSpins: 0,
      totalBet: 0,
      totalWon: 0,
      netProfit: 0,
      biggestWin: 0,
      freeSpinsRoundsTriggered: 0,
      currentRtp: 96.5,
    });
    setHistory([]);
  };

  // Handle reward from Pharaoh's Chest Bonus
  const handleClaimChestReward = (rewardAmount: number) => {
    setIsChestBonusOpen(false);
    if (rewardAmount > 0) {
      setBalance((prev) => parseFloat((prev + rewardAmount).toFixed(2)));
      setLastWin((prev) => parseFloat((prev + rewardAmount).toFixed(2)));
      setStats((prev) => ({
        ...prev,
        totalWon: parseFloat((prev.totalWon + rewardAmount).toFixed(2)),
        biggestWin: Math.max(prev.biggestWin, rewardAmount),
      }));
    }
  };



  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between bg-black text-amber-100 overflow-hidden select-none">
      {/* Opulent Egyptian Twilight Temple Backdrop */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-45 transform scale-105"
        style={{ backgroundImage: `url(${templeBg})` }}
      />
      {/* Dark luxury gradient vignette */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/95 pointer-events-none" />

      {/* Top Header - Rigid Fixed Height */}
      <div className="shrink-0 z-20">
        <SlotHeader
          balance={balance}
          freeSpinsRemaining={freeSpinsRemaining}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onOpenPaytable={() => setIsPaytableOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onRechargeCredits={() => handleAddFunds(500)}
          onOpenCelebrations={() => setCelebration({ type: 'MEGA_WIN', amount: currentBet * 25 })}
          onShowLoadingScreen={() => setIsGameLoading(true)}
        />
      </div>

      {/* Central Slot Stage - With Desktop Wings and Mobile Full-Bleed layout */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center px-1 sm:px-2 py-0.5 z-10 overflow-hidden gap-2">
        {/* Left Wing on Desktop Screens (Quick Paytable in real-time) */}
        <DesktopLeftWing currentBet={currentBet} activeWins={activeWins} />

        {/* Center Column: Jackpots + Reel Cabinet + Dynamic Ticker */}
        <div className="flex-1 min-w-0 max-w-[820px] h-full flex flex-col items-center justify-between py-0.5">
          {/* Progressive Jackpots Bar (Mini, Major, Grand - Interactive Celebration Triggers) */}
          <JackpotBanners
            spinCounter={stats.totalSpins}
            onSelectJackpot={(jackpotType, jackpotAmount) => {
              if (jackpotType === 'MINI') {
                setCelebration({ type: 'VARIANT_1', amount: jackpotAmount });
              } else if (jackpotType === 'MAJOR') {
                setCelebration({ type: 'VARIANT_2', amount: jackpotAmount });
              } else {
                setCelebration({ type: 'VARIANT_3', amount: jackpotAmount });
              }
            }}
          />

          {/* Main Slot Reel Machine Frame */}
          <div className="relative w-full p-1 sm:p-2 rounded-2xl bg-gradient-to-b from-[#2a1806]/95 via-stone-950 to-[#160b03]/95 border-2 border-amber-500/50 shadow-[0_0_40px_rgba(0,0,0,0.95)] flex flex-col justify-center my-auto hardware-accelerated">
            
            {/* Cleopatra Recostada Figure (Mobile Only - positioned reclining on the top frame) */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none sm:hidden w-full px-2">
              <div className="relative w-full max-w-[330px] h-20 overflow-visible flex items-center justify-center">
                {/* Subtle base glow to ground her to the frame */}
                <div className="absolute bottom-0 w-4/5 h-4 bg-amber-500/10 blur-lg rounded-[100%]" />
                
                <img
                  src={cleopatraRecliningImg}
                  alt="Cleopatra Cuerpo Entero Recostada"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Decorative horizontal accent line under her */}
                <div className="absolute bottom-1 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              </div>
            </div>

            {/* Top Cornice Header Bar */}
            <div className="relative w-full h-5 sm:h-7 mb-1 rounded-t-lg overflow-hidden border-b border-amber-500/40 flex items-center justify-center bg-[#170c03] shrink-0">
              <img
                src={slotFrameImg}
                alt="Frame Cornice"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                <div className="h-[1px] w-6 sm:w-16 bg-gradient-to-r from-transparent to-amber-400" />
                <span className="font-cinzel font-black text-[9px] sm:text-xs text-gold-metallic tracking-widest drop-shadow">
                  {freeSpinsRemaining > 0 ? (
                    <span className="text-yellow-300 animate-pulse">
                      ¡TIROS GRATIS ACTIVOS! MULTIPLICADOR 3X (ACUM: ${freeSpinsAccumulatedWin.toFixed(2)})
                    </span>
                  ) : (
                    `QUEEN OF EGYPT • ${activePaylinesCount} LÍNEAS ACTIVAS`
                  )}
                </span>
                <div className="h-[1px] w-6 sm:w-16 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
            </div>

            {/* 60 FPS PixiJS Slot Reels Canvas Container */}
            <PixiSlotReels
              currentGrid={currentGrid}
              isSpinning={isSpinning}
              turboMode={turboMode}
              wins={activeWins}
              activePaylinePreview={activePaylinePreview}
              onSpinComplete={handleSpinComplete}
            />

            {/* Bottom Machine Accent Info Bar */}
            <div className="mt-1 py-0.5 px-2 flex items-center justify-between text-[7.5px] sm:text-[9.5px] font-cinzel text-amber-400/70 border-t border-amber-500/20 shrink-0">
              <span>RNG CERTIFICADO • 96.5% RTP</span>
              <span className="hidden xs:inline">WILD DUPLICA X2</span>
              <span>3 SCATTERS = 15 TIROS GRATIS</span>
            </div>
          </div>

          {/* Dynamic Feed & Tips Ticker Bar */}
          <div className="hidden sm:block w-full">
            <DynamicTicker
              lastWin={lastWin}
              freeSpinsRemaining={freeSpinsRemaining}
              isSpinning={isSpinning}
            />
          </div>
        </div>

        {/* Right Wing on Desktop Screens (Live Session Stats & Recent Spins Feed) */}
        <DesktopRightWing stats={stats} history={history} />
      </main>

      {/* Bottom Rigid Control Console (Thumb-Zone & Ergonomics) */}
      <div className="shrink-0 z-20 relative overflow-visible">
        <SlotControls
          currentBet={currentBet}
          balance={balance}
          isSpinning={isSpinning}
          lastWin={lastWin}
          turboMode={turboMode}
          autoSpinCount={autoSpinRemaining}
          freeSpinsRemaining={freeSpinsRemaining}
          activePaylinesCount={activePaylinesCount}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onBetChange={(newBet) => setCurrentBet(newBet)}
          onPaylinesChange={(lines) => {
            setActivePaylinesCount(lines);
            setActivePaylinePreview(lines);
            setTimeout(() => setActivePaylinePreview(null), 800);
          }}
          onMaxBet={() => setCurrentBet(BET_STEPS[BET_STEPS.length - 1])}
          onToggleTurbo={() => setTurboMode((prev) => !prev)}
          onSpin={executeSpin}
          onStartAutoSpin={(count) => {
            setAutoSpinRemaining(count);
            executeSpin();
          }}
          onStopAutoSpin={() => setAutoSpinRemaining(0)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onOpenPaytable={() => setIsPaytableOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onOpenCelebrations={() => setCelebration({ type: 'VARIANT_3', amount: currentBet * 100 })}
          onShowLoadingScreen={() => setIsGameLoading(true)}
        />
      </div>

      {/* Paytable & Rules Modal */}
      <PaytableModal
        isOpen={isPaytableOpen}
        onClose={() => {
          setIsPaytableOpen(false);
          setActivePaylinePreview(null);
        }}
        onPreviewPayline={(lineId) => setActivePaylinePreview(lineId)}
        currentBet={currentBet}
        onTestCelebration={(type, amount) => {
          setIsPaytableOpen(false);
          setActivePaylinePreview(null);
          setCelebration({ type, amount });
        }}
      />

      {/* Player Dashboard Drawer */}
      <DashboardDrawer
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        balance={balance}
        stats={stats}
        history={history}
        onAddFunds={handleAddFunds}
        onResetStats={handleResetStats}
      />

      {/* Pharaoh's Chest Bonus Minigame Modal */}
      <PharaohChestBonusModal
        isOpen={isChestBonusOpen}
        totalBet={currentBet}
        onClaimReward={handleClaimChestReward}
      />

      {/* Big Win / Mega Win / Free Spins Celebration Popup */}
      {celebration && (
        <WinCelebrationModal
          type={celebration.type}
          amount={celebration.amount}
          bet={currentBet}
          onDismiss={() => setCelebration(null)}
        />
      )}

      {/* Initial Asset Download & Loading Screen */}
      {isGameLoading && (
        <LoadingScreen onLoadComplete={() => setIsGameLoading(false)} />
      )}
    </div>
  );
}
