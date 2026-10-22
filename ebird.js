// Optional search using the user's own CORS-enabled Worker proxy.
// The eBird API key must remain in the Worker secret, never in this public app.
function addEbirdTaxon(taxon) {
  let bird = birds.find(item => item.ebirdCode === taxon.speciesCode || item.latin === taxon.sciName);
  if (!bird) {
    bird = {
      id: `ebird_${taxon.speciesCode}`,
      name: taxon.comName || taxon.sciName,
      english: taxon.comNameEn || "",
      latin: taxon.sciName || "",
      family: taxon.familyComName || taxon.familySciName || "未分類",
      status: "",
      taiwanList: false,
      emoji: "🐦",
      ebirdCode: taxon.speciesCode,
      category: taxon.category
    };
    birds.push(bird);
  }
  bird.catalogHidden = false;
  if (!lifeSpecies.includes(bird.id)) lifeSpecies.push(bird.id);
  save();
}

async function searchEbird() {
  const query = lifeSearch.value.trim();
  if (query.length < 2) {
    ebirdResults.innerHTML = '<div class="panel hint">請輸入至少 2 個字搜尋。</div>';
    return;
  }
  if (!ebirdProxyUrl) {
    ebirdResults.innerHTML = '<div class="panel">請先部署自己的 eBird Worker，並將網址填入「封面設定」。<br><span class="hint">Worker 程式與設定步驟在 ZIP 內；也可直接匯入官方名錄 Excel。</span></div>';
    return;
  }

  ebirdSearchBtn.disabled = true;
  ebirdSearchBtn.textContent = "搜尋中…";
  ebirdResults.innerHTML = '<div class="panel hint">正在查詢 eBird 全球分類清單…</div>';
  try {
    let cache;
    try { cache = JSON.parse(localStorage.getItem("birding-ebird-taxonomy-cache") || "null"); } catch {}
    let taxa;
    if (cache && Date.now() - cache.savedAt < 7 * 24 * 60 * 60 * 1000 && Array.isArray(cache.taxa)) {
      taxa = cache.taxa;
    } else {
      const url = `${ebirdProxyUrl.replace(/\/$/, "")}/taxonomy`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.status === 403 ? "Worker 拒絕此網站來源，請確認 Worker 的允許來源設定。" : `Worker 回應 ${response.status}`);
      }
      taxa = await response.json();
      if (!Array.isArray(taxa)) throw new Error("eBird 回傳格式不符。");
      try { localStorage.setItem("birding-ebird-taxonomy-cache", JSON.stringify({ savedAt: Date.now(), taxa })); } catch {}
    }

    const term = query.toLocaleLowerCase();
    const matches = taxa.filter(taxon => [taxon.comName, taxon.comNameEn, taxon.sciName, taxon.familyComName, taxon.speciesCode]
      .some(value => String(value || "").toLocaleLowerCase().includes(term))).slice(0, 40);
    if (!matches.length) {
      ebirdResults.innerHTML = '<div class="panel hint">eBird 分類清單中沒有相符鳥種。</div>';
      return;
    }

    ebirdResults.innerHTML = `<div class="panel"><b>eBird 搜尋結果</b><span class="hint"> · 顯示前 ${matches.length} 筆</span>${matches.map(taxon => {
      const alreadyAdded = lifeSpecies.some(id => birds.some(bird => bird.id === id &&
        (bird.ebirdCode === taxon.speciesCode || bird.latin === taxon.sciName)));
      return `<div class="rec"><div class="thumb">🐦</div><div style="flex:1;min-width:0"><h3>${esc(taxon.comName || taxon.sciName)}</h3><p>${esc(taxon.comNameEn || "")} · <i>${esc(taxon.sciName || "")}</i></p><p>${esc(taxon.familyComName || taxon.familySciName || "")}</p></div><button class="btn" data-ebird-code="${esc(taxon.speciesCode)}" ${alreadyAdded ? "disabled" : ""}>${alreadyAdded ? "已加入" : "加入"}</button></div>`;
    }).join("")}</div>`;

    ebirdResults.querySelectorAll("[data-ebird-code]").forEach(button => {
      button.onclick = () => {
        const taxon = matches.find(item => item.speciesCode === button.dataset.ebirdCode);
        if (!taxon) return;
        addEbirdTaxon(taxon);
        button.textContent = "已加入";
        button.disabled = true;
      };
    });
  } catch (error) {
    const message = error.name === "TypeError"
      ? "連線失敗。請確認 Worker 已部署、允許此 GitHub Pages 網域，且可連線。也可改用官方名錄 Excel 匯入。"
      : error.message;
    ebirdResults.innerHTML = `<div class="panel">無法搜尋 eBird：${esc(message)}<p class="hint">搜尋文字只在此裝置過濾下載到的分類清單；Worker 只向 eBird 取得公開分類資料。</p></div>`;
  } finally {
    ebirdSearchBtn.disabled = false;
    ebirdSearchBtn.textContent = "搜尋 eBird";
  }
}

saveEbirdProxy.onclick = () => {
  const candidate = ebirdProxyUrlInput.value.trim().replace(/\/$/, "");
  try {
    if (candidate) {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "https:" || parsed.pathname !== "/") throw new Error("請輸入 Worker 的 HTTPS 根網址，不含路徑。");
      localStorage.setItem("birding-ebird-proxy-url", candidate);
    } else localStorage.removeItem("birding-ebird-proxy-url");
    ebirdProxyUrl = candidate;
    ebirdProxyStatus.textContent = ebirdProxyUrl ? "代理網址已儲存於此瀏覽器。" : "代理網址已清除。";
  } catch {
    ebirdProxyStatus.textContent = "網址無效或無法儲存；請使用 HTTPS Worker 根網址。";
  }
};
ebirdSearchBtn.onclick = searchEbird;


