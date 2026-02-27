'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { DemoScenario, User } from '@showcase/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LiveMetricsBar } from '../analytics/LiveMetricsBar';
import { OnboardingScreen } from '../onboarding/OnboardingScreen';
import { GlobalStats } from './GlobalStats';
import { ScenarioCard } from './ScenarioCard';
import { ScenarioRunner } from './ScenarioRunner';
import { UserHero } from './UserHero';

type View = 'hub' | 'scenario';

export function ShowcaseHub() {
  const { user, haptic, isReady } = useTelegram();
  const { isFreshAuth, user: authUser } = useAuthStore();
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(
    null,
  );
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
    api
      .getScenarios()
      .then((res) => {
        if (res.success) setScenarios(res.data as DemoScenario[]);
      })
      .catch(() => {});
  }, []);

  const handleSelectScenario = (scenario: DemoScenario) => {
    haptic.impact('medium');
    setSelectedScenario(scenario);
    setView('scenario');
    api.trackEvent('scenario_start', {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
    });
  };

  const handleBackToHub = () => {
    haptic.impact('light');
    setView('hub');
    setSelectedScenario(null);
  };

  if (!isReady) return <LoadingScreen />;

  if (showOnboarding) {
    return (
      <OnboardingScreen
        userName={user?.first_name ?? ''}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-th-bg relative overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Floating orbs */}
      <div className="orb orb-violet w-[500px] h-[500px] -top-48 -left-24 animate-float" />
      <div
        className="orb orb-cyan w-[300px] h-[300px] top-1/3 -right-20 animate-float"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="orb orb-rose w-[200px] h-[200px] bottom-40 left-1/4 animate-float"
        style={{ animationDelay: '-5s' }}
      />

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

            {/* Section header */}
            <section className="px-4 mt-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-neon-amber" />
                    <h2 className="text-lg font-bold text-th tracking-tight">
                      Demo-Кейсы
                    </h2>
                  </div>
                  <p className="text-sm text-th/35">
                    Интерактивные сценарии бизнес-задач
                  </p>
                </div>
                {scenarios.length > 0 && (
                  <span className="badge badge-primary text-[10px]">
                    {scenarios.length} кейсов
                  </span>
                )}
              </div>

              {/* Scenario cards */}
              <div className="grid grid-cols-1 gap-3">
                {scenarios.length > 0
                  ? scenarios.map((scenario, i) => (
                      <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        index={i}
                        onSelect={handleSelectScenario}
                      />
                    ))
                  : ['sk-a', 'sk-b', 'sk-c', 'sk-d'].map((id) => (
                      <div key={id} className="glass-card p-4 h-32 shimmer" />
                    ))}
              </div>
            </section>

            {/* Bottom CTA — holographic card */}
            <div className="px-4 mt-8 mb-4">
              <div className="holo-card p-6 text-center">
                <div className="relative z-10">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-brand-500/30 to-neon-cyan/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <p className="text-th/50 text-sm">
                    Хочешь такой же бот для своего бизнеса?
                  </p>
                  <p className="text-th font-semibold mt-1.5 flex items-center justify-center gap-2">
                    Напиши @daniillepekhin
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </p>
                </div>
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
    <div className="min-h-screen bg-th-bg flex items-center justify-center relative">
      <div className="aurora-bg" />
      <div className="relative z-10 text-center">
        {/* Pulsing orb loader */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-500/40 to-neon-cyan/30 animate-pulse" />
          <div
            className="absolute inset-4 rounded-full border border-brand-400/30 animate-spin"
            style={{ borderTopColor: 'rgba(108,92,231,0.8)' }}
          />
          <div className="absolute inset-6 rounded-full bg-brand-500/10 backdrop-blur-sm" />
        </div>
        <p className="text-th/30 text-sm font-medium tracking-wide">
          Загрузка...
        </p>
      </div>
    </div>
  );
}
