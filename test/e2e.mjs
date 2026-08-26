import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

const browserPath = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = await mkdtemp(join(tmpdir(), "httpscape-e2e-"));
const port = 9333;
const browser = spawn(browserPath, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  new URL("../index.html", import.meta.url).href
], { stdio: "ignore" });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let target;
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
    target = pages.find((page) => page.type === "page");
    if (target) break;
  } catch {}
  await delay(100);
}
if (!target) throw new Error("Headless browser did not start.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
});

function command(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function solve(expression, expectedRoom) {
  await evaluate(expression);
  await delay(1700);
  const room = await evaluate("JSON.parse(localStorage.getItem('httpscape-progress-v3')).step");
  if (room !== expectedRoom) throw new Error(`Expected step ${expectedRoom}, received ${room}.`);
}

await command("Runtime.enable");
await delay(300);
await solve("const f=document.querySelector('.entry');f.querySelector('input').value='hello';f.requestSubmit()", 2);
await solve("document.querySelector('.green-button').click()", 3);
await solve("new Promise(resolve=>{const b=document.querySelector('.more-button');b.dispatchEvent(new PointerEvent('pointerdown'));setTimeout(()=>{b.dispatchEvent(new PointerEvent('pointerup'));resolve()},2000)})", 4);
await solve("document.querySelector('.side-menu [data-count=\"15\"]').click()", 5);
await solve("for(const order of [0,1,2])document.querySelector('.correction-word[data-order=\"'+order+'\"]').click()", 6);
await solve("const searchForm=document.querySelector('.site-search');searchForm.querySelector('input').value='umbrella';searchForm.requestSubmit()", 7);
await solve("document.querySelector('.result-card[data-result=\"2\"]').click()", 8);
await solve("const ad=document.querySelector('.movable-ad');ad.classList.add('moved');document.querySelector('.forecast-link').click()", 9);
await solve("document.querySelector('.theme-switch input').click();document.querySelector('.night-window span').click()", 10);
await solve("document.querySelector('.sort-button').click();document.querySelector('.brand').click()", 11);

const ending = await evaluate("document.querySelector('.finished').textContent");
if (!ending.includes("You may go")) throw new Error(`Unexpected ending: ${ending}`);
console.log("Passed: the complete publication puzzle sequence in headless Edge.");
await command("Browser.close");
socket.close();
browser.kill();
