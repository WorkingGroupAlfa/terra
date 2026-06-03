import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CalendarCheck, ChevronDown,
  Flame, Leaf, Mail, Menu, Phone, ShieldCheck,
  Sprout, SunMedium, Wind, X, Zap,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'terra_energia_leads_v1';
const ADMIN_PASSWORD = 'terra-admin-2026';
const heroImage = 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=2200&q=85';

const copy = {
  en: {
    code: 'EN',
    nav: ['About', 'Solutions', 'How it works', 'Contact'],
    cta: 'Free consultation',
    heroKicker: 'Warm air systems · Green energy · Europe',
    heroTitle: 'Cleaner heat.\nLower bills.\nBetter energy.',
    heroText: 'Terra Energia designs warm-air and renewable energy systems for homes and businesses — real comfort, without waste.',
    heroBtn: 'Get a free assessment',
    heroGhost: 'See solutions',
    proof1: 'Free consultation',
    proof2: 'EN · UA · SK · DE',
    proof3: 'Homes & businesses',
    heroPanelText: 'potential energy savings after optimisation*',
    introTitle: 'Energy upgrades that feel simple from day one.',
    introText: 'We study your property, calculate the right system and explain every option in plain language — then guide you to cleaner, more efficient heating.',
    cards: [
      ['Warm air systems', 'Efficient heating and ventilation for comfort, speed and lower heat loss.'],
      ['Green energy', 'Solar, wind and hybrid setups matched to real properties and budgets.'],
      ['Energy audit', 'Honest assessment of heat loss, usage and upgrade potential before you commit.'],
      ['Commercial projects', 'Reliable climate solutions for offices, stores, workshops and hospitality.'],
    ],
    valueTitle: 'Why choose Terra Energia?',
    valueText: 'From first call to installation — we make modern heating simple, transparent and worth every euro.',
    valueItems: [
      ['Up to 37% lower energy bills', 'A well-designed warm-air or renewable system cuts heating costs by up to 37%. Typical payback period: 4–7 years.'],
      ['Fast, clean installation', 'Most systems are installed in 1–3 days with no heavy construction. Your property stays tidy, your routine intact.'],
      ['Certified European equipment', 'We work only with verified suppliers and certified components that meet EU energy and safety standards.'],
      ['Free consultation, no pressure', 'We assess your property, calculate the system and deliver a clear proposal — no obligation to proceed.'],
    ],
    processTitle: 'How it works',
    process: [
      ['Request', 'Send property details, photos or a question through the form.'],
      ['Assessment', 'We review your goals, current heating, insulation and energy potential.'],
      ['Proposal', 'You receive a clear recommendation with next steps and expected savings.'],
      ['Installation', 'We coordinate timing, suppliers and technical setup for your project.'],
    ],
    formTitle: 'Get a free assessment',
    formText: 'Leave your contact — we will call to arrange a time that works for you.',
    labels: { name: 'Name', phone: 'Phone', service: 'Service', message: 'Details (optional)', consent: 'I agree to be contacted about my request.' },
    services: ['Warm air system', 'Green energy consultation', 'Energy audit', 'Commercial project', 'Other'],
    submit: 'Send request',
    success: '✓ Request received — we will be in touch shortly.',
    footer: 'Warm air and green energy for a cleaner future.',
    adminTitle: 'Terra Energia admin',
    password: 'Password',
    unlock: 'Open admin',
    logout: 'Log out',
    records: 'Submissions',
    empty: 'No requests yet.',
    export: 'Export CSV',
    clear: 'Clear all',
  },
  ua: {
    code: 'UA',
    nav: ['Про нас', 'Рішення', 'Як працює', 'Контакти'],
    cta: 'Консультація',
    heroKicker: 'Тепле повітря · Зелена енергетика · Європа',
    heroTitle: 'Чисте тепло.\nМенше витрат.\nКраща енергія.',
    heroText: 'Terra Energia проєктує системи теплого повітря та відновлюваної енергії для будинків і бізнесу — реальний комфорт, без зайвих витрат.',
    heroBtn: 'Безкоштовна оцінка',
    heroGhost: 'Дивитися рішення',
    proof1: 'Безкоштовна консультація',
    proof2: 'EN · UA · SK · DE',
    proof3: 'Будинки та бізнес',
    heroPanelText: 'потенційна економія енергії після оптимізації*',
    introTitle: 'Проста й зрозуміла модернізація з першої розмови.',
    introText: 'Аналізуємо об\'єкт, підбираємо систему, пояснюємо варіанти без технічного жаргону та допомагаємо перейти до ефективного опалення.',
    cards: [
      ['Системи теплого повітря', 'Ефективне опалення й вентиляція з фокусом на комфорт та зменшення втрат.'],
      ['Зелена енергія', 'Сонячні, вітрові та гібридні рішення для реальних об\'єктів і бюджетів.'],
      ['Енергоаудит', 'Чесна оцінка тепловтрат, споживання й потенціалу модернізації.'],
      ['Комерційні проєкти', 'Надійний клімат-контроль для офісів, магазинів, майстерень і HoReCa.'],
    ],
    valueTitle: 'Чому обирають Terra Energia?',
    valueText: 'Від першої консультації до монтажу — робимо сучасне опалення зрозумілим, простим і вигідним.',
    valueItems: [
      ['До 37% економії на опаленні', 'Правильно спроєктовані системи теплого повітря та зеленої енергії знижують витрати на опалення до 37%. Окупність — 4–7 років.'],
      ['Швидкий і чистий монтаж', 'Більшість систем монтується за 1–3 дні без важких будівельних робіт. Об\'єкт залишається чистим, розпорядок не порушується.'],
      ['Сертифіковане європейське обладнання', 'Працюємо лише з перевіреними постачальниками та компонентами, що відповідають стандартам ЄС.'],
      ['Безкоштовна консультація, без зобов\'язань', 'Оцінюємо об\'єкт, розраховуємо систему та представляємо зрозумілу пропозицію — без тиску й зобов\'язань.'],
    ],
    processTitle: 'Як це працює',
    process: [
      ['Заявка', 'Надсилаєте деталі об\'єкта, фото або питання через форму.'],
      ['Оцінка', 'Перевіряємо цілі, поточне опалення, утеплення й енергетичний потенціал.'],
      ['Пропозиція', 'Отримуєте зрозуміле рішення з кроками та очікуваною економією.'],
      ['Монтаж', 'Координуємо терміни, постачання й технічну підготовку.'],
    ],
    formTitle: 'Безкоштовна оцінка об\'єкта',
    formText: 'Залиште контакт — передзвонимо і домовимося про зручний час.',
    labels: { name: 'Ім\'я', phone: 'Телефон', service: 'Послуга', message: 'Деталі (необов\'язково)', consent: 'Я погоджуюся на зв\'язок щодо заявки.' },
    services: ['Система теплого повітря', 'Консультація із зеленої енергії', 'Енергоаудит', 'Комерційний об\'єкт', 'Інше'],
    submit: 'Надіслати заявку',
    success: '✓ Заявку отримано — незабаром зв\'яжемося.',
    footer: 'Тепле повітря та зелена енергія для чистого майбутнього.',
    adminTitle: 'Адмінка Terra Energia',
    password: 'Пароль',
    unlock: 'Відкрити',
    logout: 'Вийти',
    records: 'Заявки',
    empty: 'Поки немає заявок.',
    export: 'Експорт CSV',
    clear: 'Очистити',
  },
  sk: {
    code: 'SK',
    nav: ['O nás', 'Riešenia', 'Ako funguje', 'Kontakt'],
    cta: 'Konzultácia',
    heroKicker: 'Teplý vzduch · Zelená energia · Európa',
    heroTitle: 'Čistejšie teplo.\nNižšie účty.\nLepšia energia.',
    heroText: 'Terra Energia navrhuje systémy teplého vzduchu a obnoviteľnej energie pre domy a firmy — skutočný komfort, bez zbytočných nákladov.',
    heroBtn: 'Bezplatné posúdenie',
    heroGhost: 'Pozrieť riešenia',
    proof1: 'Bezplatná konzultácia',
    proof2: 'EN · UA · SK · DE',
    proof3: 'Domy aj firmy',
    heroPanelText: 'potenciálna úspora energie po optimalizácii*',
    introTitle: 'Energetická modernizácia jednoducho od prvého kontaktu.',
    introText: 'Preštudujeme vašu nehnuteľnosť, navrhneme systém, vysvetlíme možnosti bez žargónu a sprevádzame vás k efektívnejšiemu vykurovaniu.',
    cards: [
      ['Systémy teplého vzduchu', 'Efektívne vykurovanie a vetranie pre komfort a nižšie tepelné straty.'],
      ['Zelená energia', 'Solárne, veterné a hybridné riešenia pre reálne objekty a rozpočty.'],
      ['Energetický audit', 'Praktické posúdenie tepelných strát a potenciálu modernizácie pred rozhodnutím.'],
      ['Komerčné projekty', 'Spoľahlivý klimatický systém pre kancelárie, obchody, dielne a gastro.'],
    ],
    valueTitle: 'Prečo si vybrať Terra Energia?',
    valueText: 'Od prvej konzultácie po montáž — moderné vykurovanie robíme jednoduchým, zrozumiteľným a výhodným.',
    valueItems: [
      ['Až 37 % nižšie náklady na vykurovanie', 'Správne navrhnuté systémy teplého vzduchu a zelenej energie znižujú náklady na vykurovanie až o 37 %. Návratnosť zvyčajne 4–7 rokov.'],
      ['Rýchla a čistá montáž', 'Väčšina systémov sa inštaluje za 1–3 dni bez ťažkých stavebných prác. Objekt zostáva čistý, rutina nenarušená.'],
      ['Certifikované európske zariadenia', 'Pracujeme iba s overenými dodávateľmi a certifikovanými komponentmi spĺňajúcimi normy EÚ.'],
      ['Bezplatná konzultácia, bez záväzkov', 'Posúdime vašu nehnuteľnosť, navrhneme systém a predložíme jasný návrh — bez tlaku a záväzkov.'],
    ],
    processTitle: 'Ako to funguje',
    process: [
      ['Dopyt', 'Pošlete detaily nehnuteľnosti, fotky alebo otázku cez formulár.'],
      ['Posúdenie', 'Skontrolujeme ciele, aktuálne kúrenie, izoláciu a energetický potenciál.'],
      ['Návrh', 'Dostanete jasné odporúčanie s ďalšími krokmi a očakávanými úsporami.'],
      ['Realizácia', 'Koordinujeme termín, dodávateľov a technickú prípravu.'],
    ],
    formTitle: 'Bezplatné posúdenie nehnuteľnosti',
    formText: 'Zanechajte kontakt — zavoláme a dohodneme vhodný čas.',
    labels: { name: 'Meno', phone: 'Telefón', service: 'Služba', message: 'Detaily (nepovinné)', consent: 'Súhlasím s kontaktovaním ohľadom mojej žiadosti.' },
    services: ['Systém teplého vzduchu', 'Konzultácia zelenej energie', 'Energetický audit', 'Komerčný projekt', 'Iné'],
    submit: 'Odoslať žiadosť',
    success: '✓ Žiadosť prijatá — čoskoro sa vám ozveme.',
    footer: 'Teplý vzduch a zelená energia pre čistejšiu budúcnosť.',
    adminTitle: 'Admin Terra Energia',
    password: 'Heslo',
    unlock: 'Otvoriť',
    logout: 'Odhlásiť',
    records: 'Žiadosti',
    empty: 'Zatiaľ žiadne žiadosti.',
    export: 'Export CSV',
    clear: 'Vymazať',
  },
  de: {
    code: 'DE',
    nav: ['Über uns', 'Lösungen', 'Ablauf', 'Kontakt'],
    cta: 'Beratung',
    heroKicker: 'Warmluft · Grüne Energie · Europa',
    heroTitle: 'Saubere Wärme.\nWeniger Kosten.\nBessere Energie.',
    heroText: 'Terra Energia plant Warmluft- und Erneuerbare-Energie-Systeme für Häuser und Betriebe — echter Komfort, ohne unnötigen Aufwand.',
    heroBtn: 'Kostenlose Einschätzung',
    heroGhost: 'Lösungen ansehen',
    proof1: 'Kostenlose Beratung',
    proof2: 'EN · UA · SK · DE',
    proof3: 'Privat & Gewerbe',
    heroPanelText: 'potenzielle Energieeinsparung nach Optimierung*',
    introTitle: 'Energie-Modernisierung, die ab dem ersten Gespräch klar ist.',
    introText: 'Wir analysieren Ihre Immobilie, berechnen das passende System, erklären Optionen ohne Fachjargon und begleiten Sie zu effizienter Wärme.',
    cards: [
      ['Warmluftsysteme', 'Effiziente Heizung und Lüftung für Komfort und weniger Wärmeverlust.'],
      ['Grüne Energie', 'Solar-, Wind- und Hybridlösungen für reale Objekte und Budgets.'],
      ['Energiecheck', 'Ehrliche Bewertung von Wärmeverlust und Modernisierungspotenzial vor der Entscheidung.'],
      ['Gewerbliche Projekte', 'Zuverlässige Klimatechnik für Büros, Shops, Werkstätten und Gastronomie.'],
    ],
    valueTitle: 'Warum Terra Energia wählen?',
    valueText: 'Von der ersten Beratung bis zur Installation — moderne Heizung einfach, klar und wirtschaftlich.',
    valueItems: [
      ['Bis zu 37 % niedrigere Heizkosten', 'Richtig geplante Warmluft- und Erneuerbare-Systeme senken die Heizkosten um bis zu 37 %. Amortisation typisch in 4–7 Jahren.'],
      ['Schnelle, saubere Installation', 'Die meisten Systeme werden in 1–3 Tagen ohne Baustelle installiert. Ihr Objekt bleibt sauber, Ihr Alltag ungestört.'],
      ['Zertifizierte europäische Geräte', 'Wir arbeiten nur mit geprüften Lieferanten und zertifizierten Komponenten nach EU-Energiestandard.'],
      ['Kostenlose Beratung, kein Druck', 'Wir bewerten Ihre Immobilie, berechnen das System und legen einen klaren Vorschlag vor — ohne Verpflichtung.'],
    ],
    processTitle: 'So funktioniert es',
    process: [
      ['Anfrage', 'Objektdaten, Fotos oder erste Fragen über das Formular senden.'],
      ['Analyse', 'Wir prüfen Ziele, aktuelle Heizung, Dämmung und Energiepotenzial.'],
      ['Vorschlag', 'Sie erhalten eine klare Empfehlung mit nächsten Schritten und Einsparungen.'],
      ['Umsetzung', 'Wir koordinieren Termin, Lieferanten und technische Vorbereitung.'],
    ],
    formTitle: 'Kostenlose Immobilienbewertung',
    formText: 'Hinterlassen Sie Ihre Daten — wir rufen zurück und vereinbaren einen passenden Termin.',
    labels: { name: 'Name', phone: 'Telefon', service: 'Leistung', message: 'Details (optional)', consent: 'Ich stimme zu, bezüglich meiner Anfrage kontaktiert zu werden.' },
    services: ['Warmluftsystem', 'Beratung grüne Energie', 'Energiecheck', 'Gewerbeprojekt', 'Andere'],
    submit: 'Anfrage senden',
    success: '✓ Anfrage eingegangen — wir melden uns in Kürze.',
    footer: 'Warmluft und grüne Energie für eine sauberere Zukunft.',
    adminTitle: 'Terra Energia Admin',
    password: 'Passwort',
    unlock: 'Öffnen',
    logout: 'Abmelden',
    records: 'Anfragen',
    empty: 'Noch keine Anfragen.',
    export: 'CSV exportieren',
    clear: 'Alle löschen',
  },
};

function getLeads() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveLead(lead) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([lead, ...getLeads()]));
  window.dispatchEvent(new Event('terra-leads-update'));
}

// ── animation presets ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function CountUp({ end, delay = 700 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const frames = 1400 / 16;
      const step = end / frames;
      let cur = 0;
      const id = setInterval(() => {
        cur = Math.min(cur + step, end);
        setN(Math.round(cur));
        if (cur >= end) clearInterval(id);
      }, 16);
    }, delay);
    return () => clearTimeout(t);
  }, [end, delay]);
  return <>{n}</>;
}

function AccordionItem({ title, body }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item${open ? ' open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="accordion-body">{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ lang, setLang, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = ['#about', '#solutions', '#process', '#contact'];
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Terra Energia">
        <span className="brand-mark"><Leaf size={20} /></span>
        <span>Terra Energia</span>
      </a>
      <nav className="desktop-nav">
        {t.nav.map((item, i) => <a key={item} href={navLinks[i]}>{item}</a>)}
      </nav>
      <div className="header-actions">
        <div className="lang-switcher">
          {Object.keys(copy).map(key => (
            <button key={key} className={lang === key ? 'active' : ''} onClick={() => setLang(key)}>
              {copy[key].code}
            </button>
          ))}
        </div>
        <a className="primary small" href="#contact">{t.cta}</a>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Menu"><Menu /></button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <button className="close" onClick={() => setMenuOpen(false)}><X /></button>
            {t.nav.map((item, i) => (
              <a key={item} href={navLinks[i]} onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
            <div className="mobile-langs">
              {Object.keys(copy).map(key => (
                <button key={key} className={lang === key ? 'active' : ''} onClick={() => { setLang(key); setMenuOpen(false); }}>
                  {copy[key].code}
                </button>
              ))}
            </div>
            <a className="primary" href="#contact" onClick={() => setMenuOpen(false)}>
              {t.cta} <ArrowRight size={18} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero({ t }) {
  return (
    <section id="top" className="hero" style={{ backgroundImage: `linear-gradient(100deg, rgba(5,29,22,.92), rgba(5,29,22,.38)), url(${heroImage})` }}>
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
      >
        <p className="kicker"><Wind size={17} /> {t.heroKicker}</p>
        <h1>{t.heroTitle}</h1>
        <p className="hero-copy">{t.heroText}</p>
        <div className="hero-buttons">
          <motion.a
            className="primary"
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.heroBtn} <ArrowRight size={18} />
          </motion.a>
          <a className="secondary" href="#solutions">{t.heroGhost}</a>
        </div>
        <motion.div
          className="proof-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          {[t.proof1, t.proof2, t.proof3].map(item => (
            <span key={item}>{item}</span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <SunMedium />
        <strong><CountUp end={37} />%</strong>
        <span>{t.heroPanelText}</span>
      </motion.div>
    </section>
  );
}

// ── Solutions ──────────────────────────────────────────────────────────────
const icons = [Flame, Wind, ShieldCheck, Zap];

function Solutions({ t }) {
  return (
    <>
      <motion.section
        id="about"
        className="section split"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <p className="eyebrow"><Sprout size={16} /> Terra Energia</p>
          <h2>{t.introTitle}</h2>
        </motion.div>
        <motion.p className="large-text" variants={fadeUp}>{t.introText}</motion.p>
      </motion.section>

      <motion.section
        id="solutions"
        className="section cards-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
      >
        {t.cards.map(([title, text], i) => {
          const Icon = icons[i];
          return (
            <motion.article
              key={title}
              className="service-card"
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          );
        })}
      </motion.section>
    </>
  );
}

// ── Conversion block with accordion ───────────────────────────────────────
function ConversionBlock({ t }) {
  return (
    <motion.section
      className="section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
    >
      <div className="conversion">
        <motion.div variants={fadeUp}>
          <h2>{t.valueTitle}</h2>
          <p className="conversion-sub">{t.valueText}</p>
        </motion.div>
        <motion.div className="accordion-list" variants={stagger}>
          {t.valueItems.map(([title, body]) => (
            <motion.div key={title} variants={fadeUp}>
              <AccordionItem title={title} body={body} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// ── Process ────────────────────────────────────────────────────────────────
function Process({ t }) {
  return (
    <motion.section
      id="process"
      className="section process-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.h2 variants={fadeUp}>{t.processTitle}</motion.h2>
      <div className="process-grid">
        {t.process.map(([title, text], i) => (
          <motion.div key={title} className="process-card" variants={fadeUp}>
            <span className="step">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ── Lead form ──────────────────────────────────────────────────────────────
function LeadForm({ t, lang }) {
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', service: t.services[0], message: '', consent: false });

  function update(key, value) { setForm(c => ({ ...c, [key]: value })); }

  function submit(e) {
    e.preventDefault();
    if (!form.consent) return;
    saveLead({ ...form, lang, createdAt: new Date().toISOString(), id: crypto.randomUUID() });
    setStatus(t.success);
    setForm({ name: '', phone: '', service: t.services[0], message: '', consent: false });
    setTimeout(() => setStatus(''), 5000);
  }

  return (
    <motion.section
      id="contact"
      className="section contact-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
    >
      <motion.div className="contact-copy" variants={fadeUp}>
        <p className="eyebrow"><CalendarCheck size={16} /> Terra Energia</p>
        <h2>{t.formTitle}</h2>
        <p>{t.formText}</p>
        <div className="contact-methods">
          <a href="tel:+421900000000"><Phone size={18} /> +421 900 000 000</a>
          <a href="mailto:hello@terraenergia.eu"><Mail size={18} /> hello@terraenergia.eu</a>
        </div>
      </motion.div>

      <motion.form className="lead-form" onSubmit={submit} variants={fadeUp}>
        <div className="two-col">
          <label>{t.labels.name}<input required value={form.name} onChange={e => update('name', e.target.value)} /></label>
          <label>{t.labels.phone}<input required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} /></label>
        </div>
        <label>{t.labels.service}
          <select value={form.service} onChange={e => update('service', e.target.value)}>
            {t.services.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>{t.labels.message}<textarea rows="3" value={form.message} onChange={e => update('message', e.target.value)} /></label>
        <label className="consent">
          <input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} />
          {t.labels.consent}
        </label>
        <motion.button className="primary full" type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          {t.submit} <ArrowRight size={18} />
        </motion.button>
        <AnimatePresence>
          {status && (
            <motion.p
              className="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {status}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.section>
  );
}

// ── Admin panel ────────────────────────────────────────────────────────────
function AdminPanel({ t, open, setOpen }) {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('terra_admin_ok') === '1');
  const [leads, setLeads] = useState(getLeads);

  useEffect(() => {
    const refresh = () => setLeads(getLeads());
    window.addEventListener('terra-leads-update', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('terra-leads-update', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  if (!open) return null;

  function login(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { sessionStorage.setItem('terra_admin_ok', '1'); setUnlocked(true); }
  }
  function logout() { sessionStorage.removeItem('terra_admin_ok'); setUnlocked(false); }
  function clearAll() { localStorage.removeItem(STORAGE_KEY); setLeads([]); }
  function exportCsv() {
    const h = ['createdAt', 'name', 'phone', 'service', 'message', 'lang'];
    const csv = [h.join(','), ...leads.map(l => h.map(k => `"${String(l[k] || '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'terra-leads.csv' });
    a.click();
  }

  return (
    <AnimatePresence>
      <motion.aside
        className="admin-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
      >
        <button className="admin-close" onClick={() => setOpen(false)}><X size={18} /></button>
        {!unlocked ? (
          <form onSubmit={login} className="admin-login">
            <h3>{t.adminTitle}</h3>
            <label>{t.password}<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
            <button className="primary full" type="submit">{t.unlock}</button>
          </form>
        ) : (
          <div>
            <div className="admin-head">
              <div><h3>{t.records}</h3><p>{leads.length} total</p></div>
              <button onClick={logout}>{t.logout}</button>
            </div>
            <div className="admin-tools">
              <button onClick={exportCsv}>{t.export}</button>
              <button onClick={clearAll}>{t.clear}</button>
            </div>
            <div className="lead-list">
              {!leads.length && <p className="empty">{t.empty}</p>}
              {leads.map(lead => (
                <article className="lead-item" key={lead.id}>
                  <strong>{lead.name}</strong>
                  <span>{new Date(lead.createdAt).toLocaleString()} · {lead.service}</span>
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                  {lead.message && <p>{lead.message}</p>}
                </article>
              ))}
            </div>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>Terra Energia</span></div>
      <p>{t.footer}</p>
    </footer>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  const browserLang = navigator.language?.slice(0, 2);
  const [lang, setLang] = useState(['uk', 'de', 'sk'].includes(browserLang) ? (browserLang === 'uk' ? 'ua' : browserLang) : 'en');
  const [adminOpen, setAdminOpen] = useState(false);
  const t = useMemo(() => copy[lang], [lang]);

  // secret keyboard shortcut: type "terra" to open admin
  useEffect(() => {
    const buf = [];
    const handle = (e) => {
      buf.push(e.key.toLowerCase());
      if (buf.slice(-5).join('') === 'terra') { setAdminOpen(v => !v); buf.length = 0; }
      if (buf.length > 20) buf.splice(0, buf.length - 10);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  return (
    <>
      <Header lang={lang} setLang={setLang} t={t} />
      <Hero t={t} />
      <Solutions t={t} />
      <ConversionBlock t={t} />
      <Process t={t} />
      <LeadForm t={t} lang={lang} />
      <Footer t={t} />
      <AdminPanel t={t} open={adminOpen} setOpen={setAdminOpen} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
