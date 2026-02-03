import { Script, Objection } from '@/types/script';

// Novatech Trading Sales Script
export const novatechScript: Script = {
  id: 'script-novatech',
  name: 'Novatech - Холодные продажи',
  description: 'Скрипт для холодных звонков по продаже торговых услуг и инвестиций',
  version: 1,
  isActive: true,
  variables: [
    { key: 'clientName', label: 'Имя клиента', defaultValue: 'уважаемый клиент' },
    { key: 'agentName', label: 'Имя агента', defaultValue: 'Александр' },
    { key: 'companyName', label: 'Название компании', defaultValue: 'Novatech' },
  ],
  blocks: [
    // ============ ПРИВЕТСТВИЕ (5-10 секунд) ============
    {
      id: 'greeting',
      type: 'greeting',
      title: 'Приветствие',
      content: 'Добрый день, {clientName}! Меня зовут {agentName}, я из компании {companyName}. Звоню буквально на минуту — это очень короткий разговор, не займёт много времени.',
      position: { x: 100, y: 100 },
      isEntryPoint: true,
      transitions: [
        { id: 'trans-greeting-1', label: 'Клиент слушает', targetBlockId: 'hook' },
        { id: 'trans-greeting-2', label: 'Занят / перезвонить', targetBlockId: 'obj-no-time' },
        { id: 'trans-greeting-3', label: 'Не интересно (сразу)', targetBlockId: 'obj-not-interested' },
      ],
    },

    // ============ ИНТРИГА / ЦЕННОСТНОЕ ПРЕДЛОЖЕНИЕ ============
    {
      id: 'hook',
      type: 'pitch',
      title: 'Интрига',
      content: 'Мы работаем с частными инвесторами, помогаем оптимизировать стратегии на валютном рынке в условиях текущей волатильности крипто-активов и Форекс.',
      position: { x: 400, y: 100 },
      transitions: [
        { id: 'trans-hook-1', label: 'Продолжает слушать', targetBlockId: 'experience-check' },
        { id: 'trans-hook-2', label: 'Что конкретно?', targetBlockId: 'experience-check' },
        { id: 'trans-hook-3', label: 'Не интересно', targetBlockId: 'obj-not-interested' },
      ],
    },

    // ============ ВЫЯВЛЕНИЕ ОПЫТА (КЛЮЧЕВОЙ ВОПРОС) ============
    {
      id: 'experience-check',
      type: 'question',
      title: 'Проверка опыта',
      content: 'Скажите, у вас уже есть опыт инвестирования? Вы понимаете, о чём идёт речь?',
      position: { x: 700, y: 100 },
      transitions: [
        { id: 'trans-exp-1', label: 'Да, есть опыт', targetBlockId: 'exp-yes-details' },
        { id: 'trans-exp-2', label: 'Нет опыта', targetBlockId: 'exp-no-reassure' },
        { id: 'trans-exp-3', label: 'Немного / пробовал', targetBlockId: 'exp-partial' },
      ],
    },

    // ============ ВЕТКА: ЕСТЬ ОПЫТ ============
    {
      id: 'exp-yes-details',
      type: 'question',
      title: 'Детали опыта',
      content: 'Отлично! Расскажите в двух словах про ваш опыт: насколько был успешен? Сколько удалось заработать? Где торгуете сейчас?',
      position: { x: 1000, y: 50 },
      transitions: [
        { id: 'trans-yes-1', label: 'Успешный опыт', targetBlockId: 'exp-successful' },
        { id: 'trans-yes-2', label: 'Были потери', targetBlockId: 'exp-unsuccessful' },
        { id: 'trans-yes-3', label: 'Нестабильные результаты', targetBlockId: 'exp-unstable' },
      ],
    },

    {
      id: 'exp-successful',
      type: 'question',
      title: 'Успешный опыт',
      content: 'Впечатляет! А насколько вы сейчас довольны доходностью по сравнению с рыночными показателями начала года? Есть ли желание масштабировать результаты?',
      position: { x: 1300, y: 0 },
      transitions: [
        { id: 'trans-suc-1', label: 'Хочу больше', targetBlockId: 'proposal-advanced' },
        { id: 'trans-suc-2', label: 'Всё устраивает', targetBlockId: 'obj-already-satisfied' },
      ],
    },

    {
      id: 'exp-unsuccessful',
      type: 'pitch',
      title: 'Были потери',
      content: 'Понимаю, это частая история на рынке. Именно поэтому мы предлагаем работу с профессиональным аналитиком, который поможет избежать типичных ошибок и выстроить стабильную стратегию.',
      position: { x: 1300, y: 100 },
      transitions: [
        { id: 'trans-unsuc-1', label: 'Интересно', targetBlockId: 'proposal-support' },
        { id: 'trans-unsuc-2', label: 'Больше не хочу рисковать', targetBlockId: 'obj-risk' },
      ],
    },

    {
      id: 'exp-unstable',
      type: 'pitch',
      title: 'Нестабильные результаты',
      content: 'Это знакомая ситуация. Нестабильность часто связана с отсутствием чёткой стратегии и дисциплины. Мы можем помочь вам найти торгового советника или пройти экспресс-курс для системного подхода.',
      position: { x: 1300, y: 200 },
      transitions: [
        { id: 'trans-unstab-1', label: 'Расскажите подробнее', targetBlockId: 'proposal-advisor' },
        { id: 'trans-unstab-2', label: 'Сомневаюсь', targetBlockId: 'obj-doubt' },
      ],
    },

    // ============ ВЕТКА: НЕТ ОПЫТА ============
    {
      id: 'exp-no-reassure',
      type: 'pitch',
      title: 'Успокоение новичка',
      content: 'Ничего страшного, мы все когда-то начинали впервые! Тут нет ничего сложного. В любом случае, компания предоставит вам опытного специалиста, который всё объяснит и будет сопровождать в течение всего времени торговли.',
      position: { x: 1000, y: 200 },
      transitions: [
        { id: 'trans-no-1', label: 'Интересно узнать', targetBlockId: 'proposal-beginner' },
        { id: 'trans-no-2', label: 'Не уверен, нужно ли мне', targetBlockId: 'obj-need' },
        { id: 'trans-no-3', label: 'Боюсь потерять деньги', targetBlockId: 'obj-risk' },
      ],
    },

    {
      id: 'exp-partial',
      type: 'question',
      title: 'Частичный опыт',
      content: 'Понятно. А с чем именно работали — Форекс, криптовалюты, акции? Что не получилось или чего не хватало?',
      position: { x: 1000, y: 300 },
      transitions: [
        { id: 'trans-part-1', label: 'Форекс/Крипто', targetBlockId: 'proposal-advisor' },
        { id: 'trans-part-2', label: 'Не хватало знаний', targetBlockId: 'proposal-beginner' },
        { id: 'trans-part-3', label: 'Не хватало времени', targetBlockId: 'proposal-automated' },
      ],
    },

    // ============ ПРЕДЛОЖЕНИЯ (по сегментам) ============
    {
      id: 'proposal-advanced',
      type: 'pitch',
      title: 'Предложение: Продвинутый',
      content: 'Для опытных трейдеров у нас есть VIP-программа с персональным аналитиком, эксклюзивные торговые сигналы и доступ к закрытым стратегиям с ROI от 15% в месяц.',
      position: { x: 1600, y: 0 },
      transitions: [
        { id: 'trans-adv-1', label: 'Готов узнать детали', targetBlockId: 'closing-demo' },
        { id: 'trans-adv-2', label: 'Какие гарантии?', targetBlockId: 'obj-guarantees' },
      ],
    },

    {
      id: 'proposal-support',
      type: 'pitch',
      title: 'Предложение: С поддержкой',
      content: 'Мы предлагаем работу с персональным аналитиком, который будет сопровождать каждую вашу сделку. Плюс обучение управлению рисками, чтобы минимизировать потери.',
      position: { x: 1600, y: 100 },
      transitions: [
        { id: 'trans-sup-1', label: 'Звучит хорошо', targetBlockId: 'closing-consultation' },
        { id: 'trans-sup-2', label: 'Сколько это стоит?', targetBlockId: 'obj-price' },
      ],
    },

    {
      id: 'proposal-advisor',
      type: 'pitch',
      title: 'Предложение: Советник',
      content: 'Мы можем помочь вам найти торгового советника, который будет приносить стабильный доход, работая 24/7. Он автоматизирует торговлю и убирает эмоциональный фактор.',
      position: { x: 1600, y: 200 },
      transitions: [
        { id: 'trans-adv-1', label: 'Как это работает?', targetBlockId: 'closing-demo' },
        { id: 'trans-adv-2', label: 'Это надёжно?', targetBlockId: 'obj-trust' },
      ],
    },

    {
      id: 'proposal-beginner',
      type: 'pitch',
      title: 'Предложение: Новичок',
      content: 'Для начинающих у нас есть программа обучения с нуля: персональный менеджер объяснит основы, проведёт через первые сделки на демо-счёте, и вы сами почувствуете, как это работает — без риска.',
      position: { x: 1600, y: 300 },
      transitions: [
        { id: 'trans-beg-1', label: 'Интересно попробовать', targetBlockId: 'closing-demo' },
        { id: 'trans-beg-2', label: 'Сколько времени займёт?', targetBlockId: 'proposal-time-answer' },
      ],
    },

    {
      id: 'proposal-automated',
      type: 'pitch',
      title: 'Предложение: Автоматизация',
      content: 'Как раз для занятых людей у нас есть инструменты автоматической торговли. Вы настраиваете параметры один раз, а система работает за вас 24/7. Занимает 15-30 минут в неделю для контроля.',
      position: { x: 1600, y: 400 },
      transitions: [
        { id: 'trans-auto-1', label: 'Покажите, как это работает', targetBlockId: 'closing-demo' },
        { id: 'trans-auto-2', label: 'Какой минимальный депозит?', targetBlockId: 'obj-price' },
      ],
    },

    {
      id: 'proposal-time-answer',
      type: 'pitch',
      title: 'Ответ про время',
      content: 'Базовое обучение занимает 3-5 дней по 1-2 часа. После этого вы уже сможете совершать осознанные сделки. А дальше — развитие по желанию, в удобном темпе.',
      position: { x: 1900, y: 350 },
      transitions: [
        { id: 'trans-time-1', label: 'Хорошо, давайте попробуем', targetBlockId: 'closing-demo' },
        { id: 'trans-time-2', label: 'Подумаю', targetBlockId: 'closing-followup' },
      ],
    },

    // ============ ОБРАБОТКА ВОЗРАЖЕНИЙ ============
    {
      id: 'obj-no-time',
      type: 'objection_handler',
      title: 'Возражение: Нет времени',
      content: 'Понимаю, время — ценный ресурс. Именно поэтому звоню на минуту. Мы как раз предлагаем инструменты, которые сэкономят ваше время, автоматизируя торговлю. Могу в двух словах рассказать — это займёт буквально 2 минуты.',
      position: { x: 400, y: 350 },
      transitions: [
        { id: 'trans-time-1', label: 'Хорошо, слушаю', targetBlockId: 'hook' },
        { id: 'trans-time-2', label: 'Нет, перезвоните', targetBlockId: 'closing-callback' },
      ],
    },

    {
      id: 'obj-not-interested',
      type: 'objection_handler',
      title: 'Возражение: Не интересно',
      content: 'Понимаю, что получаете много звонков. Скажите, а в целом тема дополнительного дохода вам интересна? Или вы уже нашли свой способ?',
      position: { x: 400, y: 450 },
      transitions: [
        { id: 'trans-ni-1', label: 'Ну, в целом интересна', targetBlockId: 'experience-check' },
        { id: 'trans-ni-2', label: 'У меня всё есть', targetBlockId: 'obj-already-satisfied' },
        { id: 'trans-ni-3', label: 'Точно не интересно', targetBlockId: 'closing-soft' },
      ],
    },

    {
      id: 'obj-already-satisfied',
      type: 'objection_handler',
      title: 'Возражение: Уже всё есть',
      content: 'Отлично, рад за вас! А скажите, вы не рассматривали диверсификацию — дополнительный инструмент помимо текущего? Это снижает общий риск портфеля.',
      position: { x: 700, y: 450 },
      transitions: [
        { id: 'trans-sat-1', label: 'Возможно, расскажите', targetBlockId: 'proposal-advisor' },
        { id: 'trans-sat-2', label: 'Нет, мне хватает', targetBlockId: 'closing-soft' },
      ],
    },

    {
      id: 'obj-risk',
      type: 'objection_handler',
      title: 'Возражение: Боюсь рисков',
      content: 'Это разумный подход — риски всегда нужно контролировать. Именно поэтому мы начинаем с демо-счёта, где вы торгуете виртуальными деньгами и видите реальные результаты без риска. Попробуете?',
      position: { x: 1000, y: 450 },
      transitions: [
        { id: 'trans-risk-1', label: 'Демо — это интересно', targetBlockId: 'closing-demo' },
        { id: 'trans-risk-2', label: 'Всё равно не уверен', targetBlockId: 'closing-materials' },
      ],
    },

    {
      id: 'obj-price',
      type: 'objection_handler',
      title: 'Возражение: Дорого',
      content: 'Понимаю вопрос о стоимости. Начать можно с минимального депозита от $250. При этом наши клиенты в среднем окупают вложения за 2-3 месяца. Давайте я покажу конкретные кейсы?',
      position: { x: 1300, y: 450 },
      transitions: [
        { id: 'trans-price-1', label: 'Покажите примеры', targetBlockId: 'closing-demo' },
        { id: 'trans-price-2', label: 'Нужно подумать', targetBlockId: 'closing-followup' },
      ],
    },

    {
      id: 'obj-trust',
      type: 'objection_handler',
      title: 'Возражение: Не доверяю',
      content: 'Здоровый скептицизм — это хорошо. {companyName} работает на рынке уже 5 лет, у нас есть лицензия, а все средства клиентов хранятся на сегрегированных счетах. Могу прислать документы и отзывы реальных клиентов.',
      position: { x: 1300, y: 550 },
      transitions: [
        { id: 'trans-trust-1', label: 'Хорошо, пришлите', targetBlockId: 'closing-materials' },
        { id: 'trans-trust-2', label: 'Сначала посмотрю сам', targetBlockId: 'closing-followup' },
      ],
    },

    {
      id: 'obj-need',
      type: 'objection_handler',
      title: 'Возражение: Не уверен, нужно ли',
      content: 'Понимаю. А скажите, у вас есть какие-то финансовые цели на ближайший год? Может быть, накопить на что-то, создать подушку безопасности, или пассивный доход?',
      position: { x: 1000, y: 550 },
      transitions: [
        { id: 'trans-need-1', label: 'Да, хотелось бы доход', targetBlockId: 'proposal-beginner' },
        { id: 'trans-need-2', label: 'Пока не думал об этом', targetBlockId: 'closing-soft' },
      ],
    },

    {
      id: 'obj-doubt',
      type: 'objection_handler',
      title: 'Возражение: Сомневаюсь',
      content: 'Сомнения — это нормально. Давайте так: я пришлю вам наш еженедельный обзор по рынку и пару кейсов клиентов. Вы посмотрите без обязательств, а я перезвоню через пару дней. Договорились?',
      position: { x: 1600, y: 550 },
      transitions: [
        { id: 'trans-doubt-1', label: 'Хорошо, присылайте', targetBlockId: 'closing-materials' },
        { id: 'trans-doubt-2', label: 'Нет, спасибо', targetBlockId: 'closing-soft' },
      ],
    },

    {
      id: 'obj-guarantees',
      type: 'objection_handler',
      title: 'Возражение: Какие гарантии',
      content: 'Честно скажу — на финансовых рынках никто не может гарантировать 100% прибыль, и если кто-то обещает — это обман. Мы гарантируем профессиональную поддержку, прозрачность и контроль рисков. Результаты зависят от стратегии, которую мы подберём вместе.',
      position: { x: 1900, y: 0 },
      transitions: [
        { id: 'trans-guar-1', label: 'Честно, ценю это', targetBlockId: 'closing-consultation' },
        { id: 'trans-guar-2', label: 'Подумаю', targetBlockId: 'closing-followup' },
      ],
    },

    // ============ ЗАКРЫТИЯ ============
    {
      id: 'closing-demo',
      type: 'closing',
      title: 'Закрытие: Демо',
      content: 'Отлично! Предлагаю вам записаться на бесплатную демонстрацию нашей платформы. Это займёт 15-20 минут, и вы сами всё увидите. Когда вам удобно — завтра в 11:00 или лучше вечером в 19:00?',
      position: { x: 2200, y: 100 },
      transitions: [],
    },

    {
      id: 'closing-consultation',
      type: 'closing',
      title: 'Закрытие: Консультация',
      content: 'Давайте назначим короткую консультацию с нашим аналитиком — он разберёт вашу ситуацию и предложит конкретный план. Это бесплатно и без обязательств. Завтра в первой половине дня или во второй?',
      position: { x: 2200, y: 200 },
      transitions: [],
    },

    {
      id: 'closing-materials',
      type: 'closing',
      title: 'Закрытие: Материалы',
      content: 'Хорошо! Давайте я пришлю вам наш обзор рынка за прошлую неделю и несколько кейсов клиентов. На какую почту или в мессенджер удобнее отправить?',
      position: { x: 2200, y: 300 },
      transitions: [],
    },

    {
      id: 'closing-followup',
      type: 'closing',
      title: 'Закрытие: Фоллоу-ап',
      content: 'Понимаю, решение требует времени. Давайте я отправлю вам информацию, и мы созвонимся через пару дней — в четверг или пятницу. Когда удобнее?',
      position: { x: 2200, y: 400 },
      transitions: [],
    },

    {
      id: 'closing-callback',
      type: 'closing',
      title: 'Закрытие: Перезвонить',
      content: 'Конечно! Когда вам будет удобно уделить 5 минут? Завтра днём или лучше на следующей неделе?',
      position: { x: 400, y: 550 },
      transitions: [],
    },

    {
      id: 'closing-soft',
      type: 'closing',
      title: 'Мягкое закрытие',
      content: 'Спасибо за ваше время! Если в будущем появится интерес к инвестициям — буду рад помочь. Хорошего дня!',
      position: { x: 700, y: 650 },
      transitions: [],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Возражения специфичные для торговли
export const tradingObjections: Objection[] = [
  {
    id: 'obj-trading-scam',
    category: 'trust',
    trigger: 'Это развод / мошенничество',
    keywords: ['развод', 'мошенники', 'лохотрон', 'скам', 'обман', 'пирамида'],
    responses: [
      {
        id: 'resp-scam-1',
        text: 'Понимаю вашу осторожность — на рынке действительно много недобросовестных компаний. {companyName} работает легально с 2019 года, имеет лицензию, и вы можете проверить нас в реестре. Давайте я пришлю вам документы?',
        tone: 'empathetic',
        effectiveness: 65,
      },
      {
        id: 'resp-scam-2',
        text: 'Скептицизм — это здорово, он защищает от мошенников. Именно поэтому мы предлагаем начать с демо-счёта — вы ничего не вкладываете и видите, как работает система.',
        tone: 'neutral',
        effectiveness: 72,
      },
    ],
    followUpBlockId: 'closing-materials',
    usageCount: 156,
    successRate: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-trading-lost-before',
    category: 'trust',
    trigger: 'Уже терял деньги на Форексе',
    keywords: ['терял', 'потерял', 'слил', 'обжёгся', 'не получилось', 'проиграл'],
    responses: [
      {
        id: 'resp-lost-1',
        text: 'Это частая история, и я понимаю ваши опасения. Большинство теряют из-за отсутствия стратегии и поддержки. У нас каждый клиент работает с персональным аналитиком, который помогает избежать типичных ошибок.',
        tone: 'empathetic',
        effectiveness: 68,
      },
      {
        id: 'resp-lost-2',
        text: 'Благодарю за честность. А что именно пошло не так — слишком большие риски, неправильная стратегия, или что-то ещё? Мы можем разобрать вашу ситуацию.',
        tone: 'curious',
        effectiveness: 75,
      },
    ],
    followUpBlockId: 'proposal-support',
    usageCount: 89,
    successRate: 42,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-trading-no-money',
    category: 'price',
    trigger: 'Нет денег на инвестиции',
    keywords: ['нет денег', 'нечего вкладывать', 'денег нет', 'не на что', 'безденежье'],
    responses: [
      {
        id: 'resp-money-1',
        text: 'Понимаю. Минимальный депозит у нас от $250 — это меньше, чем ужин в ресторане раз в месяц. При этом даже с такой суммой можно начать видеть первые результаты.',
        tone: 'neutral',
        effectiveness: 55,
      },
      {
        id: 'resp-money-2',
        text: 'А если я расскажу, как некоторые наши клиенты начинали с минимума и за полгода вышли на стабильный доход? Возможно, это изменит ваш взгляд.',
        tone: 'assertive',
        effectiveness: 48,
      },
    ],
    followUpBlockId: 'closing-materials',
    usageCount: 234,
    successRate: 22,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-trading-complex',
    category: 'need',
    trigger: 'Это слишком сложно для меня',
    keywords: ['сложно', 'не пойму', 'не разберусь', 'трудно', 'не для меня'],
    responses: [
      {
        id: 'resp-complex-1',
        text: 'Я понимаю это ощущение — со стороны всё выглядит сложным. Но наша программа обучения построена так, что даже человек без опыта разбирается за 3-5 дней. Плюс персональный менеджер всегда на связи.',
        tone: 'empathetic',
        effectiveness: 78,
      },
      {
        id: 'resp-complex-2',
        text: 'На самом деле базовые принципы очень простые — покупаешь дешевле, продаёшь дороже. Всё остальное — это инструменты, которые мы вам дадим. Хотите попробовать на демо?',
        tone: 'neutral',
        effectiveness: 71,
      },
    ],
    followUpBlockId: 'proposal-beginner',
    usageCount: 167,
    successRate: 51,
    createdAt: new Date().toISOString(),
  },
];
