const $ = (s) => document.querySelector(s);
const state = { dataset: [], favorites: readStore("aft_favorites", []), history: readStore("aft_history", []), current: [], mode: "search" };
const normalize = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeStore() { localStorage.setItem("aft_favorites", JSON.stringify(state.favorites)); localStorage.setItem("aft_history", JSON.stringify(state.history.slice(0, 100))); }
function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }
async function init() {
  try {
    const response = await fetch("./data/legal-data.json");
    const data = await response.json();
    state.dataset = data.entries || [];
    $("#datasetVersion").textContent = data.version || "Não informado";
    $("#datasetDate").textContent = data.reviewDate || "Não informada";
  } catch {
    $("#datasetVersion").textContent = "Não carregada";
    $("#datasetDate").textContent = "—";
  }
  $("#offlineState").textContent = navigator.onLine ? "Conectado (cache disponível após carregar)" : "Offline";
  renderEmpty("Pronto para pesquisar", "Digite uma conduta, artigo, código ou palavra-chave. A base local desta versão é demonstrativa.");
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}
function renderEmpty(title, description) {
  $("#resultsTitle").textContent = title;
  $("#resultCount").textContent = "0 resultados";
  $("#results").innerHTML = `<div class="empty-state"><span class="empty-icon">⌕</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
}
function search(query) {
  const q = normalize(query.trim());
  if (!q) { toast("Digite uma situação ou termo para pesquisar."); return; }
  const tokens = q.split(/\s+/).filter(Boolean);
  const matches = state.dataset.map(item => {
    const haystack = normalize([item.title, item.summary, item.article, item.code, item.nature, item.keywords, item.type].join(" "));
    const score = tokens.reduce((n, token) => n + (haystack.includes(token) ? 1 : 0), 0);
    return { item, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).map(x => x.item);
  state.current = matches;
  state.mode = "search";
  state.history = [{ query, at: new Date().toISOString() }, ...state.history.filter(h => normalize(h.query) !== q)].slice(0, 100);
  writeStore();
  $("#resultsTitle").textContent = `Resultados para “${query.trim()}”`;
  $("#resultCount").textContent = `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"}`;
  if (!matches.length) {
    $("#results").innerHTML = `<div class="empty-state"><span class="empty-icon">⌕</span><strong>Nenhum resultado local</strong><p>Isso não significa que não exista infração. Consulte as fontes oficiais ou conecte a IA na próxima etapa. Não conclua pela ausência de resultado.</p></div>`;
    return;
  }
  renderCards(matches);
}
function renderCards(items) {
  $("#results").innerHTML = items.map(item => {
    const saved = state.favorites.some(f => f.id === item.id);
    return `<article class="result-card">
      <div class="result-top"><h3>${escapeHtml(item.title)}</h3><span class="badge">${escapeHtml(item.status || "DEMONSTRATIVO")}</span></div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="meta-line">${escapeHtml(item.article || "Artigo: não informado")} · ${escapeHtml(item.code || "Código: não informado")}</div>
      <div class="card-actions"><button data-detail="${escapeHtml(item.id)}">Ver detalhes e fonte</button><button class="${saved ? "saved" : ""}" data-save="${escapeHtml(item.id)}">${saved ? "★ Salvo" : "☆ Salvar"}</button></div>
    </article>`;
  }).join("");
}
function showDetail(id) {
  const item = state.dataset.find(x => x.id === id);
  if (!item) return;
  $("#detailContent").innerHTML = `<h2>${escapeHtml(item.title)}</h2>
    <p>${escapeHtml(item.summary)}</p>
    <div class="detail-field"><strong>Situação da informação</strong><p>${escapeHtml(item.status || "Não informado")} — ${escapeHtml(item.disclaimer || "Confirme na fonte oficial.")}</p></div>
    <div class="detail-field"><strong>Dispositivo legal</strong><p>${escapeHtml(item.article || "Não informado")}</p></div>
    <div class="detail-field"><strong>Código de enquadramento</strong><p>${escapeHtml(item.code || "Não incluído nesta versão demonstrativa")}</p></div>
    <div class="detail-field"><strong>Natureza / penalidade / medida</strong><p>${escapeHtml(item.nature || "Não validada")} / ${escapeHtml(item.penalty || "Não validada")} / ${escapeHtml(item.measure || "Não validada")}</p></div>
    <div class="detail-field"><strong>Termos de busca</strong><p>${escapeHtml((item.keywords || []).join(", "))}</p></div>
    <div class="detail-field"><strong>Fonte</strong><p>${escapeHtml(item.sourceTitle || "Fonte oficial a confirmar")}</p><a href="${escapeHtml(item.sourceUrl || "https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm")}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a></div>
    <div class="detail-field"><strong>Vigência e atualização</strong><p>${escapeHtml(item.validity || "Vigência não verificada automaticamente.")}</p><p>Registro do pacote: ${escapeHtml(item.reviewDate || "não informado")}</p></div>`;
  $("#detailDialog").showModal();
}
function toggleFavorite(id) {
  const item = state.dataset.find(x => x.id === id);
  if (!item) return;
  if (state.favorites.some(f => f.id === id)) state.favorites = state.favorites.filter(f => f.id !== id);
  else state.favorites = [item, ...state.favorites];
  writeStore();
  if (state.mode === "favorites") showFavorites();
  else if (state.mode === "search") renderCards(state.current);
  toast(state.favorites.some(f => f.id === id) ? "Consulta salva neste aparelho." : "Consulta removida dos favoritos.");
}
function showFavorites() {
  state.mode = "favorites";
  $("#resultsTitle").textContent = "Favoritos";
  $("#resultCount").textContent = `${state.favorites.length} salvos`;
  state.current = state.favorites;
  if (!state.favorites.length) renderEmpty("Nenhum favorito salvo", "Use o botão Salvar em uma ficha para guardá-la neste aparelho.");
  else renderCards(state.favorites);
  $("#resultsSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function showHistory() {
  state.mode = "history";
  $("#resultsTitle").textContent = "Histórico recente";
  $("#resultCount").textContent = `${state.history.length} pesquisas`;
  if (!state.history.length) { renderEmpty("Histórico vazio", "As pesquisas realizadas neste aparelho aparecerão aqui."); return; }
  $("#results").innerHTML = state.history.map(h => `<article class="result-card"><h3>${escapeHtml(h.query)}</h3><p>${escapeHtml(new Date(h.at).toLocaleString("pt-BR"))}</p><div class="card-actions"><button data-repeat="${escapeHtml(h.query)}">Pesquisar novamente</button></div></article>`).join("");
}
$("#searchForm").addEventListener("submit", e => { e.preventDefault(); search($("#query").value); });
document.querySelectorAll("[data-query]").forEach(btn => btn.addEventListener("click", () => { $("#query").value = btn.dataset.query; search(btn.dataset.query); }));
$("#results").addEventListener("click", e => {
  const detail = e.target.closest("[data-detail]");
  const save = e.target.closest("[data-save]");
  const repeat = e.target.closest("[data-repeat]");
  if (detail) showDetail(detail.dataset.detail);
  if (save) toggleFavorite(save.dataset.save);
  if (repeat) { $("#query").value = repeat.dataset.repeat; search(repeat.dataset.repeat); window.scrollTo({top:0,behavior:"smooth"}); }
});
$("#closeDialog").addEventListener("click", () => $("#detailDialog").close());
$("#savedTab").addEventListener("click", showFavorites);
$("#historyTab").addEventListener("click", showHistory);
document.querySelectorAll("[data-nav]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n === btn));
  const nav = btn.dataset.nav;
  if (nav === "saved") showFavorites();
  else if (nav === "search") { $("#query").focus(); window.scrollTo({top:0,behavior:"smooth"}); }
  else if (nav === "sources") document.querySelector(".sources-panel").scrollIntoView({behavior:"smooth"});
  else window.scrollTo({top:0,behavior:"smooth"});
}));
$("#voiceBtn").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { $("#voiceStatus").textContent = "Reconhecimento de voz não disponível neste navegador. Você ainda pode digitar a pesquisa."; return; }
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR"; recognition.interimResults = false; recognition.maxAlternatives = 1;
  $("#voiceStatus").textContent = "Ouvindo… fale a situação com clareza.";
  recognition.onresult = event => { $("#query").value = event.results[0][0].transcript; $("#voiceStatus").textContent = "Transcrição recebida. Revise o texto antes de pesquisar."; };
  recognition.onerror = () => { $("#voiceStatus").textContent = "Não foi possível reconhecer a fala. Tente novamente ou digite o texto."; };
  recognition.onend = () => { if ($("#voiceStatus").textContent === "Ouvindo… fale a situação com clareza.") $("#voiceStatus").textContent = "Captura de voz encerrada."; };
  recognition.start();
});
$("#exportBtn").addEventListener("click", () => {
  const backup = { format: "assistente-fiscalizacao-backup-v1", exportedAt: new Date().toISOString(), favorites: state.favorites, history: state.history };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "backup-assistente-fiscalizacao.json"; a.click(); URL.revokeObjectURL(url);
  toast("Backup preparado.");
});
$("#importInput").addEventListener("change", async e => {
  const file = e.target.files?.[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.format !== "assistente-fiscalizacao-backup-v1" || !Array.isArray(data.favorites) || !Array.isArray(data.history)) throw new Error("Formato incompatível");
    state.favorites = data.favorites; state.history = data.history; writeStore(); toast("Backup importado.");
  } catch { toast("Arquivo inválido ou incompatível. Nenhum dado foi importado."); }
  e.target.value = "";
});
$("#clearBtn").addEventListener("click", () => {
  if (!confirm("Apagar favoritos e histórico salvos neste aparelho? Essa ação não pode ser desfeita.")) return;
  state.favorites = []; state.history = []; writeStore(); toast("Dados locais apagados."); renderEmpty("Dados apagados", "Você pode iniciar uma nova pesquisa.");
});
window.addEventListener("online", () => $("#offlineState").textContent = "Conectado");
window.addEventListener("offline", () => $("#offlineState").textContent = "Offline — usando recursos locais");
let installPrompt;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; $("#installBtn").hidden = false; });
$("#installBtn").addEventListener("click", async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; $("#installBtn").hidden = true; });
init();
