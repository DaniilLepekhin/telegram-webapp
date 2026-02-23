'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ScenarioCard } from './ScenarioCard';
import { ScenarioRunner } from './ScenarioRunner';
import { LiveMetricsBar } from '../analytics/LiveMetricsBar';
import { UserHero } from './UserHero';
import { GlobalStats } from './GlobalStats';
import type { DemoScenario, User } from '@showcase/shared';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { OnboardingScreen } from '../onboarding/OnboardingScreen';

type View = 'hub' | 'scenario';

export function ShowcaseHub() {
  const { user, initData, haptic, isReady } = useTelegram();
  const { setUser, setStreakUpdated } = useAuthStore();
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [view, setView] = useState<View>('hub');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Refs prevent stale closures and eliminate unstable deps from useEffect
  const authAttempted = useRef(false);
  const streakSent = useRef(false);
  // Store latest values in refs so useEffect deps stay stable
  const initDataRef = useRef(initData);
  const setUserRef = useRef(setUser);
  const setStreakUpdatedRef = useRef(setStreakUpdated);
  useEffect(() => { initDataRef.current = initData; }, [initData]);
  useEffect(() => { setUserRef.current = setUser; }, [setUser]);
  useEffect(() => { setStreakUpdatedRef.current = setStreakUpdated; }, [setStreakUpdated]);

  // Authenticate on mount — runs exactly once when Telegram SDK is ready
  useEffect(() => {
    if (!isReady || authAttempted.current) return;
    authAttempted.current = true;

    const authenticate = async () => {
      try {
        const res = await api.loginWithTelegram(initDataRef.current);
        if (res.success && res.data) {
          const { user: userData, accessToken } = res.data as { user: User & { createdAt?: string }; accessToken: string };
          // setUser calls _apiSetToken internally — api token is set synchronously
          setUserRef.current(userData, accessToken);

          // Show onboarding for new users (registered within last 2 minutes)
          if (userData.createdAt) {
            const ageMs = Date.now() - new Date(userData.createdAt).getTime();
            if (ageMs < 2 * 60 * 1000) setShowOnboarding(true);
          }

          // Award streak XP once per session — guarded by ref
          if (!streakSent.current) {
            streakSent.current = true;
            setStreakUpdatedRef.current();
            api.updateStreak().catch(() => {});
          }
          api.trackEvent('page_view', { page: 'showcase_hub' }).catch(() => {});
        }
      } catch (err) {
        console.error('Auth failed:', err);
        setAuthError('Не удалось войти. Открой приложение через Telegram.');
      } finally {
        setIsAuthLoading(false);
      }
    };

    authenticate();
  }, [isReady]); // stable — only re-run when SDK becomes ready

  // Load scenarios (public, no auth required)
  useEffect(() => {
    api.getScenarios().then((res) => {
      if (res.success) setScenarios(res.data as DemoScenario[]);
    }).catch(() => {});
  }, []);

  const handleSelectScenario = (scenario: DemoScenario) => {
    haptic.impact('medium');
    setSelectedScenario(scenario);
    setView('scenario');
    api.trackEvent('scenario_start', { scenarioId: scenario.id, scenarioTitle: scenario.title });
  };

  const handleBackToHub = () => {
    haptic.impact('light');
    setView('hub');
    setSelectedScenario(null);
  };

  if (!isReady || isAuthLoading) {
    return <LoadingScreen />;
  }

  if (authError) {
    return <ErrorScreen message={authError} onRetry={() => { authAttempted.current = false; setAuthError(null); setIsAuthLoading(true); }} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        userName={user?.first_name ?? ''}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-fuchsia-600/6 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 pb-6"
          >
            {/* Live metrics bar */}
            <LiveMetricsBar />

            {/* User hero section */}
            <UserHero user={user} />

            {/* Global platform stats */}
            <GlobalStats />

            {/* Scenarios grid */}
            <section className="px-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mb-4"
              >
                <div>
                  <h2 className="text-lg font-bold text-white">Demo Кейсы</h2>
                  <p className="text-sm text-white/40 mt-0.5">Нажми — запустится интерактивный сценарий</p>
                </div>
                {scenarios.length > 0 && (
                  <span className="badge badge-primary">{scenarios.length} кейсов</span>
                )}
              </motion.div>

              <div className="grid grid-cols-1 gap-3">
                {scenarios.length > 0 ? (
                  scenarios.map((scenario, i) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      index={i}
                      onSelect={handleSelectScenario}
                    />
                  ))
                ) : (
                  ['s0', 's1', 's2', 's3'].map((id, i) => (
                    <ScenarioSkeleton key={id} index={i} />
                  ))
                )}
              </div>
            </section>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="px-4 mt-8"
            >
              <div className="glass-card p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent" />
                <p className="text-sm text-white/50 relative z-10">
                  Хочешь такой же бот для своего бизнеса?
                </p>
                <p className="text-white font-semibold mt-1 relative z-10">
                  Напиши @daniillepekhin — обсудим твой кейс
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {selectedScenario && (
              <ScenarioRunner
                scenario={selectedScenario}
                onBack={handleBackToHub}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-brand-500 border-brand-500/20 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-brand-500/20" />
        </div>
        <p className="text-white/40 text-sm animate-pulse">Загрузка...</p>
      </motion.div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/15 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <p className="text-white font-semibold">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 mx-auto glass px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Попробовать снова
        </button>
      </motion.div>
    </div>
  );
}

function ScenarioSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card p-4 h-28 shimmer"
    />
  );
}
