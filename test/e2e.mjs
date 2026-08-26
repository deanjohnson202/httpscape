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
  const room = await evaluate("JSON.parse(localStorage.getItem('httpscape-progress-v2')).step");
  if (room !== expectedRoom) throw new Error(`Expected step ${expectedRoom}, received ${room}.`);
}

await command("Runtime.enable");
await delay(300);
await solve("const f=document.querySelector('.entry');f.querySelector('input').value='hello';f.requestSubmit()", 2);
await solve("document.querySelector('.green-button').click()", 3);
await solve("new Promise(resolve=>{const b=document.querySelector('.hold-button');b.dispatchEvent(new PointerEvent('pointerdown'));setTimeout(()=>{b.dispatchEvent(new PointerEvent('pointerup'));resolve()},2400)})", 4);
await delay(2800);
await solve("for(const i of [2,0,3,1])document.querySelectorAll('.light')[i].click()", 5);
await solve("for(const word of ['TURN','OUT','THE','LIGHTS'])[...document.querySelectorAll('.word')].find(b=>b.textContent===word).click()", 6);
await solve("document.querySelector('.switch input').click()", 7);
await solve("document.querySelector('.star.odd').click()", 8);
await solve("const slider=document.querySelector('.balance input');slider.value=68;slider.dispatchEvent(new Event('input'))", 9);
await solve("const search=document.querySelector('.collection input');search.value='keyboard';search.dispatchEvent(new Event('input'));[...document.querySelectorAll('.object')].find(b=>b.textContent==='keyboard').click()", 10);
await solve("const finalForm=document.querySelector('.last-form');finalForm.querySelector('input').value='page';finalForm.requestSubmit()", 11);

const ending = await evaluate("document.querySelector('.end').textContent");
if (!ending.includes("The page was")) throw new Error(`Unexpected ending: ${ending}`);
console.log("Passed: the complete evolving-page sequence in headless Edge.");
await command("Browser.close");
socket.close();
browser.kill();
