const appConfig = {
  appName: "Our Little Story",
  couple: {
    me: "My Love",
    you: "You"
  },
  messages: {
    welcome: "Every little moment with you feels like a tiny miracle. Let's step into our dream together.",
    welcomeTypewriter: "A tiny love story, made just for us...",
    storyIntro: "The universe brought us together in the most beautiful way, and every day since then has felt like a page from a fairy tale.",
    mascot: "Your pocket friend says: 'Even the future feels brighter when we're holding hands.'",
    letter: "Dear my favorite person, thank you for making my world softer, kinder, and more magical. I love you more than words can say.",
    final: "I will choose you in every lifetime, in every season, and in every dream.",
    memories: [
      "The first time we talked, the whole world seemed to go quiet.",
      "Our silly late-night laughs are some of my happiest memories.",
      "My favorite future is the one where we keep choosing each other."
    ],
    mascotLines: [
      "If I had a time machine, I would visit every moment that led me to you.",
      "You make even an ordinary day feel like a little adventure.",
      "My favorite place in the universe is right beside you.",
      "Sending you one tiny pocket-sized hug and a very big love."
    ]
  },
  questions: [
    {
      prompt: "Which little moment always makes you smile?",
      answers: ["Our first hello", "A silly surprise", "A quiet moment together"],
      feedback: ["My heart remembers that day too.", "Your smile is my favorite surprise.", "Those quiet moments mean everything to me."]
    },
    {
      prompt: "What is my favorite sound in the world?",
      answers: ["Your laugh", "You saying my name", "Us dreaming out loud"],
      feedback: ["I could listen to it forever.", "Every time, my heart does a little flip.", "All our dreams are better together."]
    },
    {
      prompt: "What should we always make time for?",
      answers: ["More little adventures", "More cozy days", "All of the above"],
      feedback: ["Adventure buddy for life!", "Cozy days with you are perfect.", "Correct answer: every moment with you."]
    }
  ],
  colors: {
    rose: "#ff6ca8",
    peach: "#ffd2a8",
    sky: "#8bc7ff",
    lavender: "#a99dff",
    navy: "#1f2d4d"
  },
  assets: {
    // Add licensed PNG paths here to replace the built-in original mascot poses.
    mascotPngs: {
      welcome: "img2.png",
      question: "img2.png",
      story: "img2.png",
      magic: "img2.png",
      letter: "img2.png",
      celebrate: "img2.png"
    }
  }
};

const appState = {
  currentScreen: "welcome",
  answers: {},
  questionIndex: 0,
  memories: [],
  questionFeedback: "",
  previousScreen: null,
  screenOrder: ["welcome", "question", "story", "mascot", "loveLetter", "final"],
  visitedScreens: [],
  navigationLocked: false,
  pendingPopScreen: null,
  screenCleanup: null,
  mascotTimer: null,
  mascotBubbleTimer: null,
  mascotReactionTimer: null,
  motionPreference: null,
  mascotMode: "mascot-waving",
  letterOpen: false,
  initialized: false
};

const screenLabels = {
  welcome: "Welcome",
  question: "Our question",
  story: "Our story",
  mascot: "Pocket friend",
  loveLetter: "Love letter",
  final: "Final surprise"
};

const screenTemplates = {
  welcome: () => `
    <section class="panel welcome-panel" aria-label="Welcome screen">
      <p class="eyebrow">A little surprise</p>
      <h1>For ${escapeHtml(appConfig.couple.me)}</h1>
      <p class="typewriter-line" data-typewriter="${escapeHtml(appConfig.messages.welcomeTypewriter)}" aria-label="${escapeHtml(appConfig.messages.welcomeTypewriter)}"></p>
      <p class="subtitle">${escapeHtml(appConfig.messages.welcome)}</p>
      <div class="button-row">
        <button class="primary-button" data-action="start-journey" type="button">Start Our Story</button>
      </div>
    </section>
  `,
  question: () => {
    const index = appState.questionIndex;
    const question = appConfig.questions[index];
    const selected = appState.answers[`question-${index}`];
    return `
      <section class="panel question-panel" aria-label="Question screen">
        <p class="eyebrow">A little question for us</p>
        <h2>${escapeHtml(question.prompt)}</h2>
        <p class="question-progress" aria-live="polite">Question ${index + 1} of ${appConfig.questions.length}</p>
        <div class="question-step-track" role="progressbar" aria-label="Question progress" aria-valuemin="1" aria-valuemax="${appConfig.questions.length}" aria-valuenow="${index + 1}" aria-valuetext="Question ${index + 1} of ${appConfig.questions.length}">
          <span style="width:${((index + 1) / appConfig.questions.length) * 100}%"></span>
        </div>
        <div class="choice-grid question-choices">
          ${question.answers.map((answer, answerIndex) => `
            <button class="choice-card" type="button" data-action="choose-answer" data-choice="${answerIndex}" aria-pressed="${selected === answerIndex}">
              <span class="choice-title">${escapeHtml(answer)}</span>
              <span aria-hidden="true">♡</span>
            </button>
          `).join("")}
        </div>
        <p class="playful-feedback" role="status" aria-live="polite">${escapeHtml(appState.questionFeedback)}</p>
        <div class="button-row question-controls">
          <button class="secondary-button" data-action="previous-question" type="button" ${index === 0 ? "disabled" : ""}>Previous</button>
          ${index < appConfig.questions.length - 1
            ? `<button class="primary-button" data-action="next-question" type="button">Next question</button>`
            : `<button class="primary-button" data-action="continue-to-story" type="button">Continue</button>`}
        </div>
      </section>
    `;
  },
  story: () => {
    return `
      <section class="panel story-panel" aria-label="Story screen">
        <p class="eyebrow">Our story</p>
        <h2>Every day with you feels like magic.</h2>
        <p class="story-intro reveal-text">${escapeHtml(appConfig.messages.storyIntro)}</p>
        <div class="story-stack">
          ${appConfig.messages.memories.map((memory, index) => `
            <label class="story-card reveal-card" style="--reveal-delay:${index * 120}ms">
              <span class="memory-label">A little memory ${index + 1}</span>
              <textarea class="memory-input" data-memory-index="${index}" aria-label="Edit memory ${index + 1}" rows="2">${escapeHtml(appState.memories[index] ?? memory)}</textarea>
            </label>
          `).join("")}
        </div>
        <div class="button-row">
          <button class="secondary-button" data-action="go-back" type="button">Back</button>
          <button class="primary-button" data-action="go-mascot" type="button">Continue</button>
        </div>
      </section>
    `;
  },
  mascot: () => `
    <section class="panel story-panel" aria-label="Mascot screen">
      <p class="eyebrow">A tiny guide</p>
      <h2>Your little pocket friend is right here.</h2>
      <p class="subtitle">${escapeHtml(appConfig.messages.mascot)}</p>
      <div class="button-row">
        <button class="secondary-button" data-action="go-back" type="button">Back</button>
        <button class="primary-button" data-action="go-letter" type="button">Continue</button>
      </div>
    </section>
  `,
  loveLetter: () => `
    <section class="panel letter-panel" aria-label="Love letter screen">
      <p class="eyebrow">A love note</p>
      <h2>A little something from my heart</h2>
      <div class="envelope ${appState.letterOpen ? "is-open" : ""}">
        <span class="envelope-back"></span>
        <div id="love-letter-content" class="letter-box" role="article" aria-label="Personal love letter" aria-hidden="${!appState.letterOpen}" ${appState.letterOpen ? "" : "inert"}>
          <strong>Dear ${escapeHtml(appConfig.couple.me)},</strong>
          <span>${escapeHtml(appConfig.messages.letter)}</span>
          <span class="letter-signoff">With all my heart,<br />${escapeHtml(appConfig.couple.you)}</span>
        </div>
        <span class="envelope-front"></span>
        <span class="envelope-flap"></span>
        <button class="envelope-open-button" data-action="open-letter" type="button" aria-controls="love-letter-content" aria-expanded="${appState.letterOpen}" aria-label="${appState.letterOpen ? "Love letter opened" : "Open your love letter"}" ${appState.letterOpen ? "disabled" : ""}>
          <span class="envelope-seal" aria-hidden="true">♡</span>
        </button>
      </div>
      <p class="envelope-hint" data-envelope-hint>${appState.letterOpen ? "All my love, tucked inside." : "Tap the envelope to open your letter."}</p>
      <div class="button-row">
        <button class="secondary-button" data-action="go-back" type="button">Back</button>
        <button class="primary-button" data-action="go-final" type="button">Continue</button>
      </div>
    </section>
  `,
  final: () => `
    <section class="panel final-panel" aria-label="Final surprise screen">
      <p class="eyebrow">Forever and always</p>
      <div class="cinematic-heart" aria-hidden="true"><span>♥</span><i></i><i></i><i></i><i></i></div>
      <h1 class="final-message">My dearest ${escapeHtml(appConfig.couple.me)},</h1>
      <p class="subtitle">${escapeHtml(appConfig.messages.final)}</p>
      <div class="button-row">
        <button class="secondary-button" data-action="read-letter-again" type="button">Read Letter Again</button>
        <button class="primary-button" data-action="restart" type="button">Start Again</button>
      </div>
    </section>
  `
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function handleMotionPreferenceChange(event) {
  if (event.matches) {
    window.clearInterval(appState.mascotTimer);
    appState.mascotTimer = null;
  } else {
    startMascotMotion();
  }

  const activeScreen = document.querySelector("#screen-root > .screen.active");
  if (activeScreen) {
    cleanupCurrentScreen();
    setupScreenEffects(appState.currentScreen, activeScreen, { triggerFinalCelebration: false });
  }
}

function createHeartField() {
  return Array.from({ length: 18 }, (_, index) => {
    const size = 10 + ((index % 5) * 7);
    const left = (index * 7) % 100;
    const delay = (index % 6) * -1.2;
    const duration = 8 + (index % 4) * 2.5;
    return `<span class="heart" style="--size:${size}px; --left:${left}%; --delay:${delay}s; --duration:${duration}s;"></span>`;
  }).join("");
}

function mascotArtwork(action) {
  const accessories = {
    welcome: `<path d="M166 106 Q194 83 198 56" fill="none" stroke="#26385e" stroke-width="9" stroke-linecap="round"/><circle cx="199" cy="48" r="11" fill="#fff" stroke="#26385e" stroke-width="6"/>`,
    question: `<path d="M48 61 C39 47 20 56 29 72 L48 89 L66 70 C77 55 58 46 48 61Z" fill="#ff6ca8"/><path d="M174 53 C167 43 153 50 160 62 L174 75 L188 62 C195 50 181 43 174 53Z" fill="#ff91b8"/>`,
    story: `<path d="M174 40 L180 55 L196 56 L184 66 L188 82 L174 73 L160 82 L164 66 L152 56 L168 55Z" fill="#ffd46b" stroke="#fff" stroke-width="3"/>`,
    magic: `<path d="M167 102 L199 53" stroke="#7f6cff" stroke-width="9" stroke-linecap="round"/><path d="M197 36 L202 47 L214 49 L205 57 L207 69 L197 63 L187 69 L189 57 L180 49 L192 47Z" fill="#ffd46b"/>`,
    letter: `<path d="M155 65 H204 V101 H155Z" fill="#fff8fb" stroke="#eb4b8f" stroke-width="5" stroke-linejoin="round"/><path d="M157 69 L180 87 L202 69" fill="none" stroke="#eb4b8f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    celebrate: `<path d="M48 45 C40 32 24 40 32 54 L48 69 L64 54 C72 40 56 32 48 45Z" fill="#ff6ca8"/><path d="M181 39 C174 29 160 35 167 47 L181 60 L195 47 C202 35 188 29 181 39Z" fill="#ff91b8"/><path d="M30 94 L34 104 M210 95 L205 105 M75 32 L78 41 M146 28 L143 39" stroke="#ffd46b" stroke-width="5" stroke-linecap="round"/>`
  };
  const pose = accessories[action] || accessories.welcome;
  const art = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs><linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8bd4ff"/><stop offset="1" stop-color="#438be8"/></linearGradient></defs>
      ${pose}
      <path d="M71 150 Q120 128 169 150 L178 206 Q120 228 62 206Z" fill="url(#coat)" stroke="#26385e" stroke-width="6"/>
      <path d="M84 159 Q120 143 156 159 L150 197 Q120 209 90 197Z" fill="#fff" stroke="#26385e" stroke-width="5"/>
      <path d="M76 168 Q53 179 59 195 M164 168 Q187 179 181 195" fill="none" stroke="#438be8" stroke-width="16" stroke-linecap="round"/>
      <circle cx="60" cy="197" r="10" fill="#fff" stroke="#26385e" stroke-width="4"/>
      <circle cx="180" cy="197" r="10" fill="#fff" stroke="#26385e" stroke-width="4"/>
      <path d="M67 88 Q67 35 120 35 Q173 35 173 88 L169 127 Q165 160 120 160 Q75 160 71 127Z" fill="url(#coat)" stroke="#26385e" stroke-width="6"/>
      <path d="M83 99 Q85 78 120 78 Q155 78 157 99 L153 128 Q148 149 120 149 Q92 149 87 128Z" fill="#fff8ef" stroke="#26385e" stroke-width="4"/>
      <ellipse cx="103" cy="91" rx="7" ry="10" fill="#26385e"/><ellipse cx="137" cy="91" rx="7" ry="10" fill="#26385e"/>
      <path d="M112 111 Q120 119 128 111" fill="none" stroke="#eb6d85" stroke-width="5" stroke-linecap="round"/>
      <path d="M97 126 Q120 143 143 126" fill="none" stroke="#26385e" stroke-width="4" stroke-linecap="round"/>
      <path d="M82 113 L65 108 M82 122 L64 123 M158 113 L175 108 M158 122 L176 123" stroke="#26385e" stroke-width="3" stroke-linecap="round"/>
      <path d="M99 158 Q120 169 141 158" fill="none" stroke="#26385e" stroke-width="4"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(art)}`;
}

function updateMascotPose(screenName) {
  const actionByScreen = {
    welcome: "welcome",
    question: "question",
    story: "story",
    mascot: "magic",
    loveLetter: "letter",
    final: "celebrate"
  };
  const action = actionByScreen[screenName] || "welcome";
  const providedMascot = appConfig.assets.mascotPngs[action];
  const imageSource = providedMascot || mascotArtwork(action);
  const sharedImage = document.getElementById("shared-mascot-image");
  if (sharedImage) {
    sharedImage.dataset.pose = action;
    sharedImage.dataset.fallbackApplied = "false";
    sharedImage.src = imageSource;
    sharedImage.alt = providedMascot
      ? "Doraemon waving"
      : `Original blue pocket friend ${action === "welcome" ? "waving hello" : action === "question" ? "sharing hearts" : action === "story" ? "holding a star" : action === "magic" ? "making a little magic" : action === "letter" ? "holding a love letter" : "celebrating with hearts"}`;
  }

  const stage = document.getElementById("mascot-stage");
  if (stage) {
    stage.classList.toggle("is-celebrating", screenName === "final");
    stage.classList.toggle("is-reacting", screenName === "question" && Boolean(appState.questionFeedback));
    if (screenName === "final") {
      setMascotMode("mascot-celebrating");
    } else if (screenName !== "question" || !appState.questionFeedback) {
      setMascotMode("mascot-waving");
    }
  }
}

function showMascotBubble(message) {
  const bubble = document.getElementById("mascot-speech");
  const stage = document.getElementById("mascot-stage");
  if (!bubble || !stage) {
    return;
  }

  bubble.textContent = message;
  bubble.hidden = false;
  stage.classList.add("speech-visible");
  window.clearTimeout(appState.mascotBubbleTimer);
  appState.mascotBubbleTimer = window.setTimeout(() => {
    bubble.hidden = true;
    stage.classList.remove("speech-visible");
  }, 4200);
}

function setMascotMode(mode) {
  const stage = document.getElementById("mascot-stage");
  if (!stage || stage.classList.contains(mode)) {
    return;
  }
  stage.classList.remove("mascot-flying", "mascot-running", "mascot-waving", "mascot-celebrating", "mascot-reacting");
  stage.classList.add(mode);
  appState.mascotMode = mode;
}

function startMascotMotion() {
  if (appState.mascotTimer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const modes = ["mascot-flying", "mascot-running", "mascot-waving"];
  appState.mascotTimer = window.setInterval(() => {
    if (appState.currentScreen === "final") {
      setMascotMode("mascot-celebrating");
      return;
    }
    const currentMode = appState.mascotMode;
    const choices = modes.filter((mode) => mode !== currentMode);
    setMascotMode(choices[Math.floor(Math.random() * choices.length)]);
  }, 8500);
}

function createAppShell() {
  return `
    <div class="app-shell">
      <div class="background-glow" aria-hidden="true"></div>
      <div class="heart-field" aria-hidden="true">${createHeartField()}</div>
      <div id="mascot-stage" class="mascot-stage mascot-waving">
        <div id="mascot-speech" class="mascot-speech" role="status" aria-live="polite" hidden></div>
        <button class="mascot-button" data-action="mascot-speak" type="button" aria-label="Ask your pocket friend for a romantic message">
          <img id="shared-mascot-image" class="mascot-image" alt="" />
        </button>
      </div>
      <header class="journey-chrome" aria-label="Story navigation">
        <button class="back-button" data-action="go-back" type="button" aria-label="Go to previous screen">← Back</button>
        <div class="progress-wrap">
          <span id="progress-announcement" class="visually-hidden" role="status" aria-live="polite"></span>
          <div class="progress-track" role="progressbar" aria-label="Story progress" aria-valuemin="1" aria-valuemax="6" aria-valuenow="1" aria-valuetext="Step 1 of 6: Welcome">
            <span id="progress-fill"></span>
          </div>
        </div>
      </header>
      <main id="screen-root" class="screen-root"></main>
    </div>
  `;
}

function updateUrl(screenName) {
  const url = new URL(window.location.href);
  if (screenName === "welcome") {
    url.searchParams.delete("screen");
  } else {
    url.searchParams.set("screen", screenName);
  }
  window.history.pushState({ app: true, screen: screenName }, "", url);
}

function updateProgress(screenName) {
  const currentIndex = appState.screenOrder.indexOf(screenName);
  const progress = document.querySelector(".progress-track");
  const fill = document.getElementById("progress-fill");
  const announcement = document.getElementById("progress-announcement");
  const backButton = document.querySelector("[data-action='go-back']");

  if (currentIndex < 0 || !progress || !fill || !announcement || !backButton) {
    return;
  }

  const currentStep = currentIndex + 1;
  const label = screenLabels[screenName];
  progress.setAttribute("aria-valuenow", String(currentStep));
  progress.setAttribute("aria-valuetext", `Step ${currentStep} of ${appState.screenOrder.length}: ${label}`);
  fill.style.width = `${(currentStep / appState.screenOrder.length) * 100}%`;
  announcement.textContent = `Step ${currentStep} of ${appState.screenOrder.length}: ${label}`;
  backButton.disabled = (appState.visitedScreens.length < 2 && currentIndex === 0) || appState.navigationLocked;
}

function cleanupCurrentScreen() {
  if (typeof appState.screenCleanup === "function") {
    appState.screenCleanup();
    appState.screenCleanup = null;
  }
}

function addScreenCleanup(cleanup) {
  const previousCleanup = appState.screenCleanup;
  appState.screenCleanup = () => {
    previousCleanup?.();
    cleanup();
  };
}

function triggerHeartBurst(screen, className) {
  if (!screen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const burst = document.createElement("div");
  burst.className = `heart-burst ${className}`;
  burst.setAttribute("aria-hidden", "true");
  const heartCount = className === "final-heart-burst" ? 22 : 12;
  for (let index = 0; index < heartCount; index += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / heartCount;
    const distance = 70 + (index % 4) * 28;
    heart.className = "burst-heart";
    heart.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
    heart.style.setProperty("--burst-delay", `${(index % 5) * 35}ms`);
    burst.appendChild(heart);
  }
  screen.appendChild(burst);

  const timer = window.setTimeout(() => burst.remove(), 1500);
  addScreenCleanup(() => {
    window.clearTimeout(timer);
    burst.remove();
  });
}

function setupScreenEffects(screenName, screen, { triggerFinalCelebration = true } = {}) {
  const cleanups = [];
  const typewriter = screen.querySelector("[data-typewriter]");
  if (typewriter) {
    const text = typewriter.dataset.typewriter || "";
    typewriter.textContent = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typewriter.textContent = text;
    } else {
      let position = 0;
      const timer = window.setInterval(() => {
        typewriter.textContent = text.slice(0, position + 1);
        position += 1;
        if (position >= text.length) {
          window.clearInterval(timer);
        }
      }, 48);
      cleanups.push(() => window.clearInterval(timer));
    }
  }

  if (screenName === "story" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    screen.querySelectorAll(".reveal-card").forEach((card, index) => {
      const timer = window.setTimeout(() => card.classList.add("is-revealed"), index * 120 + 60);
      cleanups.push(() => window.clearTimeout(timer));
    });
    screen.querySelector(".reveal-text")?.classList.add("is-revealed");
  } else {
    screen.querySelectorAll(".reveal-card, .reveal-text").forEach((element) => element.classList.add("is-revealed"));
  }

  appState.screenCleanup = () => cleanups.forEach((cleanup) => cleanup());
  if (screenName === "final" && triggerFinalCelebration) {
    triggerHeartBurst(screen, "final-heart-burst");
  }
}

function renderQuestionStep() {
  const activeScreen = document.querySelector("#screen-root > .screen.active");
  if (!activeScreen || appState.currentScreen !== "question") {
    return;
  }
  cleanupCurrentScreen();
  const activeAction = document.activeElement?.dataset.action;
  activeScreen.innerHTML = screenTemplates.question();
  activeScreen.scrollTop = 0;
  updateMascotPose("question");
  const focusTarget = activeAction === "choose-answer"
    ? activeScreen.querySelector(".choice-card[aria-pressed='true']")
    : activeScreen.querySelector("h2");
  if (focusTarget?.tagName === "H2") {
    focusTarget.tabIndex = -1;
  }
  focusTarget?.focus({ preventScroll: true });
}

function renderScreen(screenName, { direction = "forward" } = {}) {
  const screenRoot = document.getElementById("screen-root");
  const template = screenTemplates[screenName];

  if (!template || !screenRoot) {
    return false;
  }

  if (screenName === appState.currentScreen && screenRoot.querySelector(".screen.active")) {
    return false;
  }

  cleanupCurrentScreen();
  const incoming = document.createElement("section");
  incoming.className = `screen is-entering ${direction === "back" ? "from-left" : "from-right"}`;
  incoming.setAttribute("aria-hidden", "false");
  incoming.innerHTML = template();
  incoming.scrollTop = 0;

  const previous = screenRoot.querySelector(".screen.active");

  if (previous) {
    previous.setAttribute("aria-hidden", "true");
    previous.inert = true;
    previous.classList.remove("active", "is-entering", "from-left", "from-right");
    previous.classList.add("is-leaving");
  }

  screenRoot.appendChild(incoming);
  screenRoot.classList.add("is-transitioning");
  screenRoot.setAttribute("aria-busy", "true");
  appState.navigationLocked = true;
  appState.previousScreen = appState.currentScreen;
  appState.currentScreen = screenName;
  updateProgress(screenName);
  updateMascotPose(screenName);

  const finishTransition = () => {
    window.clearTimeout(transitionTimer);
    incoming.removeEventListener("transitionend", handleTransitionEnd);
    if (previous) {
      previous.remove();
    }
    incoming.classList.remove("is-entering", "from-left", "from-right");
    screenRoot.classList.remove("is-transitioning");
    screenRoot.removeAttribute("aria-busy");
    appState.navigationLocked = false;
    updateProgress(appState.currentScreen);

    const heading = incoming.querySelector("h1, h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    setupScreenEffects(screenName, incoming);

    if (appState.pendingPopScreen) {
      const pendingScreen = appState.pendingPopScreen;
      appState.pendingPopScreen = null;
      transitionFromHistory(pendingScreen);
    }
  };
  const handleTransitionEnd = (event) => {
    if (event.target === incoming && event.propertyName === "opacity") {
      finishTransition();
    }
  };

  incoming.addEventListener("transitionend", handleTransitionEnd);
  const transitionTimer = window.setTimeout(finishTransition, 650);
  incoming.classList.add("active");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishTransition();
  } else {
    window.requestAnimationFrame(() => {
      incoming.classList.remove("is-entering", "from-left", "from-right");
    });
  }
  return true;
}

function navigateTo(screenName) {
  if (!screenTemplates[screenName]) {
    return false;
  }
  if (appState.navigationLocked || screenName === appState.currentScreen) {
    return false;
  }

  const currentIndex = appState.screenOrder.indexOf(appState.currentScreen);
  const nextIndex = appState.screenOrder.indexOf(screenName);
  const direction = nextIndex < currentIndex ? "back" : "forward";
  updateUrl(screenName);
  appState.visitedScreens.push(screenName);
  return renderScreen(screenName, { direction });
}

function transitionFromHistory(screenName) {
  if (!screenTemplates[screenName] || screenName === appState.currentScreen) {
    return;
  }
  const currentIndex = appState.screenOrder.indexOf(appState.currentScreen);
  const nextIndex = appState.screenOrder.indexOf(screenName);
  const direction = nextIndex < currentIndex ? "back" : "forward";
  const previousVisit = appState.visitedScreens.lastIndexOf(screenName);
  if (previousVisit >= 0) {
    appState.visitedScreens = appState.visitedScreens.slice(0, previousVisit + 1);
  } else {
    appState.visitedScreens.push(screenName);
  }
  renderScreen(screenName, { direction });
}

function handlePopState(event) {
  const requestedScreen = event.state?.screen || new URLSearchParams(window.location.search).get("screen") || "welcome";
  const nextScreen = screenTemplates[requestedScreen] ? requestedScreen : "welcome";

  if (appState.navigationLocked) {
    appState.pendingPopScreen = nextScreen;
    return;
  }
  transitionFromHistory(nextScreen);
}

function handleDocumentClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }
  if (appState.navigationLocked) {
    return;
  }

  const action = target.dataset.action;

  switch (action) {
    case "mascot-speak": {
      const lines = appConfig.messages.mascotLines;
      showMascotBubble(lines[Math.floor(Math.random() * lines.length)]);
      break;
    }
    case "go-back":
      if (appState.visitedScreens.length > 1) {
        window.history.back();
      } else {
        const currentIndex = appState.screenOrder.indexOf(appState.currentScreen);
        if (currentIndex > 0) {
          navigateTo(appState.screenOrder[currentIndex - 1]);
        }
      }
      break;
    case "start-journey":
      appState.questionIndex = 0;
      appState.questionFeedback = "";
      navigateTo("question");
      break;
    case "choose-answer":
      {
        const question = appConfig.questions[appState.questionIndex];
        const selectedAnswer = Number(target.dataset.choice);
        if (!question || !Number.isInteger(selectedAnswer) || selectedAnswer < 0 || selectedAnswer >= question.answers.length) {
          break;
        }
        appState.answers[`question-${appState.questionIndex}`] = selectedAnswer;
        appState.questionFeedback = question.feedback[selectedAnswer];
      }
      renderQuestionStep();
      setMascotMode("mascot-reacting");
      showMascotBubble(appState.questionFeedback);
      window.clearTimeout(appState.mascotReactionTimer);
      appState.mascotReactionTimer = window.setTimeout(() => {
        if (appState.currentScreen !== "final") {
          setMascotMode("mascot-waving");
        }
      }, 1800);
      break;
    case "next-question":
      appState.questionIndex = Math.min(appState.questionIndex + 1, appConfig.questions.length - 1);
      appState.questionFeedback = "";
      renderQuestionStep();
      break;
    case "previous-question":
      appState.questionIndex = Math.max(appState.questionIndex - 1, 0);
      appState.questionFeedback = "";
      renderQuestionStep();
      break;
    case "continue-to-story":
      if (appConfig.questions.every((_, index) => Number.isInteger(appState.answers[`question-${index}`]))) {
        navigateTo("story");
      } else {
        appState.questionFeedback = "Choose an answer for each little question first.";
        renderQuestionStep();
      }
      break;
    case "go-mascot":
      navigateTo("mascot");
      break;
    case "go-letter":
      navigateTo("loveLetter");
      break;
    case "go-final":
      navigateTo("final");
      break;
    case "open-letter":
      appState.letterOpen = true;
      target.closest(".envelope")?.classList.add("is-open");
      target.disabled = true;
      target.setAttribute("aria-expanded", "true");
      target.setAttribute("aria-label", "Love letter opened");
      const letterContent = document.getElementById("love-letter-content");
      if (letterContent) {
        letterContent.removeAttribute("inert");
        letterContent.setAttribute("aria-hidden", "false");
      }
      triggerHeartBurst(document.querySelector("#screen-root > .screen.active"), "letter-heart-burst");
      const hint = document.querySelector("[data-envelope-hint]");
      if (hint) {
        hint.textContent = appState.letterOpen ? "All my love, tucked inside." : "Tap the envelope to open your letter.";
      }
      break;
    case "read-letter-again":
      appState.letterOpen = true;
      navigateTo("loveLetter");
      break;
    case "restart":
      appState.answers = {};
      appState.memories = [];
      appState.questionIndex = 0;
      appState.questionFeedback = "";
      appState.letterOpen = false;
      appState.visitedScreens = [];
      navigateTo("welcome");
      break;
    default:
      break;
  }
}

function handleDocumentInput(event) {
  const target = event.target;
  if (target.matches("[data-memory-index]")) {
    appState.memories[Number(target.dataset.memoryIndex)] = target.value;
  }
}

function handleMascotImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") {
    return;
  }
  image.dataset.fallbackApplied = "true";
  const action = image.dataset.pose || "welcome";
  image.src = mascotArtwork(action);
  image.alt = `Original blue pocket friend ${action === "welcome" ? "waving hello" : action === "question" ? "sharing hearts" : action === "story" ? "holding a star" : action === "magic" ? "making a little magic" : action === "letter" ? "holding a love letter" : "celebrating with hearts"}`;
}

function initializeApp() {
  if (appState.initialized) {
    return;
  }
  const root = document.getElementById("app");
  if (!root) {
    return;
  }

  appState.initialized = true;
  root.innerHTML = createAppShell();

  const params = new URLSearchParams(window.location.search);
  const initialScreen = params.get("screen") || appState.currentScreen;
  const validScreen = screenTemplates[initialScreen] ? initialScreen : "welcome";
  appState.currentScreen = validScreen;
  appState.visitedScreens = [validScreen];
  window.history.replaceState({ app: true, screen: validScreen }, "", window.location.href);

  const screenRoot = document.getElementById("screen-root");
  document.getElementById("shared-mascot-image").addEventListener("error", handleMascotImageError);
  const template = screenTemplates[validScreen];
  const initial = document.createElement("section");
  initial.className = "screen active";
  initial.setAttribute("aria-hidden", "false");
  initial.innerHTML = template();
  screenRoot.appendChild(initial);
  updateMascotPose(validScreen);
  updateProgress(validScreen);
  setupScreenEffects(validScreen, initial);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleDocumentInput);
  window.addEventListener("popstate", handlePopState);
  appState.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  appState.motionPreference.addEventListener("change", handleMotionPreferenceChange);
  startMascotMotion();
}

window.addEventListener("DOMContentLoaded", initializeApp);
