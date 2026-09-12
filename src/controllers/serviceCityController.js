/**
 * serviceCityController.js
 * Full CRUD for Service + City localized page overrides.
 */

const prisma = require("../config/db");
// slug uniqueness checked manually below

function defaultSlug(serviceKey, cityKey) {
  return `${serviceKey}-translation-services-in-${cityKey}`;
}

function buildDefaultCityOverride(service, city) {
  const SN = service.name || "Translation";
  const snLow = SN.toLowerCase();
  const CN = city.name || "Delhi";
  const cnLow = CN.toLowerCase();
  const SK = service.key;
  const CK = city.key;

  const basePrice = service.price || 850;
  const pEcon = Math.round(basePrice * 0.7);
  const pExp = Math.round(basePrice * 1.5);

  const svcCO = (typeof service.contentOverrides === 'object' && service.contentOverrides) || {};

  function localizeText(text) {
    if (!text || typeof text !== 'string') return text;
    const WEM_HOLD = '___WEM_ADDR___';
    const EMB_HOLD = '___EMB_ND___';
    const DHC_HOLD = '___DHC_CRT___';

    let res = text
      .replace(/617,\s*West\s+End\s+Mall,\s*Janakpuri,\s*New\s+(Delhi|India)([\s–\-]+110058)?/gi, WEM_HOLD)
      .replace(/all\s+60\+\s+embassies\s+in\s+(New\s+)?(Delhi|India)/gi, EMB_HOLD)
      .replace(/(Delhi|India)\s+High\s+Court/gi, DHC_HOLD)
      .replace(/\{city\}/gi, CN)
      .replace(/\{service\}/gi, SN)
      .replace(/\{serviceLower\}/gi, snLow);

    if (CN.toLowerCase() !== 'delhi' && CN.toLowerCase() !== 'new delhi') {
      res = res
        .replace(/\bIndia's\b/gi, `${CN}'s`)
        .replace(/\b(New\s+)?Delhi's\b/gi, `${CN}'s`)
        .replace(/\bin\s+(New\s+)?Delhi(\s+NCR)?\b/gi, `in ${CN}`)
        .replace(/\bin\s+India\b/gi, `in ${CN}`)
        .replace(/across\s+(New\s+)?Delhi(\s+NCR)?/gi, `across ${CN}`)
        .replace(/across\s+India/gi, `across ${CN}`)
        .replace(/–\s*(New\s+)?Delhi\b/gi, `– ${CN}`)
        .replace(/–\s*India\b/gi, `– ${CN}`)
        .replace(/\b(New\s+)?Delhi\s+Office\b/gi, `${CN} Office`)
        .replace(/\b(New\s+)?Delhi\s+Clients\b/gi, `${CN} Clients`)
        .replace(/\b(New\s+)?Delhi\s+agency\b/gi, `${CN} agency`)
        .replace(/\b(New\s+)?Delhi\s+team\b/gi, `${CN} team`)
        .replace(new RegExp(`${CN}\\s+(New\\s+)?Delhi`, "gi"), CN)
        .replace(new RegExp(`(New\\s+)?Delhi\\s+${CN}`, "gi"), CN);
    }

    res = res
      .replace(new RegExp(WEM_HOLD, 'g'), '617, West End Mall, Janakpuri, New Delhi – 110058')
      .replace(new RegExp(EMB_HOLD, 'g'), 'all 60+ embassies in New Delhi')
      .replace(new RegExp(DHC_HOLD, 'g'), 'Delhi High Court');

    return res;
  }

  // 1. Process Steps
  const defaultProcessSteps = (Array.isArray(svcCO.processSteps) && svcCO.processSteps.length > 0)
    ? svcCO.processSteps.map(st => ({
        ...st,
        title: localizeText(st.title),
        desc: localizeText(st.desc)
      }))
    : [
        { step: 1, title: 'Submit Documents', desc: `Upload scanned documents via WhatsApp or email or visit our ${CN} office.` },
        { step: 2, title: 'Instant Quote', desc: 'Receive itemized quotation with timeline and transparent pricing in 30 mins.' },
        { step: 3, title: 'Expert Translation', desc: `Native certified linguist translates ${snLow} with terminology precision.` },
        { step: 4, title: 'QA & Certification', desc: 'Second linguist proofreads and issues Certificate of Accuracy under ISO 17100.' },
        { step: 5, title: 'Express Delivery', desc: `Digital copy emailed in 24 hours, hard copy couriered across ${CN}.` }
      ];

  // 2. About Paragraphs (Inherit directly from service or use standard template)
  const isDelhi = CN.toLowerCase() === 'delhi' || CN.toLowerCase() === 'new delhi';
  const locText = isDelhi ? 'Delhi NCR' : CN;
  const standardAboutParagraphs = [
    `Language Guru is ${CN}’s most trusted internationally certified translation agency with offices at 617, West End Mall, Janakpuri, New Delhi. Since 2005, we have delivered 50,000+ ${snLow} in ${locText}, covering 120+ languages and all document types for immigration, legal, academic, medical and corporate purposes.`,
    `Our ${snLow} includes official letterhead, Certified Seal & Sign, Certificate of Accuracy, and international certification – accepted by all 60+ embassies in New Delhi, MEA (Ministry of External Affairs), Delhi High Court, district courts and top universities worldwide.`
  ];

  const defaultAboutParagraphs = (Array.isArray(svcCO.aboutParagraphs) && svcCO.aboutParagraphs.length > 0)
    ? svcCO.aboutParagraphs.map(localizeText)
    : standardAboutParagraphs;

  // 3. Agency Paragraphs (Inherit directly from service)
  const defaultAgencyParagraphs = (Array.isArray(svcCO.agencyParagraphs) && svcCO.agencyParagraphs.length > 0)
    ? svcCO.agencyParagraphs.map(localizeText)
    : [
        `With over 20+ years of translation leadership and 50,000+ completed projects, Language Guru is the trusted translation partner for Fortune 500 multinationals, legal advocates, healthcare institutions, universities, and individual applicants in ${CN}.`,
        `All translations undergo a strict two-tier quality control process by accredited native translators to guarantee complete linguistic and legal accuracy.`
      ];

  // 4. Diff Rows
  const standard8DiffRows = [
    { feat: 'Official Letterhead', std: '✗', our: '✓ Included' },
    { feat: 'Certified Seal & Sign', std: '✗', our: '✓ Included' },
    { feat: 'ISO Certification', std: '✗', our: '✓ Included' },
    { feat: 'Statement of Accuracy', std: '✗', our: '✓ Included' },
    { feat: 'Embassy Accepted', std: '✗', our: '✓ All Embassies' },
    { feat: 'Court Accepted', std: '✗', our: '✓ All Courts' },
    { feat: 'MEA / Apostille Ready', std: '✗', our: '✓ MEA Accepted' },
    { feat: 'Notarization (add-on)', std: '✗', our: '✓ +₹200/page' }
  ];

  const defaultDiffRows = (Array.isArray(svcCO.diffRows) && svcCO.diffRows.length >= 8)
    ? svcCO.diffRows.map(r => ({
        feat: localizeText(r.feat),
        std: localizeText(r.std),
        our: localizeText(r.our)
      }))
    : standard8DiffRows;

  // 5. Doc Categories (Inherit service-specific document categories)
  const defaultDocCategories = (Array.isArray(svcCO.docCategories) && svcCO.docCategories.length > 0)
    ? svcCO.docCategories.map(cat => ({
        ...cat,
        panelTitle: localizeText(cat.panelTitle),
        panelSub: localizeText(cat.panelSub),
        ctaText: localizeText(cat.ctaText),
        ctaBtn: localizeText(cat.ctaBtn)
      }))
    : [
        { id: 'cat-personal', name: 'Personal & Vital Docs', icon: '📄', color: '#dbeafe', panelTitle: `Personal Documents Translation in ${CN}`, panelSub: 'Birth, marriage, death certificates & police clearance', docs: 'Birth Certificate, Marriage Certificate, Death Certificate, Divorce Decree, Police Clearance, Passport Copy, Driving License', ctaText: 'Need personal document translation in ' + CN + '?', ctaBtn: '📋 Get Quote' },
        { id: 'cat-academic', name: 'Educational & Academic', icon: '🎓', color: '#fef3c7', panelTitle: `Academic Records Translation in ${CN}`, panelSub: 'Degrees, diplomas, transcripts & marksheet', docs: 'Degree Certificate, Diploma, Transcript, Marksheet, Syllabus, Recommendation Letter, Migration Certificate', ctaText: 'Applying to foreign universities from ' + CN + '?', ctaBtn: '🎓 Get Academic Quote' },
        { id: 'cat-legal', name: 'Legal & Court Docs', icon: '⚖️', color: '#e0e7ff', panelTitle: `Legal Documents Translation in ${CN}`, panelSub: 'Affidavits, contracts, court orders & agreements', docs: 'Affidavit, Power of Attorney, Contract, Agreement, Court Judgment, Patent, Non-Disclosure Agreement', ctaText: 'Need sworn & notarized legal translation in ' + CN + '?', ctaBtn: '⚖️ Get Legal Quote' },
        { id: 'cat-financial', name: 'Financial & Banking', icon: '💰', color: '#dcfce7', panelTitle: `Financial Documents Translation in ${CN}`, panelSub: 'Bank statements, audit reports & tax returns', docs: 'Bank Statement, Audit Report, Tax Return, Salary Slip, Balance Sheet, Income Statement, CA Certificate', ctaText: 'Need financial translation for visa / banking in ' + CN + '?', ctaBtn: '💰 Get Financial Quote' },
        { id: 'cat-commercial', name: 'Commercial & Business', icon: '💼', color: '#f3e8ff', panelTitle: `Corporate & Business Translation in ${CN}`, panelSub: 'Company documents, agreements & trade licenses', docs: 'Articles of Association, Memorandum, Trade License, Partnership Deed, Board Resolution, Annual Report', ctaText: 'Expanding business globally from ' + CN + '?', ctaBtn: '💼 Get Corporate Quote' },
        { id: 'cat-medical', name: 'Medical & Healthcare', icon: '🏥', color: '#fee2e2', panelTitle: `Medical Records Translation in ${CN}`, panelSub: 'Medical reports, clinical trials & prescriptions', docs: 'Medical Report, Discharge Summary, Clinical Trial, Prescription, Lab Test, Vaccine Card, Medical Invoice', ctaText: 'Need medical translation for treatment abroad from ' + CN + '?', ctaBtn: '🏥 Get Medical Quote' }
      ];

  // 6. Pricing Tiers (Inherit from service)
  const defaultPricingTiers = (Array.isArray(svcCO.pricingTiers) && svcCO.pricingTiers.length > 0)
    ? svcCO.pricingTiers.map(pt => ({
        ...pt,
        features: localizeText(pt.features),
        delivery: localizeText(pt.delivery)
      }))
    : [
        { tier: 1, name: 'Standard Translation', price: `₹${pEcon}`, unit: 'per page', delivery: '2-3 Days', badge: '', feats: `Professional ${snLow}|Standard accuracy|Digital delivery (PDF)|Email support` },
        { tier: 2, name: 'Certified Translation', price: `₹${basePrice}`, unit: 'per page', delivery: '24-48 Hours', badge: 'MOST POPULAR', feats: `ISO 17100 Certified ${snLow}|Certificate of Accuracy|Agency Sign & Stamp|Embassy & Court Approved|Courier across ${CN}` },
        { tier: 3, name: 'Express & Notarized', price: `₹${pExp}`, unit: 'per page', delivery: '24 Hours Express', badge: 'EXPRESS', feats: `Urgent 24-hr turnaround|Notarized with Advocate Stamp|Apostille/Embassy ready|Priority linguist assignment|Free express shipping` }
      ];

  // 7. Why Choose List (Inherit from service)
  const defaultWhyChooseList = (Array.isArray(svcCO.whyChooseList) && svcCO.whyChooseList.length > 0)
    ? svcCO.whyChooseList.map(wc => ({
        ...wc,
        title: localizeText(wc.title),
        desc: localizeText(wc.desc)
      }))
    : [
        { icon: '🏛️', title: 'Govt. & Embassy Approved', desc: `Accepted by 60+ embassies, MEA, courts, universities, and government bodies in ${CN} and worldwide.` },
        { icon: '🏅', title: 'ISO 17100:2015 Certified', desc: 'Dual ISO certification guaranteeing highest linguistic accuracy and quality management.' },
        { icon: '⚡', title: '24-Hour Express Delivery', desc: `Same-day and 24-hour turnaround options available for urgent document submissions in ${CN}.` },
        { icon: '🔒', title: 'Strict Confidentiality', desc: 'Full NDA protection and GDPR-compliant data security for all sensitive personal and corporate documents.' }
      ];

  // 8. Certificate Samples (Standard 8 items across all services)
  const defaultSampleCerts = [
    { doc: 'Birth Certificate', lang: 'English → German', code: 'DE', flag: '🇩🇪', seal: '🇩🇪', acc: 'German Embassy', time: '24 Hrs', icon: '📜' },
    { doc: 'Birth Certificate', lang: 'English → French', code: 'FR', flag: '🇫🇷', seal: '🇫🇷', acc: 'French Consulate', time: '24 Hrs', icon: '📜' },
    { doc: 'Birth Certificate', lang: 'Hindi → Arabic', code: 'SA', flag: '🇸🇦', seal: '🇸🇦', acc: 'Saudi Consulate', time: '48 Hrs', icon: '📜' },
    { doc: 'Marriage Certificate', lang: 'English → Spanish', code: 'ES', flag: '🇪🇸', seal: '🇪🇸', acc: 'Spanish Embassy', time: '24 Hrs', icon: '💒' },
    { doc: 'Marriage Certificate', lang: 'Hindi → German', code: 'DE', flag: '🇩🇪', seal: '🇩🇪', acc: 'German Embassy', time: '48 Hrs', icon: '💒' },
    { doc: 'Marriage Certificate', lang: 'English → Japanese', code: 'JP', flag: '🇯🇵', seal: '🇯🇵', acc: 'Japanese Embassy', time: '48 Hrs', icon: '💒' },
    { doc: 'Degree Certificate', lang: 'English → Spanish', code: 'ES', flag: '🇪🇸', seal: '🇪🇸', acc: 'Spanish Embassy', time: '48 Hrs', icon: '🎓' },
    { doc: 'Academic Transcript', lang: 'English → French', code: 'FR', flag: '🇫🇷', seal: '🇫🇷', acc: 'French University', time: '48 Hrs', icon: '📋' }
  ];

  // 9. FAQs (Inherit from service)
  const rawFaqs = (Array.isArray(service.faqs) && service.faqs.length > 0)
    ? service.faqs
    : ((Array.isArray(svcCO.faqs) && svcCO.faqs.length > 0) ? svcCO.faqs : null);

  const defaultFaqs = rawFaqs
    ? rawFaqs.map(f => ({ q: localizeText(f.q), a: localizeText(f.a) }))
    : [
        { q: `Are your translations accepted by all Govt Departments & Indian Courts?`, a: `Yes — our certified translations carry the Agency Sign & Stamp and Certificate of Accuracy under ISO-9001:2015 and ISO 17100:2015 standards, and are routinely accepted by Indian government departments, courts, passport offices, RTOs, universities and banks in ${CN}.` },
        { q: `How much does ${SN} cost in ${CN}?`, a: `${SN} in ${CN} starts from ₹${pEcon}/page (standard), ₹${basePrice}/page (certified with letterhead + Certificate of Accuracy), and ₹${pExp}/page (express 24hr). Bulk discounts available.` },
        { q: `Do you provide ${SN} in cities other than ${CN}?`, a: `Yes! We provide ISO-certified, embassy-approved ${SN} in 150+ cities across India including Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, and more.` },
        { q: `Which languages do you support for ${SN} in ${CN}?`, a: `We support 120+ language pairs including German, French, Spanish, Italian, Russian, Portuguese, Dutch, Chinese, Japanese, Korean, Arabic, Turkish, and all Indian regional languages.` },
        { q: `How do I submit my documents in ${CN}?`, a: `Submit online by sharing scanned copies via email or WhatsApp — 100% online process with free courier delivery across ${CN}.` },
        { q: `Are your ${SN} translations accepted by all embassies?`, a: 'Our certified translations are routinely submitted to the German, French and US Embassies, the Australian, Canadian and British High Commissions, the UAE Embassy and 60+ embassies in New Delhi.' }
      ];

  // 10. Reviews (Inherit from service)
  const rawReviews = (Array.isArray(service.reviews) && service.reviews.length > 0)
    ? service.reviews
    : ((Array.isArray(svcCO.reviews) && svcCO.reviews.length > 0) ? svcCO.reviews : null);

  const defaultReviews = rawReviews
    ? rawReviews.map(r => ({
        ...r,
        text: localizeText(r.text),
        role: localizeText(r.role)
      }))
    : [
        { stars: '⭐⭐⭐⭐⭐', text: `Language Guru provided certified ${snLow} for my visa application in ${CN} in 24 hours. The embassy accepted it immediately without questions. Super fast and reliable!`, name: 'Rohit Sharma', role: `Visa Applicant · ${CN}`, avatar: 'RS' },
        { stars: '⭐⭐⭐⭐⭐', text: `Outstanding ${snLow} for our corporate documents in ${CN}. Accurate terminology and prompt delivery with official Certificate of Accuracy. Highly recommended!`, name: 'Pooja Verma', role: `Corporate Legal Counsel · ${CN}`, avatar: 'PV' },
        { stars: '⭐⭐⭐⭐⭐', text: `Very professional team in ${CN}. Got my academic transcripts and degree certificate translated in 2 days. Clear pricing and no hidden costs.`, name: 'Aakash Gupta', role: `Higher Studies · ${CN}`, avatar: 'AG' }
      ];

  // 11. Trust Cards
  const defaultTrustCards = {
    trustCard1: svcCO.trustCard1 ? localizeText(svcCO.trustCard1) : '🏛️ Govt. Authorized | MSME Reg. · ISO-9001:2015 and ISO 17100:2015',
    trustCard2: svcCO.trustCard2 ? localizeText(svcCO.trustCard2) : `⭐ 4.9/5 Rating | 2,847 verified Google reviews in ${CN}`,
    trustCard3: svcCO.trustCard3 ? localizeText(svcCO.trustCard3) : '🚗 Easy Submission | Office / email / WhatsApp submission',
    trustCard4: svcCO.trustCard4 ? localizeText(svcCO.trustCard4) : `⚡ 24-Hr Express | Urgent ${snLow} in 24 hours`,
    trustCard5: svcCO.trustCard5 ? localizeText(svcCO.trustCard5) : `✅ 100% Accepted | All embassies · All courts · MEA ${CN}`,
    trustCard6: svcCO.trustCard6 ? localizeText(svcCO.trustCard6) : '🔒 Confidential | NDA-backed · GDPR compliant · Secure',
  };

  const defaultOtherServices = [
    { icon: '🏅', name: `Certified Translation in ${CN}`, desc: 'Embassy & court accepted certified translations', link: '/services/certified' },
    { icon: '⚖️', name: `Legal Translation in ${CN}`, desc: 'Contracts, court judgments, patents & affidavits', link: '/services/legal' },
    { icon: '🏥', name: `Medical Translation in ${CN}`, desc: 'Medical reports, clinical trials, pharma dossiers', link: '/services/medical' },
    { icon: '⚙️', name: `Technical Translation in ${CN}`, desc: 'Manuals, engineering docs, technical specs', link: '/services/technical' },
    { icon: '🎓', name: `Academic Translation in ${CN}`, desc: 'Degrees, diplomas, transcripts & marksheet translation', link: '/services/academic' },
    { icon: '🌐', name: `Apostille & Attestation in ${CN}`, desc: 'MEA apostille + embassy, HRD & notary attestation', link: '/services/apostille' },
    { icon: '🔏', name: `Notarized Translation in ${CN}`, desc: 'Advocate-notarized legal translation for courts', link: '/services/notarization' },
    { icon: '💼', name: `Business Translation in ${CN}`, desc: 'Corporate docs, annual reports, business contracts', link: '/services/business' },
    { icon: '🌍', name: `Website Localization in ${CN}`, desc: 'Multilingual website, software & app localization', link: '/services/website' },
    { icon: '📊', name: `Financial Translation in ${CN}`, desc: 'Bank statements, financial reports, balance sheets', link: '/services/financial' },
    { icon: '🎙️', name: `Interpretation Services in ${CN}`, desc: 'Simultaneous & consecutive professional interpreters', link: '/services/interpretation' },
    { icon: '✈️', name: `Visa & Immigration in ${CN}`, desc: 'Student, tourist, work & PR visa certified translation', link: '/services/visa' }
  ].filter(s => s.link !== `/services/${SK}`);

  return {
    serviceKey: SK,
    cityKey: CK,
    slug: defaultSlug(SK, CK),
    metaTitle: `${SN} in ${CN} | Language Guru`,
    metaDesc: `Professional ${snLow} in ${CN}. ISO-certified translators, embassy-accepted documents, 24-hr express delivery. Get a free quote.`,
    metaKeywords: `${snLow} ${cnLow}, certified ${snLow} ${cnLow}, translation services ${cnLow}, translation agency ${cnLow}`,
    ogImage: '',
    heroBadge: svcCO.heroBadge ? localizeText(svcCO.heroBadge) : `#1 ${SN} in ${CN}`,
    heroIso: svcCO.heroIso || 'ISO 17100:2015 & ISO 9001:2015 Certified',
    heroTitle: `${SN} Services in <em>${CN}</em>`,
    heroSub: svcCO.heroSub ? localizeText(svcCO.heroSub) : `Language Guru is ${CN}'s leading ${snLow} agency – ISO-9001:2015 and ISO 17100:2015 certified. 120+ languages, 50,000+ documents delivered, accepted by all embassies, courts and universities. Serving ${CN} since 2005.`,
    heroBgImage: '',
    heroBtn1Text: svcCO.heroBtn1Text || '📋 Get Free Quote',
    heroBtn1Link: svcCO.heroBtn1Link || '/quote',
    heroBtn2Text: svcCO.heroBtn2Text || '📞 Call Expert',
    heroBtn2Phone: svcCO.heroBtn2Phone || '+91-9312690490',
    heroBtn3Text: svcCO.heroBtn3Text || '💬 WhatsApp',
    heroBtn3WA: svcCO.heroBtn3WA || '919312690490',
    heroBadgesList: svcCO.heroBadgesList ? localizeText(svcCO.heroBadgesList) : '✅ All Embassy Accepted | ⚡ 24-Hr Express | 🔏 Notarized & Apostilled | ⭐ 4.9/5 - 2,847 Reviews',
    title: `${SN} in ${CN}`,
    label: `${SN} in ${CN}`,
    p1: defaultAboutParagraphs[0],
    p2: defaultAboutParagraphs[1] || '',
    aboutTitle: svcCO.aboutTitle ? localizeText(svcCO.aboutTitle) : `${SN} Services in ${CN} – Language Guru`,
    agencyTitle: svcCO.agencyTitle ? localizeText(svcCO.agencyTitle) : `${SN} Agency in ${CN}`,
    agencyOfficeTitle: svcCO.agencyOfficeTitle ? localizeText(svcCO.agencyOfficeTitle) : `📍 ${SN} Agency – ${CN} Office`,
    officeAddressText: svcCO.officeAddressText ? localizeText(svcCO.officeAddressText) : `617, West End Mall, Janakpuri, New Delhi – 110058 | Serving ${CN} with Express Delivery`,
    processTag: svcCO.processTag || 'HOW IT WORKS',
    processTitle: svcCO.processTitle ? localizeText(svcCO.processTitle) : `5-Step ${SN} Process in ${CN}`,
    step1Title: defaultProcessSteps[0]?.title || '', step1Desc: defaultProcessSteps[0]?.desc || '',
    step2Title: defaultProcessSteps[1]?.title || '', step2Desc: defaultProcessSteps[1]?.desc || '',
    step3Title: defaultProcessSteps[2]?.title || '', step3Desc: defaultProcessSteps[2]?.desc || '',
    step4Title: defaultProcessSteps[3]?.title || '', step4Desc: defaultProcessSteps[3]?.desc || '',
    step5Title: defaultProcessSteps[4]?.title || '', step5Desc: defaultProcessSteps[4]?.desc || '',
    diffTitle: svcCO.diffTitle ? localizeText(svcCO.diffTitle) : `Standard vs ${SN} – What's the Difference?`,
    diffCol0Header: svcCO.diffCol0Header || 'Feature',
    diffCol1Header: svcCO.diffCol1Header || 'Standard Translation',
    diffCol2Header: svcCO.diffCol2Header ? localizeText(svcCO.diffCol2Header) : `${SN} (${CN})`,
    docsTitle: svcCO.docsTitle ? localizeText(svcCO.docsTitle) : `${SN} Documents We Handle in ${CN}`,
    docsSubtitle: svcCO.docsSubtitle ? localizeText(svcCO.docsSubtitle) : 'We handle 100+ document types across all categories. Click a category to explore:',
    pricingTitle: svcCO.pricingTitle ? localizeText(svcCO.pricingTitle) : `${SN} Pricing in ${CN}`,
    tier1Name: defaultPricingTiers[0]?.name || 'Standard Translation', tier1Price: defaultPricingTiers[0]?.price || `₹${pEcon}`, tier1Unit: defaultPricingTiers[0]?.unit || 'per page', tier1Delivery: defaultPricingTiers[0]?.delivery || '2-3 Days',
    tier2Name: defaultPricingTiers[1]?.name || 'Certified Translation', tier2Badge: defaultPricingTiers[1]?.badge || 'MOST POPULAR', tier2Price: defaultPricingTiers[1]?.price || `₹${basePrice}`, tier2Unit: defaultPricingTiers[1]?.unit || 'per page', tier2Delivery: defaultPricingTiers[1]?.delivery || '24-48 Hours',
    tier3Name: defaultPricingTiers[2]?.name || 'Express & Notarized', tier3Price: defaultPricingTiers[2]?.price || `₹${pExp}`, tier3Unit: defaultPricingTiers[2]?.unit || 'per page', tier3Delivery: defaultPricingTiers[2]?.delivery || '24 Hours Express',
    currencySymbol: svcCO.currencySymbol || '₹',
    pricingAddons: svcCO.pricingAddons ? localizeText(svcCO.pricingAddons) : '➕ Add-ons: Notarization ₹200/page · MEA Apostille ₹1,400/page · Embassy Attestation ₹5,500/page · Courier ₹200 | Bulk: 10+ pages – 10% off · 20+ pages – 15% off',
    certSampleTitle: svcCO.certSampleTitle ? localizeText(svcCO.certSampleTitle) : `${SN} Certificate Samples`,
    certSampleSubtitle: svcCO.certSampleSubtitle ? localizeText(svcCO.certSampleSubtitle) : `View verified ISO-certified samples for ${SN} in ${CN}:`,
    whyChooseTitle: svcCO.whyChooseTitle ? localizeText(svcCO.whyChooseTitle) : `Why Choose Language Guru for ${SN} in ${CN}?`,
    otherSvcsTitle: svcCO.otherSvcsTitle ? localizeText(svcCO.otherSvcsTitle) : `Other Translation Service Types in ${CN}`,
    otherSvcsSubtitle: svcCO.otherSvcsSubtitle ? localizeText(svcCO.otherSvcsSubtitle) : `Language Guru provides all translation services in ${CN}:`,
    allLanguagesTitle: svcCO.allLanguagesTitle ? localizeText(svcCO.allLanguagesTitle) : `All Languages Available for ${SN} in ${CN}`,
    certificationsTitle: svcCO.certificationsTitle || 'Certifications & Accreditations',
    ctaTitle: svcCO.ctaTitle ? localizeText(svcCO.ctaTitle) : `Need ${SN} in ${CN}?`,
    ctaSubtitle: svcCO.ctaSubtitle ? localizeText(svcCO.ctaSubtitle) : `Instant quote in 30 minutes. 24-hour express delivery across ${CN}. Email & WhatsApp submission.`,
    sidebarPhone1: svcCO.sidebarPhone1 || '+919312690490',
    sidebarPhone2: svcCO.sidebarPhone2 || '+919810693777',
    sidebarBtn1Text: svcCO.sidebarBtn1Text || '📋 Get Free Quote',
    sidebarBtn1Link: svcCO.sidebarBtn1Link || '/quote',
    sidebarBtn2Text: svcCO.sidebarBtn2Text || '💬 WhatsApp Us',
    sidebarBtn2WA: svcCO.sidebarBtn2WA || '919312690490',
    sidebarCtaTitle: svcCO.sidebarCtaTitle ? localizeText(svcCO.sidebarCtaTitle) : `Get ${SN} in ${CN}`,
    sidebarCitiesTitle: svcCO.sidebarCitiesTitle ? localizeText(svcCO.sidebarCitiesTitle) : `🏙️ ${SN} – Other Cities`,
    sidebarLangsTitle: svcCO.sidebarLangsTitle ? localizeText(svcCO.sidebarLangsTitle) : `🌐 Languages in ${CN}`,
    sidebarOtherSvcsTitle: svcCO.sidebarOtherSvcsTitle ? localizeText(svcCO.sidebarOtherSvcsTitle) : `📋 Other Services – ${CN}`,
    ...defaultTrustCards,
    contentOverrides: {
      aboutParagraphs: defaultAboutParagraphs,
      agencyParagraphs: defaultAgencyParagraphs,
      diffRows: defaultDiffRows,
      docCategories: defaultDocCategories,
      pricingTiers: defaultPricingTiers,
      whyChooseList: defaultWhyChooseList,
      sampleCertsList: defaultSampleCerts,
      otherServicesList: defaultOtherServices,
      processSteps: defaultProcessSteps,
      ...defaultTrustCards,
      diffTitle: svcCO.diffTitle ? localizeText(svcCO.diffTitle) : `Standard vs ${SN} – What's the Difference?`,
      docsTitle: svcCO.docsTitle ? localizeText(svcCO.docsTitle) : `${SN} Documents We Handle in ${CN}`,
      docsSubtitle: svcCO.docsSubtitle ? localizeText(svcCO.docsSubtitle) : 'We handle 100+ document types across all categories. Click a category to explore:',
      pricingTitle: svcCO.pricingTitle ? localizeText(svcCO.pricingTitle) : `${SN} Pricing in ${CN}`,
      whyChooseTitle: svcCO.whyChooseTitle ? localizeText(svcCO.whyChooseTitle) : `Why Choose Language Guru for ${SN} in ${CN}?`,
      otherSvcsTitle: svcCO.otherSvcsTitle ? localizeText(svcCO.otherSvcsTitle) : `Other Translation Service Types in ${CN}`,
      otherSvcsSubtitle: svcCO.otherSvcsSubtitle ? localizeText(svcCO.otherSvcsSubtitle) : `Language Guru provides all translation services in ${CN}:`,
      certSampleTitle: svcCO.certSampleTitle ? localizeText(svcCO.certSampleTitle) : `${SN} Certificate Samples`,
      certSampleSubtitle: svcCO.certSampleSubtitle ? localizeText(svcCO.certSampleSubtitle) : `View verified ISO-certified samples for ${SN} in ${CN}:`,
      reviewsTitle: svcCO.reviewsTitle ? localizeText(svcCO.reviewsTitle) : `Client Reviews – ${SN} ${CN}`,
      faqsTitle: svcCO.faqsTitle ? localizeText(svcCO.faqsTitle) : `FAQs – ${SN} ${CN}`,
      aboutTitle: svcCO.aboutTitle ? localizeText(svcCO.aboutTitle) : `${SN} Services in ${CN} – Language Guru`,
      agencyTitle: svcCO.agencyTitle ? localizeText(svcCO.agencyTitle) : `${SN} Agency in ${CN}`,
    },
    faqs: defaultFaqs,
    reviews: defaultReviews,
    isActive: true,
  };
}

const getServiceCities = async (req, res) => {
  try {
    const { serviceKey } = req.params;
    const [service, cities, overrides] = await Promise.all([
      prisma.service.findUnique({ where: { key: serviceKey } }),
      prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.serviceCityOverride.findMany({
        where: { serviceKey },
        select: { cityKey: true, slug: true, metaTitle: true, isActive: true, updatedAt: true }
      })
    ]);
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.cityKey] = o; });
    const result = cities.map(city => ({
      ...city,
      hasOverride: !!overrideMap[city.key],
      overrideSlug: overrideMap[city.key]?.slug || null,
      overrideMetaTitle: overrideMap[city.key]?.metaTitle || null,
      overrideUpdatedAt: overrideMap[city.key]?.updatedAt || null,
      overrideIsActive: overrideMap[city.key]?.isActive ?? null,
    }));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("getServiceCities error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getServiceCityOverride = async (req, res) => {
  try {
    const { serviceKey, cityKey } = req.params;
    const [service, city, override] = await Promise.all([
      prisma.service.findUnique({ where: { key: serviceKey } }),
      prisma.city.findFirst({ where: { key: cityKey } }),
      prisma.serviceCityOverride.findUnique({ where: { serviceKey_cityKey: { serviceKey, cityKey } } })
    ]);
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    if (!city)    return res.status(404).json({ success: false, message: "City not found." });

    const defaults = buildDefaultCityOverride(service, city);

    if (override) {
      // Merge saved override on top of defaults (non-null and non-empty arrays win)
      const ovCO = (typeof override.contentOverrides === 'object' && override.contentOverrides) || {};
      const defCO = defaults.contentOverrides || {};

      // Detect if override has old generic dummy boilerplate
      const isGenericAbout = Array.isArray(ovCO.aboutParagraphs) && ovCO.aboutParagraphs.length > 0 &&
        typeof ovCO.aboutParagraphs[0] === 'string' &&
        ovCO.aboutParagraphs[0].includes('premier translation agency providing certified');
      const isGenericAgency = Array.isArray(ovCO.agencyParagraphs) && ovCO.agencyParagraphs.length > 0 &&
        typeof ovCO.agencyParagraphs[0] === 'string' &&
        ovCO.agencyParagraphs[0].includes('With over 18 years of industry experience');
      const isGenericDocCats = Array.isArray(ovCO.docCategories) && ovCO.docCategories.length === 6 &&
        ovCO.docCategories[0]?.id === 'cat-personal';
      const isGenericWhy = Array.isArray(ovCO.whyChooseList) && ovCO.whyChooseList.length === 4 &&
        ovCO.whyChooseList[0]?.title?.includes('Govt. & Embassy Approved');

      const mergedContentOverrides = {
        ...defCO,
        ...ovCO,
        aboutParagraphs: (!isGenericAbout && Array.isArray(ovCO.aboutParagraphs) && ovCO.aboutParagraphs.length > 0) ? ovCO.aboutParagraphs : defCO.aboutParagraphs,
        agencyParagraphs: (!isGenericAgency && Array.isArray(ovCO.agencyParagraphs) && ovCO.agencyParagraphs.length > 0) ? ovCO.agencyParagraphs : defCO.agencyParagraphs,
        diffRows: (Array.isArray(ovCO.diffRows) && ovCO.diffRows.length >= 8) ? ovCO.diffRows : defCO.diffRows,
        docCategories: (!isGenericDocCats && Array.isArray(ovCO.docCategories) && ovCO.docCategories.length > 0) ? ovCO.docCategories : defCO.docCategories,
        pricingTiers: (Array.isArray(ovCO.pricingTiers) && ovCO.pricingTiers.length > 0) ? ovCO.pricingTiers : defCO.pricingTiers,
        whyChooseList: (!isGenericWhy && Array.isArray(ovCO.whyChooseList) && ovCO.whyChooseList.length > 0) ? ovCO.whyChooseList : defCO.whyChooseList,
        sampleCertsList: (Array.isArray(ovCO.sampleCertsList) && ovCO.sampleCertsList.length >= 8) ? ovCO.sampleCertsList : defCO.sampleCertsList,
        otherServicesList: (Array.isArray(ovCO.otherServicesList) && ovCO.otherServicesList.length > 0) ? ovCO.otherServicesList : defCO.otherServicesList,
        processSteps: (Array.isArray(ovCO.processSteps) && ovCO.processSteps.length > 0) ? ovCO.processSteps : defCO.processSteps,
        sectionOrder: Array.isArray(ovCO.sectionOrder) ? ovCO.sectionOrder : (defCO.sectionOrder || null),
        hiddenSections: Array.isArray(ovCO.hiddenSections) ? ovCO.hiddenSections : [],
        customSections: Array.isArray(ovCO.customSections) ? ovCO.customSections : [],
      };

      const merged = { ...defaults };
      Object.entries(override).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          merged[k] = v;
        }
      });
      merged.contentOverrides = mergedContentOverrides;
      merged.diffTitle = ovCO.diffTitle || override.diffTitle || defaults.diffTitle;
      merged.docsTitle = ovCO.docsTitle || override.docsTitle || defaults.docsTitle;
      merged.docsSubtitle = ovCO.docsSubtitle || override.docsSubtitle || defaults.docsSubtitle;
      merged.otherSvcsTitle = ovCO.otherSvcsTitle || override.otherSvcsTitle || defaults.otherSvcsTitle;
      merged.otherSvcsSubtitle = ovCO.otherSvcsSubtitle || override.otherSvcsSubtitle || defaults.otherSvcsSubtitle;
      merged.certSampleTitle = ovCO.certSampleTitle || override.certSampleTitle || defaults.certSampleTitle;
      merged.certSampleSubtitle = ovCO.certSampleSubtitle || override.certSampleSubtitle || defaults.certSampleSubtitle;
      merged.pricingTitle = ovCO.pricingTitle || override.pricingTitle || defaults.pricingTitle;
      merged.whyChooseTitle = ovCO.whyChooseTitle || override.whyChooseTitle || defaults.whyChooseTitle;
      merged.aboutTitle = ovCO.aboutTitle || override.aboutTitle || defaults.aboutTitle;
      merged.agencyTitle = ovCO.agencyTitle || override.agencyTitle || defaults.agencyTitle;
      merged.reviewsTitle = ovCO.reviewsTitle || defaults.reviewsTitle;
      merged.faqsTitle = ovCO.faqsTitle || defaults.faqsTitle;
      merged.faqs = (override.faqs && Array.isArray(override.faqs) && override.faqs.length > 0) ? override.faqs : defaults.faqs;
      merged.reviews = (override.reviews && Array.isArray(override.reviews) && override.reviews.length > 0) ? override.reviews : defaults.reviews;

      return res.json({ success: true, data: merged, exists: true });
    }

    res.json({ success: true, data: defaults, exists: false });
  } catch (error) {
    console.error("getServiceCityOverride error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const upsertServiceCityOverride = async (req, res) => {
  try {
    const { serviceKey, cityKey } = req.params;
    const [service, city] = await Promise.all([
      prisma.service.findUnique({ where: { key: serviceKey } }),
      prisma.city.findFirst({ where: { key: cityKey } })
    ]);
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    if (!city)    return res.status(404).json({ success: false, message: "City not found." });

    const b = req.body;
    const rawSlug = (b.slug && b.slug.trim()) || defaultSlug(serviceKey, cityKey);

    const existing = await prisma.serviceCityOverride.findUnique({ where: { serviceKey_cityKey: { serviceKey, cityKey } } });
    if (!existing) {
      const slugConflict = await prisma.serviceCityOverride.findFirst({ where: { slug: rawSlug } });
      if (slugConflict) return res.status(409).json({ success: false, message: `The slug "${rawSlug}" is already in use by another page.` });
    }

    const n = v => v || null;
    const data = {
      slug: rawSlug,
      metaTitle: n(b.metaTitle), metaDesc: n(b.metaDesc), metaKeywords: n(b.metaKeywords), ogImage: n(b.ogImage),
      heroBadge: n(b.heroBadge), heroTitle: n(b.heroTitle), heroSub: n(b.heroSub),
      heroBgImage: n(b.heroBgImage), heroIso: n(b.heroIso),
      heroBtn1Text: n(b.heroBtn1Text), heroBtn1Link: n(b.heroBtn1Link),
      heroBtn2Text: n(b.heroBtn2Text), heroBtn2Phone: n(b.heroBtn2Phone),
      heroBtn3Text: n(b.heroBtn3Text), heroBtn3WA: n(b.heroBtn3WA), heroBadgesList: n(b.heroBadgesList),
      title: n(b.title), label: n(b.label), p1: n(b.p1), p2: n(b.p2),
      aboutTitle: n(b.aboutTitle), agencyOfficeTitle: n(b.agencyOfficeTitle), officeAddressText: n(b.officeAddressText),
      processTag: n(b.processTag), processTitle: n(b.processTitle),
      step1Title: n(b.step1Title), step1Desc: n(b.step1Desc),
      step2Title: n(b.step2Title), step2Desc: n(b.step2Desc),
      step3Title: n(b.step3Title), step3Desc: n(b.step3Desc),
      step4Title: n(b.step4Title), step4Desc: n(b.step4Desc),
      step5Title: n(b.step5Title), step5Desc: n(b.step5Desc),
      diffCol0Header: n(b.diffCol0Header), diffCol1Header: n(b.diffCol1Header), diffCol2Header: n(b.diffCol2Header),
      tier1Name: n(b.tier1Name), tier1Price: n(b.tier1Price), tier1Unit: n(b.tier1Unit), tier1Delivery: n(b.tier1Delivery),
      tier2Name: n(b.tier2Name), tier2Badge: n(b.tier2Badge), tier2Price: n(b.tier2Price), tier2Unit: n(b.tier2Unit), tier2Delivery: n(b.tier2Delivery),
      tier3Name: n(b.tier3Name), tier3Price: n(b.tier3Price), tier3Unit: n(b.tier3Unit), tier3Delivery: n(b.tier3Delivery),
      currencySymbol: n(b.currencySymbol), pricingAddons: n(b.pricingAddons), includesTitle: n(b.includesTitle),
      whyChooseTitle: n(b.whyChooseTitle), otherSvcsSubtitle: n(b.otherSvcsSubtitle),
      certSampleSubtitle: n(b.certSampleSubtitle), allLanguagesTitle: n(b.allLanguagesTitle),
      certificationsTitle: n(b.certificationsTitle), ctaTitle: n(b.ctaTitle), ctaSubtitle: n(b.ctaSubtitle),
      sidebarPhone1: n(b.sidebarPhone1), sidebarPhone2: n(b.sidebarPhone2),
      sidebarBtn1Text: n(b.sidebarBtn1Text), sidebarBtn1Link: n(b.sidebarBtn1Link),
      sidebarBtn2Text: n(b.sidebarBtn2Text), sidebarBtn2WA: n(b.sidebarBtn2WA),
      sidebarCtaTitle: n(b.sidebarCtaTitle), sidebarCitiesTitle: n(b.sidebarCitiesTitle),
      sidebarLangsTitle: n(b.sidebarLangsTitle), sidebarOtherSvcsTitle: n(b.sidebarOtherSvcsTitle),
      contentOverrides: b.contentOverrides || null,
      faqs: b.faqs || null,
      reviews: b.reviews || null,
      isActive: b.isActive !== undefined ? Boolean(b.isActive) : true,
    };

    const record = await prisma.serviceCityOverride.upsert({
      where: { serviceKey_cityKey: { serviceKey, cityKey } },
      create: { serviceKey, cityKey, ...data },
      update: data,
    });
    res.json({ success: true, data: record, message: "Saved successfully." });
  } catch (error) {
    console.error("upsertServiceCityOverride error:", error);
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "That slug is already in use by another page." });
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const deleteServiceCityOverride = async (req, res) => {
  try {
    const { serviceKey, cityKey } = req.params;
    const existing = await prisma.serviceCityOverride.findUnique({ where: { serviceKey_cityKey: { serviceKey, cityKey } } });
    if (!existing) return res.status(404).json({ success: false, message: "No custom override found for this city." });
    await prisma.serviceCityOverride.delete({ where: { serviceKey_cityKey: { serviceKey, cityKey } } });
    res.json({ success: true, message: "Custom city override removed." });
  } catch (error) {
    console.error("deleteServiceCityOverride error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getAllServiceCityOverrides = async (req, res) => {
  try {
    const overrides = await prisma.serviceCityOverride.findMany({
      where: { isActive: true },
      select: { serviceKey: true, cityKey: true, slug: true, metaTitle: true, metaDesc: true, updatedAt: true },
      orderBy: [{ serviceKey: "asc" }, { cityKey: "asc" }]
    });
    res.json({ success: true, data: overrides });
  } catch (error) {
    console.error("getAllServiceCityOverrides error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { buildDefaultCityOverride, getServiceCities, getServiceCityOverride, upsertServiceCityOverride, deleteServiceCityOverride, getAllServiceCityOverrides };

