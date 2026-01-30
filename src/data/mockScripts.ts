import { Script, Objection, ABTest } from '@/types/script';

export const mockScriptBlocks: Script = {
  id: 'script-1',
  name: 'Основной скрипт продаж',
  description: 'Стандартный скрипт для первичного контакта с клиентом',
  version: 1,
  isActive: true,
  variables: [
    { key: 'clientName', label: 'Имя клиента', defaultValue: 'Уважаемый клиент' },
    { key: 'agentName', label: 'Имя агента', defaultValue: 'Алексей' },
    { key: 'companyName', label: 'Название компании', defaultValue: 'AI Caller' },
  ],
  blocks: [
    {
      id: 'block-1',
      type: 'greeting',
      title: 'Приветствие',
      content: 'Здравствуйте, {clientName}! Меня зовут {agentName}, я представляю компанию {companyName}.',
      position: { x: 100, y: 100 },
      isEntryPoint: true,
      transitions: [
        { id: 'trans-1', label: 'Клиент слушает', targetBlockId: 'block-2' },
        { id: 'trans-2', label: 'Занят / перезвонить', targetBlockId: 'block-callback' },
      ],
    },
    {
      id: 'block-2',
      type: 'pitch',
      title: 'Презентация',
      content: 'Мы помогаем бизнесам автоматизировать процессы продаж и увеличить конверсию на 30-50%. Скажите, вы сейчас занимаетесь активными продажами?',
      position: { x: 400, y: 100 },
      transitions: [
        { id: 'trans-3', label: 'Да, занимаемся', targetBlockId: 'block-interested' },
        { id: 'trans-4', label: 'Нет / не актуально', targetBlockId: 'block-objection-need' },
        { id: 'trans-5', label: 'Возражение по цене', targetBlockId: 'block-objection-price' },
      ],
      objectionIds: ['obj-price', 'obj-need'],
    },
    {
      id: 'block-interested',
      type: 'question',
      title: 'Интерес подтверждён',
      content: 'Отлично! Тогда вам будет интересно узнать о нашем решении. Какой у вас сейчас основной канал привлечения клиентов?',
      position: { x: 700, y: 50 },
      transitions: [
        { id: 'trans-6', label: 'Холодные звонки', targetBlockId: 'block-solution' },
        { id: 'trans-7', label: 'Другие каналы', targetBlockId: 'block-alternative' },
      ],
    },
    {
      id: 'block-objection-need',
      type: 'objection_handler',
      title: 'Обработка: Не актуально',
      content: 'Понимаю. А планируете ли вы расширять клиентскую базу в ближайшее время?',
      position: { x: 400, y: 300 },
      transitions: [
        { id: 'trans-8', label: 'Да, планируем', targetBlockId: 'block-interested' },
        { id: 'trans-9', label: 'Нет, не планируем', targetBlockId: 'block-closing-soft' },
      ],
    },
    {
      id: 'block-objection-price',
      type: 'objection_handler',
      title: 'Обработка: Дорого',
      content: 'Я вас понимаю, вопрос бюджета важен. Давайте я расскажу, как наши клиенты окупают инвестиции уже в первый месяц...',
      position: { x: 700, y: 200 },
      transitions: [
        { id: 'trans-10', label: 'Готов слушать', targetBlockId: 'block-solution' },
        { id: 'trans-11', label: 'Всё равно дорого', targetBlockId: 'block-closing-soft' },
      ],
    },
    {
      id: 'block-solution',
      type: 'pitch',
      title: 'Описание решения',
      content: 'Наш AI-агент может совершать до 1000 звонков в день, работает 24/7 и увеличивает конверсию в 2-3 раза. Могу предложить вам бесплатную демонстрацию.',
      position: { x: 1000, y: 100 },
      transitions: [
        { id: 'trans-12', label: 'Согласен на демо', targetBlockId: 'block-closing-success' },
        { id: 'trans-13', label: 'Нужно подумать', targetBlockId: 'block-closing-followup' },
      ],
    },
    {
      id: 'block-alternative',
      type: 'question',
      title: 'Альтернативные каналы',
      content: 'Интересно! А какие результаты даёт этот канал? Мы можем дополнить его AI-звонками для увеличения охвата.',
      position: { x: 700, y: 350 },
      transitions: [
        { id: 'trans-14', label: 'Интересно', targetBlockId: 'block-solution' },
        { id: 'trans-15', label: 'Не интересно', targetBlockId: 'block-closing-soft' },
      ],
    },
    {
      id: 'block-callback',
      type: 'closing',
      title: 'Перезвонить позже',
      content: 'Понимаю, вы заняты. Когда вам будет удобно, чтобы я перезвонил?',
      position: { x: 100, y: 300 },
      transitions: [],
    },
    {
      id: 'block-closing-success',
      type: 'closing',
      title: 'Успешное закрытие',
      content: 'Отлично! Давайте согласуем удобное время для демонстрации. Какой день вам подходит?',
      position: { x: 1300, y: 50 },
      transitions: [],
    },
    {
      id: 'block-closing-followup',
      type: 'closing',
      title: 'Фоллоу-ап',
      content: 'Хорошо, я отправлю вам информацию на почту и перезвоню через пару дней. Договорились?',
      position: { x: 1300, y: 150 },
      transitions: [],
    },
    {
      id: 'block-closing-soft',
      type: 'closing',
      title: 'Мягкое завершение',
      content: 'Спасибо за ваше время! Если в будущем появится интерес — буду рад помочь. Всего доброго!',
      position: { x: 700, y: 500 },
      transitions: [],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockObjections: Objection[] = [
  {
    id: 'obj-price',
    category: 'price',
    trigger: 'Это слишком дорого',
    keywords: ['дорого', 'цена', 'бюджет', 'денег нет', 'не по карману', 'стоимость'],
    responses: [
      {
        id: 'resp-1',
        text: 'Понимаю ваше беспокойство о бюджете. Давайте посмотрим на это с другой стороны: наши клиенты окупают инвестиции уже в первый месяц благодаря увеличению продаж.',
        tone: 'empathetic',
        effectiveness: 78,
      },
      {
        id: 'resp-2',
        text: 'А с чем вы сравниваете? Если посчитать стоимость одного звонка менеджера и AI-агента, разница будет в 10 раз.',
        tone: 'curious',
        effectiveness: 65,
      },
      {
        id: 'resp-3',
        text: 'Именно поэтому мы предлагаем бесплатный пилот на 100 звонков — вы сами увидите результат без рисков.',
        tone: 'assertive',
        effectiveness: 82,
      },
    ],
    followUpBlockId: 'block-solution',
    usageCount: 234,
    successRate: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-need',
    category: 'need',
    trigger: 'Нам это не нужно',
    keywords: ['не нужно', 'не актуально', 'не интересно', 'хватает', 'есть уже'],
    responses: [
      {
        id: 'resp-4',
        text: 'Понимаю, что сейчас может казаться, что всё работает хорошо. А если я покажу, как увеличить продажи на 30% без дополнительных сотрудников — это было бы интересно?',
        tone: 'curious',
        effectiveness: 72,
      },
      {
        id: 'resp-5',
        text: 'Многие наши клиенты так думали вначале. Но после пилота поняли, что упускали возможности. Готовы попробовать бесплатно?',
        tone: 'assertive',
        effectiveness: 58,
      },
    ],
    followUpBlockId: 'block-interested',
    usageCount: 189,
    successRate: 32,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-timing',
    category: 'timing',
    trigger: 'Сейчас не время',
    keywords: ['позже', 'не сейчас', 'перезвоните', 'занят', 'не время', 'потом'],
    responses: [
      {
        id: 'resp-6',
        text: 'Понимаю, у вас много дел. Когда было бы удобно уделить мне 5 минут? Я могу перезвонить в любое время.',
        tone: 'empathetic',
        effectiveness: 85,
      },
      {
        id: 'resp-7',
        text: 'Хорошо! Могу отправить короткую презентацию на почту, а потом созвонимся? Какой email удобнее?',
        tone: 'neutral',
        effectiveness: 76,
      },
    ],
    followUpBlockId: 'block-callback',
    usageCount: 312,
    successRate: 55,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-trust',
    category: 'trust',
    trigger: 'Не доверяю AI',
    keywords: ['робот', 'автомат', 'не живой', 'AI', 'искусственный', 'не доверяю'],
    responses: [
      {
        id: 'resp-8',
        text: 'Отличный вопрос! Наш AI работает как помощник менеджера, а не замена. Он освобождает время от рутины, чтобы ваши сотрудники фокусировались на сложных переговорах.',
        tone: 'empathetic',
        effectiveness: 71,
      },
      {
        id: 'resp-9',
        text: 'Кстати, 87% клиентов не замечают, что говорят с AI. Хотите проверить на демо?',
        tone: 'assertive',
        effectiveness: 68,
      },
    ],
    followUpBlockId: 'block-solution',
    usageCount: 98,
    successRate: 41,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-competitor',
    category: 'competitor',
    trigger: 'У нас уже есть решение',
    keywords: ['конкурент', 'другой', 'уже есть', 'пользуемся', 'работаем с'],
    responses: [
      {
        id: 'resp-10',
        text: 'Здорово, что вы уже автоматизируете продажи! С каким решением работаете? Возможно, мы могли бы дополнить его.',
        tone: 'curious',
        effectiveness: 62,
      },
      {
        id: 'resp-11',
        text: 'Интересно! А довольны ли вы результатами? Наши клиенты переходили к нам после повышения конверсии на 40%.',
        tone: 'assertive',
        effectiveness: 55,
      },
    ],
    followUpBlockId: 'block-alternative',
    usageCount: 67,
    successRate: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-authority',
    category: 'authority',
    trigger: 'Я не принимаю решения',
    keywords: ['не решаю', 'начальник', 'директор', 'руководство', 'согласовать'],
    responses: [
      {
        id: 'resp-12',
        text: 'Понимаю! А кто в вашей компании отвечает за такие решения? Возможно, я мог бы связаться напрямую или отправить информацию.',
        tone: 'neutral',
        effectiveness: 79,
      },
      {
        id: 'resp-13',
        text: 'Хорошо. Могли бы вы передать информацию руководителю? Я подготовлю краткую презентацию специально для него.',
        tone: 'empathetic',
        effectiveness: 73,
      },
    ],
    followUpBlockId: 'block-closing-followup',
    usageCount: 145,
    successRate: 38,
    createdAt: new Date().toISOString(),
  },
];

export const mockABTests: ABTest[] = [
  {
    id: 'test-1',
    name: 'Тест приветствия',
    status: 'running',
    variants: [
      { id: 'var-a', name: 'Формальное', scriptId: 'script-1', weight: 50 },
      { id: 'var-b', name: 'Дружелюбное', scriptId: 'script-2', weight: 50 },
    ],
    metrics: [
      { variantId: 'var-a', calls: 156, conversions: 23, avgDuration: 180 },
      { variantId: 'var-b', calls: 148, conversions: 31, avgDuration: 210 },
    ],
    startDate: '2025-01-20',
    createdAt: new Date().toISOString(),
  },
];

export const scriptsList: Script[] = [
  mockScriptBlocks,
  {
    id: 'script-2',
    name: 'Скрипт для повторного звонка',
    description: 'Для клиентов, которые просили перезвонить',
    version: 1,
    isActive: false,
    variables: [
      { key: 'clientName', label: 'Имя клиента' },
      { key: 'previousTopic', label: 'Тема прошлого разговора' },
    ],
    blocks: [
      {
        id: 'block-1',
        type: 'greeting',
        title: 'Приветствие',
        content: 'Добрый день, {clientName}! Это снова {agentName} из {companyName}. Мы с вами общались по поводу {previousTopic}.',
        position: { x: 100, y: 100 },
        isEntryPoint: true,
        transitions: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
