const stage = document.querySelector("#quizStage");
const progressBar = document.querySelector("#progressBar");
const backButton = document.querySelector("#backButton");

const API_URL = "https://ecobackend888.onrender.com";
const PRODUCT_KEY = "protocolo_sono_7_noites";

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

async function openCheckout(button) {
  if (button.dataset.loading === "true") return;

  button.dataset.loading = "true";
  const originalText = button.textContent;
  button.textContent = "Abrindo pagamento…";
  button.style.opacity = "0.7";

  try {
    const res = await fetch(`${API_URL}/api/mp/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey: PRODUCT_KEY, origin: "quiz", utm: getUtmParams() }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || `Erro ${res.status}`);
    }

    const { init_point } = await res.json();
    if (!init_point) throw new Error("Link de pagamento não retornado");

    window.location.href = init_point;
  } catch (err) {
    button.dataset.loading = "false";
    button.textContent = originalText;
    button.style.opacity = "";
    alert(
      `Não foi possível abrir o pagamento.\n${err instanceof Error ? err.message : err}\n\nTente novamente ou entre em contato.`,
    );
  }
}

const screens = [
  {
    type: "hook",
    title: "Você deita…<br><em>mas sua mente não desliga?</em>",
    subtitle:
      "Responda 7 perguntas e descubra por que isso acontece — e o que fazer ainda hoje à noite.",
    social: "12.400+ pessoas já descobriram o motivo",
    cta: "Identificar o meu padrão agora",
  },
  {
    question: "Há quanto tempo isso acontece?",
    options: [
      "Faz algumas semanas — começou do nada",
      "Há alguns meses — e parece estar piorando",
      "Já faz mais de um ano que não durmo direito",
      "Sempre fui assim, não me lembro de dormir bem",
    ],
  },
  {
    question: "O que acontece nos primeiros minutos depois que você deita?",
    options: [
      "Minha cabeça começa a girar com pensamentos do dia",
      "Meu corpo está esgotado, mas não consigo desligar",
      "Fico repassando situações que queria ter resolvido diferente",
      "Não paro de pensar — sem motivo específico",
    ],
  },
  {
    question: "Como você reage quando percebe que o sono não está vindo?",
    options: [
      "Fico frustrado comigo mesmo por não conseguir relaxar",
      "Começo a calcular quantas horas ainda tenho para dormir",
      "Meu corpo fica mais tenso quanto mais eu tento",
      "Desisto e fico olhando o celular até cair de sono",
    ],
  },
  {
    question: "O que você costuma fazer na última hora antes de dormir?",
    options: [
      "Fico no celular até a hora de apagar a luz",
      "Assisto série ou vídeo até o sono bater",
      "Tento relaxar, mas minha cabeça não desacelera",
      "Não tenho rotina — cada noite é diferente",
    ],
  },
  {
    question: "Você já tentou algo para melhorar seu sono?",
    options: [
      "Sim — melatonina, chá, remédio — nada resolveu de vez",
      "Tentei algumas coisas, mas desisti porque não vi resultado",
      "Já tentei rotinas e técnicas, mas não consigo manter",
      "Nunca tentei nada de forma consistente",
    ],
  },
  {
    question: "Como você acorda no dia seguinte?",
    options: [
      "Destruído — como se não tivesse descansado nada",
      "Com o corpo pesado e a mente lenta nas primeiras horas",
      "Funciono, mas sem energia de verdade",
      "Bem fisicamente, mas já mentalmente esgotado",
    ],
  },
  {
    question: "O que você mais quer quando pensa em dormir melhor?",
    options: [
      "Conseguir desligar minha mente e finalmente descansar",
      "Acordar com energia real para o dia",
      "Me livrar da ansiedade que me ataca à noite",
      "Sentir que estou no controle do meu próprio sono",
    ],
  },
  {
    type: "loading",
  },
  {
    type: "result",
  },
];

let currentScreen = 0;
const answers = [];

function setProgress() {
  const quizSteps = screens.length - 2;
  const progress = Math.min((currentScreen / quizSteps) * 100, 100);
  progressBar.style.width = `${progress}%`;
  backButton.hidden = currentScreen === 0 || currentScreen >= screens.length - 1;
}

function renderScreen() {
  setProgress();
  const screen = screens[currentScreen];

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
    stage.querySelector("button").addEventListener("click", nextScreen);
    return;
  }

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
          ${steps
            .map(
              (step, i) => `
            <div class="loading-step" data-i="${i}">
              <div class="step-icon"><div class="step-spinner"></div></div>
              <span>${step}</span>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    `;

    const stepEls = stage.querySelectorAll(".loading-step");
    const STEP = 720;

    stepEls.forEach((el, i) => {
      window.setTimeout(() => el.classList.add("active"), i * STEP);
      window.setTimeout(() => {
        el.querySelector(".step-icon").innerHTML =
          '<span class="step-check">✓</span>';
        el.classList.add("done");
      }, i * STEP + STEP - 60);
    });

    window.setTimeout(nextScreen, stepEls.length * STEP + 380);
    return;
  }

  if (screen.type === "result") {
    progressBar.style.width = "100%";
    stage.innerHTML = `
      <div class="screen result">

        <div class="diagnosis-badge">
          <span class="badge-dot"></span>
          Estado de Alerta Crônico
        </div>

        <div class="result-copy">
          <h2>Você não tem insônia.</h2>

          <p>Você tem dificuldade para <strong>desligar</strong>.</p>

          <p>Seu sistema nervoso entrou em modo de alerta — e não recebeu o sinal para voltar ao repouso. Resultado: seu corpo está esgotado, mas sua mente continua processando.</p>

          <div class="result-block">
            <p>Quanto mais você tenta forçar o sono…</p>
            <p><em>mais acordado você fica.</em></p>
          </div>

          <p>Isso não é falta de esforço.<br><strong>É um padrão do seu sistema nervoso — e tem solução.</strong></p>
        </div>

        <div class="result-divider"></div>

        <div class="offer-box">
          <p class="offer-label">O que resolve isso</p>
          <p>Existe um protocolo de <strong>7 minutos</strong> que ensina seu sistema nervoso a desligar antes de dormir.</p>
          <p>Sem remédio. Sem contar ovelhas.<br><strong>Funciona já na primeira noite.</strong></p>

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
        </div>

        <div class="social-row">
          <div class="avatars">
            <div class="avatar">AM</div>
            <div class="avatar">RS</div>
            <div class="avatar">PL</div>
            <div class="avatar">JT</div>
            <div class="avatar">+</div>
          </div>
          <p><strong>12.400+</strong> pessoas já dormiram melhor com isso</p>
        </div>

        <div class="price-anchor">
          <span class="price-old">de R$97</span>
          <span class="price-new">por R$37</span>
        </div>

        <button class="primary-cta btn-pulse" type="button" id="ctaButton">
          Quero dormir bem ainda hoje →
        </button>

        <div class="guarantee-box">
          <span class="guarantee-check">✓</span>
          <p>Resultado em <strong>3 noites</strong> ou reembolso total — sem perguntas</p>
        </div>

      </div>
    `;

    stage.querySelector("#ctaButton").addEventListener("click", function () {
      openCheckout(this);
    });
    return;
  }

  stage.innerHTML = `
    <div class="screen">
      <p class="eyebrow">Pergunta ${currentScreen} de 7</p>
      <h2>${screen.question}</h2>
      <div class="options">
        ${screen.options
          .map(
            (option, index) =>
              `<button class="option" type="button" data-option="${index}">${option}</button>`,
          )
          .join("")}
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
