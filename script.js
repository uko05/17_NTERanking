import { incrementBakatareCount } from './bakatareCount.js';

const imageFolder = 'https://cdn.jsdelivr.net/gh/uko05/99_SharedImage@main/03_NTE/chara_icon/';
const dataPath = 'https://cdn.jsdelivr.net/gh/uko05/99_SharedImage@main/03_NTE/chara_data/nte_chars.json';

let imageData = [];
const SELECTED_LABEL = '☑';
const tabSelections = {}; // { zokusei: filename | null }

//------------------------------------------------------------------------------------------------

const i18n = {
  ja: {
    title:      "NTE推しキャラ連環",
    save:       "Save Image",
    bakatare:   "ばかたれモード",
    mobileHint: "※スマホの人は横画面推奨",
    hikari:  "光",
    sou:     "相",
    rei:     "霊",
    tamasii: "魂",
    ju:      "呪",
    yami:    "闇",
  },
  en: {
    title:      "NTE Oshi Character Renkan",
    save:       "Save Image",
    bakatare:   "Bakatare Mode",
    mobileHint: "* For mobile, landscape mode recommended",
    hikari:  "Hikari",
    sou:     "Sou",
    rei:     "Rei",
    tamasii: "Tamasii",
    ju:      "Ju",
    yami:    "Yami",
  }
};

// ===== i18n =====
function applyLang(lang) {
  const dict = i18n[lang] || i18n.ja;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] != null) el.textContent = dict[key];
  });
  localStorage.setItem('lang', lang);
}

function initLangSwitch() {
  const saved = localStorage.getItem('lang') || 'ja';
  const radio = document.querySelector(`input[name="lang"][value="${saved}"]`);
  if (radio) radio.checked = true;
  applyLang(saved);
  document.querySelectorAll('input[name="lang"]').forEach(r => {
    r.addEventListener('change', e => applyLang(e.target.value));
  });
}

// ===== 連環スロット操作 =====
function getSlot(zokusei) {
  return document.querySelector(`.renkan-slot[data-zokusei="${zokusei}"]`);
}

function setSlotImage(zokusei, filename) {
  const slot = getSlot(zokusei);
  if (!slot) return;
  if (filename) {
    slot.style.backgroundImage = `url('${imageFolder}${encodeURIComponent(filename)}')`;
    slot.classList.add('has-char');
  } else {
    slot.style.backgroundImage = '';
    slot.classList.remove('has-char');
  }
}

function clearAllSlots() {
  document.querySelectorAll('.renkan-slot').forEach(slot => {
    slot.style.backgroundImage = '';
    slot.classList.remove('has-char');
  });
}

function fillAllSlots(filename) {
  document.querySelectorAll('.renkan-slot').forEach(slot => {
    slot.style.backgroundImage = `url('${imageFolder}${encodeURIComponent(filename)}')`;
    slot.classList.add('has-char');
  });
}

// ===== キャラリスト選択マーク =====
function addCheckmark(container) {
  container.style.border = '2px solid blue';
  let label = container.querySelector('.selected-label');
  if (!label) {
    label = document.createElement('div');
    label.className = 'selected-label';
    container.appendChild(label);
  }
  label.textContent = SELECTED_LABEL;
}

function removeCheckmark(container) {
  container.style.border = 'none';
  const label = container.querySelector('.selected-label');
  if (label) label.remove();
}

// ===== 全クリア =====
function clearAllListSelections() {
  document.querySelectorAll('.image-item.selected').forEach(img => {
    img.classList.remove('selected');
    removeCheckmark(img.parentElement);
  });
}

function clearEverything() {
  clearAllSlots();
  clearAllListSelections();
  for (const key of Object.keys(tabSelections)) delete tabSelections[key];
}

// ===== キャラリスト更新 =====
function updateImageList(category, container) {
  container.innerHTML = '';
  const chars = imageData.filter(c => c.zokusei === category);
  chars.forEach(char => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('image-container');

    const img = document.createElement('img');
    img.src = `${imageFolder}${encodeURIComponent(char.filename)}`;
    img.dataset.src = char.filename;
    img.dataset.zokusei = char.zokusei;
    img.classList.add('image-item');
    img.addEventListener('click', () => handleImageClick(img, category));

    wrapper.appendChild(img);
    container.appendChild(wrapper);
  });
}

// ===== タブ切り替え時に選択状態を復元 =====
function restoreSelectionState(category) {
  const selected = tabSelections[category];
  if (!selected) return;
  const img = document.querySelector(`.image-item[data-src="${selected}"]`);
  if (img) addCheckmark(img.parentElement);
}

// ===== クリック処理 =====
function handleImageClick(img, category) {
  const src = img.dataset.src;
  const modeC = document.getElementById('modeC');

  // ばかたれモード：全スロットに同じキャラを表示
  if (modeC?.checked) {
    clearEverything();
    img.classList.add('selected');
    addCheckmark(img.parentElement);
    fillAllSlots(src);
    return;
  }

  const currentSelection = tabSelections[category];

  if (currentSelection === src) {
    // 同じキャラ再クリック → 選択解除
    img.classList.remove('selected');
    removeCheckmark(img.parentElement);
    tabSelections[category] = null;
    setSlotImage(category, null);
  } else {
    // 別のキャラ → 前の選択を外して新しく選択（自動置き換え）
    if (currentSelection) {
      const prevImg = document.querySelector(`.image-item[data-src="${currentSelection}"]`);
      if (prevImg) {
        prevImg.classList.remove('selected');
        removeCheckmark(prevImg.parentElement);
      }
    }
    img.classList.add('selected');
    addCheckmark(img.parentElement);
    tabSelections[category] = src;
    setSlotImage(category, src);
  }
}

// ===== 画像読み込み・タブ初期化 =====
function loadImages() {
  const tabs = document.querySelectorAll('.tab-label');
  const tabContents = document.querySelectorAll('.tab-content');
  const modeC = document.getElementById('modeC');

  if (modeC) {
    modeC.addEventListener('change', () => clearEverything());
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      if (tab.classList.contains('active')) return;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(content => {
        if (content.previousElementSibling === tab) {
          updateImageList(category, content.querySelector('.image-list'));
          restoreSelectionState(category);
        }
      });
    });
  });

  tabs[0].click();

  document.getElementById('save-button')?.addEventListener('click', saveImage);
}

// ===== 画像保存 =====
function saveImage() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    navigator.maxTouchPoints > 0;

  html2canvas(grid, { useCORS: true, scale: 2 })
    .then(canvas => new Promise(resolve => canvas.toBlob(resolve, 'image/png')))
    .then(async (blob) => {
      if (!blob) throw new Error('Blob 作成失敗');

      // ばかたれモード時のみ集計（1時間クールダウン）
      const modeC = document.getElementById('modeC');
      if (modeC?.checked) {
        const selectedImg = document.querySelector('.image-list .image-item.selected');
        if (selectedImg?.dataset?.src) {
          const COOLDOWN_MS = 60 * 60 * 1000;
          const key = 'bakatareLastSentNTE';
          const last = Number(localStorage.getItem(key) || 0);
          const nowMs = Date.now();
          if (nowMs - last >= COOLDOWN_MS) {
            try {
              await incrementBakatareCount(selectedImg.dataset.src);
              localStorage.setItem(key, String(nowMs));
            } catch (e) {
              console.warn('ばかたれ集計失敗（保存は続行）', e);
            }
          }
        }
      }

      // ファイル名
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `NTE推しキャラ連環_${ts}.png`;

      // モバイル：シェアAPI → フォールバック新規タブ
      if (isMobile) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'NTE推しキャラ連環', text: '写真アプリに保存してね' });
            return;
          }
        } catch (e) {
          console.warn('Share failed, fallback', e);
        }
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return;
      }

      // PC：即ダウンロード
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    })
    .catch(err => {
      console.error('画像保存エラー:', err);
      alert('画像の保存に失敗しました。もう一度お試しください。');
    });
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(dataPath);
    imageData = await res.json();
  } catch (e) {
    console.error('キャラデータ読み込み失敗:', e);
  }

  initLangSwitch();
  loadImages();

  const currentLang =
    document.querySelector('input[name="lang"]:checked')?.value ||
    localStorage.getItem('lang') ||
    'ja';
  applyLang(currentLang);
});
