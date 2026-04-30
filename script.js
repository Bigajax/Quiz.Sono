const stage = document.querySelector("#quizStage");
const progressBar = document.querySelector("#progressBar");
const backButton = document.querySelector("#backButton");

const API_URL = "https://ecobackend888.onrender.com";
const PRODUCT_KEY = "protocolo_sono_7_noites";
const PROD_APP_URL = "https://ecofrontend888.vercel.app";
const APP_URL = (() => {
  const h = window.location.hostname;
  const isLocal = !h || h === "localhost" || h === "127.0.0.1";
  return isLocal ? "http://localhost:5173" : PROD_APP_URL;
})();

let quizResponseId = null;

function trackPixel(event, params) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", event, params || {});
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

function buildAnswersPayload() {
  return screens
    .filter((s) => s.question)
    .map((s, i) => ({ question: s.question, answer: answers[i + 1] ?? null }));
}

function saveAnswersToStorage() {
  try {
    sessionStorage.setItem("eco.sono.quiz_answers", JSON.stringify(buildAnswersPayload()));
    if (answers[2]) sessionStorage.setItem("eco.sono.q2_answer", answers[2]);
    if (answers[5]) sessionStorage.setItem("eco.sono.q5_answer", answers[5]);
  } catch {
    // silencioso
  }
}

async function saveQuizResponses() {
  try {
    const res = await fetch(`${API_URL}/api/quiz/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: buildAnswersPayload(),
        utm: getUtmParams(),
        quiz_source: "quiz_sono",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      quizResponseId = data.id;
    }
  } catch {
    // silencioso
  }
}

async function markConversion() {
  if (!quizResponseId) return;
  try {
    await fetch(`${API_URL}/api/quiz/response/${quizResponseId}/convert`, { method: "PATCH" });
  } catch {
    // silencioso
  }
}

// ── Cópia personalizada da tela de transição ──────────────────────────────
function getTransitionCopy() {
  const q2 = answers[2] || "";
  const q5 = answers[5] || "";

  let diagnostic = "Seu sistema nervoso ficou travado em modo de alerta — e não recebe mais o sinal para voltar ao repouso.";
  if (q2.includes("cabeça começa a girar")) {
    diagnostic = "Sua mente ativa pensamentos em loop exatamente no momento em que você tenta parar.";
  } else if (q2.includes("corpo está esgotado")) {
    diagnostic = "Seu corpo pede descanso, mas seu sistema nervoso ainda não recebe o sinal de parar.";
  } else if (q2.includes("repassando situações")) {
    diagnostic = "Seu cérebro fica preso em ciclos de ruminação no silêncio da noite.";
  } else if (q2.includes("Não paro de pensar")) {
    diagnostic = "Seu sistema nervoso mantém o estado de alerta mesmo sem uma causa aparente.";
  }

  let solution = "A meditação de 7 minutos foi calibrada para desligar esse padrão de alerta.";
  if (q5.includes("desligar minha mente")) {
    solution = "A meditação de 7 minutos foi calibrada especificamente para silenciar esse estado de hiperativação.";
  } else if (q5.includes("energia real")) {
    solution = "O protocolo reensina seu sistema nervoso a recuperar energia real durante o sono.";
  } else if (q5.includes("ansiedade")) {
    solution = "A Noite 1 trabalha diretamente o estado de ansiedade noturna — o gatilho do seu padrão.";
  } else if (q5.includes("controle")) {
    solution = "Em 7 minutos, você começa a recondicionar quem dita as regras do seu sono.";
  }

  return { diagnostic, solution };
}

// ── Screens — 5 perguntas ─────────────────────────────────────────────────
const screens = [
  {
    type: "hook",
    title: "Você deita…<br><em>mas sua mente não desliga?</em>",
    subtitle:
      "Responda 5 perguntas rápidas e descubra por que seu sistema nervoso não consegue parar — e o que fazer ainda hoje à noite.",
    social: "12.400+ pessoas já entenderam o próprio padrão",
    cta: "Descobrir o meu padrão de sono →",
  },
  // Q1 — duração (usada na animação de loading)
  {
    question: "Há quanto tempo isso acontece?",
    options: [
      "Faz algumas semanas — começou do nada",
      "Há alguns meses — e parece estar piorando",
      "Já faz mais de um ano que não durmo direito",
      "Sempre fui assim, não me lembro de dormir bem",
    ],
  },
  // Q2 — padrão noturno (usada na transição personalizada)
  {
    question: "O que acontece nos primeiros minutos depois que você deita?",
    options: [
      "Minha cabeça começa a girar com pensamentos do dia",
      "Meu corpo está esgotado, mas não consigo desligar",
      "Fico repassando situações que queria ter resolvido diferente",
      "Não paro de pensar — sem motivo específico",
    ],
  },
  // Q3 — reação ao não conseguir dormir
  {
    question: "Como você reage quando percebe que o sono não está vindo?",
    options: [
      "Fico frustrado comigo mesmo por não conseguir relaxar",
      "Começo a calcular quantas horas ainda tenho para dormir",
      "Meu corpo fica mais tenso quanto mais eu tento",
      "Desisto e fico olhando o celular até cair de sono",
    ],
  },
  // Q4 — tentativas anteriores (qualificação)
  {
    question: "Você já tentou algo para melhorar seu sono?",
    options: [
      "Sim — melatonina, chá, remédio — nada resolveu de vez",
      "Tentei algumas coisas, mas desisti porque não vi resultado",
      "Já tentei rotinas e técnicas, mas não consigo manter",
      "Nunca tentei nada de forma consistente",
    ],
  },
  // Q5 — motivação (usada na transição personalizada)
  {
    question: "O que você mais quer quando pensa em dormir melhor?",
    options: [
      "Conseguir desligar minha mente e finalmente descansar",
      "Acordar com energia real para o dia",
      "Me livrar da ansiedade que me ataca à noite",
      "Sentir que estou no controle do meu próprio sono",
    ],
  },
  { type: "loading" },
  { type: "transition" },
];

let currentScreen = 0;
const answers = [];

function setProgress() {
  const quizSteps = screens.length - 2; // exclui loading + transition
  const progress = Math.min((currentScreen / quizSteps) * 100, 100);
  progressBar.style.width = `${progress}%`;
  backButton.hidden = currentScreen === 0 || currentScreen >= screens.length - 1;
}

function renderScreen() {
  setProgress();
  const screen = screens[currentScreen];

  // ── Hook ──────────────────────────────────────────────────────────────────
  if (screen.type === "hook") {
    stage.innerHTML = `
      <div class="screen">
        <div class="section-label">Protocolo Sono Profundo</div>
        <h1>${screen.title}</h1>
        <p class="subtitle">${screen.subtitle}</p>
        <button class="start-button btn-pulse" type="button">${screen.cta}</button>
        <div class="social-proof">
          <span class="stars-row">★★★★★</span>
          <span>${screen.social}</span>
        </div>
      </div>
    `;
    stage.querySelector("button").addEventListener("click", () => {
      trackPixel("ViewContent", { content_name: "Quiz Sono Profundo" });
      nextScreen();
    });
    return;
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (screen.type === "loading") {
    const durationAnswer = answers[1] || "";
    let durationLabel = "identificado";
    if (durationAnswer.includes("semanas")) durationLabel = "recente";
    else if (durationAnswer.includes("meses")) durationLabel = "progressivo";
    else if (durationAnswer.includes("mais de um ano")) durationLabel = "crônico";
    else if (durationAnswer.includes("Sempre")) durationLabel = "de longa data";

    const steps = [
      `Padrão ${durationLabel} de ativação mental detectado…`,
      "Identificando gatilhos de alerta noturno…",
      "Montando seu protocolo personalizado…",
    ];

    stage.innerHTML = `
      <div class="screen">
        <div class="loading-header">
          <div class="section-label">Protocolo Sono Profundo</div>
          <h2>Analisando seu perfil…</h2>
          <p class="subtitle">Identificamos seu padrão. Montando protocolo.</p>
        </div>
        <div class="loading-steps">
          ${steps.map((step, i) => `
            <div class="loading-step" data-i="${i}">
              <div class="step-icon"><div class="step-spinner"></div></div>
              <span>${step}</span>
            </div>`).join("")}
        </div>
      </div>
    `;

    const stepEls = stage.querySelectorAll(".loading-step");
    const STEP = 720;
    stepEls.forEach((el, i) => {
      window.setTimeout(() => el.classList.add("active"), i * STEP);
      window.setTimeout(() => {
        el.querySelector(".step-icon").innerHTML = '<span class="step-check">✓</span>';
        el.classList.add("done");
      }, i * STEP + STEP - 60);
    });

    // Salvar respostas durante o loading (sem bloquear UX)
    saveAnswersToStorage();
    saveQuizResponses();
    trackPixel("Lead");

    window.setTimeout(nextScreen, stepEls.length * STEP + 380);
    return;
  }

  // ── Tela de Transição Personalizada ──────────────────────────────────────
  if (screen.type === "transition") {
    progressBar.style.width = "100%";
    const { diagnostic, solution } = getTransitionCopy();

    stage.innerHTML = `
      <div class="screen transition-screen">

        <div class="diagnosis-badge">
          <span class="badge-dot"></span>
          Diagnóstico · Estado de Alerta Ativo
        </div>

        <h2 class="transition-headline">
          Seu padrão mostra que sua mente está em <em>estado de alerta constante.</em>
        </h2>

        <p class="transition-diagnostic">${diagnostic}</p>

        <div class="transition-divider"></div>

        <p class="transition-body">Seu corpo está cansado,<br><em>mas sua mente não desliga.</em></p>

        <p class="transition-solution">${solution}</p>

        <div class="testimonials">
          <div class="testimonial">
            <div class="testimonial-stars">★★★★★</div>
            <p>"Dormi 7 horas seguidas pela primeira vez em meses. Não acreditei que seria tão simples."</p>
            <span class="testimonial-author">— Carla M., 34 anos</span>
          </div>
          <div class="testimonial">
            <div class="testimonial-stars">★★★★★</div>
            <p>"Terceira noite e já acordo com energia de verdade. Parece que minha cabeça finalmente aprendeu a parar."</p>
            <span class="testimonial-author">— Marcos T., 41 anos</span>
          </div>
        </div>

        <button class="primary-cta btn-pulse" type="button" id="ctaStart">
          Iniciar experiência personalizada →
        </button>

        <p class="transition-subtext">Sem cadastro · Sem cartão · Acesso imediato</p>

      </div>
    `;

    stage.querySelector("#ctaStart").addEventListener("click", function () {
      trackPixel("ViewContent", {
        content_ids: [PRODUCT_KEY],
        content_name: "Noite 1 Grátis",
      });
      markConversion();
      const utmParams = getUtmParams();
      const guestId = quizResponseId || `guest_${Date.now()}`;
      const params = new URLSearchParams({
        guestSono: "1",
        source: utmParams.utm_source ? `quiz_sono_${utmParams.utm_source}` : "quiz_sono",
        guest_id: guestId,
      });
      window.location.href = `${APP_URL}/app/meditacoes/sono?${params.toString()}`;
    });
    return;
  }

  // ── Pergunta ──────────────────────────────────────────────────────────────
  stage.innerHTML = `
    <div class="screen">
      <p class="eyebrow">Pergunta ${currentScreen} de 5</p>
      <h2>${screen.question}</h2>
      <div class="options">
        ${screen.options.map((option, index) =>
          `<button class="option" type="button" data-option="${index}">${option}</button>`
        ).join("")}
      </div>
    </div>
  `;

  stage.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("selected");
      answers[currentScreen] = button.textContent;
      window.setTimeout(nextScreen, 240);
    });
  });
}

function nextScreen() {
  currentScreen += 1;
  renderScreen();
}

function previousScreen() {
  currentScreen = Math.max(currentScreen - 1, 0);
  renderScreen();
}

backButton.addEventListener("click", previousScreen);
renderScreen();
