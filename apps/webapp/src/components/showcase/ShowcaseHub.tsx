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
import { OnboardingScreen } from '../onboarding/OnboardingScreen';

type View = 'hub' | 'scenario';

export function ShowcaseHub() {
  const { user, haptic, isReady } = useTelegram();
  const { isFreshAuth, user: authUser } = useAuthStore();
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [view, setView] = useState<View>('hub');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingCheckedRef = useRef(false);

  useEffect(() => {
    if (!isFreshAuth || onboardingCheckedRef.current) return;
    onboardingCheckedRef.current = true;
    const userData = authUser as (User & { createdAt?: string }) | null;
    if (userData?.createdAt) {
      const ageMs = Date.now() - new Date(userData.createdAt).getTime();
      if (ageMs < 2 * 60 * 1000) setShowOnboarding(true);
    }
  }, [isFreshAuth, authUser]);

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

  if (!isReady) {
    return <LoadingScreen />;
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
      </div>

      <AnimatePresence mode="wait">
        {view === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 pb-6"
          >
            <LiveMetricsBar />
            <UserHero user={user} />
            <GlobalStats />

            {/* Scenarios grid */}
            <section className="px-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Demo Кейсы</h2>
                  <p className="text-sm text-white/40 mt-0.5">Нажми — запустится интерактивный сценарий</p>
                </div>
                {scenarios.length > 0 && (
                  <span className="badge badge-primary">{scenarios.length} кейсов</span>
                )}
              </div>

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
                  ['s0', 's1', 's2', 's3'].map((id) => (
                    <div key={id} className="glass-card p-4 h-28 shimmer" />
                  ))
                )}
              </div>
            </section>

            {/* Bottom CTA */}
            <div className="px-4 mt-8">
              <div className="glass-card p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent" />
                <p className="text-sm text-white/50 relative z-10">
                  Хочешь такой же бот для своего бизнеса?
                </p>
                <p className="text-white font-semibold mt-1 relative z-10">
                  Напиши @daniillepekhin — обсудим твой кейс
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
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
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-brand-500 border-brand-500/20 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-brand-500/20" />
        </div>
        <p className="text-white/40 text-sm animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
}
