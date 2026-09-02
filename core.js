[file name]: core.js
[file content begin]
/* ═══════════════════════════════════════════
   الذكي v2.2 — core.js
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Helpers ─── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
    // 💡 دالة سحرية لفتح جميع نوافذ التحضير (النص وعناصر التوليد) دفعة واحدة
  function expandPreparationAccordions() {
    $$('.acc-item', $('#newAccordion')).forEach(it => {
      it.classList.add('is-open');
      const panel = $('.acc-panel', it);
      if (panel) panel.hidden = false;
    });
    // التمرير السلس للأسفل ليرى المعلم النص وأزرار التوليد بوضوح
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  // المترجم الشامل للشفرات الرياضية (يعمل بشكل طبيعي مع النصوص المستخرجة)
  function parseMathHTML(text) {
    let t = String(text || '');
    
    // 1. الكسور أولاً: (السر هنا!) نعالج الكسور قبل أي شيء لكي لا تمزق أكواد HTML الخاصة بالأسس
    // 💡 الدرع المطور: يمنع الروابط والتواريخ، و {1,35} يمنع تحويل الجمل النصية الطويلة بالخطأ
    t = t.replace(/\(\s*([^/)'":?]{1,35})\s*\/\s*([^/)'":?]{1,35})\s*\)/g, (m, num, den) => `<span style="display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 4px; direction: rtl; font-size: 0.9em;"><span style="padding: 0 3px; line-height: 1;">${num.trim()}</span><span style="border-top: 1.5px solid currentColor; margin-top: 1px; padding: 0 3px; line-height: 1;">${den.trim()}</span></span>`);

    // 2. الجذور: تحويل الجذور المكتوبة نصياً مثل: جذر(3) أو sqrt(16)
    t = t.replace(/(?:sqrt|جذر)\s*\(([^)]+)\)/gi, (m, val) => `<span style="display: inline-flex; direction: rtl; align-items: stretch; vertical-align: middle; margin: 0 4px;"><span style="flex-shrink: 0; align-self: stretch; min-width: 10px; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 30%22%3E%3Cpath d=%22M1 0 L13 28 L18 19%22 stroke=%22%23000%22 stroke-width=%223.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 fill=%22none%22/%3E%3C/svg%3E'); background-size: 100% 100%; background-repeat: no-repeat;"></span><span style="border-top: 1.5px solid currentColor; margin-top: 1.5px; padding: 2px 4px 0 4px; line-height: 1.2;">${val.trim()}</span></span>`);

    // 3. الأسس: ستجد الأسس وتتكفل بها بهدوء سواء كانت منفردة أو بداخل كود الكسر الذي تم تكوينه
    // 💡 استخدام وسم <sup> الأصلي المدعوم لضمان عدم وجود مسافات أو تشتت في الطباعة
    t = t.replace(/([)\]a-zA-Z\u0600-\u06FF0-9٠-٩]+)\s*\^\s*([a-zA-Z\u0600-\u06FF0-9٠-٩\-]+)/g, (m, base, exp) => `<span style="display: inline-block; direction: rtl; unicode-bidi: isolate; margin: 0 2px;"><span style="font-size: 1.1em;">${base.trim()}</span><sup style="font-size: 0.8em; margin-right: 2px; top: -0.5em;">${exp.trim()}</sup></span>`);
    
    // 4. الحفاظ على الشفرات الكبرى إن وُجدت (نهايات، تكامل، معادلة)
    t = t.replace(/\[\s*(?:limit|نهاية)\s*:\s*([^,،\]]+)\s*[,،]\s*([\s\S]+?)\s*\]/gi, (m, cond, func) => `<span style="display: inline-flex; flex-direction: column; align-items: center; vertical-align: baseline; margin: 0 2px; direction: rtl;"><span style="font-weight: bold; font-family: 'Amiri', serif; font-size:1.2em; line-height: 1;">نهــــــا</span><span style="font-size: 0.75em; margin-top:-2px;">${cond.trim()}</span></span><span style="margin-right: 4px;">${func.trim()}</span>`);
    
    t = t.replace(/\[\s*(?:int|تكامل)\s*:\s*([^,،\]]+)\s*[,،]\s*([^,،\]]+)\s*[,،]\s*([\s\S]+?)\s*\]/gi, (m, func, lower, upper) => `<span style="display: inline-flex; align-items: center; direction: rtl; margin: 0 5px; vertical-align: middle;"><span style="position: relative; display: inline-flex; justify-content: center; align-items: center; width: 24px; height: 40px;"><span style="font-size: 2.8em; font-family: 'Times New Roman', serif; font-weight: normal; line-height: 1;">∫</span><span style="position: absolute; top: -8px; right: -6px; font-size: 0.7em;">${upper.trim()}</span><span style="position: absolute; bottom: -8px; left: -6px; font-size: 0.7em;">${lower.trim()}</span></span><span style="margin-right: 10px;">${func.trim()}</span></span>`);
    
    t = t.replace(/\[\s*(?:eq|معادلة)\s*:\s*([\s\S]+?)\s*\]/gi, (m, eq) => `<span dir="rtl" style="unicode-bidi: isolate; display: inline-block; margin: 0 4px;">${eq.trim()}</span>`);

    return t;
  }


  function esc(s) {
    let safeText = (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    return parseMathHTML(safeText);
  }

  function formatDate(d) {
    if (!d) return '';
    const p = String(d).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
  }
  async function fileToBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error('read_fail'));
      r.readAsDataURL(file);
    });
  }
  function sanitizeFilename(n) {
    return (n || 'خطة-الدرس').replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 80) || 'خطة-الدرس';
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 4000);
  }
  function shuffleArrayFisherYates(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // مكتبة html2canvas لا تدعم text-decoration:underline إطلاقًا (قصور معروف بالمكتبة)
  // الحل: تحويل أي عنصر مسطّر إلى حد سفلي حقيقي (border-bottom) قبل التصدير، فهذا يُرسم بشكل صحيح دائمًا
  function fixUnderlinesForExport(container) {
    const all = container.querySelectorAll('*');
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.textDecorationLine.includes('underline') || el.tagName === 'U') {
        el.style.textDecoration = 'none';
        el.style.borderBottom = '1.5px solid currentColor';
        el.style.paddingBottom = '1px';
        el.style.display = el.style.display || 'inline-block';
      }
    });
    return container;
  }

  /* ─── Constants ─── */
    /* ─── Constants ─── */
  const SETTINGS_KEY = 'haael_settings_v2';
  const DB_NAME = 'haaelDB_v2', DB_VERSION = 4; // رفعنا الإصدار إلى 2 لإنشاء المخزن الجديد
  const LESSONS_STORE = 'lessons', BOOKS_STORE = 'books';
  const EXTRACTS_STORE = 'extracts'; // مخزن دروس شاشة "دروس واختبارات"
  const EXAM_APP_FILE = 'exams.html';
 // اسم ملف تطبيق الاختبارات الرسمي (يجب أن يطابق اسم الملف الفعلي تماماً)

  const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const FALLBACK_CHAIN = [
    'gemini-3.5-flash','gemini-3.1-flash-lite','gemini-2.5-flash','gemini-2.0-flash','gemini-flash-latest'
  ];  function mathRulesBlock(isEnglish) {
    if (isEnglish) return `
⚠️ MATH RULES: 
- Use standard text for math: Use ^ for powers (e.g., x^2). Use sqrt() for roots (e.g., sqrt(16)). Use ( / ) for fractions.
- Never use complex HTML or custom shortcodes. Just plain text symbols.
`;
    return `
⚠️ قواعد الرياضيات (هامة جداً):
- اكتب الرياضيات بشكل نصي طبيعي ومقروء تماماً كما في الكتب المدرسية.
- للأسس: استخدم علامة ^ (مثال: س^٢ أو (س+ص)^٢). يُمنع منعاً باتاً استخدام شفرات معقدة أو كلمات إنجليزية.
- للجذور: استخدم كلمة جذر (مثال: جذر(٣) أو جذر(س+١)).
- للكسور: استخدم الأقواس وعلامة القسمة (مثال: (س / ص)).
- استخدم الأرقام العربية الشرقية (١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠).
`;
  }

  /* ─── State ─── */
  const state = {
    settings: {
      apiKey:'', school:'', teacher:'', directorate:'', subject:'',
      defaultLang:'ar', defaultModel:'gemini-3.5-flash'
    },
    viewStack: ['home'],
    sourceType: 'title',
    language: 'ar',
    currentRecord: null,
    archiveCache: [],
    archiveKind: 'plan',
        examGenerationTarget: 'internal', // لمعرفة هل الزر المضغوط داخلي أم للاختبار الرسمي
    archiveGrade: '',
    archiveSubject: '',
    selectionMode: false,
    selectedIds: new Set(),
    booksCache: [],
    editMode: false,
    phoneViewMode: false,
    fontScale: 1,
    db: null
  };

  /* ─── Lazy Loaders ─── */
  let _pdfjsP = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('load_fail'));
      document.head.appendChild(s);
    });
  }
  function ensurePdfJs() {
    if (typeof pdfjsLib !== 'undefined') return Promise.resolve();
    if (!_pdfjsP) _pdfjsP = loadScript('/pdf.min.js')
      .then(() => { pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; })
      .catch(e => { _pdfjsP = null; throw e; });
    return _pdfjsP;
  }

  /* ─── Navigation ─── */
  const VIEW_TITLES = {
    home:'الذكي', new:'تحضير جديد', result:'الخطة الدرسية',
    archive:'الأرشيف', library:'المكتبة', settings:'الإعدادات',
    bank:'دروس واختبارات'
  };
  function showView(name) {
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
    $('#appbarTitle').textContent = VIEW_TITLES[name] || 'الذكي';
    $('#btnBack').hidden = name === 'home';
    window.scrollTo(0, 0);
  }
  function navigate(name) {
    if (state.viewStack[state.viewStack.length - 1] !== name) state.viewStack.push(name);
    showView(name);
  }
  function goBack() {
    if (state.viewStack.length > 1) state.viewStack.pop();
    showView(state.viewStack[state.viewStack.length - 1]);
  }
  // يغلق أي نافذة منبثقة/عارض مفتوح حالياً (أولوية أعلى من التنقل بين الشاشات)
  // يُستخدم من زر الرجوع الظاهر في الشريط ومن زر الرجوع الفعلي بالجهاز، حتى يكون
  // سلوك "الرجوع" متسقاً دائماً: يغلق ما هو مفتوح فوق الشاشة أولاً، ثم يرجع خطوة بالتنقل
  function closeTopmostOverlay() {
    const modal = $('.modal-bg.is-active');
    if (modal) { modal.classList.remove('is-active'); return true; }
    if ($('#bookReaderOverlay')?.classList.contains('is-active')) { closeBookReader(); return true; }
    return false;
  }
  function handleBackAction() {
    if (closeTopmostOverlay()) return;
    goBack();
  }

  /* ─── Toast / Overlay ─── */
  let _toastTimer;
  function toast(msg, kind) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast is-active' + (kind ? ' toast-' + kind : '');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('is-active'), 3600);
  }
  function showOverlay(text) {
    $('#loadingText').textContent = text || 'جاري المعالجة...';
    $('#loadingOverlay').classList.add('is-active');
  }
  function hideOverlay() { $('#loadingOverlay').classList.remove('is-active'); }

  /* ─── Settings ─── */
  function loadSettings() {
    try { const r = localStorage.getItem(SETTINGS_KEY); if (r) Object.assign(state.settings, JSON.parse(r)); } catch (e) {}
    try { state.fontScale = parseFloat(localStorage.getItem('haael_fs') || '1') || 1; } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch (e) {}
  }
  function populateSettingsForm() {
    $('#sApiKey').value       = state.settings.apiKey       || '';
    $('#sSchool').value       = state.settings.school       || '';
    $('#sTeacher').value      = state.settings.teacher      || '';
    $('#sDirectorate').value  = state.settings.directorate  || '';
    $('#sSubject').value      = state.settings.subject      || '';
    $('#sDefaultLang').value  = state.settings.defaultLang  || 'ar';
    $('#sDefaultModel').value = state.settings.defaultModel || 'gemini-3.1-flash-lite';
  }
  function onSaveSettings() {
    state.settings.apiKey       = $('#sApiKey').value.trim();
    state.settings.school       = $('#sSchool').value.trim();
    state.settings.teacher      = $('#sTeacher').value.trim();
    state.settings.directorate  = $('#sDirectorate').value.trim();
    state.settings.subject      = $('#sSubject').value.trim();
    state.settings.defaultLang  = $('#sDefaultLang').value;
    state.settings.defaultModel = $('#sDefaultModel').value;
    saveSettings();
    toast('تم حفظ الإعدادات ✓', 'success');
  }

  /* ─── Font / Theme — --fz لمحتوى المستندات، --ui-scale لعناصر الواجهة (الأزرار/البطاقات/القوائم) ─── */
  function applyFontScale(s) {
    state.fontScale = Math.max(0.6, Math.min(3.0, s));
    // --fz لمحتوى المستندات (الخطط/الملخصات) — نطاقه واسع كما كان
    document.documentElement.style.setProperty('--fz', (24 * state.fontScale) + 'px');
    // --ui-scale لعناصر الواجهة: نطاق أضيق (0.85–1.35) حتى لا تنكسر الأزرار
    // أو تخرج عن الشاشة على الهواتف الصغيرة عند تكبير خط المستندات كثيراً
    const uiScale = Math.max(0.85, Math.min(1.35, state.fontScale));
    document.documentElement.style.setProperty('--ui-scale', uiScale);
    try { localStorage.setItem('haael_fs', state.fontScale); } catch (e) {}
  }
  function applyTheme(name) {
    if (!name) return;
    document.documentElement.dataset.theme = name;
    try { localStorage.setItem('haael_theme', name); } catch (e) {}
  }
  function applyFont(family) {
    if (!family) return;
    document.documentElement.style.setProperty('--font-ui',  family);
    document.documentElement.style.setProperty('--font-doc', family);
    document.documentElement.style.setProperty('--font-en',  family);
    try { localStorage.setItem('haael_font', family); } catch (e) {}
  }

  /* ─── IndexedDB ─── */
    /* ─── IndexedDB ─── */
  function openDB() {
    return new Promise((res, rej) => {
      if (state.db) { res(state.db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LESSONS_STORE)) {
          const ls = db.createObjectStore(LESSONS_STORE, { keyPath:'id', autoIncrement:true });
          ls.createIndex('title','title',{unique:false});
          ls.createIndex('createdAt','createdAt',{unique:false});
        }
        if (!db.objectStoreNames.contains(BOOKS_STORE)) {
          db.createObjectStore(BOOKS_STORE, { keyPath:'id', autoIncrement:true });
        }
        // --- [دروس واختبارات] ---
        if (!db.objectStoreNames.contains(EXTRACTS_STORE)) {
          db.createObjectStore(EXTRACTS_STORE, { keyPath:'id', autoIncrement:true });
        }
      };
      
      req.onsuccess = e => { state.db = e.target.result; res(state.db); };
      req.onerror = e => rej(e.target.error);
    });
  }

  function dbOp(store, mode, fn) {
    return openDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction(store, mode);
      const req = fn(tx.objectStore(store));
      req.onsuccess = () => res(req.result);
      req.onerror = e => rej(e.target.error);
    }));
  }
    // 💡 إضافة دالة التذكير بالنسخ الاحتياطي
  function showBackupReminderModal() {
    let modal = $('#backupReminderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-bg';
      modal.id = 'backupReminderModal';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 400px; text-align: center; padding: 25px;">
          <div style="font-size: 50px; margin-bottom: 10px;">🛡️</div>
          <h2 style="color: #4f46e5; margin-bottom: 10px; font-size: 22px; font-weight: 900;">تأمين مجهودك!</h2>
          <p style="color: #475569; font-size: 14.5px; font-weight: bold; line-height: 1.6; margin-bottom: 25px;">
            لقد قمت بتحضير وإضافة 15 درساً جديداً منذ آخر نسخة احتياطية. لحماية مجهودك من أي طارئ، ننصحك بشدة بأخذ نسخة احتياطية لبياناتك الآن.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#10b981; transition:0.2s; border:none; color:white; cursor:pointer;" onclick="document.getElementById('backupReminderModal').classList.remove('is-active'); document.getElementById('btnExportBackup').click();">💾 تصدير نسخة احتياطية الآن</button>
            <button class="btn-primary" style="padding:12px; border-radius:12px; font-size:14px; font-weight:bold; background:#cbd5e1; color:#334155; transition:0.2s; border:none; cursor:pointer;" onclick="document.getElementById('backupReminderModal').classList.remove('is-active');">ذكرني لاحقاً</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('is-active');
  }

  // 💡 محرك الإضافة لقاعدة البيانات (مدمج معه عداد النسخ الاحتياطي ودرع حماية)
  const dbAdd = (store, r) => dbOp(store, 'readwrite', s => s.add(r)).then(id => {
      try {
          // إذا تم الحفظ في الأرشيف أو بنك الدروس
          if (store === LESSONS_STORE || store === EXTRACTS_STORE) {
              let count = parseInt(localStorage.getItem('haael_unbacked_count') || '0');
              count++;
              if (count >= 15) {
                  setTimeout(showBackupReminderModal, 1500); 
                  localStorage.setItem('haael_unbacked_count', '0'); 
              } else {
                  localStorage.setItem('haael_unbacked_count', count);
              }
          }
      } catch(e) { /* حماية للهواتف التي تحظر التخزين المحلي */ }
      return id;
  });

  const dbPut    = (store, r)  => dbOp(store, 'readwrite', s => s.put(r));
  const dbGet    = (store, id) => dbOp(store, 'readonly',  s => s.get(id));
  const dbGetAll = store       => dbOp(store, 'readonly',  s => s.getAll());
  const dbDelete = (store, id) => dbOp(store, 'readwrite', s => s.delete(id));
  const dbClearAll = store     => dbOp(store, 'readwrite', s => s.clear());

  /* ─── Segmented controls ─── */
  function wireSegmented(containerId, dataAttr, onChange) {
    const el = $('#' + containerId);
    el.addEventListener('click', e => {
      const btn = e.target.closest('.seg-btn'); if (!btn) return;
      $$('.seg-btn', el).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset[dataAttr]);
    });
  }
  function onSourceChange(src) {
    state.sourceType = src;
    ['title','text','images','pdf','library'].forEach(s => {
      $('#panel-' + s).hidden = s !== src;
    });
  }
  function onLanguageChange(lang) { state.language = lang; updateTranslateBtn(); }

  /* ─── Image Compression ─── */
  // نطلب من المتصفح فك تشفير الصورة "مصغّرة مباشرة" (resize أثناء فك الترميز نفسه)
  // بدل فك الصورة الأصلية بكامل دقتها أولاً ثم تصغيرها لاحقاً — هذا هو الفرق الحقيقي
  // الذي يمنع انهيار الذاكرة مع الصور الكبيرة جداً (بخلاف المحاولة السابقة).
  async function loadDrawableSafe(file, maxDim) {
    if (window.createImageBitmap) {
      try {
        // resizeWidth فقط (بدون resizeHeight) يحافظ على أبعاد الصورة تلقائياً
        // ويسمح للمتصفح بفك الترميز مباشرة على الحجم المصغّر (توفير حقيقي بالذاكرة)
        const bmp = await createImageBitmap(file, { resizeWidth: maxDim, resizeQuality: 'medium' });
        if (bmp.height <= maxDim) return { bitmap: bmp, w: bmp.width, h: bmp.height };
        // حماية إضافية للصور الطويلة جداً (بانورامية/ممسوحة عمودياً) — العملية هنا رخيصة
        // لأنها تُجرى على النسخة المصغّرة أصلاً وليس على الصورة الأصلية
        const w2 = Math.round(bmp.width * maxDim / bmp.height), h2 = maxDim;
        const shrunk = await createImageBitmap(bmp, { resizeWidth: w2, resizeHeight: h2, resizeQuality: 'medium' });
        bmp.close();
        return { bitmap: shrunk, w: w2, h: h2 };
      } catch (e) { /* نتابع بالطريقة التقليدية أدناه فقط عند تعذّر ما سبق */ }
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else       { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        resolve({ bitmap: img, w, h });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img_load')); };
      img.src = url;
    });
  }
  async function compressImage(file, maxDim, quality) {
    const { bitmap, w, h } = await loadDrawableSafe(file, maxDim);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    const out = canvas.toDataURL('image/jpeg', quality).split(',')[1];
    if (bitmap.close) bitmap.close(); // تحرير ذاكرة الصورة المفكوكة فوراً
    canvas.width = canvas.height = 0;
    return out;
  }
  // مصغّرة عرض خفيفة جداً — تُستخدم للمعاينة فقط بدل تحميل الصورة الأصلية كاملة
  async function makeThumb(file) {
    try { return 'data:image/jpeg;base64,' + await compressImage(file, 240, 0.6); }
    catch (e) { return null; }
  }


  /* ─── Images via Gemini Vision ─── */
  function handleImagePick() { 
  $('#imageInput').value = ''; 
  $('#imageInput').click(); 
}

        // =========================================================================
  // 1. استخراج النصوص من الصور العادية (Supercharged Vision OCR)
  // =========================================================================
    /* ─── Images via Gemini Vision ─── */
  function handleImagePick() { 
    $('#imageInput').value = ''; 
    $('#imageInput').click(); 
  }

  async function handleImagesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return; 
    $('#btnRetryImages').hidden = false;
    
    const thumbs = $('#imageThumbs');
    thumbs.innerHTML = '';
    // مصغّرات خفيفة الحجم بدل عرض الصور الأصلية كاملة (تفادي انهيار الذاكرة مع صور كبيرة جداً)
    for (const f of files) {
      const img = document.createElement('img');
      makeThumb(f).then(src => { if (src) img.src = src; });
      thumbs.appendChild(img);
    }
    
    if (!state.settings.apiKey) {
      toast('أدخل مفتاح API لقراءة الصور تلقائياً', 'error');
      $('#imageTextWrap').hidden = false;
      return;
    }

    const prog = $('#ocrProgress'), fill = $('#ocrBarFill'), status = $('#ocrStatus');
    prog.hidden = false; fill.style.width = '5%';
    status.textContent = 'جاري تجهيز الصور...';
    $('#imageTextWrap').hidden = true;
    
    const model = state.settings.defaultModel || 'gemini-2.0-flash';
    const url = `${GEMINI_BASE}${model}:generateContent?key=${encodeURIComponent(state.settings.apiKey)}`;
    
    // 💡 البرومبت الحديدي الموحد للصور
        const STRICT_OCR_PROMPT = `أنت خبير ذكاء اصطناعي مبرمج لتعمل كماسح ضوئي (OCR) فائق الدقة للمناهج التعليمية.
مهمتك: استخراج كافة النصوص من هذه الصفحة بنسبة تطابق 100% دون أي تفكير إبداعي.
قواعد صارمة جداً إجبارية:
1. اللغات: استخرج النصوص العربية والإنجليزية حرفياً كما هي.
2. الرياضيات والعلوم (هام جداً): اكتب المعادلات نصياً لتجنب تشوهها. للكسور اكتب (البسط / المقام). للجذور اكتب جذر(الرقم). للأسس اكتب (الأساس^الأس). لسهم الاستنتاج/الاستلزام اكتب (<==) دائماً بنفس الصيغة النصية الموحدة.
3. الرموز العربية: حافظ على الرموز الرياضية العربية (س، ص، ع، ط، جا، جتا، ظا) ولا تحولها للإنجليزية أبداً.
4. التنسيق: حافظ على ترتيب الأسطر، القوائم النقطية، والجداول كما تظهر تماماً.
5. المخرجات: أعد النص المستخرج فقط وفقط.`;

    const extractedTexts = [];
    let skipped = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        status.textContent = `قراءة الصورة ${i + 1} من ${files.length}...`;
        fill.style.width = Math.round(5 + (i / files.length) * 90) + '%';
        
        // 💡 [الحل السحري]: الانتظار 3.5 ثوانٍ لتجنب حظر جوجل
        if (i > 0) {
          status.textContent = `تأمين الاتصال للصورة ${i + 1} (لتجنب الحظر)...`;
          await new Promise(resolve => setTimeout(resolve, 3500)); 
          status.textContent = `قراءة الصورة ${i + 1} من ${files.length}...`;
        }

        try {
          // 💡 الضغط الخارق: 900 بكسل وجودة 45% لعدم إرهاق الهاتف
          const b64 = await compressImage(files[i], 1200, 0.75); 
          const res = await fetch(url, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              contents: [{ role:'user', parts: [
                { inlineData: { mimeType:'image/jpeg', data:b64 } },
                { text: STRICT_OCR_PROMPT }
              ]}],
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
              ],
              generationConfig: { temperature: 0.0 } // 💡 صفر إبداع لدقة مطلقة
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || `خطأ ${res.status}`);
          const text = (data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
          if (text) extractedTexts.push(text); else skipped++;
        } catch (imgErr) {
          skipped++; 
        }
      }
      
      if (skipped) toast(`تعذّر استخراج نص ${skipped} صورة، تم تجاوزها`, 'error');
      fill.style.width = '100%';
      const combined = extractedTexts.join('\n\n');
      if (combined) {
        $('#imagesExtractedText').value = combined;
        $('#imageTextWrap').hidden = false;
        status.textContent = 'تم الاستخراج بنجاح ✓';
        toast('تم قراءة الصور بنجاح ✓', 'success');
                // 💡 إظهار نافذة الخيارات التلقائية للصور
        if (combined.trim().length > 10) {
          setTimeout(showPostExtractModal, 500);
        }

      } else {
        status.textContent = 'لم يُستخرج نص (قد يكون بسبب جودة الصور)';
        $('#imageTextWrap').hidden = false;
        toast('لم يُستخرج نص', 'error');
      }
    } catch (err) {
      $('#ocrBarFill').style.width = '0%';
      $('#ocrStatus').textContent = 'تعذر: ' + (err.message || 'خطأ');
      $('#imageTextWrap').hidden = false;
      toast('فشل: ' + (err.message || 'خطأ غير معروف'), 'error');
    }
  }

  /* ─── PDF Hybrid Extraction (نص + Gemini Vision للمُصوَّر) ─── */
  function handlePdfPick() { 
    $('#pdfInput').value = ''; 
    $('#pdfInput').click(); 
  }
  
  async function handlePdfChange(e) {
    const file = e.target.files?.[0]; 
    if (!file) return; 
    $('#btnRetryPdf').hidden = false;
    
    $('#pdfFileName').textContent = file.name; $('#pdfFileName').hidden = false;
    const from = parseInt($('#pdfPageFrom').value) || 1;
    const to   = parseInt($('#pdfPageTo').value)   || 5;
    await extractPdfRange(file, from, to, 'pdf');
  }

  /* ─── OCR أولي (صفحة واحدة) — نواة مشتركة تُستخدم من extractPdfRange ومن library-extract.js عبر HaelCore ─── */
  const SHARED_STRICT_OCR_PROMPT = `أنت خبير ذكاء اصطناعي مبرمج لتعمل كماسح ضوئي (OCR) فائق الدقة للمناهج التعليمية.
مهمتك: استخراج كافة النصوص من هذه الصفحة بنسبة تطابق 100% دون أي تفكير إبداعي.
قواعد صارمة جداً إجبارية:
1. اللغات: استخرج النصوص العربية والإنجليزية حرفياً كما هي.
2. الرياضيات والعلوم (هام جداً): اكتب المعادلات نصياً لتجنب تشوهها. للكسور اكتب (البسط / المقام). للجذور اكتب جذر(الرقم). للأسس اكتب (الأساس^الأس). لسهم الاستنتاج/الاستلزام اكتب (<==) دائماً بنفس الصيغة النصية الموحدة.
3. الرموز العربية: حافظ على الرموز الرياضية العربية (س، ص، ع، ط، جا، جتا، ظا) ولا تحولها للإنجليزية أبداً.
4. التنسيق: حافظ على ترتيب الأسطر، القوائم النقطية، والجداول كما تظهر تماماً.
5. المخرجات: أعد النص المستخرج فقط وفقط.`;

  async function ocrPdfPageToText(pdf, pageNum) {
    if (!state.settings.apiKey) { const e = new Error('لا يوجد مفتاح API'); e.code = 'no-api-key'; throw e; }
    const page = await pdf.getPage(pageNum);
    const nativeVp = page.getViewport({ scale: 1 });
    const MAX_SIDE = 1280;
    const longSide = Math.max(nativeVp.width, nativeVp.height);
    const safeScale = Math.min(0.8, MAX_SIDE / longSide);
    const viewport = page.getViewport({ scale: Math.max(safeScale, 0.25) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const b64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
    canvas.width = canvas.height = 0;

    const model = state.settings.defaultModel || 'gemini-2.0-flash';
    const url = `${GEMINI_BASE}${model}:generateContent?key=${encodeURIComponent(state.settings.apiKey || '')}`;
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: b64 } },
          { text: SHARED_STRICT_OCR_PROMPT }
        ]}],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { temperature: 0.0 }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `خطأ ${res.status}`);
    return (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  }

  // 💡 استنتاج العنوان آلياً من الفهرس (لعدم إزعاج المعلم)
  function ensureTitleAutoFilled() {
      const titleInput = $('#fTitle');
      if (!titleInput.value.trim()) {
          const bookSelect = $('#libraryBookSelect');
          const fromInput = $('#libPageFrom');
          
          if (bookSelect && fromInput && bookSelect.value) {
              const bookId = parseInt(bookSelect.value);
              const fromP = parseInt(fromInput.value);
              const book = state.booksCache.find(b => b.id === bookId);
              
              if (book && book.toc) {
                  // نبحث عن الموضوع الذي تقع الصفحة المطلوبة داخل نطاقه
                  const tocItem = book.toc.find(t => fromP >= t.page && fromP <= t.endPage) || book.toc.find(t => t.page === fromP);
                  if (tocItem) {
                      titleInput.value = tocItem.title;
                      return;
                  }
              }
          }
          // إذا لم يجد فهرساً، نضع اسماً افتراضياً لكي لا يتوقف الحفظ
          titleInput.value = 'الدرس المستخرج';
      }
  }

  // 💡 نافذة الخيارات الذكية ما بعد الاستخراج
  function showPostExtractModal() {
    ensureTitleAutoFilled(); // 👈 سحب العنوان فوراً

    let modal = $('#postExtractModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-bg';
      modal.id = 'postExtractModal';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 450px; text-align: center; padding: 25px;">
          <div class="modal-hdr" style="justify-content: center; position: relative; border-bottom: none;">
            <h2 style="color: #10b981; margin: 0; font-size: 22px;">✅ اكتمل الاستخراج</h2>
            <button class="modal-close" style="position: absolute; left: 0; top: -5px;" onclick="document.getElementById('postExtractModal').classList.remove('is-active')">✕</button>
          </div>
          <div class="modal-body" style="display:flex; flex-direction:column; gap:12px; padding-top: 5px; max-height: 70vh; overflow-y: auto;">
            <p style="font-size:14px; color:#475569; margin-bottom:10px; font-weight: 800;">النص المصدري جاهز! اختر الإجراء المطلوب (النافذة ستبقى مفتوحة لتنفيذ عدة مهام):</p>
            
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; transition:0.2s;" onclick="document.getElementById('btnGenerate').click();">📝 توليد خطة درس (PPP)</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#059669; transition:0.2s;" onclick="document.getElementById('btnGenerateBoard').click();">🖍️ توليد سبورة تفاعلية</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#d97706; transition:0.2s;" onclick="document.getElementById('btnGenerateQuiz').click();">🧩 توليد ملخص واختبار (سريع)</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#2563eb; transition:0.2s;" onclick="document.getElementById('btnGenerateAudio').click();">🎧 إعداد درس صوتي</button>
            
            <hr style="border:0; border-top:2px dashed #e2e8f0; margin: 5px 0;">
            <p style="font-size:13px; color:#64748b; margin-bottom:0px; font-weight: bold;">خيارات بنك (دروس واختبارات) الشاملة:</p>
            
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#4f46e5; transition:0.2s;" onclick="document.getElementById('btnSaveToBank').click();">💾 حفظ كنص في الأرشيف فقط</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#8b5cf6; transition:0.2s;" onclick="quickTriggerBankAction('summary');">📜 بناء ملخص شامل احترافي</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#db2777; transition:0.2s;" onclick="quickTriggerBankAction('exam_internal');">🧪 إعداد اختبار شامل</button>
            <button class="btn-primary" style="padding:14px; border-radius:12px; font-size:15px; font-weight:900; background:#1e40af; transition:0.2s;" onclick="quickTriggerBankAction('exam_official');">📝 تصدير لاختبار رسمي للطباعة</button>

          </div>
        </div>
      `;
      document.body.appendChild(modal);
      // إغلاق حصراً من زر ✕
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('is-active'); });
    }
    modal.classList.add('is-active');
  }

  // 💡 محرك لتنفيذ خيارات البنك الشاملة مباشرة من نافذة الاستخراج بدون مغادرتها
  window.quickTriggerBankAction = async function(action) {
      ensureTitleAutoFilled(); // ضمان وجود العنوان
      
      const content = getContentText();
      if (!content) { toast('لا يوجد نص مستخرج!', 'error'); return; }
      const meta = gatherMeta();
      const title = $('#fTitle').value.trim();
      
      showOverlay('جاري حفظ النص وتجهيز العملية...');
      try {
          // التحقق مما إذا كان الدرس محفوظاً مسبقاً لتجنب التكرار في الأرشيف
          const existing = await dbGetAll(EXTRACTS_STORE);
          let recordId = null;
          const matched = existing.find(r => r.title === title && r.content === content);
          
          if (matched) {
              recordId = matched.id;
          } else {
              const record = {
                  title: title, subject: meta.subject, grade: meta.grade, section: meta.section,
                  content: content, sourceType: meta.sourceType, savedAt: Date.now()
              };
              recordId = await dbAdd(EXTRACTS_STORE, record);
          }
          
          // تحديث الواجهة وتحديد الدرس برمجياً في الخلفية
          await loadKnowledgeBank(); 
          document.querySelectorAll('.bank-chk').forEach(cb => cb.checked = false);
          
          setTimeout(() => {
              const newCb = document.querySelector(`.bank-chk[value="${recordId}"]`);
              if (newCb) newCb.checked = true;
              
              hideOverlay();
              
              // إغلاق هذه النافذة لفتح النوافذ المنبثقة الخاصة باختيارات (الاختبار الشامل)
              $('#postExtractModal').classList.remove('is-active');
              
              // محاكاة النقر على الأزرار الأصلية
              if (action === 'summary') {
                  $('#btnGenBankSummary')?.click();
              } else if (action === 'exam_internal') {
                  $('#btnGenBankQuiz')?.click(); 
              } else if (action === 'exam_official') {
                  $('#btnGenOfficialExam')?.click();
              }
          }, 400);

      } catch (e) {
          hideOverlay(); toast('تعذر تجهيز العملية', 'error');
      }
  };

    async function extractPdfRange(fileOrBuffer, pageFrom, pageTo, prefix) {
    const fill   = $('#' + prefix + 'BarFill');
    const status = $('#' + prefix + 'Status');
    const textWrap = $('#' + prefix + 'TextWrap');
    const textArea = $('#' + prefix + 'ExtractedText');
    const prog = $('#' + prefix + 'Progress');
    prog.hidden = false; fill.style.width = '0%';
    status.textContent = 'جاري فتح ملف PDF...'; textWrap.hidden = true;

    try { await ensurePdfJs(); }
    catch (e) { status.textContent = 'تعذر تحميل مكتبة PDF'; textWrap.hidden = false; return; }

    let objectUrl = null;
    try {
      let pdf;
      if (fileOrBuffer instanceof Blob) {
        objectUrl = URL.createObjectURL(fileOrBuffer);
        pdf = await pdfjsLib.getDocument(objectUrl).promise;
      } else {
        pdf = await pdfjsLib.getDocument({ data: fileOrBuffer }).promise;
      }
      
      const toPage = Math.min(pageTo, pdf.numPages);
      let combinedText = '';
      
      // 💡 تم رفع الحد لـ 20 صفحة دفعة واحدة بأمان
      const MAX_SCANNED = 20; 
      let scannedCount = 0;
      const model = state.settings.defaultModel || 'gemini-2.0-flash';
      const url = `${GEMINI_BASE}${model}:generateContent?key=${encodeURIComponent(state.settings.apiKey || '')}`;

      const STRICT_OCR_PROMPT = `أنت خبير ذكاء اصطناعي مبرمج لتعمل كماسح ضوئي (OCR) فائق الدقة للمناهج التعليمية.
مهمتك: استخراج كافة النصوص من هذه الصفحة بنسبة تطابق 100% دون أي تفكير إبداعي.
قواعد صارمة جداً إجبارية:
1. اللغات: استخرج النصوص العربية والإنجليزية حرفياً كما هي.
2. الرياضيات والعلوم (هام جداً): اكتب المعادلات نصياً لتجنب تشوهها. للكسور اكتب (البسط / المقام). للجذور اكتب جذر(الرقم). للأسس اكتب (الأساس^الأس). لسهم الاستنتاج/الاستلزام اكتب (<==) دائماً بنفس الصيغة النصية الموحدة.
3. الرموز العربية: حافظ على الرموز الرياضية العربية (س، ص، ع، ط، جا، جتا، ظا) ولا تحولها للإنجليزية أبداً.
4. التنسيق: حافظ على ترتيب الأسطر، القوائم النقطية، والجداول كما تظهر تماماً.
5. المخرجات: أعد النص المستخرج فقط وفقط.`;

      for (let i = pageFrom; i <= toPage; i++) {
        fill.style.width = Math.round(((i - pageFrom) / (toPage - pageFrom + 1)) * 90) + '%';
        status.textContent = `فحص الصفحة ${i} من ${toPage}...`;

        // 💡 الانتظار 3.5 ثوانٍ بين الصفحات لتجنب الحظر
        if (i > pageFrom) {
          status.textContent = `تأمين الاتصال للصفحة ${i} (لتجنب الحظر)...`;
          await new Promise(resolve => setTimeout(resolve, 3500));
          status.textContent = `فحص الصفحة ${i} من ${toPage}...`;
        }

        const page = await pdf.getPage(i);

        if (scannedCount >= MAX_SCANNED) {
          toast(`تنبيه: تم الاكتفاء بأول ${MAX_SCANNED} صفحة كحد أقصى`, 'error');
          break;
        }

        status.textContent = `جاري تجهيز صفحة ${i} كصورة خفيفة جداً...`;
        let b64;
        try {
          const nativeVp = page.getViewport({ scale: 1 });
          const MAX_SIDE = 1280; 
          const longSide = Math.max(nativeVp.width, nativeVp.height);
          const safeScale = Math.min(0.8, MAX_SIDE / longSide);
          const viewport = page.getViewport({ scale: Math.max(safeScale, 0.25) });
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;

          b64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
          canvas.width = canvas.height = 0; 
        } catch (pageErr) {
          toast(`تعذّر تصوير الصفحة ${i}، تم تجاوزها`, 'error');
          continue;
        }

        if (!state.settings.apiKey) throw new Error('الصفحات المصورة تتطلب مفتاح API');
        scannedCount++;
        status.textContent = `قراءة الصفحة ${i} بالذكاء الاصطناعي...`;
        
        try {
          const res = await fetch(url, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              contents:[{role:'user', parts:[
                { inlineData: { mimeType: 'image/jpeg', data: b64 } },
                { text: STRICT_OCR_PROMPT }
              ]}],
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
              ],
              generationConfig:{temperature: 0.0}
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || `خطأ ${res.status}`);
          const aiText = (data.candidates?.[0]?.content?.parts||[]).map(p => p.text||'').join('').trim();
          if (aiText) combinedText += aiText + '\n\n';
        } catch (apiErr) {
          toast(`تعذّرت قراءة الصفحة ${i}: ${apiErr.message || ''}`, 'error');
        }
      }

      const finalResult = combinedText.trim();
      textArea.value = finalResult;
      textWrap.hidden = false;
      fill.style.width = '100%';
      
      if (finalResult.length > 5) {
        status.textContent = 'تم الاستخراج بنجاح ✓';
        toast('تم استخراج النص ✓', 'success');
        
        // 👈 السطر السحري: إظهار النص وأزرار التوليد
        expandPreparationAccordions();
        
        // 💡 إظهار نافذة الخيارات التلقائية
        if (typeof showPostExtractModal === 'function' && combinedText.trim().length > 10) {
          setTimeout(showPostExtractModal, 500); 
        }
      } else {
        status.textContent = 'لم يُستخرج نص (تأكد من جودة الملف أو اتصال الإنترنت)';
        toast('اكتملت العملية ولكن لم يُستخرج أي نص!', 'error');
      }
      
    } catch (err) {
      fill.style.width = '0%';
      status.textContent = 'تعذر: ' + (err.message || 'خطأ');
      textWrap.hidden = false;
      toast(err.message || 'تعذر استخراج النص', 'error');
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  /* ─── Library ─── */
  function finalizeToc(flat, totalPages, offsetPages) {
    offsetPages = parseInt(offsetPages) || 0;
    const seen = new Set();
    const clean = flat.filter(x => {
      if (!x.title || !x.page || x.page < 1) return false;
      if (seen.has(x.page)) return false;
      seen.add(x.page); return true;
    });
    if (!clean.length) return null;
    return clean.map((x, i) => ({
      title: x.title,
      page: Math.min(x.page + offsetPages, totalPages),
      endPage: Math.min((clean[i+1] ? clean[i+1].page - 1 : totalPages) + offsetPages, totalPages)
    }));
  }
  async function tocViaAI(pdf, fromPage, toPage, offsetPages) {
    if (!state.settings.apiKey) { const e = new Error('لا يوجد مفتاح API'); e.code = 'no-api-key'; throw e; }
    const total = pdf.numPages;
    fromPage = Math.max(1, Math.min(fromPage, total));
    toPage = Math.max(fromPage, Math.min(toPage, total, fromPage + 6)); // حد أقصى 7 صفحات دفعة واحدة
    const parts = [];
        for (let i = fromPage; i <= toPage; i++) {
      const page = await pdf.getPage(i);
      const nativeVp = page.getViewport({ scale: 1 });
      const MAX_SIDE = 1500;
      const longSide = Math.max(nativeVp.width, nativeVp.height);
      const safeScale = Math.min(0.7, MAX_SIDE / longSide);
      const viewport = page.getViewport({ scale: Math.max(safeScale, 0.15) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const b64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } });
      canvas.width = canvas.height = 0;
    }
    parts.push({ text: 'أنت مساعد ذكي متخصص في تحليل المستندات. المرفقات هي صور لفهرس كتاب (Table of Contents).\nمهمتك: استخراج الفهرس بالكامل وبدقة متناهية سطراً بسطر.\nالقواعد:\n1. استخرج كل عنوان (سواء كان وحدة رئيسية، أو درساً فرعياً، أو قسم قواعد/مفردات) مع رقم الصفحة المقابل له بالضبط كما هو مطبوع.\n2. لا تلخص، ولا تتجاهل أي عنوان فرعي موجود في الصورة.\n3. حافظ على لغة العناوين الأصلية (الإنجليزية بالإنجليزية، والعربية بالعربية).\n4. إذا لم تجد رقم صفحة لعنوان معين، تجاهل هذا العنوان فقط.\nأعد النتيجة بصيغة JSON فقط: مصفوفة تحتوي عناصر بالشكل التالي: {"title":"اسم الموضوع","page":رقم الصفحة كعدد صحيح}. لا تكتب أي نص أو تعليق خارج مصفوفة الـ JSON.' });

    const model = state.settings.defaultModel || 'gemini-2.0-flash';
    const url = `${GEMINI_BASE}${model}:generateContent?key=${encodeURIComponent(state.settings.apiKey)}`;
    let res, data;
    try {
      res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
        })
      });
      data = await res.json();
    } catch (e) { const err = new Error('فشل الاتصال بالشبكة'); err.code = 'network'; throw err; }
    if (!res.ok) { const err = new Error(data?.error?.message || 'خطأ من الخادم'); err.code = 'api-error'; throw err; }
    const raw = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    let list;
    try { list = JSON.parse(raw); }
    catch (e) {
      const m = raw.match(/\[[\s\S]*\]/);
      if (!m) { const err = new Error('تعذر فهم استجابة النموذج'); err.code = 'parse-error'; throw err; }
      list = JSON.parse(m[0]);
    }
    if (!Array.isArray(list) || !list.length) { const err = new Error('لم يُعثر على فهرس'); err.code = 'empty-result'; throw err; }
    const flat = list.map(x => ({ title: String(x.title||'').trim(), page: parseInt(x.page) }))
      .filter(x => x.title && x.page > 0);
    flat.sort((a,b) => a.page - b.page);
    const toc = finalizeToc(flat, total, offsetPages);
    if (!toc) { const err = new Error('لم يُعثر على فهرس'); err.code = 'empty-result'; throw err; }
    return toc;
  }
  async function runTocExtraction(bookId, fromPage, toPage, offsetPages) {
    const modal = $('#tocRangeModal'), btn = $('#btnConfirmTocRange'), prog = $('#tocRangeProgress');
    prog.hidden = false; btn.disabled = true;
    let objectUrl = null;
    try {
      const book = await dbGet(BOOKS_STORE, bookId);
      if (!book) throw new Error('الكتاب غير موجود');
      if (!book.data) throw new Error('لا يوجد ملف PDF مرفق بهذا الكتاب (فهرس مستورد فقط) — أعد رفع الكتاب الأصلي');
      await ensurePdfJs();
      objectUrl = URL.createObjectURL(book.data);
      const pdf = await pdfjsLib.getDocument(objectUrl).promise;
      const toc = await tocViaAI(pdf, fromPage, toPage, offsetPages);
      book.toc = toc;
      await dbPut(BOOKS_STORE, book);
      modal.classList.remove('is-active');
      toast(`تم استخراج فهرس بـ ${toc.length} موضوع ✓`, 'success');
      await refreshLibraryList(); await refreshLibrarySelect();
    } catch (e) {
      const msgs = {
        'no-api-key': 'أدخل مفتاح Gemini في الإعدادات أولاً',
        'empty-result': 'لم يُعثر على فهرس ضمن الصفحات المحددة، تحقق من الأرقام وحاول مجدداً',
        'network': 'تعذر الاتصال بالإنترنت، حاول مجدداً',
        'parse-error': 'تعذر فهم نتيجة الاستخراج، جرّب صفحات أخرى'
      };
      toast(msgs[e.code] || e.message || 'تعذر استخراج الفهرس', 'error');
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      prog.hidden = true; btn.disabled = false;
    }
  }
  function openTocRangeModal(bookId) {
    $('#tocRangeModal').dataset.bookId = bookId;
    $('#tocRangeFrom').value = 2; $('#tocRangeTo').value = 3;
    if ($('#tocOffsetPages')) $('#tocOffsetPages').value = 0;
    $('#tocRangeProgress').hidden = true;
    $('#tocRangeModal').classList.add('is-active');
  }
  function openTocViewModal(bookId) {
    const book = state.booksCache.find(b => b.id === bookId);
    if (!book?.toc?.length) return;
    $('#tocViewList').innerHTML = book.toc.map(t => `
      <div class="toc-item" data-book="${bookId}" data-from="${t.page}" data-to="${t.endPage}">
        <span class="toc-item-title">${esc(t.title)}</span>
        <span class="toc-item-pages">ص ${t.page}–${t.endPage}</span>
      </div>`).join('');
    $('#tocViewModal').classList.add('is-active');
  }
  async function jumpToLibraryTopic(bookId, fromPage, toPage) {
    $('#tocViewModal').classList.remove('is-active');
    navigate('new');
    
    // 💡 السطر السحري: فتح قسم إضافة المحتوى (الأكورديون) ليرى المعلم شريط التقدم والنص فوراً
    expandPreparationAccordions();
    
    $$('.seg-btn', $('#sourceSegment')).forEach(b => b.classList.toggle('active', b.dataset.source === 'library'));
    onSourceChange('library');
    await refreshLibrarySelect();
    $('#libraryBookSelect').value = String(bookId);
    renderLibraryToc();
    $('#libPageFrom').value = fromPage;
    $('#libPageTo').value = toPage;
    onExtractFromLib();
  }

  /* ─── قارئ الكتاب الداخلي (تصفح صفحة بصفحة + تحديد نطاق للاستخراج) ─── */
  const readerState = { pdf:null, bookId:null, pageNum:1, rangeStart:null, rangeEnd:null, rendering:false, objectUrl:null };

  async function openBookReader(bookId) {
    const book = await dbGet(BOOKS_STORE, bookId);
    if (!book) { toast('تعذر العثور على الكتاب', 'error'); return; }
    if (!book.data) { toast('هذا الكتاب فهرس مستورد فقط بدون ملف PDF فعلي — أعد رفع الكتاب الأصلي لاستعراضه', 'error'); return; }
    showOverlay('جاري فتح الكتاب...');
    try {
      await ensurePdfJs();
      readerState.objectUrl = URL.createObjectURL(book.data);
      readerState.pdf = await pdfjsLib.getDocument(readerState.objectUrl).promise;
      readerState.bookId = bookId;
      readerState.pageNum = 1;
      readerState.rangeStart = null;
      readerState.rangeEnd = null;
      $('#readerBookTitle').textContent = book.name || 'كتاب';
      $('#readerTotalPages').textContent = readerState.pdf.numPages;
      $('#readerPageInput').max = readerState.pdf.numPages;
      updateReaderSelectionBar();
      $('#bookReaderOverlay').classList.add('is-active');
      hideOverlay();
      await renderReaderPage(1);
    } catch (e) {
      hideOverlay();
      console.error('[reader] فشل فتح الكتاب', e);
      toast('تعذر فتح الكتاب', 'error');
    }
  }

    async function renderReaderPage(num) {
    if (!readerState.pdf || readerState.rendering) return;
    num = Math.max(1, Math.min(num, readerState.pdf.numPages));
    readerState.rendering = true;
    try {
      const page = await readerState.pdf.getPage(num);
      const canvas = $('#bookReaderCanvas');
      const wrap = $('#bookReaderCanvasWrap');
      const baseViewport = page.getViewport({ scale:1 });
      
      // حساب الحجم الذي يملأ الشاشة بصرياً
      const displayScale = Math.max(0.2, Math.min(wrap.clientWidth / baseViewport.width, wrap.clientHeight / baseViewport.height) || 1);
      
      // 💡 السر هنا: معامل الدقة (نضاعف عدد البكسلات لتناسب الشاشات الحديثة وتوضيح الخط)
      const qualityMultiplier = Math.max(window.devicePixelRatio || 1, 2.5); // حد أدنى 2.5 ضعف للوضوح الفائق
      const renderViewport = page.getViewport({ scale: displayScale * qualityMultiplier });
      
      // 1. تحديد الدقة الفعلية العالية جداً للرسم (البيانات الخام)
      canvas.width = renderViewport.width; 
      canvas.height = renderViewport.height;
      
      // 2. إجبار الكانفس بصرياً على الظهور بحجم الشاشة (تصغير الصورة العالية الدقة لتصبح حادة جداً)
      canvas.style.width = (baseViewport.width * displayScale) + 'px';
      canvas.style.height = (baseViewport.height * displayScale) + 'px';
      canvas.style.maxWidth = '100%';
      canvas.style.objectFit = 'contain';

      const ctx = canvas.getContext('2d');
      
      // تفعيل تنعيم الخطوط العالي الجودة
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
      readerState.pageNum = num;
      $('#readerPageInput').value = num;
    } catch (e) {
      console.error('[reader] فشل رسم الصفحة', num, e);
      toast('تعذر عرض هذه الصفحة', 'error');
    } finally {
      readerState.rendering = false;
    }
  }

  function readerNext() { renderReaderPage(readerState.pageNum + 1); }
  function readerPrev() { renderReaderPage(readerState.pageNum - 1); }

  function closeBookReader() {
    $('#bookReaderOverlay').classList.remove('is-active');
    if (readerState.objectUrl) { URL.revokeObjectURL(readerState.objectUrl); readerState.objectUrl = null; }
    readerState.pdf = null; readerState.bookId = null;
    readerState.rangeStart = null; readerState.rangeEnd = null;
  }

  function markReaderRangeStart() {
    readerState.rangeStart = readerState.pageNum;
    readerState.rangeEnd = null;
    updateReaderSelectionBar();
  }
  function markReaderRangeEnd() {
    if (readerState.rangeStart == null) return;
    let a = readerState.rangeStart, b = readerState.pageNum;
    if (b < a) { const t = a; a = b; b = t; }
    readerState.rangeStart = a; readerState.rangeEnd = b;
    updateReaderSelectionBar();
  }
  function cancelReader