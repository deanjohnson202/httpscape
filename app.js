const page = document.querySelector("#page");
const resetDialog = document.querySelector("#reset-dialog");
const STORAGE_KEY = "httpscape-progress-v2";
const LAST_STEP = 11;

let state = { step: 1, started: Date.now() };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && Number.isInteger(saved.step) && saved.step >= 1 && saved.step <= LAST_STEP) state = saved;
} catch {}

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const normalize = (value) => value.toLowerCase().trim().replace(/[.!?,]+$/g, "").replace(/\s+/g, " ");
const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function section(className = "") {
  const element = document.createElement("section");
  element.className = `scene ${className}`.trim();
  page.append(element);
  return element;
}

function shake(element) {
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
}

function advance(current) {
  current.querySelectorAll("button, input").forEach((control) => control.disabled = true);
  state.step += 1;
  save();
  window.setTimeout(() => {
    const next = renderStep(state.step);
    next.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 550);
}

const echoes = [
  "",
  "hello.",
  "●",
  "held.",
  "four lights remember.",
  "turn out the lights.",
  "darkness.",
  "one star was awake.",
  "balance.",
  "keys without locks.",
  "the page."
];

function renderEcho(step) {
  const echo = section("echo");
  echo.textContent = echoes[step];
}

function greeting() {
  const scene = section();
  const form = document.createElement("form");
  form.className = "entry";
  form.innerHTML = '<label class="sr-only" for="greeting">Message</label><input id="greeting" autocomplete="off" aria-label="Message"><button>Send</button>';
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const accepted = ["hello", "hi", "hey", "hiya", "howdy", "greetings", "good morning", "good afternoon", "good evening"];
    if (accepted.includes(normalize(form.querySelector("input").value))) advance(scene);
    else shake(form);
  });
  scene.append(form);
  form.querySelector("input").focus();
  return scene;
}

function below() {
  const scene = section("descent");
  scene.innerHTML = '<p class="line">You know just what buttons to push.</p>';
  const button = document.createElement("button");
  button.type = "button";
  button.className = "green-button";
  button.setAttribute("aria-label", "Green button");
  button.addEventListener("click", () => advance(scene));
  scene.append(button);
  return scene;
}

function holdOn() {
  const scene = section();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "hold-button";
  button.textContent = "hold on";
  let start = 0;
  let frame = 0;
  let completed = false;

  const tick = (time) => {
    if (!start) start = time;
    const progress = Math.min((time - start) / 2200, 1);
    button.style.setProperty("--hold", progress);
    if (progress === 1) {
      completed = true;
      advance(scene);
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  const begin = (event) => {
    if (event.type === "keydown" && ![" ", "Enter"].includes(event.key)) return;
    event.preventDefault();
    start = 0;
    button.classList.add("holding");
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  };
  const end = (event) => {
    if (event.type === "keyup" && ![" ", "Enter"].includes(event.key)) return;
    if (completed) return;
    cancelAnimationFrame(frame);
    start = 0;
    button.classList.remove("holding");
    button.style.setProperty("--hold", 0);
  };
  button.addEventListener("pointerdown", begin);
  button.addEventListener("pointerup", end);
  button.addEventListener("pointerleave", end);
  button.addEventListener("pointercancel", end);
  button.addEventListener("keydown", begin);
  button.addEventListener("keyup", end);
  scene.append(button);
  return scene;
}

function rememberLights() {
  const scene = section();
  const lights = document.createElement("div");
  lights.className = "lights";
  const colors = ["#d95b55", "#e5bc45", "#4c9fd6", "#55ae74"];
  const sequence = [2, 0, 3, 1];
  let input = [];
  let showing = true;

  colors.forEach((color, index) => {
    const light = document.createElement("button");
    light.type = "button";
    light.className = "light";
    light.style.setProperty("--light", color);
    light.setAttribute("aria-label", `Light ${index + 1}`);
    light.addEventListener("click", () => {
      if (showing) return;
      light.classList.add("lit");
      window.setTimeout(() => light.classList.remove("lit"), 150);
      input.push(index);
      if (input[input.length - 1] !== sequence[input.length - 1]) {
        input = [];
        shake(lights);
        window.setTimeout(play, 500);
      } else if (input.length === sequence.length) {
        advance(scene);
      }
    });
    lights.append(light);
  });

  async function play() {
    showing = true;
    input = [];
    await wait(450);
    for (const index of sequence) {
      const light = lights.children[index];
      light.classList.add("lit");
      await wait(360);
      light.classList.remove("lit");
      await wait(180);
    }
    showing = false;
  }
  scene.append(lights);
  play();
  return scene;
}

function makeSentence() {
  const scene = section();
  const line = document.createElement("p");
  const slots = document.createElement("div");
  const bank = document.createElement("div");
  const chosen = [];
  line.className = "line";
  line.textContent = "Everything has its place.";
  slots.className = "sentence";
  bank.className = "word-bank";
  for (let index = 0; index < 4; index += 1) {
    const slot = document.createElement("span");
    slot.className = "slot";
    slots.append(slot);
  }

  const reset = () => {
    chosen.length = 0;
    [...slots.children].forEach((slot) => slot.textContent = "");
    [...bank.children].forEach((button) => button.disabled = false);
  };
  ["LIGHTS", "TURN", "THE", "OUT"].forEach((word) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "word";
    button.textContent = word;
    button.addEventListener("click", () => {
      slots.children[chosen.length].textContent = word;
      chosen.push(word);
      button.disabled = true;
      if (chosen.length === 4 && chosen.join(" ") === "TURN OUT THE LIGHTS") advance(scene);
      else if (chosen.length === 4) {
        shake(slots);
        window.setTimeout(reset, 500);
      }
    });
    bank.append(button);
  });
  scene.append(line, slots, bank);
  return scene;
}

function switchLights() {
  const scene = section();
  const control = document.createElement("label");
  control.className = "switch";
  control.innerHTML = '<input type="checkbox"><i aria-hidden="true"></i><span>lights</span>';
  control.querySelector("input").addEventListener("change", () => {
    document.body.classList.add("night");
    document.querySelector('meta[name="theme-color"]').content = "#080a11";
    window.setTimeout(() => advance(scene), 900);
  });
  scene.append(control);
  return scene;
}

function stars() {
  const scene = section();
  const field = document.createElement("div");
  field.className = "stars";
  const points = [
    [8, 18, 5], [29, 62, 4], [47, 25, 6], [72, 12, 4], [88, 53, 5],
    [15, 78, 4], [39, 82, 5], [65, 69, 5], [79, 88, 4]
  ];
  points.forEach(([x, y, size], index) => {
    const star = document.createElement("button");
    star.type = "button";
    star.className = index === 6 ? "star odd" : "star";
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.setProperty("--size", `${size}px`);
    star.setAttribute("aria-label", "Star");
    if (index === 6) star.addEventListener("click", () => advance(scene));
    field.append(star);
  });
  scene.append(field);
  return scene;
}

function findBalance() {
  const scene = section();
  const balance = document.createElement("div");
  balance.className = "balance";
  balance.innerHTML = '<div class="beam"><span class="weight"></span><span class="weight"></span></div><input type="range" min="0" max="100" value="20" aria-label="Balance">';
  const beam = balance.querySelector(".beam");
  const input = balance.querySelector("input");
  let timer;
  const update = () => {
    const difference = Number(input.value) - 68;
    beam.style.setProperty("--tilt", `${difference / 5}deg`);
    window.clearTimeout(timer);
    if (difference === 0) timer = window.setTimeout(() => advance(scene), 650);
  };
  input.addEventListener("input", update);
  scene.append(balance);
  update();
  return scene;
}

function findKeys() {
  const scene = section();
  const collection = document.createElement("div");
  const line = document.createElement("p");
  const input = document.createElement("input");
  const objects = document.createElement("div");
  const things = ["anchor", "bottle", "candle", "compass", "feather", "hammer", "keyboard", "lantern", "mirror", "notebook", "watch", "rope"];
  collection.className = "collection";
  line.className = "line";
  line.textContent = "keys, but no locks.";
  input.type = "search";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Search");
  objects.className = "objects";
  const draw = () => {
    const query = input.value.trim().toLowerCase();
    objects.replaceChildren();
    things.filter((thing) => thing.includes(query)).forEach((thing) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "object";
      button.textContent = thing;
      if (thing === "keyboard" && query) button.addEventListener("click", () => advance(scene));
      objects.append(button);
    });
  };
  input.addEventListener("input", draw);
  collection.append(line, input, objects);
  scene.append(collection);
  draw();
  return scene;
}

function finalQuestion() {
  const scene = section();
  const form = document.createElement("form");
  form.className = "last-form";
  form.innerHTML = '<p class="line">What opened every lock?</p><input autocomplete="off" aria-label="Answer">';
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = normalize(form.querySelector("input").value);
    ["page", "the page", "website", "the website", "site", "the site"].includes(answer)
      ? advance(scene)
      : shake(form);
  });
  scene.append(form);
  form.querySelector("input").focus();
  return scene;
}

function ending() {
  const scene = section("end");
  scene.innerHTML = '<p class="line">You were never trapped.<br>The page was.</p>';
  return scene;
}

const renderers = [greeting, below, holdOn, rememberLights, makeSentence, switchLights, stars, findBalance, findKeys, finalQuestion, ending];

function renderStep(step) {
  if (step >= 7) document.body.classList.add("night");
  return renderers[step - 1]();
}

function renderSavedGame() {
  page.replaceChildren();
  for (let step = 1; step < state.step; step += 1) renderEcho(step);
  renderStep(state.step);
}

document.querySelector("#reset").addEventListener("click", () => resetDialog.showModal());
document.querySelector("#cancel-reset").addEventListener("click", () => resetDialog.close());
document.querySelector("#confirm-reset").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = { step: 1, started: Date.now() };
  document.body.classList.remove("night");
  document.querySelector('meta[name="theme-color"]').content = "#f2f0e9";
  resetDialog.close();
  renderSavedGame();
});

renderSavedGame();
