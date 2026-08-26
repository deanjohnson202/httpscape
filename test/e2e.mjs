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
  await delay(950);
  const room = await evaluate("JSON.parse(localStorage.getItem('httpscape-progress-v1')).room");
  if (room !== expectedRoom) throw new Error(`Expected room ${expectedRoom}, received ${room}.`);
}

await command("Runtime.enable");
await delay(300);
await solve("document.querySelector('#greeting').value='hello';document.querySelector('#stage form').requestSubmit()", 2);
await solve("document.querySelector('#stage button').click()", 3);
await solve("document.querySelectorAll('#stage button')[1].click()", 4);
await solve("document.querySelector('#stage input').value=25;document.querySelector('#stage button').click()", 5);
await solve("for(const word of ['TURN','OFF','THE','LIGHTS'])[...document.querySelectorAll('#stage button')].find(b=>b.textContent===word).click()", 6);
await solve("document.querySelector('#stage input').click();document.querySelector('.secret').click()", 7);
await solve("for(const word of ['First','Second','Third','Last'])[...document.querySelectorAll('#stage button')].find(b=>b.textContent===word).click()", 8);
await solve("const i=document.querySelector('#stage input');i.value='keyboard';i.dispatchEvent(new Event('input'));[...document.querySelectorAll('.object')].find(b=>b.textContent==='Keyboard').click()", 9);
await solve("const s=document.querySelector('#stage select');s.value='East';for(const c of document.querySelectorAll('[type=checkbox]'))c.checked=c.value==='moon';document.querySelector('[value=safe]').checked=true;s.dispatchEvent(new Event('change'))", 10);
await solve("document.querySelector('#answer').value='the page was the key';document.querySelector('#stage form').requestSubmit()", 11);

const title = await evaluate("document.querySelector('#title').textContent");
if (title !== "You escaped.") throw new Error(`Unexpected final title: ${title}`);
console.log("Passed: all 10 rooms completed in headless Edge.");
await command("Browser.close");
socket.close();
browser.kill();
