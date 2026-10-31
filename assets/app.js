/* 双语金句素材库 · 交互逻辑
 * 依赖：data/phrases.js 暴露的 window.PHRASES
 * 无框架、无打包、无网络请求（file:// 直接打开也能用）。
 */
(function () {
  'use strict';

  var DATA = window.PHRASES;
  var root = document.documentElement;

  if (!DATA || !Array.isArray(DATA.items)) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="padding:24px;color:#a33a2c">数据文件 data/phrases.js 加载失败，请确认它与 index.html 的相对路径。</p>'
    );
    return;
  }

  var ITEMS = DATA.items;
  var BANDS = DATA.bands || [];
  var META = DATA.meta || {};

  var state = { q: '', band: 'all' };

  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    cards: $('#cards'),
    search: $('#search'),
    clear: $('#btn-clear'),
    chips: $('#band-chips'),
    hint: $('#result-hint'),
    count: $('#stat-count'),
    empty: $('#empty'),
    random: $('#btn-random'),
    theme: $('#btn-theme'),
    json: $('#btn-json'),
    csv: $('#btn-csv'),
    print: $('#btn-print'),
    repo: $('#repo-link')
  };

  /* ---------------- 工具函数 ---------------- */

  function bandOf(code) {
    for (var i = 0; i < BANDS.length; i++) {
      if (BANDS[i].code === code) return BANDS[i];
    }
    return { code: code, name: code, risk: '', form: '' };
  }

  function normalize(s) {
    return String(s || '').toLowerCase();
  }

  function matches(item) {
    if (state.band !== 'all' && item.band !== state.band) return false;
    if (!state.q) return true;
    var band = bandOf(item.band);
    var haystack = [
      item.id, item.en, item.zh, item.key, item.hook, item.form,
      band.name, band.note, band.form
    ].join(' ').toLowerCase();
    return state.q.split(/\s+/).every(function (term) {
      return !term || haystack.indexOf(term) !== -1;
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function toCSV(items) {
    var head = ['id', 'band', 'band_name', 'form', 'risk', 'en', 'zh', 'key', 'hook'];
    var rows = items.map(function (it) {
      var b = bandOf(it.band);
      return [it.id, it.band, b.name, it.form, b.risk, it.en, it.zh, it.key, it.hook].map(csvCell).join(',');
    });
    return '\uFEFF' + [head.join(',')].concat(rows).join('\r\n') + '\r\n';
  }

  function toJSON(items) {
    return JSON.stringify({
      meta: META,
      bands: BANDS,
      items: items
    }, null, 2);
  }

  /* ---------------- 渲染 ---------------- */

  function renderChips() {
    var counts = {};
    ITEMS.forEach(function (it) { counts[it.band] = (counts[it.band] || 0) + 1; });

    var html = '<button type="button" class="chip" data-band="all" aria-pressed="' +
      (state.band === 'all') + '">全部<span class="num">' + ITEMS.length + '</span></button>';

    BANDS.forEach(function (b) {
      html += '<button type="button" class="chip" data-band="' + esc(b.code) + '" aria-pressed="' +
        (state.band === b.code) + '" title="' + esc(b.note) + '">' +
        esc(b.name) + '<span class="num">' + (counts[b.code] || 0) + '</span></button>';
    });

    el.chips.innerHTML = html;
  }

  function cardHTML(it) {
    var b = bandOf(it.band);
    return '' +
      '<article class="card" data-id="' + esc(it.id) + '">' +
        '<div class="card-top">' +
          '<span class="badge">' + esc(it.id) + '</span>' +
          '<span class="band-name">' + esc(b.name) + ' · 形式 ' + esc(it.form || b.form || '-') + '</span>' +
          '<span class="risk" data-risk="' + esc(b.risk) + '">风险 ' + esc(b.risk || '-') + '</span>' +
        '</div>' +
        '<p class="en" lang="en">' + esc(it.en) + '</p>' +
        '<p class="zh" lang="zh-CN">' + esc(it.zh) + '</p>' +
        (it.key ? '<p class="key">' + esc(it.key) + '</p>' : '') +
        (it.hook ? '<p class="hook">' + esc(it.hook) + '</p>' : '') +
        '<div class="card-foot">' +
          '<button type="button" class="btn" data-copy="bilingual">复制双语</button>' +
          '<button type="button" class="btn" data-copy="en">复制英文</button>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var visible = ITEMS.filter(matches);
    el.cards.innerHTML = visible.map(cardHTML).join('');
    el.empty.hidden = visible.length > 0;
    el.count.textContent = ITEMS.length;
    el.hint.textContent = visible.length === ITEMS.length
      ? '共 ' + ITEMS.length + ' 条'
      : '筛出 ' + visible.length + ' / ' + ITEMS.length + ' 条';
    el.clear.hidden = !state.q;

    Array.prototype.forEach.call(el.chips.children, function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset.band === state.band));
    });
  }

  /* ---------------- 复制 ---------------- */

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); }
      catch (e) { reject(e); }
      finally { ta.remove(); }
    });
  }

  function flash(btn, label) {
    var original = btn.textContent;
    btn.textContent = label;
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1200);
  }

  /* ---------------- 事件 ---------------- */

  el.search.addEventListener('input', function () {
    state.q = normalize(this.value).trim();
    render();
  });

  el.clear.addEventListener('click', function () {
    state.q = '';
    el.search.value = '';
    el.search.focus();
    render();
  });

  el.chips.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    state.band = chip.dataset.band;
    render();
  });

  el.cards.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var id = btn.closest('.card').dataset.id;
    var item = ITEMS.filter(function (it) { return it.id === id; })[0];
    if (!item) return;
    var text = btn.dataset.copy === 'en' ? item.en : item.en + '\n' + item.zh;
    copyText(text).then(function () {
      flash(btn, '已复制');
    }).catch(function () {
      flash(btn, '复制失败');
    });
  });

  el.random.addEventListener('click', function () {
    state.q = '';
    el.search.value = '';
    if (state.band !== 'all' && Math.random() < 0.5) state.band = 'all';
    var pool = ITEMS.filter(function (it) {
      return state.band === 'all' || it.band === state.band;
    });
    var pick = pool[Math.floor(Math.random() * pool.length)];
    render();
    var card = el.cards.querySelector('[data-id="' + pick.id + '"]');
    if (card) {
      card.classList.add('is-new');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  el.json.addEventListener('click', function () {
    download('phrases.json', toJSON(ITEMS.filter(matches)), 'application/json');
  });

  el.csv.addEventListener('click', function () {
    download('phrases.csv', toCSV(ITEMS.filter(matches)), 'text/csv');
  });

  el.print.addEventListener('click', function () { window.print(); });

  /* 主题：默认跟随系统，手动切换后记忆 */
  var THEME_KEY = 'phrase-deck-theme';

  function applyTheme(mode) {
    if (mode === 'dark' || mode === 'light') {
      root.setAttribute('data-theme', mode);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* file:// 下可能被禁 */ }
  applyTheme(saved);

  el.theme.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 忽略 */ }
  });

  /* 快捷键：/ 聚焦搜索，Esc 清空 */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') {
        state.q = '';
        el.search.value = '';
        el.search.blur();
        render();
      }
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      el.search.focus();
    }
  });

  if (META.repo) el.repo.href = META.repo;

  renderChips();
  render();
})();
