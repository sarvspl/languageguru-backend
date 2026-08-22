/**
 * languageCityController.js
 * Full CRUD for Language + City localized page overrides.
 * Architecture mirrors serviceCityController.js exactly.
 */

const prisma = require("../config/db");

function defaultSlug(languageKey, cityKey) {
  return languageKey + "-translation-services-in-" + cityKey;
}

function buildDefaultLanguageCityOverride(language, city) {
  const LN = language.name || "Translation";
  const lnLow = LN.toLowerCase();
  const FLAG = language.flag || "🌐";
  const CN = city.name || "Delhi";
  const cnLow = CN.toLowerCase();
  const LK = language.key;
  const CK = city.key;

  const basePrice = language.price || 899;
  const pStd = Math.max(Math.round(basePrice * 0.72), 499);
  const pExp = Math.round(basePrice * 1.5);

  const defaultProcessSteps = [
    { step: 1, title: "Submit Documents", desc: "Share scanned copies via WhatsApp, email, or drop off at our " + CN + " office." },
    { step: 2, title: "Instant Quote", desc: "Receive an itemised " + lnLow + " translation quote with timeline in 30 minutes." },
    { step: 3, title: "Native Translation", desc: "Assigned to a certified native " + LN + " linguist with domain expertise." },
    { step: 4, title: "QA & Certification", desc: "Independent proofreading, official seal, and Certificate of Accuracy under ISO 17100." },
    { step: 5, title: "Express Delivery", desc: "Digital PDF emailed in 24 hrs; hard copy couriered to any address in " + CN + "." }
  ];

  const defaultIntroParagraphs = [
    "Language Guru is " + CN + "'s leading ISO-certified " + LN + " translation agency delivering professional, embassy-accepted " + LN + "↔English/Hindi translation services to individuals, law firms, hospitals, and corporates in " + CN + " since 2005.",
    "Our certified " + LN + " translators are native speakers and domain specialists in legal, medical, academic, immigration, and business translation — serving every major district in " + CN + " with 24-hour express delivery.",
    "All " + LN + " translations are delivered on official letterhead with a signed Certificate of Accuracy, accepted by 60+ embassies, MEA, all Indian courts, and universities worldwide from " + CN + "."
  ];

  const defaultLegalParagraphs = [
    "Language Guru provides court-certified " + LN + " legal translation in " + CN + " — covering affidavits, contracts, court judgments, power of attorney, MOA/AOA, and all evidentiary documents.",
    "Our legal " + LN + " translators in " + CN + " are qualified professionals with deep expertise in Indian and international legal terminology, ensuring 100% court and embassy acceptance."
  ];

  const defaultOfficialParagraphs = [
    "Official " + LN + " translations from Language Guru in " + CN + " meet the strict formatting and accuracy standards required by Indian government bodies, embassies, consulates, and MEA.",
    "We provide sworn and notarized official " + LN + " translations in " + CN + " for visa applications, MEA apostille, embassy attestation, university admissions, and all government submissions."
  ];

  const defaultCertifiedParagraphs = [
    "Every certified " + LN + " translation from Language Guru in " + CN + " is printed on official letterhead with a unique certification number, authorized translator signature, official seal, and Certificate of Accuracy.",
    "Our certified " + LN + " translations are accepted by all 60+ embassies in New Delhi, MEA, High Court, all district courts, passport offices, banks, and universities from " + CN + "."
  ];

  const defaultAgencyParagraphs = [
    "With 20+ years, 50,000+ projects, and 500+ certified translators, Language Guru is India's most trusted " + LN + " translation agency serving " + CN + ".",
    "All translations undergo a strict three-tier quality control process — native translation, expert review, and final proofreading — before our official seal is applied."
  ];

  const defaultInterpParagraphs = [
    "Language Guru provides professional simultaneous, consecutive, and remote " + LN + " interpretation services in " + CN + " for summits, court proceedings, medical appointments, and diplomatic events."
  ];

  const defaultDocCategories = [
    { id: "cat-immigration", name: "Immigration & Visa", icon: "🛂", color: "#dbeafe", panelTitle: LN + " Immigration Document Translation in " + CN, panelSub: "Visa, PR, work permit, immigration forms", docs: "Passport Copy, Visa Application, Police Clearance (PCC), Birth Certificate, Marriage Certificate, Sponsorship Letter, Employment Contract", ctaText: "Need " + LN + " immigration translation in " + CN + "?", ctaBtn: "📋 Get Quote" },
    { id: "cat-legal", name: "Legal & Court", icon: "⚖️", color: "#e0e7ff", panelTitle: LN + " Legal Document Translation in " + CN, panelSub: "Affidavits, contracts, court orders & agreements", docs: "Affidavit, Power of Attorney, Court Judgment, Contract, Partnership Deed, MOA/AOA, NDA, Patent", ctaText: "Need sworn " + LN + " legal translation in " + CN + "?", ctaBtn: "⚖️ Get Legal Quote" },
    { id: "cat-academic", name: "Academic & Degrees", icon: "🎓", color: "#fef3c7", panelTitle: LN + " Academic Document Translation in " + CN, panelSub: "Degrees, diplomas, transcripts & marksheet", docs: "Degree Certificate, Diploma, Transcript, Marksheet, Migration Certificate, Recommendation Letter, Syllabus", ctaText: "Applying to " + LN + "-speaking universities from " + CN + "?", ctaBtn: "🎓 Get Academic Quote" },
    { id: "cat-medical", name: "Medical & Healthcare", icon: "🏥", color: "#fee2e2", panelTitle: LN + " Medical Document Translation in " + CN, panelSub: "Medical reports, clinical trials & prescriptions", docs: "Medical Report, Discharge Summary, Clinical Trial Dossier, Prescription, Lab Test, Vaccine Card, Hospital Record", ctaText: "Need " + LN + " medical translation from " + CN + "?", ctaBtn: "🏥 Get Medical Quote" },
    { id: "cat-business", name: "Business & Corporate", icon: "💼", color: "#f3e8ff", panelTitle: LN + " Business Document Translation in " + CN, panelSub: "Company documents, agreements & trade licenses", docs: "Articles of Association, Board Resolution, Annual Report, Business Plan, Trade License, Invoice, Financial Statement", ctaText: LN + " business translation in " + CN + "?", ctaBtn: "💼 Get Corporate Quote" },
    { id: "cat-technical", name: "Technical & Engineering", icon: "⚙️", color: "#dcfce7", panelTitle: LN + " Technical Document Translation in " + CN, panelSub: "Manuals, patents, engineering documents", docs: "Technical Manual, Patent Application, Engineering Specification, Safety Data Sheet, Product Brochure, Software Manual", ctaText: LN + " technical translation from " + CN + "?", ctaBtn: "⚙️ Get Technical Quote" }
  ];

  const defaultPricingTiers = [
    { tier: 1, name: "Standard Translation", price: "₹" + pStd, unit: "per page", delivery: "5–7 Days", badge: "", feats: "Professional " + lnLow + " translation|Standard accuracy review|Digital PDF delivery|Email support" },
    { tier: 2, name: "Certified Translation", price: "₹" + basePrice, unit: "per page", delivery: "24–48 Hours", badge: "MOST POPULAR", feats: "ISO 17100 Certified " + lnLow + " translation|Certificate of Accuracy|Agency Sign & Stamp|Embassy & Court Accepted|Courier across " + CN },
    { tier: 3, name: "Express & Notarized", price: "₹" + pExp, unit: "per page", delivery: "24 Hours Express", badge: "EXPRESS", feats: "Urgent 24-hr turnaround|Notarized with Advocate Stamp|Apostille/Embassy ready|Priority linguist assignment|Free express courier in " + CN }
  ];

  const defaultWhyChooseList = [
    { icon: "🏛️", title: "Govt. & Embassy Approved", desc: "Accepted by 60+ embassies, MEA, courts, universities, and government bodies in " + CN + " and worldwide." },
    { icon: "🏅", title: "ISO 17100:2015 Certified", desc: "Dual ISO certification guaranteeing highest " + lnLow + " translation accuracy and quality management." },
    { icon: "⚡", title: "24-Hour Express Delivery", desc: "Same-day and 24-hour " + lnLow + " translation available for urgent submissions in " + CN + "." },
    { icon: "🔒", title: "Strict Confidentiality", desc: "Full NDA and GDPR-compliant data security for all sensitive personal and corporate documents." }
  ];

  const defaultSampleCerts = [
    { doc: "Birth Certificate", lang: "English → " + LN, flag: FLAG, acc: "Embassy Accepted", time: "24 Hrs", icon: "📜" },
    { doc: "Degree Certificate", lang: "English → " + LN, flag: FLAG, acc: "University Accepted", time: "24 Hrs", icon: "🎓" },
    { doc: "Marriage Certificate", lang: LN + " → English", flag: FLAG, acc: "Embassy & MEA", time: "24 Hrs", icon: "💍" },
    { doc: "Legal Contract", lang: LN + " → English", flag: FLAG, acc: "Court Certified", time: "48 Hrs", icon: "⚖️" }
  ];

  const defaultReviews = [
    { stars: "⭐⭐⭐⭐⭐", text: "Language Guru delivered my certified " + LN + " translation for a visa application in " + CN + " in just 24 hours. Accepted by the embassy immediately. Superb service!", name: "Rahul Sharma", role: "Visa Applicant · " + CN, avatar: "RS" },
    { stars: "⭐⭐⭐⭐⭐", text: "Outstanding " + LN + " translation for our corporate contracts in " + CN + ". Accurate legal terminology, prompt delivery, and official Certificate of Accuracy. Highly recommended!", name: "Priya Mehta", role: "Corporate Legal Counsel · " + CN, avatar: "PM" },
    { stars: "⭐⭐⭐⭐⭐", text: "Professional team in " + CN + ". Got my academic transcripts translated from English to " + LN + " in 2 days. Clear pricing, no hidden costs.", name: "Aakash Gupta", role: "Higher Studies Applicant · " + CN, avatar: "AG" }
  ];

  const defaultFaqs = [
    { q: "How much does " + LN + " translation cost in " + CN + "?", a: LN + " translation in " + CN + " starts from ₹" + pStd + "/page (standard), ₹" + basePrice + "/page (certified with agency letterhead + Certificate of Accuracy), and ₹" + pExp + "/page (express 24-hr). Bulk discounts available for 10+ pages." },
    { q: "Are your " + LN + " translations accepted by embassies in " + CN + "?", a: "Yes — our certified " + LN + " translations carry the Agency Sign & Stamp and Certificate of Accuracy under ISO-9001:2015 and ISO 17100:2015, accepted by 60+ embassies, MEA, all Indian courts, and universities from " + CN + "." },
    { q: "How fast can I get " + LN + " translation in " + CN + "?", a: "Standard delivery is 2–3 working days. Certified delivery is 24–48 hours. Express 24-hr turnaround is available for urgent submissions from " + CN + "." },
    { q: "Do you provide " + LN + " translation in cities other than " + CN + "?", a: "Yes! We provide ISO-certified " + LN + " translation across 108 cities in India including Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, and more." },
    { q: "How do I submit my documents for " + LN + " translation in " + CN + "?", a: "Submit online by sharing scanned copies via email or WhatsApp — 100% online process with free courier delivery across " + CN + ". Office visits also welcome." },
    { q: "What types of documents do you translate from " + LN + " in " + CN + "?", a: "We translate all document types — birth, marriage, degree, and death certificates; court orders, affidavits, contracts; medical reports; bank statements; technical manuals; and much more from " + CN + "." }
  ];

  const defaultTrustCards = {
    trustCard1: "🏛️ Govt. Authorized | MSME Reg. · ISO-9001:2015 and ISO 17100:2015",
    trustCard2: "⭐ 4.9/5 Rating | 10,000+ verified Google reviews in " + CN,
    trustCard3: "🚗 Easy Submission | Office / email / WhatsApp",
    trustCard4: "⚡ 24-Hr Express | Urgent " + lnLow + " translation in 24 hours",
    trustCard5: "✅ 100% Accepted | All embassies · All courts · MEA " + CN,
    trustCard6: "🔒 Confidential | NDA-backed · GDPR compliant · Secure"
  };

  const co = {
    introParagraphs: defaultIntroParagraphs,
    legalParagraphs: defaultLegalParagraphs,
    officialParagraphs: defaultOfficialParagraphs,
    certifiedParagraphs: defaultCertifiedParagraphs,
    agencyParagraphs: defaultAgencyParagraphs,
    interpParagraphs: defaultInterpParagraphs,
    docCategories: defaultDocCategories,
    pricingTiers: defaultPricingTiers,
    sampleCertsList: defaultSampleCerts,
    processSteps: defaultProcessSteps,
    whyChooseList: defaultWhyChooseList,
    ...defaultTrustCards,
    pricingTitle: LN + " Translation Pricing in " + CN,
    whyChooseTitle: "Why Choose Language Guru for " + LN + " Translation in " + CN + "?",
    reviewsTitle: "Client Reviews – " + LN + " Translation " + CN,
    faqsTitle: "FAQs – " + LN + " Translation in " + CN,
    aboutTitle: LN + " Translation Services in " + CN + " – Language Guru",
    agencyTitle: LN + " Translation Agency in " + CN,
    docsTitle: LN + " Document Translation in " + CN,
    docsSubtitle: "We handle 100+ document types across all categories. Click a category to explore:",
    certSampleTitle: LN + " Translation Certificate Samples",
    certSampleSubtitle: "View verified ISO-certified " + lnLow + " translation samples:",
    interpTitle: LN + " Interpretation Services in " + CN,
    servicesTitle: LN + " Translation Services in " + CN + " – All Types",
    industriesTitle: "Industry-Specific " + LN + " Translation in " + CN
  };

  return {
    languageKey: LK,
    cityKey: CK,
    slug: defaultSlug(LK, CK),
    metaTitle: LN + " Translation Services in " + CN + " | ISO Certified | Language Guru",
    metaDesc: "Professional " + lnLow + " translation in " + CN + ". ISO-certified native translators, embassy-accepted documents, 24-hr express delivery. Certified " + lnLow + " translation with Certificate of Accuracy. Get a free quote.",
    metaKeywords: lnLow + " translation " + cnLow + ", certified " + lnLow + " translation " + cnLow + ", " + lnLow + " translator " + cnLow + ", translation agency " + cnLow,
    ogImage: "",
    heroBadge: "#1 " + LN + " Translation in " + CN,
    heroFlag: FLAG + " " + LN + " Translation Services · " + CN,
    heroIso: "ISO 17100:2015 & ISO 9001:2015 Certified",
    heroTitle: LN + " Translation\nServices in " + CN,
    heroSub: "Language Guru is " + CN + "'s leading " + lnLow + " translation agency — ISO-9001:2015 and ISO 17100:2015 certified. 120+ language pairs, 50,000+ documents delivered, accepted by all embassies, courts and universities. Serving " + CN + " since 2005.",
    heroBgImage: "",
    heroBtn1Text: "📋 Get Free Quote",
    heroBtn1Link: "/quote",
    heroBtn2Text: "📞 Call Expert",
    heroBtn2Phone: "+91-9312690490",
    heroBtn3Text: "💬 WhatsApp",
    heroBtn3WA: "919312690490",
    heroBadgesList: "✅ All Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized & Apostilled | ⭐ 4.9/5 · 10,000+ Reviews",
    title: LN + " Translation Services in " + CN,
    p1: defaultIntroParagraphs[0],
    p2: defaultIntroParagraphs[1],
    aboutTitle: LN + " Translation Services in " + CN + " – Language Guru",
    agencyTitle: LN + " Translation Agency in " + CN,
    agencyOfficeTitle: "📍 " + LN + " Translation Agency – " + CN + " Office",
    officeAddressText: "617, West End Mall, Janakpuri, New Delhi – 110058 | Serving " + CN + " with Express Delivery",
    processTag: "HOW IT WORKS",
    processTitle: "5-Step " + LN + " Translation Process in " + CN,
    step1Title: defaultProcessSteps[0].title, step1Desc: defaultProcessSteps[0].desc,
    step2Title: defaultProcessSteps[1].title, step2Desc: defaultProcessSteps[1].desc,
    step3Title: defaultProcessSteps[2].title, step3Desc: defaultProcessSteps[2].desc,
    step4Title: defaultProcessSteps[3].title, step4Desc: defaultProcessSteps[3].desc,
    step5Title: defaultProcessSteps[4].title, step5Desc: defaultProcessSteps[4].desc,
    pricingTitle: LN + " Translation Pricing in " + CN,
    currencySymbol: "₹",
    pricingAddons: "➕ Add-ons: Notarization ₹200/page · MEA Apostille ₹1,400/page · Embassy Attestation ₹5,500/page · Courier ₹200 | Bulk: 10+ pages – 10% off · 20+ pages – 15% off",
    tier1Name: defaultPricingTiers[0].name, tier1Price: defaultPricingTiers[0].price, tier1Unit: defaultPricingTiers[0].unit, tier1Delivery: defaultPricingTiers[0].delivery,
    tier2Name: defaultPricingTiers[1].name, tier2Badge: defaultPricingTiers[1].badge, tier2Price: defaultPricingTiers[1].price, tier2Unit: defaultPricingTiers[1].unit, tier2Delivery: defaultPricingTiers[1].delivery,
    tier3Name: defaultPricingTiers[2].name, tier3Price: defaultPricingTiers[2].price, tier3Unit: defaultPricingTiers[2].unit, tier3Delivery: defaultPricingTiers[2].delivery,
    docsTitle: LN + " Document Translation in " + CN,
    docsSubtitle: "We handle 100+ document types across all categories. Click a category to explore:",
    certSampleTitle: LN + " Translation Certificate Samples",
    certSampleSubtitle: "View verified ISO-certified " + lnLow + " translation samples:",
    interpTitle: LN + " Interpretation Services in " + CN,
    servicesTitle: LN + " Translation Services in " + CN + " – All Types",
    industriesTitle: "Industry-Specific " + LN + " Translation in " + CN,
    whyChooseTitle: "Why Choose Language Guru for " + LN + " Translation in " + CN + "?",
    reviewsTitle: "Client Reviews – " + LN + " Translation " + CN,
    faqsTitle: "FAQs – " + LN + " Translation in " + CN,
    ctaTitle: "Need " + LN + " Translation in " + CN + "?",
    ctaSubtitle: "Instant quote in 30 minutes. 24-hour express delivery across " + CN + ". Email & WhatsApp submission.",
    sidebarPhone1: "+919312690490",
    sidebarPhone2: "+919810693777",
    sidebarBtn1Text: "📋 Get Free Quote",
    sidebarBtn1Link: "/quote",
    sidebarBtn2Text: "💬 WhatsApp Us",
    sidebarBtn2WA: "919312690490",
    sidebarCtaTitle: "Get " + LN + " Translation in " + CN,
    sidebarCitiesTitle: "🏙️ " + LN + " Translation – Other Cities",
    sidebarLangsTitle: "🌐 Other Languages in " + CN,
    sidebarOtherSvcsTitle: "📋 Other Services – " + CN,
    ...defaultTrustCards,
    contentOverrides: co,
    faqs: defaultFaqs,
    reviews: defaultReviews,
    isActive: true
  };
}

const getLanguageCities = async (req, res) => {
  try {
    const { languageKey } = req.params;
    const [language, cities, overrides] = await Promise.all([
      prisma.language.findUnique({ where: { key: languageKey } }),
      prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.languageCityOverride.findMany({
        where: { languageKey },
        select: { cityKey: true, slug: true, metaTitle: true, isActive: true, updatedAt: true }
      })
    ]);
    if (!language) return res.status(404).json({ success: false, message: "Language not found." });
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.cityKey] = o; });
    const result = cities.map(city => ({
      ...city,
      hasOverride: !!overrideMap[city.key],
      overrideSlug: overrideMap[city.key]?.slug || null,
      overrideMetaTitle: overrideMap[city.key]?.metaTitle || null,
      overrideUpdatedAt: overrideMap[city.key]?.updatedAt || null,
      overrideIsActive: overrideMap[city.key]?.isActive ?? null
    }));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("getLanguageCities error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getLanguageCityOverride = async (req, res) => {
  try {
    const { languageKey, cityKey } = req.params;
    const [language, city, override] = await Promise.all([
      prisma.language.findUnique({ where: { key: languageKey } }),
      prisma.city.findFirst({ where: { key: cityKey } }),
      prisma.languageCityOverride.findUnique({ where: { languageKey_cityKey: { languageKey, cityKey } } })
    ]);
    if (!language) return res.status(404).json({ success: false, message: "Language not found." });
    if (!city)    return res.status(404).json({ success: false, message: "City not found." });

    const defaults = buildDefaultLanguageCityOverride(language, city);

    if (override) {
      const ovCO = (typeof override.contentOverrides === "object" && override.contentOverrides) || {};
      const defCO = defaults.contentOverrides || {};

      const arr = (a, b) => (Array.isArray(a) && a.length > 0) ? a : b;

      const mergedContentOverrides = {
        ...defCO,
        ...ovCO,
        introParagraphs:     arr(ovCO.introParagraphs,     defCO.introParagraphs),
        legalParagraphs:     arr(ovCO.legalParagraphs,     defCO.legalParagraphs),
        officialParagraphs:  arr(ovCO.officialParagraphs,  defCO.officialParagraphs),
        certifiedParagraphs: arr(ovCO.certifiedParagraphs, defCO.certifiedParagraphs),
        agencyParagraphs:    arr(ovCO.agencyParagraphs,    defCO.agencyParagraphs),
        interpParagraphs:    arr(ovCO.interpParagraphs,    defCO.interpParagraphs),
        docCategories:       arr(ovCO.docCategories,       defCO.docCategories),
        pricingTiers:        arr(ovCO.pricingTiers,        defCO.pricingTiers),
        sampleCertsList:     arr(ovCO.sampleCertsList,     defCO.sampleCertsList),
        servicesCards:       arr(ovCO.servicesCards,       defCO.servicesCards),
        processSteps:        arr(ovCO.processSteps,        defCO.processSteps),
        whyChooseList:       arr(ovCO.whyChooseList,       defCO.whyChooseList),
        sectionOrder:   Array.isArray(ovCO.sectionOrder)   ? ovCO.sectionOrder   : (defCO.sectionOrder  || null),
        hiddenSections: Array.isArray(ovCO.hiddenSections) ? ovCO.hiddenSections : [],
        customSections: Array.isArray(ovCO.customSections) ? ovCO.customSections : []
      };

      const merged = { ...defaults };
      Object.entries(override).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") merged[k] = v;
      });
      merged.contentOverrides = mergedContentOverrides;

      const pick = (...args) => args.find(v => v && typeof v === "string" && v.trim()) || "";
      merged.pricingTitle       = pick(ovCO.pricingTitle,       override.pricingTitle,       defaults.pricingTitle);
      merged.whyChooseTitle     = pick(ovCO.whyChooseTitle,     override.whyChooseTitle,     defaults.whyChooseTitle);
      merged.reviewsTitle       = pick(ovCO.reviewsTitle,       override.reviewsTitle,       defaults.reviewsTitle);
      merged.faqsTitle          = pick(ovCO.faqsTitle,          override.faqsTitle,          defaults.faqsTitle);
      merged.aboutTitle         = pick(ovCO.aboutTitle,         override.aboutTitle,         defaults.aboutTitle);
      merged.agencyTitle        = pick(ovCO.agencyTitle,        override.agencyTitle,        defaults.agencyTitle);
      merged.docsTitle          = pick(ovCO.docsTitle,          override.docsTitle,          defaults.docsTitle);
      merged.docsSubtitle       = pick(ovCO.docsSubtitle,       override.docsSubtitle,       defaults.docsSubtitle);
      merged.certSampleTitle    = pick(ovCO.certSampleTitle,    override.certSampleTitle,    defaults.certSampleTitle);
      merged.certSampleSubtitle = pick(ovCO.certSampleSubtitle, override.certSampleSubtitle, defaults.certSampleSubtitle);
      merged.interpTitle        = pick(ovCO.interpTitle,        override.interpTitle,        defaults.interpTitle);
      merged.servicesTitle      = pick(ovCO.servicesTitle,      override.servicesTitle,      defaults.servicesTitle);
      merged.industriesTitle    = pick(ovCO.industriesTitle,    override.industriesTitle,    defaults.industriesTitle);

      merged.faqs    = (override.faqs    && Array.isArray(override.faqs)    && override.faqs.length    > 0) ? override.faqs    : defaults.faqs;
      merged.reviews = (override.reviews && Array.isArray(override.reviews) && override.reviews.length > 0) ? override.reviews : defaults.reviews;

      return res.json({ success: true, data: merged, exists: true });
    }

    res.json({ success: true, data: defaults, exists: false });
  } catch (error) {
    console.error("getLanguageCityOverride error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const upsertLanguageCityOverride = async (req, res) => {
  try {
    const { languageKey, cityKey } = req.params;
    const [language, city] = await Promise.all([
      prisma.language.findUnique({ where: { key: languageKey } }),
      prisma.city.findFirst({ where: { key: cityKey } })
    ]);
    if (!language) return res.status(404).json({ success: false, message: "Language not found." });
    if (!city)    return res.status(404).json({ success: false, message: "City not found." });

    const b = req.body;
    const rawSlug = (b.slug && b.slug.trim()) || defaultSlug(languageKey, cityKey);

    const existing = await prisma.languageCityOverride.findUnique({ where: { languageKey_cityKey: { languageKey, cityKey } } });
    if (!existing) {
      const slugConflict = await prisma.languageCityOverride.findFirst({ where: { slug: rawSlug } });
      if (slugConflict) return res.status(409).json({ success: false, message: 'The slug "' + rawSlug + '" is already in use by another page.' });
    }

    const n = v => v || null;
    const data = {
      slug: rawSlug,
      metaTitle: n(b.metaTitle), metaDesc: n(b.metaDesc), metaKeywords: n(b.metaKeywords), ogImage: n(b.ogImage),
      heroBadge: n(b.heroBadge), heroTitle: n(b.heroTitle), heroSub: n(b.heroSub),
      heroBgImage: n(b.heroBgImage), heroFlag: n(b.heroFlag), heroIso: n(b.heroIso),
      heroBtn1Text: n(b.heroBtn1Text), heroBtn1Link: n(b.heroBtn1Link),
      heroBtn2Text: n(b.heroBtn2Text), heroBtn2Phone: n(b.heroBtn2Phone),
      heroBtn3Text: n(b.heroBtn3Text), heroBtn3WA: n(b.heroBtn3WA), heroBadgesList: n(b.heroBadgesList),
      title: n(b.title), p1: n(b.p1), p2: n(b.p2),
      aboutTitle: n(b.aboutTitle), agencyTitle: n(b.agencyTitle),
      agencyOfficeTitle: n(b.agencyOfficeTitle), officeAddressText: n(b.officeAddressText),
      processTag: n(b.processTag), processTitle: n(b.processTitle),
      step1Title: n(b.step1Title), step1Desc: n(b.step1Desc),
      step2Title: n(b.step2Title), step2Desc: n(b.step2Desc),
      step3Title: n(b.step3Title), step3Desc: n(b.step3Desc),
      step4Title: n(b.step4Title), step4Desc: n(b.step4Desc),
      step5Title: n(b.step5Title), step5Desc: n(b.step5Desc),
      tier1Name: n(b.tier1Name), tier1Price: n(b.tier1Price), tier1Unit: n(b.tier1Unit), tier1Delivery: n(b.tier1Delivery),
      tier2Name: n(b.tier2Name), tier2Badge: n(b.tier2Badge), tier2Price: n(b.tier2Price), tier2Unit: n(b.tier2Unit), tier2Delivery: n(b.tier2Delivery),
      tier3Name: n(b.tier3Name), tier3Price: n(b.tier3Price), tier3Unit: n(b.tier3Unit), tier3Delivery: n(b.tier3Delivery),
      currencySymbol: n(b.currencySymbol), pricingAddons: n(b.pricingAddons),
      pricingTitle: n(b.pricingTitle), whyChooseTitle: n(b.whyChooseTitle),
      reviewsTitle: n(b.reviewsTitle), faqsTitle: n(b.faqsTitle),
      ctaTitle: n(b.ctaTitle), ctaSubtitle: n(b.ctaSubtitle),
      docsTitle: n(b.docsTitle), docsSubtitle: n(b.docsSubtitle),
      certSampleTitle: n(b.certSampleTitle), certSampleSubtitle: n(b.certSampleSubtitle),
      interpTitle: n(b.interpTitle), servicesTitle: n(b.servicesTitle), industriesTitle: n(b.industriesTitle),
      sidebarPhone1: n(b.sidebarPhone1), sidebarPhone2: n(b.sidebarPhone2),
      sidebarBtn1Text: n(b.sidebarBtn1Text), sidebarBtn1Link: n(b.sidebarBtn1Link),
      sidebarBtn2Text: n(b.sidebarBtn2Text), sidebarBtn2WA: n(b.sidebarBtn2WA),
      sidebarCtaTitle: n(b.sidebarCtaTitle), sidebarCitiesTitle: n(b.sidebarCitiesTitle),
      sidebarLangsTitle: n(b.sidebarLangsTitle), sidebarOtherSvcsTitle: n(b.sidebarOtherSvcsTitle),
      contentOverrides: b.contentOverrides || null,
      faqs: b.faqs || null,
      reviews: b.reviews || null,
      isActive: b.isActive !== undefined ? Boolean(b.isActive) : true
    };

    const record = await prisma.languageCityOverride.upsert({
      where: { languageKey_cityKey: { languageKey, cityKey } },
      create: { languageKey, cityKey, ...data },
      update: data
    });
    res.json({ success: true, data: record, message: "Saved successfully." });
  } catch (error) {
    console.error("upsertLanguageCityOverride error:", error);
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "That slug is already in use by another page." });
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteLanguageCityOverride = async (req, res) => {
  try {
    const { languageKey, cityKey } = req.params;
    const existing = await prisma.languageCityOverride.findUnique({ where: { languageKey_cityKey: { languageKey, cityKey } } });
    if (!existing) return res.status(404).json({ success: false, message: "No custom override found for this city." });
    await prisma.languageCityOverride.delete({ where: { languageKey_cityKey: { languageKey, cityKey } } });
    res.json({ success: true, message: "Custom city override removed." });
  } catch (error) {
    console.error("deleteLanguageCityOverride error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getAllLanguageCityOverrides = async (req, res) => {
  try {
    const overrides = await prisma.languageCityOverride.findMany({
      where: { isActive: true },
      select: { languageKey: true, cityKey: true, slug: true, metaTitle: true, metaDesc: true, updatedAt: true },
      orderBy: [{ languageKey: "asc" }, { cityKey: "asc" }]
    });
    res.json({ success: true, data: overrides });
  } catch (error) {
    console.error("getAllLanguageCityOverrides error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getLanguageCities,
  getLanguageCityOverride,
  upsertLanguageCityOverride,
  deleteLanguageCityOverride,
  getAllLanguageCityOverrides
};
