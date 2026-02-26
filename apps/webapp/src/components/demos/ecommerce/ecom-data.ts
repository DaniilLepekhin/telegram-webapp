import type { DemoCategory, DemoProduct } from './ecom-types';

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 'outerwear', name: 'Верхняя одежда', icon: '🧥' },
  { id: 'tshirts', name: 'Футболки', icon: '👕' },
  { id: 'accessories', name: 'Аксессуары', icon: '🎒' },
  { id: 'shoes', name: 'Обувь', icon: '👟' },
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45'];

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ── Верхняя одежда ──────────────────────────────────────────────
  {
    id: 'p1',
    name: 'Tech-флиска Nebula',
    description:
      'Лёгкая флисовая куртка с мембранной подкладкой. Идеальна для межсезонья — дышит, не продувается, быстро сохнет. Светоотражающие элементы для безопасности в тёмное время.',
    price: 4990,
    compareAtPrice: 6990,
    categoryId: 'outerwear',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    icon: '🧥',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Чёрный', value: 'bg-zinc-900' },
      { name: 'Индиго', value: 'bg-indigo-700' },
    ],
    rating: 4.8,
    reviewCount: 124,
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Ветровка Urban Shield',
    description:
      'Водоотталкивающая ветровка с капюшоном. Упаковывается в собственный карман. Проклеенные швы, YKK-молнии, регулируемые манжеты.',
    price: 7490,
    categoryId: 'outerwear',
    gradient: 'from-cyan-600 via-teal-600 to-emerald-700',
    icon: '🧥',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Хаки', value: 'bg-emerald-800' },
      { name: 'Тёмно-синий', value: 'bg-blue-900' },
      { name: 'Чёрный', value: 'bg-zinc-900' },
    ],
    rating: 4.6,
    reviewCount: 87,
    isNew: true,
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Худи Midnight',
    description:
      'Oversized худи из плотного хлопка 320 г/м². Начёс inside, рибана на манжетах. Вышитый логотип на груди. Унисекс крой.',
    price: 3990,
    categoryId: 'outerwear',
    gradient: 'from-slate-700 via-gray-800 to-zinc-900',
    icon: '🧥',
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Чёрный', value: 'bg-zinc-900' },
      { name: 'Серый', value: 'bg-gray-500' },
      { name: 'Графит', value: 'bg-slate-700' },
    ],
    rating: 4.9,
    reviewCount: 256,
    isBestseller: true,
    inStock: true,
  },

  // ── Футболки ───────────────────────────────────────────────────
  {
    id: 'p4',
    name: 'Oversize-тишка Cloud',
    description:
      'Воздушная oversize-футболка из органического хлопка. Опущенное плечо, удлинённый крой. Принт-вышивка «облако» на спине.',
    price: 2490,
    categoryId: 'tshirts',
    gradient: 'from-sky-500 via-blue-500 to-indigo-600',
    icon: '👕',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Белый', value: 'bg-white' },
      { name: 'Голубой', value: 'bg-sky-400' },
    ],
    rating: 4.7,
    reviewCount: 198,
    isNew: true,
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Базовая футболка Mono',
    description:
      'Классическая базовая футболка из 100% хлопка Supima. Плотность 180 г/м², усиленный воротник. Идеальна под пиджак или соло.',
    price: 1490,
    compareAtPrice: 1990,
    categoryId: 'tshirts',
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    icon: '👕',
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Белый', value: 'bg-white' },
      { name: 'Чёрный', value: 'bg-zinc-900' },
      { name: 'Серый', value: 'bg-gray-400' },
      { name: 'Синий', value: 'bg-blue-800' },
    ],
    rating: 4.5,
    reviewCount: 412,
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Поло Premium',
    description:
      'Поло из пике-хлопка с эластаном. Современный slim-fit крой, вышитый логотип. Дышащая ткань для активного лета.',
    price: 2990,
    categoryId: 'tshirts',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    icon: '👕',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Тёмно-зелёный', value: 'bg-emerald-800' },
      { name: 'Белый', value: 'bg-white' },
      { name: 'Синий', value: 'bg-blue-700' },
    ],
    rating: 4.4,
    reviewCount: 76,
    inStock: true,
  },

  // ── Аксессуары ─────────────────────────────────────────────────
  {
    id: 'p7',
    name: 'Кепка Stealth',
    description:
      'Бейсболка с изогнутым козырьком. 6-панельный дизайн, металлическая застёжка. Вышивка на фронтальной панели.',
    price: 1990,
    categoryId: 'accessories',
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
    icon: '🧢',
    colors: [
      { name: 'Чёрный', value: 'bg-zinc-900' },
      { name: 'Белый', value: 'bg-white' },
    ],
    rating: 4.3,
    reviewCount: 145,
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Рюкзак Voyager 25L',
    description:
      'Городской рюкзак из водоотталкивающего нейлона. Отделение для ноутбука 15.6", скрытый карман, USB-порт для зарядки. Ортопедическая спинка.',
    price: 5490,
    categoryId: 'accessories',
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    icon: '🎒',
    sizes: undefined,
    rating: 4.8,
    reviewCount: 203,
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'p9',
    name: 'Смарт-часы Pulse X2',
    description:
      'Фитнес-часы с AMOLED дисплеем. SpO2, ЧСС, GPS, 7 дней автономности. Водозащита IP68. Совместимы с iOS и Android.',
    price: 8990,
    compareAtPrice: 12990,
    categoryId: 'accessories',
    gradient: 'from-amber-500 via-yellow-500 to-orange-600',
    icon: '⌚',
    rating: 4.7,
    reviewCount: 318,
    isNew: true,
    inStock: true,
  },

  // ── Обувь ──────────────────────────────────────────────────────
  {
    id: 'p10',
    name: 'Кроссовки AirFlow',
    description:
      'Беговые кроссовки с технологией AirFlow. Подошва из EVA с карбоновой пластиной. Сетчатый верх для вентиляции. Вес 240 г.',
    price: 6990,
    categoryId: 'shoes',
    gradient: 'from-red-500 via-rose-600 to-pink-700',
    icon: '👟',
    sizes: SHOE_SIZES,
    colors: [
      { name: 'Белый/Красный', value: 'bg-red-500' },
      { name: 'Чёрный', value: 'bg-zinc-900' },
    ],
    rating: 4.6,
    reviewCount: 189,
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'p11',
    name: 'Слипоны Canvas',
    description:
      'Лёгкие слипоны из плотного canvas-хлопка. Вулканизированная подошва, мягкая стелька из пены. Повседневная классика.',
    price: 3490,
    categoryId: 'shoes',
    gradient: 'from-teal-500 via-cyan-600 to-sky-700',
    icon: '👞',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Бежевый', value: 'bg-amber-100' },
      { name: 'Чёрный', value: 'bg-zinc-900' },
      { name: 'Хаки', value: 'bg-emerald-800' },
    ],
    rating: 4.4,
    reviewCount: 97,
    inStock: true,
  },
  {
    id: 'p12',
    name: 'Ботинки Trail Pro',
    description:
      'Треккинговые ботинки с Gore-Tex мембраной. Подошва Vibram, защита пальцев, система быстрой шнуровки. Для города и лёгких троп.',
    price: 9990,
    compareAtPrice: 11990,
    categoryId: 'shoes',
    gradient: 'from-stone-600 via-amber-700 to-yellow-800',
    icon: '🥾',
    sizes: ['40', '41', '42', '43', '44', '45'],
    rating: 4.9,
    reviewCount: 64,
    isNew: true,
    inStock: true,
  },
];
