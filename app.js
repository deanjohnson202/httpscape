const $ = (selector) => document.querySelector(selector);
const stage = $("#stage");
const feedback = $("#feedback");
const game = $("#game");
const STORAGE_KEY = "httpscape-progress-v1";
const TOTAL_ROOMS = 10;

let state = { room: 1, started: Date.now(), hints: 0 };
let roomHints = [];
let hintIndex = 0;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && Number.isInteger(saved.room) && saved.room > 0 && saved.room <= 11) state = saved;
} catch {}

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const normalize = (text) => text.toLowerCase().trim().replace(/[.!?,]+$/g, "").replace(/\s+/g, " ");

function createButton(text, kind = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button ${kind}`;
  button.textContent = text;
  return button;
}

function setupRoom(title, prompt, hints) {
  $("#number").textContent = state.room <= TOTAL_ROOMS ? `Room ${state.room}` : "Escape complete";
  $("#title").textContent = title;
  $("#prompt").textContent = prompt;
  $("#status").textContent = state.room <= TOTAL_ROOMS ? `Room ${state.room} of ${TOTAL_ROOMS}` : "Escaped";
  $("#bar").style.width = `${Math.min(state.room - 1, TOTAL_ROOMS) * 10}%`;
  $("#hint").hidden = state.room > TOTAL_ROOMS;
  stage.replaceChildren();
  feedback.textContent = "";
  feedback.className = "";
  roomHints = hints;
  hintIndex = 0;
  document.body.classList.remove("dark");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showFeedback(message, success = false) {
  feedback.textContent = message;
  feedback.className = success ? "good" : "";
}

function completeRoom(message) {
  showFeedback(message, true);
  stage.querySelectorAll("button, input, select").forEach((control) => control.disabled = true);
  window.setTimeout(() => {
    state.room += 1;
    save();
    render();
    game.focus();
  }, 800);
}

function room1() {
  setupRoom("Is anyone there?", "The page is listening, but it does not know you yet.", [
    "Start as you would with a person.",
    "Try a friendly greeting.",
    "Type “hello” and press Send."
  ]);
  const form = document.createElement("form");
  form.className = "row";
  form.innerHTML = '<label class="sr-only" for="greeting">Your message</label><input id="greeting" autocomplete="off" placeholder="Type something…"><button class="button">Send</button>';
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const greetings = ["hello", "hi", "hey", "hiya", "howdy", "greetings", "good morning", "good afternoon", "good evening"];
    greetings.includes(normalize($("#greeting").value))
      ? completeRoom("Hello. Now we can begin.")
      : showFeedback("The page remains silent. Perhaps begin more politely.");
  });
  stage.append(form);
  $("#greeting").focus();
}

function room2() {
  setupRoom("Look beyond what you can see", "Some answers are not hidden. They are simply farther away.", [
    "There is more than the first screen.",
    "Travel toward the bottom of the page.",
    "Scroll down and press the green button."
  ]);
  const trail = document.createElement("div");
  trail.className = "scroll-trail";
  trail.innerHTML = "<p>keep going</p><p>pages have edges</p><p>almost there</p>";
  const button = createButton("Continue");
  button.addEventListener("click", () => completeRoom("You found the bottom."));
  trail.append(button);
  stage.append(trail);
}

function room3() {
  setupRoom("Choose carefully", "Three buttons wait. The quiet one between danger and safety opens the way.", [
    "Pay attention to position, not color.",
    "The answer is between the other two.",
    "Press the middle button."
  ]);
  const box = document.createElement("div");
  box.className = "three";
  [["DANGER", "red", false], ["…", "alt", true], ["SAFE", "", false]].forEach(([text, kind, correct]) => {
    const button = createButton(text, kind);
    button.addEventListener("click", () => correct
      ? completeRoom("Quiet choices still make noise.")
      : showFeedback("That button was louder than it was useful."));
    box.append(button);
  });
  stage.append(box);
}

function room4() {
  setupRoom("Fine adjustment", "Begin at nothing. Stop halfway to fifty.", [
    "The control runs from 0 to 100.",
    "Halfway to fifty is less than fifty.",
    "Move the slider to 25."
  ]);
  stage.innerHTML = '<div class="slider"><output>0</output><input type="range" min="0" max="100" value="0" aria-label="Number from zero to one hundred"><button class="button">Lock it in</button></div>';
  const input = stage.querySelector("input");
  const output = stage.querySelector("output");
  input.addEventListener("input", () => output.value = input.value);
  stage.querySelector("button").addEventListener("click", () => {
    Number(input.value) === 25
      ? completeRoom("Exactly a quarter of the way.")
      : showFeedback(`${input.value} does not satisfy the clue.`);
  });
}

function room5() {
  setupRoom("Put things in order", "The instruction has been broken apart. Rebuild it.", [
    "Choose the words to form a command.",
    "The command begins with an action.",
    "Choose TURN, OFF, THE, LIGHTS."
  ]);
  const chosen = [];
  const bank = document.createElement("div");
  const answer = document.createElement("div");
  bank.className = "words";
  answer.className = "answer";
  answer.textContent = "Choose words in order";
  ["LIGHTS", "TURN", "THE", "OFF"].forEach((word) => {
    const button = createButton(word, "word");
    button.addEventListener("click", () => {
      chosen.push(word);
      button.disabled = true;
      answer.textContent = chosen.join(" ");
      if (chosen.join(" ") === "TURN OFF THE LIGHTS") completeRoom("Instruction accepted.");
      else if (chosen.length === 4) {
        showFeedback("That sentence does not make sense. Try again.");
        window.setTimeout(room5, 650);
      }
    });
    bank.append(button);
  });
  stage.append(bank, answer);
}

function room6() {
  setupRoom("A different light", "The last instruction was not merely a phrase.", [
    "This room has a light switch.",
    "Some writing is easier to see in darkness.",
    "Turn off the lights, then press the revealed button."
  ]);
  const label = document.createElement("label");
  label.className = "switch";
  label.innerHTML = '<input type="checkbox"><i aria-hidden="true"></i><strong>Lights</strong>';
  const secret = createButton("I appear in the dark", "secret");
  label.querySelector("input").addEventListener("change", (event) => document.body.classList.toggle("dark", event.target.checked));
  secret.addEventListener("click", () => completeRoom("Darkness can reveal as much as light."));
  stage.append(label, secret);
}

function room7() {
  setupRoom("Read between the tabs", "Every story has an order: first, second, third, last.", [
    "Open the tabs in the order named.",
    "A wrong choice resets the sequence.",
    "Choose First, Second, Third, then Last."
  ]);
  const order = [];
  const expected = ["first", "second", "third", "last"];
  const letters = { first: "O", second: "P", third: "E", last: "N" };
  const tabs = document.createElement("div");
  const panel = document.createElement("div");
  tabs.className = "tabs";
  panel.className = "tab-panel";
  panel.textContent = "Choose where the story begins.";
  [["third", "Third"], ["last", "Last"], ["first", "First"], ["second", "Second"]].forEach(([id, text]) => {
    const button = createButton(text, "tab");
    button.addEventListener("click", () => {
      if (id !== expected[order.length]) {
        order.length = 0;
        panel.textContent = "The story lost its place. Begin again.";
        showFeedback("Wrong order. The sequence reset.");
        return;
      }
      order.push(id);
      panel.textContent = order.map((item) => letters[item]).join(" ");
      if (order.length === 4) completeRoom("OPEN. A useful word.");
    });
    tabs.append(button);
  });
  stage.append(tabs, panel);
}

function room8() {
  setupRoom("Find what matters", "Find something with keys that opens no locks.", [
    "Use search to filter the objects.",
    "It has many keys and sits near a computer.",
    "Search for “keyboard”."
  ]);
  const objects = ["Anchor", "Bottle", "Candle", "Compass", "Feather", "Hammer", "Keyboard", "Lantern", "Mirror", "Notebook", "Pocket watch", "Rope"];
  const input = document.createElement("input");
  const grid = document.createElement("div");
  input.type = "search";
  input.placeholder = "Search the collection…";
  input.setAttribute("aria-label", "Search the collection");
  grid.className = "objects";
  const draw = () => {
    const query = input.value.trim().toLowerCase();
    grid.replaceChildren();
    objects.filter((item) => item.toLowerCase().includes(query)).forEach((item) => {
      const button = document.createElement("button");
      button.className = "object";
      button.textContent = item;
      button.addEventListener("click", () => item === "Keyboard" && query
        ? completeRoom("Keys without locks. Found.")
        : showFeedback(`${item} is not the object described.`));
      grid.append(button);
    });
  };
  input.addEventListener("input", draw);
  stage.append(input, grid);
  draw();
  input.focus();
}

function room9() {
  setupRoom("Everything has its place", "Face east. Leave only the moon. Make the warning safe.", [
    "Each sentence controls one panel.",
    "Choose East, Moon only, and Safe.",
    "Direction: East. Object: Moon only. Status: Safe."
  ]);
  stage.innerHTML = '<div class="control"><label>Direction<select><option>North</option><option>South</option><option>East</option><option>West</option></select></label><fieldset><legend>Visible objects</legend><label><input type="checkbox" value="sun" checked> Sun</label><label><input type="checkbox" value="moon"> Moon</label><label><input type="checkbox" value="stars" checked> Stars</label></fieldset><fieldset><legend>Warning status</legend><label><input type="radio" name="status" value="danger" checked> Danger</label><label><input type="radio" name="status" value="safe"> Safe</label></fieldset></div>';
  const check = () => {
    const objects = [...stage.querySelectorAll('[type="checkbox"]:checked')].map((input) => input.value);
    const status = stage.querySelector('[name="status"]:checked').value;
    if (stage.querySelector("select").value === "East" && objects.join() === "moon" && status === "safe") {
      completeRoom("The room settles into place.");
    }
  };
  stage.querySelectorAll("input, select").forEach((control) => control.addEventListener("change", check));
}

function room10() {
  setupRoom("The whole page", "Remember the rooms. Then tell the page what opened every one.", [
    "Every interaction happened in the same place.",
    "The completed memories point to the page itself.",
    "Enter: THE PAGE WAS THE KEY."
  ]);
  stage.innerHTML = '<div class="memories"><p>A friendly word began the <span>conversation</span>.</p><p>The bottom was found by <span>scrolling</span>.</p><p>Darkness revealed what light <span>hid</span>.</p><p>Order turned fragments into <span>meaning</span>.</p></div><form class="final"><label for="answer">What was the key?</label><div class="row"><input id="answer" autocomplete="off" placeholder="Enter the final phrase"><button class="button">Escape</button></div></form>';
  stage.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    normalize($("#answer").value).replace(/[^a-z0-9]/g, "") === "thepagewasthekey"
      ? completeRoom("The lock gives way.")
      : showFeedback("That is not what all ten rooms had in common.");
  });
}

function victory() {
  setupRoom("You escaped.", "At first, this page had nothing to say. You taught it how to speak.", []);
  const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
  stage.innerHTML = `<div class="victory"><div class="check">✓</div><p>You completed HTTPscape in about <strong>${minutes} minute${minutes === 1 ? "" : "s"}</strong> and used <strong>${state.hints} hint${state.hints === 1 ? "" : "s"}</strong>.</p><button class="button">Play again</button></div>`;
  stage.querySelector("button").addEventListener("click", resetGame);
}

const rooms = [room1, room2, room3, room4, room5, room6, room7, room8, room9, room10, victory];
const render = () => rooms[state.room - 1]();

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  state = { room: 1, started: Date.now(), hints: 0 };
  save();
  $("#reset-box").close();
  render();
}

$("#hint").addEventListener("click", () => {
  hintIndex = 0;
  $("#hint-text").textContent = roomHints[0];
  $("#more-hint").hidden = roomHints.length < 2;
  $("#hint-box").showModal();
  state.hints += 1;
  save();
});
$("#more-hint").addEventListener("click", () => {
  hintIndex = Math.min(hintIndex + 1, roomHints.length - 1);
  $("#hint-text").textContent = roomHints[hintIndex];
  $("#more-hint").hidden = hintIndex === roomHints.length - 1;
});
$("#close-hint").addEventListener("click", () => $("#hint-box").close());
$("#reset").addEventListener("click", () => $("#reset-box").showModal());
$("#cancel-reset").addEventListener("click", () => $("#reset-box").close());
$("#confirm-reset").addEventListener("click", resetGame);

render();
