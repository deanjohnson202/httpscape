const page = document.querySelector("#page");
const resetDialog = document.querySelector("#reset-dialog");

let state = { step: 1, started: Date.now(), sorted: false };
const normalize = (value) => value.toLowerCase().trim().replace(/[.!?,]+$/g, "").replace(/\s+/g, " ");

function shake(element) {
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
}

function advance(step, delay = 450) {
  state.step = step;
  window.setTimeout(render, delay);
}

function renderOpening() {
  page.className = "opening";
  page.replaceChildren();
  document.body.classList.remove("night");
  document.title = " ";

  if (state.step === 1) {
    const scene = document.createElement("section");
    scene.className = "opening-scene";
    scene.innerHTML = '<form class="entry"><label class="sr-only" for="greeting">Message</label><input id="greeting" autocomplete="off" aria-label="Message"><button>Send</button></form>';
    const form = scene.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const accepted = ["hello", "hi", "hey", "hiya", "howdy", "greetings", "good morning", "good afternoon", "good evening"];
      accepted.includes(normalize(form.querySelector("input").value)) ? advance(2) : shake(form);
    });
    page.append(scene);
    form.querySelector("input").focus();
    return;
  }

  const descent = document.createElement("section");
  descent.className = "descent";
  descent.innerHTML = '<p>You know just what buttons to push.</p><button class="green-button" type="button" aria-label="Green button"></button>';
  descent.querySelector("button").addEventListener("click", () => advance(3, 250));
  page.append(descent);
}

function shellMarkup() {
  return `
    <div class="publication">
      <header class="masthead">
        <div class="utility"><span>Wednesday, August 26</span><span class="weather-brief">72° · Mostly ordinary</span></div>
        <div class="brand-row">
          <button class="menu-button" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
          <button class="brand" type="button">The Daily Ordinary</button>
          <button class="account-button" type="button">Sign in</button>
        </div>
        <nav class="top-nav" aria-label="Primary">
          <button type="button">Local</button><button type="button">Weather</button><button type="button">Culture</button>
          <button type="button">Science</button><button class="more-button" type="button">More</button>
        </nav>
        <form class="site-search" role="search">
          <input aria-label="Search the site" autocomplete="off">
          <button type="submit">Search</button>
        </form>
      </header>

      <div class="ticker" aria-label="Latest headlines">
        <span>BREAKING, EVENTUALLY</span>
        <p>Town clock remains approximately correct</p>
        <p>Officials decline to comment on unusually confident duck</p>
      </div>

      <div class="site-grid">
        <aside class="left-rail">
          <section class="side-menu"></section>
          <section class="updates">
            <header><h2>Latest updates</h2><button class="sort-button" type="button" aria-label="Sort updates">↕</button></header>
            <div class="update-list"></div>
          </section>
        </aside>

        <main class="article-area"></main>

        <aside class="right-rail">
          <section class="popular">
            <h2>Most read</h2>
            <ol>
              <li><a href="#">Five Quiet Benches Ranked</a></li>
              <li><a href="#">Is Your Shed Judging You?</a></li>
              <li><a href="#">Soup: Still Warm</a></li>
            </ol>
          </section>
          <section class="weather-card">
            <span class="weather-icon">☀</span>
            <div><strong>Perfectly adequate</strong><small>High 72 · Low 61</small></div>
          </section>
          <section class="ad-slot"></section>
        </aside>
      </div>

      <footer class="site-footer">
        <div><strong>The Daily Ordinary</strong><span>Reporting on things that happened.</span></div>
        <nav><a href="#">About</a><a href="#">Corrections</a><a href="#">Contact</a><a href="#">Privacy</a></nav>
        <label class="theme-switch"><input type="checkbox"><i></i><span>Night reading</span></label>
        <small>© 2026 Ordinary Media Concern</small>
      </footer>
    </div>`;
}

function ordinaryArticle() {
  return `
    <article class="article">
      <p class="section-label">Local observations</p>
      <h1>Area Pigeon Walks Entire Length of Crosswalk Despite Being Able to Fly</h1>
      <p class="dek">Witnesses described the decision as “methodical” and “probably none of our business.”</p>
      <div class="byline">By Marjorie Crumb <span>·</span> 9:14 a.m.</div>
      <figure class="hero-art" role="img" aria-label="An abstract illustration of a pigeon at a crosswalk">
        <div class="sun"></div><div class="road"></div><div class="pigeon">◆</div>
      </figure>
      <div class="article-body">
        <p>At 8:42 Tuesday morning, a pigeon approached the corner of Fourth and Elm, waited for the signal, and crossed entirely on foot.</p>
        <p>The bird could have flown. Everyone present understood this. Nevertheless, it continued at an even pace while traffic remained respectfully still.</p>
        <blockquote>“It seemed committed to the process.”</blockquote>
        <p>Members of the transportation committee continued to hold their positions while the crossing was completed.</p>
        <p>Asked whether the event would affect policy, a city spokesperson said there was currently no policy concerning pedestrian birds.</p>
      </div>
    </article>`;
}

function correctionArticle() {
  return `
    <article class="article corrections-article">
      <p class="section-label">Corrections & clarifications</p>
      <h1>Several Small Errors That Do Not Change the Larger Truth</h1>
      <p class="dek">The Daily Ordinary regrets the following inaccuracies.</p>
      <div class="byline">Updated 10:03 a.m.</div>
      <div class="article-body">
        <p>Yesterday’s report described the mayor’s hat as <button class="correction-word" data-order="2">umbrella</button>. It was, in fact, burgundy.</p>
        <p>The annual pavement festival was said to <button class="correction-word" data-order="0">search</button> on Friday. It begins on Thursday.</p>
        <p>A photograph of a decorative shrub was mistakenly credited <button class="correction-word" data-order="1">for</button> the shrub itself.</p>
        <p>We remain confident that all unrelated portions of these stories were mostly accurate.</p>
      </div>
      <aside class="correction-tray"><span>Corrections</span><p></p></aside>
    </article>`;
}

function searchResults() {
  const results = [
    ["Umbrella Left Open Indoors Has No Immediate Effect", "12 minutes ago"],
    ["Council Debates Seasonal Awning Vocabulary", "34 minutes ago"],
    ["Rain Continues to Fall Primarily Downward", "61 minutes ago"],
    ["Seven Uses for a Dry Towel", "1 hour ago"]
  ];
  return `
    <section class="results">
      <p class="section-label">Search</p>
      <h1>Results for “umbrella”</h1>
      <div class="result-list">
        ${results.map(([title, time], index) => `<button type="button" class="result-card" data-result="${index}"><span>${time}</span><strong>${title}</strong><small>Reporting from somewhere nearby.</small></button>`).join("")}
      </div>
    </section>`;
}

function impossibleArticle() {
  return `
    <article class="article">
      <p class="section-label">Weather adjacent</p>
      <h1>Rain Continues to Fall Primarily Downward</h1>
      <p class="dek">Researchers say the familiar direction remains the favorite.</p>
      <div class="byline">By Cliff Forecast <span>·</span> 61 minutes ago</div>
      <div class="article-body">
        <p>Rain observed across the county maintained its traditional relationship with gravity throughout the afternoon.</p>
        <p>Readers seeking tomorrow’s conditions may find the forecast nearby, although advertising has recently occupied much of the available atmosphere.</p>
      </div>
    </article>`;
}

function nightArticle() {
  return `
    <article class="article night-article">
      <p class="section-label">After hours</p>
      <h1>The Office Is Empty, but One Desk Lamp Remains On</h1>
      <p class="dek">Facilities insists someone will deal with it in the morning.</p>
      <div class="byline">11:48 p.m.</div>
      <figure class="night-window"><span>put the latest first</span></figure>
      <div class="article-body">
        <p>From the street, the fourth-floor window appears ordinary until the surrounding offices go dark.</p>
        <p>No employee has claimed responsibility for the light. It continues to illuminate one chair, two folders, and a mug reading “Adequate.”</p>
      </div>
    </article>`;
}

function renderUpdates() {
  const updates = state.sorted
    ? [["2 min", "Bus arrives"], ["4 min", "Bus departs"], ["11 min", "Bench remains"]]
    : [["11 min", "Bench remains"], ["2 min", "Bus arrives"], ["4 min", "Bus departs"]];
  document.querySelector(".update-list").innerHTML = updates.map(([time, text]) => `<p><time>${time}</time><span>${text}</span></p>`).join("");
}

function renderSideMenu() {
  const menu = document.querySelector(".side-menu");
  if (state.step < 4) {
    menu.innerHTML = '<p class="rail-note">A weekly window into daily life.</p>';
    return;
  }
  const items = [["Local", 4], ["Weather", 8], ["Culture", 12], ["Transit", 15], ["Science", 20]];
  menu.innerHTML = '<h2>Sections</h2>' + items.map(([name, count]) => `<button type="button" data-count="${count}"><span>${name}</span><small>${count}</small></button>`).join("");
  if (state.step === 4) {
    menu.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      Number(button.dataset.count) === 15 ? advance(5) : shake(menu);
    }));
  }
}

function wireHoldMore() {
  const button = document.querySelector(".more-button");
  if (state.step !== 3) return;
  let timer;
  let start;
  const fill = document.createElement("i");
  button.append(fill);
  const begin = (event) => {
    event.preventDefault();
    start = performance.now();
    button.classList.add("holding");
    const draw = () => {
      const progress = Math.min((performance.now() - start) / 1800, 1);
      button.style.setProperty("--hold", progress);
      if (progress === 1) {
        advance(4);
        return;
      }
      timer = requestAnimationFrame(draw);
    };
    timer = requestAnimationFrame(draw);
  };
  const cancel = () => {
    cancelAnimationFrame(timer);
    button.classList.remove("holding");
    button.style.setProperty("--hold", 0);
  };
  button.addEventListener("pointerdown", begin);
  button.addEventListener("pointerup", cancel);
  button.addEventListener("pointerleave", cancel);
}

function wireCorrections() {
  if (state.step !== 5) return;
  const tray = document.querySelector(".correction-tray p");
  const selected = [];
  document.querySelectorAll(".correction-word").forEach((button) => button.addEventListener("click", () => {
    const expected = selected.length;
    if (Number(button.dataset.order) !== expected) {
      selected.length = 0;
      tray.textContent = "";
      document.querySelectorAll(".correction-word").forEach((word) => word.disabled = false);
      shake(document.querySelector(".corrections-article"));
      return;
    }
    selected.push(button.textContent);
    button.disabled = true;
    tray.textContent = selected.join(" ");
    if (selected.length === 3) advance(6, 700);
  }));
}

function wireSearch() {
  const form = document.querySelector(".site-search");
  const input = form.querySelector("input");
  if (state.step >= 6) {
    form.classList.add("available");
    input.value = state.step === 6 ? "" : "umbrella";
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.step !== 6) return;
    normalize(input.value) === "search for umbrella" || normalize(input.value) === "umbrella"
      ? advance(7)
      : shake(form);
  });
}

function renderAdvertisement() {
  const slot = document.querySelector(".ad-slot");
  if (state.step < 8) {
    slot.innerHTML = '<p class="ad-label">Advertisement</p><strong>PLAIN CRACKERS</strong><span>Now with corners.</span>';
    return;
  }
  slot.innerHTML = '<button class="forecast-link" type="button">Tomorrow’s forecast</button><div class="movable-ad"><p class="ad-label">Advertisement</p><strong>UMBRELLA PLUS</strong><span>For rain that means business.</span><button type="button" aria-label="Close advertisement">×</button></div>';
  if (state.step !== 8) {
    slot.querySelector(".movable-ad").classList.add("moved");
    return;
  }

  const ad = slot.querySelector(".movable-ad");
  let origin;
  const move = (event) => {
    if (!origin) return;
    const x = event.clientX - origin.x;
    const y = event.clientY - origin.y;
    if (Math.abs(x) + Math.abs(y) > 35) ad.classList.add("moved");
    ad.style.transform = `translate(${x}px, ${y}px) rotate(-2deg)`;
  };
  ad.addEventListener("pointerdown", (event) => {
    origin = { x: event.clientX, y: event.clientY };
    ad.setPointerCapture(event.pointerId);
  });
  ad.addEventListener("pointermove", move);
  ad.addEventListener("pointerup", () => origin = null);
  ad.querySelector("button").addEventListener("click", () => shake(ad));
  slot.querySelector(".forecast-link").addEventListener("click", () => {
    if (ad.classList.contains("moved")) advance(9);
  });
}

function wireNight() {
  const toggle = document.querySelector(".theme-switch input");
  if (state.step >= 10 || document.body.classList.contains("night")) toggle.checked = true;
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("night", toggle.checked);
    document.querySelector('meta[name="theme-color"]').content = toggle.checked ? "#101b2b" : "#f5f2e8";
  });
  if (state.step === 9) {
    const secret = document.querySelector(".night-window span");
    secret.addEventListener("click", () => {
      if (document.body.classList.contains("night")) advance(10);
    });
  }
}

function wireFinale() {
  const sort = document.querySelector(".sort-button");
  const brand = document.querySelector(".brand");
  if (state.step !== 10) return;
  sort.addEventListener("click", () => {
    state.sorted = true;
    renderUpdates();
    brand.classList.add("ready");
  });
  if (state.sorted) brand.classList.add("ready");
  brand.addEventListener("click", () => {
    if (state.sorted) playEscape();
  });
}

function playEscape() {
  state.step = 11;
  document.body.dataset.step = 11;
  const publication = document.querySelector(".publication");
  const escapeScene = document.createElement("div");
  escapeScene.className = "escape-scene";
  escapeScene.setAttribute("role", "status");
  escapeScene.setAttribute("aria-label", "You escaped.");
  escapeScene.innerHTML = `
    <div class="escape-person" aria-hidden="true">
      <svg viewBox="0 0 100 170">
        <circle class="person-head" cx="50" cy="25" r="17"></circle>
        <path class="person-body" d="M50 42 L50 103"></path>
        <path class="person-arm arm-left" d="M50 57 L24 84"></path>
        <path class="person-arm arm-right" d="M50 57 L77 82"></path>
        <path class="person-leg leg-left" d="M50 102 L27 145"></path>
        <path class="person-leg leg-right" d="M50 102 L75 145"></path>
        <g class="thumb-arm">
          <path d="M50 59 L73 44 L85 24"></path>
          <path d="M85 24 L84 9"></path>
          <path d="M85 24 L95 18"></path>
        </g>
      </svg>
    </div>
    <p class="escape-message">You’re out.</p>`;
  document.body.append(escapeScene);
  requestAnimationFrame(() => {
    publication.classList.add("escaping");
    escapeScene.classList.add("playing");
  });
}

function renderPublication() {
  page.className = "";
  page.innerHTML = shellMarkup();
  document.title = "The Daily Ordinary";
  if (state.step >= 10) document.body.classList.add("night");
  else document.body.classList.remove("night");

  const articleArea = document.querySelector(".article-area");
  if (state.step === 5 || state.step === 6) articleArea.innerHTML = correctionArticle();
  else if (state.step === 7) articleArea.innerHTML = searchResults();
  else if (state.step === 8) articleArea.innerHTML = impossibleArticle();
  else if (state.step >= 9 && state.step <= 10) articleArea.innerHTML = nightArticle();
  else if (state.step === 11) articleArea.innerHTML = '<section class="finished"><h1>You’re out.</h1></section>';
  else articleArea.innerHTML = ordinaryArticle();

  renderSideMenu();
  renderUpdates();
  renderAdvertisement();
  wireHoldMore();
  wireCorrections();
  wireSearch();
  wireNight();
  wireFinale();

  if (state.step === 7) {
    document.querySelectorAll(".result-card").forEach((button) => button.addEventListener("click", () => {
      button.dataset.result === "2" ? advance(8) : shake(button);
    }));
  }
}

function render() {
  document.body.dataset.step = state.step;
  state.step < 3 ? renderOpening() : renderPublication();
}

document.querySelector("#reset").addEventListener("click", () => resetDialog.showModal());
document.querySelector("#cancel-reset").addEventListener("click", () => resetDialog.close());
document.querySelector("#confirm-reset").addEventListener("click", () => {
  state = { step: 1, started: Date.now(), sorted: false };
  document.querySelector(".escape-scene")?.remove();
  document.body.classList.remove("night");
  document.querySelector('meta[name="theme-color"]').content = "#f2f0e9";
  resetDialog.close();
  render();
});

render();
