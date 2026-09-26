// ============================================================================
// RİYAZİ ANALİZ SEMİNARI — İNTERAKTİV SİMULYATOR MÜHƏRRİKİ
// Hissə 0: Remotion Üslubunda 5 Səhnəlik Animasiyalı Tarixi Slayd Pleyeri
// Hissə 1: (3, 5) Açıq İnterval və Sərhəd Təcrübəsi
// Hissə 2: 2D Koordinat Qrafikində (ε → Sol/Sağ Ətraf) Addım-Addım Proyeksiya
// ============================================================================

// ============================================================================
// HİSSƏ 0: REMOTION ÜSLUBUNDA ANİMASİYALI TARİXİ SLAYD PLEYERİ
// ============================================================================
const rPlayer = document.getElementById("remotion-player");
const rSlides = document.querySelectorAll(".r-slide");
const rTabs = document.querySelectorAll(".scene-tab");
const rPlayToggle = document.getElementById("r-play-toggle");
const rPrevBtn = document.getElementById("r-prev-btn");
const rNextBtn = document.getElementById("r-next-btn");
const rTimelineWrap = document.getElementById("r-timeline-wrap");
const rTimelineBar = document.getElementById("r-timeline-bar");
const rFrameCounter = document.getElementById("r-frame-counter");
const rFullscreenBtn = document.getElementById("r-fullscreen-btn");

const SEHNE_SAYI = 5;
const SEHNE_MUDDETI_MS = 8000; // Hər səhnə 8 saniyə
let cariSehne = 0;
let sehneKecidMs = 0;
let rOynayir = true;
let sonZaman = performance.now();

function sehneyeKec(indeks) {
  cariSehne = (indeks + SEHNE_SAYI) % SEHNE_SAYI;
  sehneKecidMs = 0;

  rSlides.forEach((sl, i) => {
    sl.classList.toggle("active", i === cariSehne);
  });
  rTabs.forEach((tb, i) => {
    tb.classList.toggle("active", i === cariSehne);
  });
  timelineYenile();
}

function timelineYenile() {
  const umumiMuddet = SEHNE_SAYI * SEHNE_MUDDETI_MS;
  const cariUmumiMs = cariSehne * SEHNE_MUDDETI_MS + sehneKecidMs;
  const faiz = Math.min(100, (cariUmumiMs / umumiMuddet) * 100);
  rTimelineBar.style.width = `${faiz.toFixed(1)}%`;

  const saniye = Math.floor(cariUmumiMs / 1000);
  const deqStr = String(Math.floor(saniye / 60)).padStart(2, "0");
  const sanStr = String(saniye % 60).padStart(2, "0");
  rFrameCounter.textContent = `Səhnə ${cariSehne + 1} / ${SEHNE_SAYI} · ${deqStr}:${sanStr}`;
}

function remotionLoop(indi) {
  const dt = indi - sonZaman;
  sonZaman = indi;

  if (rOynayir) {
    sehneKecidMs += dt;
    if (sehneKecidMs >= SEHNE_MUDDETI_MS) {
      sehneyeKec(cariSehne + 1);
    } else {
      timelineYenile();
    }
  }
  requestAnimationFrame(remotionLoop);
}
requestAnimationFrame(remotionLoop);

rTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const idx = parseInt(tab.getAttribute("data-scene"), 10);
    sehneyeKec(idx);
  });
});

rPlayToggle.addEventListener("click", () => {
  rOynayir = !rOynayir;
  rPlayToggle.textContent = rOynayir ? "⏸ Avto-Slaydı Dayandır" : "▶ Avto-Slaydı Başlat";
});

rPrevBtn.addEventListener("click", () => {
  sehneyeKec(cariSehne - 1);
});

rNextBtn.addEventListener("click", () => {
  sehneyeKec(cariSehne + 1);
});

rTimelineWrap.addEventListener("click", (e) => {
  const rect = rTimelineWrap.getBoundingClientRect();
  const nisbet = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
  const hedefSehne = Math.floor(nisbet * SEHNE_SAYI);
  sehneyeKec(hedefSehne);
});

rFullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    rPlayer.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// ============================================================================
// HİSSƏ 1: (3, 5) AÇIQ İNTERVAL VƏ SƏRHƏD SİMULYATORU
// ============================================================================
const intCanvas = document.getElementById("interval-canvas");
const intCtx = intCanvas.getContext("2d");
const intEpsSlider = document.getElementById("int-eps-slider");
const intEpsVal = document.getElementById("int-eps-val");
const intStatusBox = document.getElementById("int-status-box");

let secilmisNoqte = 4.70;

document.querySelectorAll("#interval-presets .pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#interval-presets .pill-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    secilmisNoqte = parseFloat(btn.getAttribute("data-pt"));
    intervalSimulyatoruCek();
  });
});

intEpsSlider.addEventListener("input", intervalSimulyatoruCek);

let intSurusdur = false;
intCanvas.addEventListener("mousedown", (e) => {
  intSurusdur = true;
  intervalMouseYenile(e.clientX);
});
window.addEventListener("mousemove", (e) => {
  if (intSurusdur) intervalMouseYenile(e.clientX);
});
window.addEventListener("mouseup", () => {
  intSurusdur = false;
});

intCanvas.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 0) {
      intSurusdur = true;
      intervalMouseYenile(e.touches[0].clientX);
    }
  },
  { passive: true }
);
intCanvas.addEventListener(
  "touchmove",
  (e) => {
    if (intSurusdur && e.touches.length > 0) {
      intervalMouseYenile(e.touches[0].clientX);
    }
  },
  { passive: true }
);
window.addEventListener("touchend", () => {
  intSurusdur = false;
});

function intervalMouseYenile(clientX) {
  const rect = intCanvas.getBoundingClientRect();
  const px = (clientX - rect.left) * (intCanvas.width / rect.width);
  const kicikEkran = window.innerWidth < 600;
  const solPad = kicikEkran ? 36 : 70;
  const sagPad = kicikEkran ? 36 : 70;
  const minVal = 2.5;
  const maxVal = 5.6;
  let val = minVal + ((px - solPad) / (intCanvas.width - solPad - sagPad)) * (maxVal - minVal);
  val = Math.max(3.0, Math.min(5.0, val));
  secilmisNoqte = Math.round(val * 100) / 100;

  document.querySelectorAll("#interval-presets .pill-btn").forEach((b) => {
    const pt = parseFloat(b.getAttribute("data-pt"));
    b.classList.toggle("active", Math.abs(pt - secilmisNoqte) < 0.015);
  });
  intervalSimulyatoruCek();
}

function intervalSimulyatoruCek() {
  const kicikEkran = window.innerWidth < 600;
  const hedefW = kicikEkran ? 620 : 980;
  const hedefH = kicikEkran ? 220 : 210;
  if (intCanvas.width !== hedefW || intCanvas.height !== hedefH) {
    intCanvas.width = hedefW;
    intCanvas.height = hedefH;
  }

  const W = intCanvas.width;
  const H = intCanvas.height;
  intCtx.clearRect(0, 0, W, H);

  const eps = parseFloat(intEpsSlider.value);
  intEpsVal.textContent = `ε = ${eps.toFixed(2)}`;

  const solPad = kicikEkran ? 36 : 70;
  const sagPad = kicikEkran ? 36 : 70;
  const oxY = 118;
  const minVal = 2.5;
  const maxVal = 5.6;

  function xPiksel(v) {
    return solPad + ((v - minVal) / (maxVal - minVal)) * (W - solPad - sagPad);
  }

  const px3 = xPiksel(3);
  const px5 = xPiksel(5);
  const px0 = xPiksel(secilmisNoqte);
  const solQanad = secilmisNoqte - eps;
  const sagQanad = secilmisNoqte + eps;
  const pxSol = xPiksel(solQanad);
  const pxSag = xPiksel(sagQanad);

  // 1) (3, 5) Daxili İnterval Zonası
  intCtx.fillStyle = "#eef6f0";
  intCtx.fillRect(px3, 32, px5 - px3, 140);

  // 5-dən sağdakı "Çöl bölgə"
  intCtx.fillStyle = "#faf1f0";
  intCtx.fillRect(px5, 32, W - sagPad - px5, 140);

  intCtx.font = kicikEkran ? "600 10.5px 'IBM Plex Mono', monospace" : "600 11.5px 'IBM Plex Mono', monospace";
  intCtx.fillStyle = "#156836";
  intCtx.textAlign = "center";
  intCtx.fillText(kicikEkran ? "DAXİLİ İNTERVAL: (3, 5)" : "İCAZƏ VERİLƏN DAXİLİ İNTERVAL: (3, 5)", (px3 + px5) / 2, 50);

  intCtx.fillStyle = "#a82020";
  intCtx.fillText(kicikEkran ? "KƏNAR (>5)" : "İNTERVALDAN KƏNAR (> 5)", (px5 + W - sagPad) / 2, 50);

  intCtx.save();
  intCtx.setLineDash([4, 4]);
  intCtx.strokeStyle = "#948e80";
  intCtx.lineWidth = 1.2;
  [px3, px5].forEach((px) => {
    intCtx.beginPath();
    intCtx.moveTo(px, 32);
    intCtx.lineTo(px, 172);
    intCtx.stroke();
  });
  intCtx.restore();

  // 2) Əsas ədəd oxu xətti
  intCtx.strokeStyle = "#4a4842";
  intCtx.lineWidth = 2;
  intCtx.beginPath();
  intCtx.moveTo(solPad - 15, oxY);
  intCtx.lineTo(W - sagPad + 15, oxY);
  intCtx.stroke();

  intCtx.strokeStyle = "#156836";
  intCtx.lineWidth = 4;
  intCtx.beginPath();
  intCtx.moveTo(px3, oxY);
  intCtx.lineTo(px5, oxY);
  intCtx.stroke();

  intCtx.font = "500 12px 'IBM Plex Mono', monospace";
  intCtx.fillStyle = "#4a4842";
  intCtx.textAlign = "center";
  for (let v = 3.0; v <= 5.5; v += 0.5) {
    const px = xPiksel(v);
    intCtx.beginPath();
    intCtx.moveTo(px, oxY - 5);
    intCtx.lineTo(px, oxY + 5);
    intCtx.strokeStyle = "#4a4842";
    intCtx.lineWidth = 1.5;
    intCtx.stroke();
    intCtx.fillText(v.toFixed(1), px, oxY + 24);
  }

  // 3) (x0 - ε, x0 + ε) Ətraf Qutusu
  const qutuY = oxY - 34;
  const qutuH = 24;

  const icSol = Math.max(px3, pxSol);
  const icSag = Math.min(px5, pxSag);
  if (icSag > icSol) {
    intCtx.fillStyle = "rgba(21, 104, 54, 0.20)";
    intCtx.strokeStyle = "#156836";
    intCtx.lineWidth = 1.8;
    intCtx.fillRect(icSol, qutuY, icSag - icSol, qutuH);
    intCtx.strokeRect(icSol, qutuY, icSag - icSol, qutuH);
  }

  const colSag = pxSag > px5;
  const colSol = pxSol < px3;
  if (colSag) {
    const dasmaBas = Math.max(px5, pxSol);
    intCtx.fillStyle = "rgba(168, 32, 32, 0.25)";
    intCtx.strokeStyle = "#a82020";
    intCtx.lineWidth = 2;
    intCtx.fillRect(dasmaBas, qutuY, pxSag - dasmaBas, qutuH);
    intCtx.strokeRect(dasmaBas, qutuY, pxSag - dasmaBas, qutuH);

    intCtx.fillStyle = "#a82020";
    intCtx.font = "600 11.5px 'IBM Plex Sans', sans-serif";
    intCtx.textAlign = "left";
    intCtx.fillText("← Çölə daşan hissə!", px5 + 6, qutuY - 6);
  }

  intCtx.font = "600 11.5px 'IBM Plex Mono', monospace";
  intCtx.fillStyle = "#181816";
  intCtx.textAlign = "center";
  intCtx.fillText(
    `(${solQanad.toFixed(2)}, ${sagQanad.toFixed(2)})`,
    px0,
    qutuY + 16
  );

  dairəCek(intCtx, px3, oxY, 6, "#ffffff", "#156836", 2.5);
  dairəCek(intCtx, px5, oxY, 6, "#ffffff", "#a82020", 2.5);

  dairəCek(intCtx, px0, oxY, 6.5, "#181816", "#ffffff", 2);
  intCtx.fillStyle = "#181816";
  intCtx.font = "700 12.5px 'IBM Plex Mono', monospace";
  intCtx.fillText(`x₀ = ${secilmisNoqte.toFixed(2)}`, px0, oxY + 44);

  const tamIceridedir = !colSag && !colSol && secilmisNoqte > 3 && secilmisNoqte < 5;
  if (Math.abs(secilmisNoqte - 5.0) < 0.005) {
    intStatusBox.className = "figure-status-bar status-error";
    intStatusBox.innerHTML = `<strong>SƏRHƏD NÖQTƏSİ (x₀ = 5.00):</strong> Slayderlə <strong>ε = ${eps.toFixed(2)}</strong> ətrafını nə qədər sıxırsan sıx, sağ qanad <strong>(5.00, ${(5 + eps).toFixed(2)})</strong> həmişə 5-dən sağa — intervaldan çölə daşır! Məhz buna görə <strong>5 nöqtəsi (3, 5) açıq intervalına daxil deyil</strong>.`;
  } else if (tamIceridedir) {
    intStatusBox.className = "figure-status-bar";
    intStatusBox.innerHTML = `<strong>DAXİLİ NÖQTƏ TƏSDİQLƏNDİ (x₀ = ${secilmisNoqte.toFixed(2)}):</strong> Seçilən <strong>ε = ${eps.toFixed(2)}</strong> üçün <strong>(${solQanad.toFixed(2)}, ${sagQanad.toFixed(2)})</strong> ətrafı tamamilə <strong>(3, 5)</strong> intervalının içində yerləşir!`;
  } else {
    const lazimEps = (5 - secilmisNoqte).toFixed(2);
    intStatusBox.className = "figure-status-bar status-error";
    intStatusBox.innerHTML = `<strong>ƏTRAF HƏLƏ GENİŞDİR (x₀ = ${secilmisNoqte.toFixed(2)}, ε = ${eps.toFixed(2)}):</strong> Hazırda sağ qanad (${sagQanad.toFixed(2)}) 5 sərhədini keçir. Lakin <strong>x₀ = ${secilmisNoqte.toFixed(2)}</strong> daxili nöqtə olduğu üçün slayderi sola çəkib <strong>ε &lt; ${lazimEps}</strong> etsən, ətraf tamamilə içəriyə sığacaq! (Slayderi sola çəkib yoxla).`;
  }
}

function dairəCek(c, x, y, r, ic, kenar, qalinliq) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = ic;
  c.fill();
  c.lineWidth = qalinliq;
  c.strokeStyle = kenar;
  c.stroke();
}

// ============================================================================
// HİSSƏ 2: 2D LİMİT QRAFİKİ VƏ 1D ƏDƏD OXU SİMULYATORU (SOL VƏ SAĞ ƏTRAF)
// ============================================================================
const funksiyaInput = document.getElementById("funksiya-input");
const x0Input = document.getElementById("x0-input");
const lGosterici = document.getElementById("l-gosterici");
const slider = document.getElementById("slider");
const epsReqem = document.getElementById("eps-reqem");

const yAraliqMetn = document.getElementById("y-araliq-metn");
const xAraliqMetn = document.getElementById("x-araliq-metn");
const deltaSolReqem = document.getElementById("delta-sol-reqem");
const deltaSagReqem = document.getElementById("delta-sag-reqem");
const deltaMinReqem = document.getElementById("delta-min-reqem");
const simmetriyaIzah = document.getElementById("simmetriya-izah");
const stepBanner = document.getElementById("step-banner");

const oxSolQutu = document.getElementById("ox-sol-qutu");
const oxSagQutu = document.getElementById("ox-sag-qutu");
const oxSolYazi = document.getElementById("ox-sol-yazi");
const oxSagYazi = document.getElementById("ox-sag-yazi");
const oxX0Yazi = document.getElementById("ox-x0-yazi");

const canvas = document.getElementById("limit-canvas");
const ctx = canvas.getContext("2d");
const mouseMelumat = document.getElementById("mouse-melumat");

let cariAddim = 3;
let animasiyaId = null;
let mouseX = null;

document.querySelectorAll("#graph-step-bar .step-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#graph-step-bar .step-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    cariAddim = parseInt(tab.getAttribute("data-step"), 10);

    if (cariAddim === 1) {
      stepBanner.innerHTML = `<strong>Addım 1 — Y Oxundakı ε Dəhlizi:</strong> Əvvəlcə şaquli <strong>Y oxunda</strong> hədəf <strong>L</strong> nöqtəsinin alt və üst tərəfində icazə verilən <strong>L − ε</strong> və <strong>L + ε</strong> sərhədlərini qeyd edirik.`;
    } else if (cariAddim === 2) {
      stepBanner.innerHTML = `<strong>Addım 2 — Əyri ilə Kəsişmə:</strong> Y oxundakı <strong>L ± ε</strong> sərhədlərindən üfüqi şüalar sağa doğru uzanaraq <strong>f(x) əyrisini</strong> kəsir. Əyrinin yaşıl rəngli hissəsi həmin dəqiqlik şərtini ödəyən nöqtələrdir.`;
    } else {
      stepBanner.innerHTML = `<strong>Addım 3 — X Oxundakı Sol və Sağ Ətraf:</strong> Yaşıl əyrinin uc nöqtələrindən düz aşağı — <strong>X oxuna</strong> şaquli xətlər endiririk. Beləliklə, X oxunda <strong>x₀</strong>-ın <strong>Sol ətrafı</strong> və <strong>Sağ ətrafı</strong> yaranır!`;
    }
    yenileSimulyator();
  });
});

function funksiyaniHesabla(ifade, xDeyeri) {
  try {
    let temiz = ifade
      .trim()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/x²/gi, "(x*x)")
      .replace(/x³/gi, "(x*x*x)")
      .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
      .replace(/√x/gi, "Math.sqrt(x)")
      .replace(/sqrt\(/gi, "Math.sqrt(")
      .replace(/sin\(/gi, "Math.sin(")
      .replace(/cos\(/gi, "Math.cos(")
      .replace(/\^/g, "**");

    temiz = temiz.replace(/(\d)(x)/gi, "$1*$2");
    temiz = temiz.replace(/(\d)\(/g, "$1*(");
    temiz = temiz.replace(/\)(x|\d)/gi, ")*$1");

    const fn = new Function("x", `return ${temiz};`);
    const netice = fn(xDeyeri);
    return Number.isFinite(netice) ? netice : NaN;
  } catch (err) {
    return NaN;
  }
}

const sliderMinLabel = document.getElementById("slider-min-label");
const sliderMaxLabel = document.getElementById("slider-max-label");
const btnZoomToggle = document.getElementById("btn-zoom-toggle");

let mikroskopRejimi = false;

if (btnZoomToggle) {
  btnZoomToggle.addEventListener("click", () => {
    mikroskopRejimi = !mikroskopRejimi;
    btnZoomToggle.classList.toggle("active", mikroskopRejimi);
    btnZoomToggle.textContent = mikroskopRejimi
      ? "↺ Tam Qrafikə Qayıt (0-dan)"
      : "🔍 Nöqtəyə Yaxınlaş (Mikroskop)";
    yenileSimulyator();
  });
}

function tersXTap(ifade, x0, hedefY, axtarisYonu) {
  const f0 = funksiyaniHesabla(ifade, x0);
  if (!Number.isFinite(f0)) return x0;

  const fSag = funksiyaniHesabla(ifade, x0 + 0.001);
  const artandir = fSag >= f0;

  let sol = axtarisYonu === "sol" ? 0.0001 : x0;
  let sag = axtarisYonu === "sol" ? x0 : Math.max(x0 * 3, x0 + 5);

  for (let i = 0; i < 55; i++) {
    let orta = (sol + sag) / 2;
    let fOrta = funksiyaniHesabla(ifade, orta);
    if (!Number.isFinite(fOrta)) break;

    if (artandir) {
      if (fOrta < hedefY) sol = orta;
      else sag = orta;
    } else {
      if (fOrta > hedefY) sol = orta;
      else sag = orta;
    }
  }
  return (sol + sag) / 2;
}

// Funksiya və ya x0 dəyişdikdə ε slayderinin şkalasını L-ə uyğun özütənzimləyir
function epsSkalasiniYenile() {
  const ifade = funksiyaInput.value || "2*x";
  const x0 = parseFloat(x0Input.value) || 2;
  const L = funksiyaniHesabla(ifade, x0);
  if (!Number.isFinite(L)) return;

  const epsMax = Math.max(1.50, +(Math.abs(L) * 0.35).toFixed(2));
  const epsDefault = +(epsMax * 0.533).toFixed(2);

  slider.min = "0.05";
  slider.max = epsMax.toFixed(2);
  slider.step = epsMax > 10 ? "0.05" : "0.01";
  slider.value = epsDefault.toFixed(2);

  if (sliderMinLabel) sliderMinLabel.textContent = "← Sıxılmış (0.05)";
  if (sliderMaxLabel) sliderMaxLabel.textContent = `Geniş (${epsMax.toFixed(2)}) →`;
}

document.querySelectorAll(".fn-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".fn-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    funksiyaInput.value = btn.getAttribute("data-fn");
    x0Input.value = btn.getAttribute("data-x0");
    epsSkalasiniYenile();
    yenileSimulyator();
  });
});

document.querySelectorAll(".key-btn[data-insert]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const elave = btn.getAttribute("data-insert");
    const bas = funksiyaInput.selectionStart || funksiyaInput.value.length;
    const son = funksiyaInput.selectionEnd || funksiyaInput.value.length;
    const evvel = funksiyaInput.value.substring(0, bas);
    const sonra = funksiyaInput.value.substring(son);

    funksiyaInput.value = evvel + elave + sonra;
    funksiyaInput.focus();
    const yeniKursor = bas + elave.length;
    funksiyaInput.setSelectionRange(yeniKursor, yeniKursor);

    document.querySelectorAll(".fn-btn").forEach((b) => b.classList.remove("active"));
    epsSkalasiniYenile();
    yenileSimulyator();
  });
});

document.getElementById("btn-temizle").addEventListener("click", () => {
  funksiyaInput.value = "";
  funksiyaInput.focus();
});

funksiyaInput.addEventListener("input", () => {
  document.querySelectorAll(".fn-btn").forEach((b) => b.classList.remove("active"));
  epsSkalasiniYenile();
  yenileSimulyator();
});

x0Input.addEventListener("input", () => {
  epsSkalasiniYenile();
  yenileSimulyator();
});
slider.addEventListener("input", yenileSimulyator);

document.getElementById("btn-avto-six").addEventListener("click", () => {
  if (animasiyaId) {
    cancelAnimationFrame(animasiyaId);
    animasiyaId = null;
    document.getElementById("btn-avto-six").textContent = "▶ Sıxılmanı Canlandır (ε → 0)";
    return;
  }

  const maxEps = parseFloat(slider.max) || 1.50;
  const addimPayi = Math.max(0.005, (maxEps - 0.05) / 190);
  slider.value = (maxEps * 0.93).toFixed(2);
  document.getElementById("btn-avto-six").textContent = "⏸ Dayandır";

  function addimAnimasiya() {
    let cari = parseFloat(slider.value);
    if (cari > 0.06) {
      slider.value = Math.max(0.05, cari - addimPayi).toFixed(3);
      yenileSimulyator();
      animasiyaId = requestAnimationFrame(addimAnimasiya);
    } else {
      animasiyaId = null;
      document.getElementById("btn-avto-six").textContent = "▶ Sıxılmanı Canlandır (ε → 0)";
    }
  }
  animasiyaId = requestAnimationFrame(addimAnimasiya);
});

document.getElementById("btn-sifirla").addEventListener("click", () => {
  if (animasiyaId) {
    cancelAnimationFrame(animasiyaId);
    animasiyaId = null;
    document.getElementById("btn-avto-six").textContent = "▶ Sıxılmanı Canlandır (ε → 0)";
  }
  mikroskopRejimi = false;
  if (btnZoomToggle) {
    btnZoomToggle.classList.remove("active");
    btnZoomToggle.textContent = "🔍 Nöqtəyə Yaxınlaş (Mikroskop)";
  }
  epsSkalasiniYenile();
  yenileSimulyator();
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  yenileSimulyator();
});

canvas.addEventListener("mouseleave", () => {
  mouseX = null;
  mouseMelumat.textContent = "Siçanı (və ya barmağını) qrafikin üzərində gəzdirərək istənilən x nöqtəsini yoxla";
  mouseMelumat.style.color = "#181816";
  yenileSimulyator();
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      yenileSimulyator();
    }
  },
  { passive: true }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      yenileSimulyator();
    }
  },
  { passive: true }
);

// Ədədin kiçikliyinə görə avtomatik vergüldən sonrakı rəqəm sayını seçən funksiya
function deqiqFormat(eded, adiReqem = 2) {
  if (!Number.isFinite(eded)) return "—";
  const m = Math.abs(eded);
  if (m > 0 && m < 0.0005) return eded.toFixed(5);
  if (m > 0 && m < 0.005) return eded.toFixed(4);
  if (m > 0 && m < 0.05) return eded.toFixed(3);
  return eded.toFixed(adiReqem);
}

// Oxlar üçün həmişə 5-7 arası təmiz şkala addımı seçən funksiya (rəqəmlər üst-üstə minməsin!)
function optimalAddimTap(araliq) {
  const hedef = Math.max(1e-6, araliq / 6);
  const quvvet = Math.pow(10, Math.floor(Math.log10(hedef)));
  const norm = hedef / quvvet;
  let v = 1;
  if (norm > 5) v = 10;
  else if (norm > 2.5) v = 5;
  else if (norm > 1.5) v = 2;
  return v * quvvet;
}

function yenileSimulyator() {
  const ifade = funksiyaInput.value || "2*x";
  const x0 = parseFloat(x0Input.value) || 2;
  const eps = parseFloat(slider.value) || 0.8;
  const epsMax = parseFloat(slider.max) || 1.5;

  const L = funksiyaniHesabla(ifade, x0);
  if (!Number.isFinite(L)) {
    lGosterici.textContent = "Xəta";
    return;
  }

  lGosterici.textContent = `L = ${L.toFixed(2)}`;
  epsReqem.textContent = `ε = ${eps.toFixed(2)}`;

  const yAsagi = L - eps;
  const yYuxari = L + eps;

  const fSagYoxla = funksiyaniHesabla(ifade, x0 + 0.001);
  const artandir = fSagYoxla >= L;

  const xSol = tersXTap(ifade, x0, artandir ? yAsagi : yYuxari, "sol");
  const xSag = tersXTap(ifade, x0, artandir ? yYuxari : yAsagi, "sag");

  const solEtraf = Math.max(0, x0 - xSol);
  const sagEtraf = Math.max(0, xSag - x0);
  const minEtraf = Math.min(solEtraf, sagEtraf);

  // Funksiyanın düz xətt və ya əyri olduğunu 2-ci tərtib fərqlə dəqiq yoxlayaq
  const fSolTest = funksiyaniHesabla(ifade, x0 - 0.1);
  const fSagTest = funksiyaniHesabla(ifade, x0 + 0.1);
  const eyrilik = Math.abs(fSagTest - 2 * L + fSolTest);

  const kicikdir = minEtraf < 0.05;
  const kDeq = kicikdir ? 3 : 2;
  let eDeq = minEtraf < 0.01 ? 4 : 3;

  // Əyri funksiyada Sol və Sağ ətraf fərqli olduğu halda yuvarlaqlaşmada eyni görünməsin deyə dəqiqliyi artırırıq
  if (eyrilik >= 1e-5 && Math.abs(solEtraf - sagEtraf) > 1e-9) {
    while (eDeq < 6 && solEtraf.toFixed(eDeq) === sagEtraf.toFixed(eDeq)) {
      eDeq++;
    }
  }

  yAraliqMetn.textContent = `(${yAsagi.toFixed(2)}, ${yYuxari.toFixed(2)})`;
  xAraliqMetn.textContent = `(${xSol.toFixed(kDeq)}, ${xSag.toFixed(kDeq)})`;
  deltaSolReqem.textContent = solEtraf.toFixed(eDeq);
  deltaSagReqem.textContent = sagEtraf.toFixed(eDeq);
  deltaMinReqem.textContent = minEtraf.toFixed(eDeq);

  if (eyrilik < 1e-5) {
    simmetriyaIzah.textContent = `Düz xətt: Sol ətraf = Sağ ətraf = ${solEtraf.toFixed(eDeq)}`;
  } else {
    simmetriyaIzah.textContent = `Əyri funksiya: Sol ətraf (${solEtraf.toFixed(eDeq)}) ≠ Sağ ətraf (${sagEtraf.toFixed(eDeq)})`;
  }

  // 1D Ədəd oxu qutularının CSS enini konteyner ölçüsünə və maksimum ε ətrafına görə özütənzimləyirik!
  const refXSol = tersXTap(ifade, x0, artandir ? L - epsMax : L + epsMax, "sol");
  const refXSag = tersXTap(ifade, x0, artandir ? L + epsMax : L - epsMax, "sag");
  const refMaxEtraf = Math.max(1e-5, Math.max(x0 - refXSol, refXSag - x0));

  const xettEl = oxSolQutu.parentElement;
  const xettEn = xettEl && xettEl.clientWidth > 0 ? xettEl.clientWidth : 560;
  const yariMaxEn = Math.min(265, Math.max(68, Math.floor((xettEn - 36) / 2)));
  const yariBazaEn = Math.min(210, Math.floor(yariMaxEn * 0.85));
  const minQutuEn = xettEn < 360 ? 36 : 42;

  const solEn = Math.max(minQutuEn, Math.min(yariMaxEn, (solEtraf / refMaxEtraf) * yariBazaEn));
  const sagEn = Math.max(minQutuEn, Math.min(yariMaxEn, (sagEtraf / refMaxEtraf) * yariBazaEn));

  oxSolQutu.style.width = `${solEn}px`;
  oxSagQutu.style.width = `${sagEn}px`;
  oxSolYazi.textContent = solEn > 115 ? `Sol: ${solEtraf.toFixed(eDeq)}` : `${solEtraf.toFixed(eDeq)}`;
  oxSagYazi.textContent = sagEn > 115 ? `Sağ: ${sagEtraf.toFixed(eDeq)}` : `${sagEtraf.toFixed(eDeq)}`;
  oxX0Yazi.textContent = `x₀ = ${x0}`;

  qrafikiCek(ifade, x0, L, eps, epsMax, xSol, xSag, yAsagi, yYuxari, refXSol, refXSag);
}

// ============================================================================
// 2D KOORDİNAT QRAFİKİ (TAM (0,0) ƏYRİSİ VƏ TOQQUŞMAYAN ETİKETLƏR İLƏ)
// ============================================================================
function qrafikiCek(ifade, x0, L, eps, epsMax, xSol, xSag, yAsagi, yYuxari, refXSol, refXSag) {
  const kicikEkran = window.innerWidth < 600;
  const hedefW = kicikEkran ? 580 : 760;
  const hedefH = kicikEkran ? 420 : 440;
  if (canvas.width !== hedefW || canvas.height !== hedefH) {
    canvas.width = hedefW;
    canvas.height = hedefH;
  }

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const solBosluq = kicikEkran ? 80 : 92;
  const sagBosluq = kicikEkran ? 24 : 40;
  const ustBosluq = 38;
  const altBosluq = 64;

  const cizimW = W - solBosluq - sagBosluq;
  const cizimH = H - ustBosluq - altBosluq;

  // ƏSAS QRAFİK HƏMİŞƏ (0, 0)-DAN BAŞLAYIR Kİ, FUNKSİYANIN ƏSL ƏYRİ FORMASI TAM GÖRÜNSÜN!
  let minX = 0;
  let maxX = Math.max(3.4, x0 * 1.48);
  let minY = L >= 0 ? 0 : L * 1.4;
  let maxY = Math.max(6.0, (L + epsMax) * 1.18);

  // Yalnız istifadəçi "Mikroskop" düyməsini sıxdıqda nöqtənin ətrafına yaxınlaşırıq:
  if (mikroskopRejimi) {
    const xYarim = Math.max((xSag - xSol) * 2.2, 0.04);
    minX = Math.max(0, x0 - xYarim);
    maxX = x0 + xYarim;

    const yYarim = Math.max(eps * 2.4, 0.25);
    minY = L >= 0 ? Math.max(0, L - yYarim) : L - yYarim;
    maxY = L + yYarim;
  }

  function ekranX(x) {
    return solBosluq + ((x - minX) / (maxX - minX)) * cizimW;
  }
  function ekranY(y) {
    return H - altBosluq - ((y - minY) / (maxY - minY)) * cizimH;
  }
  function riyaziX(px) {
    return minX + ((px - solBosluq) / cizimW) * (maxX - minX);
  }

  const sifirX = solBosluq;
  const sifirY = H - altBosluq;

  // 1) İncə koordinat toru (Həmişə 5-7 təmiz bölgü, heç vaxt üst-üstə minmir!)
  ctx.strokeStyle = "#f0ece1";
  ctx.lineWidth = 1;
  ctx.font = "500 11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#8c867a";

  const px0 = ekranX(x0);
  const py0 = ekranY(L);
  const pxSol = ekranX(xSol);
  const pxSag = ekranX(xSag);
  const pyAsagi = ekranY(yAsagi);
  const pyYuxari = ekranY(yYuxari);

  const xAddim = optimalAddimTap(maxX - minX);
  const xBas = Math.ceil(minX / xAddim) * xAddim;
  const xTorDeq = xAddim < 0.01 ? 3 : xAddim < 0.1 ? 2 : xAddim < 1 ? 1 : 0;

  ctx.textAlign = "center";
  for (let gx = xBas; gx <= maxX + 1e-9; gx += xAddim) {
    const px = ekranX(gx);
    if (px < sifirX - 2 || px > W - sagBosluq + 2) continue;
    ctx.beginPath();
    ctx.moveTo(px, ustBosluq);
    ctx.lineTo(px, sifirY);
    ctx.stroke();

    // Əgər xSol, x0, xSag yazıları ilə toqquşmursa şkala rəqəmini yaz
    if (Math.abs(px - px0) > 34 && Math.abs(px - pxSol) > 34 && Math.abs(px - pxSag) > 34) {
      ctx.fillText(gx.toFixed(xTorDeq), px, sifirY + 18);
    }
  }

  const yAddim = optimalAddimTap(maxY - minY);
  const yBas = Math.ceil(minY / yAddim) * yAddim;
  const yTorDeq = yAddim < 0.1 ? 2 : yAddim < 1 ? 1 : 0;

  ctx.textAlign = "right";
  for (let gy = yBas; gy <= maxY + 1e-9; gy += yAddim) {
    const py = ekranY(gy);
    if (py < ustBosluq - 2 || py > sifirY + 2) continue;
    ctx.beginPath();
    ctx.moveTo(sifirX, py);
    ctx.lineTo(W - sagBosluq, py);
    ctx.stroke();

    // Əgər L+ε, L, L-ε yazıları ilə toqquşmursa şkala rəqəmini yaz
    if (Math.abs(py - py0) > 22 && Math.abs(py - pyAsagi) > 22 && Math.abs(py - pyYuxari) > 22) {
      ctx.fillText(gy.toFixed(yTorDeq), sifirX - 10, py + 4);
    }
  }

  const fSagYoxla = funksiyaniHesabla(ifade, x0 + 0.001);
  const artandir = fSagYoxla >= L;
  const solKesismeY = artandir ? pyAsagi : pyYuxari;
  const sagKesismeY = artandir ? pyYuxari : pyAsagi;

  // ADDIM 1: Y oxundakı ε dəhlizi
  const ufuqiSonX = cariAddim === 1 ? sifirX + 180 : Math.max(pxSol, pxSag);
  ctx.fillStyle = "rgba(184, 59, 20, 0.09)";
  ctx.fillRect(sifirX, pyYuxari, ufuqiSonX - sifirX, pyAsagi - pyYuxari);

  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#b83b14";

  ctx.beginPath();
  ctx.moveTo(sifirX, pyYuxari);
  ctx.lineTo(cariAddim === 1 ? ufuqiSonX : (artandir ? pxSag : pxSol), pyYuxari);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sifirX, pyAsagi);
  ctx.lineTo(cariAddim === 1 ? ufuqiSonX : (artandir ? pxSol : pxSag), pyAsagi);
  ctx.stroke();

  ctx.strokeStyle = "#5c584f";
  ctx.beginPath();
  ctx.moveTo(sifirX, py0);
  ctx.lineTo(px0, py0);
  ctx.stroke();
  ctx.restore();

  const ortaUfuqiX = (sifirX + (cariAddim === 1 ? ufuqiSonX : Math.min(pxSol, pxSag))) / 2;
  if (ortaUfuqiX - sifirX > 30) {
    oxBasiCek(ortaUfuqiX, pyYuxari, "sag", "#b83b14");
    oxBasiCek(ortaUfuqiX, pyAsagi, "sag", "#b83b14");
  }

  // ADDIM 3: Əyridən X oxuna düşən Sol və Sağ ətraf sütunları
  if (cariAddim >= 3) {
    ctx.fillStyle = "rgba(27, 75, 138, 0.11)";
    ctx.fillRect(pxSol, Math.min(pyAsagi, pyYuxari), px0 - pxSol, sifirY - Math.min(pyAsagi, pyYuxari));

    ctx.fillStyle = "rgba(43, 58, 103, 0.11)";
    ctx.fillRect(px0, Math.min(pyAsagi, pyYuxari), pxSag - px0, sifirY - Math.min(pyAsagi, pyYuxari));

    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#1b4b8a";

    ctx.beginPath();
    ctx.moveTo(pxSol, solKesismeY);
    ctx.lineTo(pxSol, sifirY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pxSag, sagKesismeY);
    ctx.lineTo(pxSag, sifirY);
    ctx.stroke();

    ctx.strokeStyle = "#181816";
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px0, sifirY);
    ctx.stroke();
    ctx.restore();

    const ortaSaquliY = (Math.max(pyAsagi, pyYuxari) + sifirY) / 2;
    if (sifirY - Math.max(pyAsagi, pyYuxari) > 30) {
      oxBasiCek(pxSol, ortaSaquliY, "asagi", "#1b4b8a");
      oxBasiCek(pxSag, ortaSaquliY, "asagi", "#1b4b8a");
    }
  }

  // KOORDİNAT OXLARI
  ctx.strokeStyle = "#181816";
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(sifirX, H - altBosluq + 8);
  ctx.lineTo(sifirX, ustBosluq - 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sifirX - 8, sifirY);
  ctx.lineTo(W - sagBosluq + 10, sifirY);
  ctx.stroke();

  if (!mikroskopRejimi) {
    ctx.fillStyle = "#4a4842";
    ctx.font = "600 11.5px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("0", sifirX - 8, sifirY + 16);
  } else {
    // Mikroskop rejimi aktiv olanda yuxarı sağ küncdə bildiriş göstər
    etiketQutusuCek(
      W - sagBosluq - 335,
      ustBosluq - 28,
      "🔍 Mikroskop Rejimi (Yaxından əyri düz xətt kimi görünür)",
      "#f3efe6",
      "#8c867a",
      "#4a4842"
    );
  }

  ctx.fillStyle = "#181816";
  ctx.font = "600 12px 'IBM Plex Sans', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("↑ Y oxu: f(x) çıxışı", sifirX + 8, ustBosluq - 10);
  ctx.textAlign = "right";
  ctx.fillText("X oxu: x girişi →", W - sagBosluq + 6, sifirY - 10);

  // Y oxu üzərində ε mötərizəsi
  ctx.strokeStyle = "#b83b14";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(sifirX, pyYuxari);
  ctx.lineTo(sifirX, pyAsagi);
  ctx.stroke();

  // X oxu üzərində Sol və Sağ ətraf parçaları
  if (cariAddim >= 3) {
    ctx.strokeStyle = "#1b4b8a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pxSol, sifirY);
    ctx.lineTo(px0, sifirY);
    ctx.stroke();

    ctx.strokeStyle = "#2b3a67";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px0, sifirY);
    ctx.lineTo(pxSag, sifirY);
    ctx.stroke();
  }

  // FUNKSİYA ƏYRİSİ (yalnız çərçivə daxilində kəsilməklə - clip)
  ctx.save();
  ctx.beginPath();
  ctx.rect(sifirX, ustBosluq - 6, cizimW + 10, cizimH + 6);
  ctx.clip();

  ctx.strokeStyle = "#5c584f";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  let ilkNoqte = true;
  for (let px = sifirX; px <= W - sagBosluq; px += 1.5) {
    const rx = riyaziX(px);
    const ry = funksiyaniHesabla(ifade, rx);
    if (Number.isFinite(ry)) {
      const py = ekranY(ry);
      if (py >= ustBosluq - 100 && py <= sifirY + 100) {
        if (ilkNoqte) {
          ctx.moveTo(px, py);
          ilkNoqte = false;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        ilkNoqte = true;
      }
    } else {
      ilkNoqte = true;
    }
  }
  ctx.stroke();

  // ADDIM 2: Əyrinin aktiv yaşıl hissəsi
  if (cariAddim >= 2) {
    ctx.strokeStyle = "#156836";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ilkNoqte = true;
    for (let px = Math.max(sifirX, pxSol); px <= Math.min(W - sagBosluq, pxSag); px += 1) {
      const rx = riyaziX(px);
      const ry = funksiyaniHesabla(ifade, rx);
      if (Number.isFinite(ry)) {
        const py = ekranY(ry);
        if (ilkNoqte) {
          ctx.moveTo(px, py);
          ilkNoqte = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();
  }
  ctx.restore();

  if (cariAddim >= 2) {
    dairəCek(ctx, pxSol, solKesismeY, 5, "#ffffff", "#156836", 2.2);
    dairəCek(ctx, pxSag, sagKesismeY, 5, "#ffffff", "#156836", 2.2);
  }

  dairəCek(ctx, px0, py0, 5.5, "#181816", "#ffffff", 2);
  dairəCek(ctx, sifirX, pyYuxari, 4.5, "#ffffff", "#b83b14", 2);
  dairəCek(ctx, sifirX, pyAsagi, 4.5, "#ffffff", "#b83b14", 2);
  dairəCek(ctx, sifirX, py0, 4.5, "#181816", "#ffffff", 1.5);

  if (cariAddim >= 3) {
    dairəCek(ctx, pxSol, sifirY, 4.5, "#ffffff", "#1b4b8a", 2);
    dairəCek(ctx, pxSag, sifirY, 4.5, "#ffffff", "#2b3a67", 2);
    dairəCek(ctx, px0, sifirY, 5, "#181816", "#ffffff", 1.5);
  }

  // =========================================================================
  // TOQQUŞMAYAN OX ETİKETLƏRİ (ε çox kiçik olanda belə iç-içə girmir!)
  // =========================================================================
  ctx.font = "600 11.5px 'IBM Plex Mono', monospace";
  ctx.textAlign = "right";

  // Y oxunda minimum 16px məsafə saxla ki, L+ε, L, L-ε heç vaxt üst-üstə düşməsin
  const yaziYuxariY = Math.min(pyYuxari, py0 - 16);
  const yaziAsagiY = Math.max(pyAsagi, py0 + 16);

  ctx.fillStyle = "#b83b14";
  ctx.fillText(`L+ε=${yYuxari.toFixed(2)}`, sifirX - 8, yaziYuxariY + 4);
  ctx.fillText(`L−ε=${yAsagi.toFixed(2)}`, sifirX - 8, yaziAsagiY + 4);

  ctx.fillStyle = "#181816";
  ctx.fillText(`L=${L.toFixed(2)}`, sifirX - 8, py0 + 4);

  etiketQutusuCek(
    sifirX + 12,
    Math.max(ustBosluq + 4, pyYuxari - 28),
    "① Y oxunda L ± ε dəhlizi",
    "#fdf3ef",
    "#b83b14",
    "#b83b14"
  );

  if (cariAddim >= 2) {
    etiketQutusuCek(
      Math.min(W - 220, pxSag + 12),
      py0 - 12,
      "② f(x) əyrisində uyğun hissə",
      "#eef7f1",
      "#156836",
      "#156836"
    );
  }

  if (cariAddim >= 3) {
    ctx.textAlign = "center";
    // X oxunda xSol və xSag yazıları arasında minimum 60px məsafə saxla ki, iç-içə girməsin
    const yaziSolX = Math.min(pxSol, px0 - 30);
    const yaziSagX = Math.max(pxSag, px0 + 30);
    const xEtiketDeq = (xSag - xSol) < 0.05 ? 3 : 2;

    ctx.fillStyle = "#1b4b8a";
    ctx.fillText(`${xSol.toFixed(xEtiketDeq)}`, yaziSolX, sifirY + 20);

    ctx.fillStyle = "#181816";
    ctx.fillText(`x₀=${x0}`, px0, sifirY + 38);

    ctx.fillStyle = "#2b3a67";
    ctx.fillText(`${xSag.toFixed(xEtiketDeq)}`, yaziSagX, sifirY + 20);

    const solEtr = x0 - xSol;
    const sagEtr = xSag - x0;
    let bDeq = Math.min(solEtr, sagEtr) < 0.01 ? 4 : 3;
    if (Math.abs(solEtr - sagEtr) > 1e-9) {
      while (bDeq < 6 && solEtr.toFixed(bDeq) === sagEtr.toFixed(bDeq)) bDeq++;
    }
    etiketQutusuCek(
      Math.max(sifirX + 10, Math.min(W - 335, pxSol - 15)),
      sifirY - 34,
      `③ X oxunda Sol ətraf=${solEtr.toFixed(bDeq)} | Sağ ətraf=${sagEtr.toFixed(bDeq)}`,
      "#eff4fa",
      "#1b4b8a",
      "#1b4b8a"
    );
  }

  // SİÇAN (MOUSE) YOXLAMASI
  if (mouseX !== null && mouseX >= sifirX && mouseX <= W - sagBosluq) {
    const mx = riyaziX(mouseX);
    const my = funksiyaniHesabla(ifade, mx);

    if (Number.isFinite(my) && my >= minY && my <= maxY * 1.05) {
      const pmy = ekranY(my);
      const icindedir = mx > xSol && mx < xSag;
      const reng = icindedir ? "#156836" : "#a82020";

      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = reng;
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.moveTo(mouseX, sifirY);
      ctx.lineTo(mouseX, pmy);
      ctx.lineTo(sifirX, pmy);
      ctx.stroke();
      ctx.restore();

      dairəCek(ctx, mouseX, pmy, 5.5, reng, "#ffffff", 2);

      if (icindedir) {
        mouseMelumat.textContent = `✓ x = ${deqiqFormat(mx, 2)} → f(x) = ${my.toFixed(2)} (ε dəhlizinin İÇİNDƏDİR)`;
        mouseMelumat.style.color = "#156836";
      } else {
        mouseMelumat.textContent = `✕ x = ${deqiqFormat(mx, 2)} → f(x) = ${my.toFixed(2)} (ε dəhlizindən KƏNARDADIR)`;
        mouseMelumat.style.color = "#a82020";
      }
    }
  }
}

function etiketQutusuCek(x, y, metn, fonReng, cerciveReng, yaziReng) {
  ctx.save();
  ctx.font = "600 11.5px 'IBM Plex Sans', sans-serif";
  const en = ctx.measureText(metn).width + 14;
  const hundurluk = 22;
  const duzX = Math.max(6, Math.min(canvas.width - en - 6, x));

  ctx.fillStyle = fonReng;
  ctx.strokeStyle = cerciveReng;
  ctx.lineWidth = 1;

  ctx.fillRect(duzX, y, en, hundurluk);
  ctx.strokeRect(duzX, y, en, hundurluk);

  ctx.fillStyle = yaziReng;
  ctx.textAlign = "left";
  ctx.fillText(metn, duzX + 7, y + 15);
  ctx.restore();
}

function oxBasiCek(x, y, istiqamet, reng) {
  ctx.save();
  ctx.fillStyle = reng;
  ctx.beginPath();
  if (istiqamet === "sag") {
    ctx.moveTo(x + 6, y);
    ctx.lineTo(x - 4, y - 4.5);
    ctx.lineTo(x - 4, y + 4.5);
  } else if (istiqamet === "asagi") {
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x - 4.5, y - 4);
    ctx.lineTo(x + 4.5, y - 4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

window.addEventListener("resize", () => {
  intervalSimulyatoruCek();
  yenileSimulyator();
});

// İlk açılışda işə salırıq
intervalSimulyatoruCek();
yenileSimulyator();

