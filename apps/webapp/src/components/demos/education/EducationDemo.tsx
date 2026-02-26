'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, CheckCircle2, Play } from 'lucide-react';
import { useState } from 'react';

type EduView =
  | 'catalog'
  | 'course'
  | 'lesson'
  | 'quiz'
  | 'score'
  | 'certificate';

interface EducationDemoProps {
  onBack: () => void;
}

const COURSES = [
  {
    id: 'marketing',
    emoji: '📊',
    title: 'Digital Marketing PRO',
    subtitle: 'Продвижение в интернете',
    gradient: 'from-blue-500 to-cyan-500',
    lessons: 12,
    hours: 6,
    rating: 4.9,
    students: 3241,
    progress: 2,
    topics: [
      { id: 'intro', title: 'Введение в digital', done: true },
      { id: 'seo', title: 'SEO и контент', done: true },
      { id: 'content', title: 'Контент-стратегия', done: false, current: true },
      { id: 'email', title: 'Email маркетинг', done: false },
      { id: 'smm', title: 'SMM и Telegram', done: false },
      { id: 'analytics', title: 'Аналитика и ROI', done: false },
    ],
  },
  {
    id: 'python',
    emoji: '🐍',
    title: 'Python для аналитика',
    subtitle: 'Data Science с нуля',
    gradient: 'from-emerald-500 to-teal-600',
    lessons: 24,
    hours: 18,
    rating: 4.9,
    students: 1872,
    progress: 0,
    topics: [],
  },
  {
    id: 'design',
    emoji: '🎨',
    title: 'Дизайн в Figma',
    subtitle: 'UI/UX с нуля до Pro',
    gradient: 'from-purple-500 to-pink-600',
    lessons: 8,
    hours: 4,
    rating: 4.7,
    students: 958,
    progress: 0,
    topics: [],
  },
];

const LESSON_CONTENT = {
  id: 'content',
  title: 'Контент-стратегия',
  duration: '18 мин',
  blocks: [
    {
      type: 'text',
      content:
        'Контент-стратегия — это план создания, публикации и управления контентом, направленный на достижение бизнес-целей.',
    },
    {
      type: 'highlight',
      content:
        '💡 Ключевой принцип: один пост — одна идея. Не пытайтесь вложить всё в один материал.',
    },
    {
      type: 'text',
      content:
        'Основные типы контента: обучающий, развлекательный, продающий. Пропорция 70/20/10 — проверенная формула роста.',
    },
    {
      type: 'list',
      items: [
        'Определите целевую аудиторию и её боли',
        'Выберите 3-5 форматов контента',
        'Создайте контент-план на 30 дней',
        'Анализируйте метрики каждые 2 недели',
      ],
    },
  ],
};

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Какая пропорция контента считается оптимальной?',
    options: [
      { id: 'a', text: '50/30/20' },
      { id: 'b', text: '70/20/10' },
      { id: 'c', text: '80/10/10' },
      { id: 'd', text: '60/30/10' },
    ],
    correct: 'b',
  },
  {
    id: 'q2',
    question: 'Что такое контент-стратегия?',
    options: [
      { id: 'a', text: 'График публикаций' },
      { id: 'b', text: 'Тип рекламного поста' },
      { id: 'c', text: 'План создания и управления контентом' },
      { id: 'd', text: 'Инструмент аналитики' },
    ],
    correct: 'c',
  },
  {
    id: 'q3',
    question: 'Сколько форматов контента оптимально выбирать?',
    options: [
      { id: 'a', text: '1-2' },
      { id: 'b', text: '3-5' },
      { id: 'c', text: '7-10' },
      { id: 'd', text: 'Все возможные' },
    ],
    correct: 'b',
  },
];

function ViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function EducationDemo({ onBack }: EducationDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<EduView>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('marketing');
  const [history, setHistory] = useState<EduView[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lessonProgress, setLessonProgress] = useState(0);

  const navigate = (to: EduView) => {
    haptic.selection();
    setHistory((prev) => [...prev, view]);
    setView(to);
  };

  const goBack = () => {
    haptic.impact('light');
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setView(prev);
    } else {
      onBack();
    }
  };

  const titles: Record<EduView, string> = {
    catalog: '🎓 EdTech',
    course: 'Курс',
    lesson: 'Урок',
    quiz: 'Тест',
    score: 'Результаты',
    certificate: 'Сертификат',
  };

  const selectedCourse =
    COURSES.find((c) => c.id === selectedCourseId) ?? COURSES[0];

  const correctAnswers = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === q.correct,
  ).length;
  const totalQuestions = QUIZ_QUESTIONS.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  const handleAnswer = (questionId: string, optionId: string) => {
    haptic.selection();
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        haptic.notification('success');
        navigate('score');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-th-bg">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-th-bg/80 backdrop-blur-xl border-b border-th-border/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-th/60 hover:text-th transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              {history.length === 0 ? 'Кейсы' : 'Назад'}
            </span>
          </button>
          <h1 className="text-sm font-bold text-th absolute left-1/2 -translate-x-1/2">
            {titles[view]}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── CATALOG ─── */}
        {view === 'catalog' && (
          <ViewWrapper key="catalog">
            <div className="px-4 pt-4 pb-8">
              {/* Header hero */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 p-5 mb-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">
                      Образовательная платформа
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-black mb-1">
                    Учись. Практикуй. Расти.
                  </h2>
                  <p className="text-white/70 text-sm">
                    Курсы от практикующих экспертов с живыми заданиями
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-white/80 text-xs">
                    <span>🎓 5 241 выпускник</span>
                    <span>⭐ 4.9 рейтинг</span>
                    <span>🏆 Сертификаты</span>
                  </div>
                </div>
              </div>

              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Курсы
              </p>
              <div className="space-y-3">
                {COURSES.map((course, i) => (
                  <motion.button
                    key={course.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      navigate('course');
                    }}
                    className="w-full text-left bg-th-raised/60 rounded-2xl p-4 border border-th-border/5"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {course.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-th">
                          {course.title}
                        </p>
                        <p className="text-xs text-th/50 mt-0.5">
                          {course.subtitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-th/40">
                          <span>{course.lessons} уроков</span>
                          <span>•</span>
                          <span>{course.hours}ч</span>
                          <span>•</span>
                          <span>⭐ {course.rating}</span>
                        </div>
                      </div>
                    </div>
                    {course.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-th/40">Прогресс</span>
                          <span className="text-xs text-th/60">
                            {course.progress}/{course.lessons}
                          </span>
                        </div>
                        <div className="h-1.5 bg-th-border/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${course.gradient} rounded-full`}
                            style={{
                              width: `${(course.progress / course.lessons) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── COURSE ─── */}
        {view === 'course' && (
          <ViewWrapper key="course">
            <div className="px-4 pt-4 pb-8">
              {/* Course hero */}
              <div
                className={`rounded-3xl bg-gradient-to-br ${selectedCourse.gradient} p-5 mb-6 relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
                <div className="text-4xl mb-3">{selectedCourse.emoji}</div>
                <h2 className="text-white text-xl font-black mb-1">
                  {selectedCourse.title}
                </h2>
                <p className="text-white/70 text-sm mb-4">
                  {selectedCourse.subtitle}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: `${selectedCourse.lessons}`, l: 'уроков' },
                    { v: `${selectedCourse.hours}ч`, l: 'контента' },
                    {
                      v: `${selectedCourse.students.toLocaleString()}`,
                      l: 'учеников',
                    },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="bg-black/20 rounded-xl p-2 text-center backdrop-blur-sm"
                    >
                      <div className="text-white font-bold text-sm">{s.v}</div>
                      <div className="text-white/50 text-[10px]">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {selectedCourse.progress > 0 && (
                <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-th">
                      Ваш прогресс
                    </span>
                    <span className="text-sm text-th/60">
                      {selectedCourse.progress}/{selectedCourse.lessons}
                    </span>
                  </div>
                  <div className="h-2 bg-th-border/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${selectedCourse.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(selectedCourse.progress / selectedCourse.lessons) * 100}%`,
                      }}
                      transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Lessons */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Программа курса
              </p>
              <div className="space-y-2">
                {selectedCourse.topics.map((topic, i) => (
                  <motion.button
                    key={topic.id}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={topic.current ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (topic.current) {
                        setLessonProgress(0);
                        navigate('lesson');
                      } else if (!topic.done) {
                        haptic.notification('warning');
                      }
                    }}
                    className={`w-full text-left rounded-2xl p-3.5 flex items-center gap-3 border ${
                      topic.current
                        ? 'border-blue-500/30 bg-blue-500/10'
                        : topic.done
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-th-border/5 bg-th-raised/40 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        topic.done
                          ? 'bg-emerald-500/20'
                          : topic.current
                            ? `bg-gradient-to-br ${selectedCourse.gradient}`
                            : 'bg-th-border/10'
                      }`}
                    >
                      {topic.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : topic.current ? (
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      ) : (
                        <span className="text-xs text-th/30 font-bold">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${topic.done ? 'text-th/70' : topic.current ? 'text-th' : 'text-th/40'}`}
                      >
                        {topic.title}
                      </p>
                      {topic.current && (
                        <p className="text-xs text-blue-400 mt-0.5">
                          Текущий урок
                        </p>
                      )}
                    </div>
                    {topic.done && (
                      <span className="text-emerald-400 text-xs">✓</span>
                    )}
                    {topic.current && (
                      <span className="text-blue-400 text-xs">›</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── LESSON ─── */}
        {view === 'lesson' && (
          <ViewWrapper key="lesson">
            <div className="px-4 pt-4 pb-8">
              {/* Lesson header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-th/40 text-xs uppercase tracking-wider">
                    Урок 3 из 12
                  </p>
                  <h2 className="text-xl font-black text-th mt-1">
                    {LESSON_CONTENT.title}
                  </h2>
                </div>
                <div className="bg-blue-500/10 rounded-xl px-3 py-1.5">
                  <p className="text-blue-400 text-xs font-medium">
                    {LESSON_CONTENT.duration}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-th-border/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${lessonProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Lesson content */}
              <div className="space-y-4 mb-8">
                {LESSON_CONTENT.blocks.map((block, i) => {
                  const blockKey = `${block.type}-${i}`;
                  if (block.type === 'text') {
                    return (
                      <p
                        key={blockKey}
                        className="text-sm text-th/80 leading-relaxed"
                      >
                        {block.content}
                      </p>
                    );
                  }
                  if (block.type === 'highlight') {
                    return (
                      <div
                        key={blockKey}
                        className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4"
                      >
                        <p className="text-sm text-blue-300 leading-relaxed">
                          {block.content}
                        </p>
                      </div>
                    );
                  }
                  if (block.type === 'list' && block.items) {
                    return (
                      <div
                        key={blockKey}
                        className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5"
                      >
                        <p className="text-xs font-semibold text-th/40 uppercase tracking-wider mb-3">
                          Чеклист
                        </p>
                        <div className="space-y-2">
                          {block.items.map((item, j) => (
                            <div
                              key={item}
                              className="flex items-start gap-2.5"
                            >
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-[10px] font-bold">
                                  {j + 1}
                                </span>
                              </div>
                              <p className="text-sm text-th/80">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Progress controls */}
              <div className="space-y-3">
                {lessonProgress < 100 ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      haptic.selection();
                      setLessonProgress((p) => Math.min(100, p + 35));
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base"
                  >
                    Читаю дальше →
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setAnswers({});
                      setCurrentQuestion(0);
                      navigate('quiz');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base"
                  >
                    Пройти тест ✓
                  </motion.button>
                )}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── QUIZ ─── */}
        {view === 'quiz' && (
          <ViewWrapper key={`quiz-${currentQuestion}`}>
            <div className="px-4 pt-4 pb-8">
              {/* Quiz header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-th/40 text-sm">
                  Вопрос {currentQuestion + 1} из {totalQuestions}
                </p>
                <div className="flex gap-1">
                  {QUIZ_QUESTIONS.map((q, i) => (
                    <div
                      key={q.id}
                      className={`w-6 h-1.5 rounded-full transition-colors ${
                        i < currentQuestion
                          ? 'bg-emerald-400'
                          : i === currentQuestion
                            ? 'bg-blue-400'
                            : 'bg-th-border/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h2 className="text-lg font-bold text-th mb-6 leading-snug">
                {QUIZ_QUESTIONS[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {QUIZ_QUESTIONS[currentQuestion].options.map((option) => {
                  const isSelected =
                    answers[QUIZ_QUESTIONS[currentQuestion].id] === option.id;
                  const isCorrect =
                    option.id === QUIZ_QUESTIONS[currentQuestion].correct;
                  const hasAnswer =
                    QUIZ_QUESTIONS[currentQuestion].id in answers;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileTap={!hasAnswer ? { scale: 0.98 } : {}}
                      onClick={() =>
                        !hasAnswer &&
                        handleAnswer(
                          QUIZ_QUESTIONS[currentQuestion].id,
                          option.id,
                        )
                      }
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        hasAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : hasAnswer && isSelected && !isCorrect
                            ? 'border-rose-500 bg-rose-500/10'
                            : isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-th-border/10 bg-th-raised/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${
                            hasAnswer && isCorrect
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : hasAnswer && isSelected && !isCorrect
                                ? 'border-rose-500 bg-rose-500 text-white'
                                : 'border-th-border/20 text-th/50'
                          }`}
                        >
                          {option.id.toUpperCase()}
                        </div>
                        <span
                          className={`text-sm font-medium ${hasAnswer && (isCorrect || (isSelected && !isCorrect)) ? 'text-th' : 'text-th/80'}`}
                        >
                          {option.text}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── SCORE ─── */}
        {view === 'score' && (
          <ViewWrapper key="score">
            <div className="px-4 pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5"
              >
                <span className="text-4xl font-black text-white">{score}%</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-black text-th mb-1">
                  {score >= 80
                    ? 'Отлично!'
                    : score >= 60
                      ? 'Хорошо!'
                      : 'Попробуй ещё раз'}
                </h2>
                <p className="text-th/50 text-sm mb-6">
                  {correctAnswers} из {totalQuestions} правильных ответов
                </p>

                <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    {QUIZ_QUESTIONS.map((q, i) => (
                      <div
                        key={q.id}
                        className={`flex-1 flex flex-col items-center gap-1`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            answers[q.id] === q.correct
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {answers[q.id] === q.correct ? '✓' : '✗'}
                        </div>
                        <span className="text-th/40 text-[10px]">
                          Вопрос {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {score >= 70 && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('certificate')}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base flex items-center justify-center gap-2"
                    >
                      <Award className="w-5 h-5" />
                      Получить сертификат
                    </motion.button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers({});
                      setCurrentQuestion(0);
                      navigate('quiz');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-th-raised/60 border border-th-border/10 text-th/70 font-medium text-sm"
                  >
                    Пройти тест заново
                  </button>
                </div>
              </motion.div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── CERTIFICATE ─── */}
        {view === 'certificate' && (
          <ViewWrapper key="certificate">
            <div className="px-4 pt-4 pb-8">
              {/* Certificate card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-50/5 to-yellow-50/5 p-6 mb-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[repeating-linear-gradient(45deg,#f59e0b_0px,#f59e0b_1px,transparent_1px,transparent_20px)]" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Сертификат об окончании
                  </p>
                  <h2 className="text-xl font-black text-th mb-1">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-th/50 text-sm mb-5">
                    {selectedCourse.subtitle}
                  </p>

                  <div className="border-t border-th-border/10 pt-4">
                    <p className="text-th/30 text-xs mb-1">Выдан</p>
                    <p className="text-th font-bold">Студент платформы</p>
                  </div>

                  <div className="border-t border-th-border/10 mt-4 pt-4 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-emerald-400 text-xs font-medium">
                      Верифицирован • ID #EDU
                      {Math.floor(Math.random() * 90000) + 10000}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => haptic.notification('success')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base"
                >
                  Поделиться в канале
                </motion.button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3.5 rounded-2xl bg-th-raised/60 border border-th-border/10 text-th/70 font-medium text-sm"
                >
                  Вернуться к кейсам
                </button>
              </div>
            </div>
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
