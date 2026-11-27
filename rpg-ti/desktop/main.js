"use strict";

const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/* ================= contas locais =================
 * As contas ficam em <userData>/contas.json, só neste computador.
 * Senhas nunca são gravadas: guardamos sal + hash scrypt.
 */
const NOME_RE = /^[\p{L}\p{N}._-]{3,20}$/u;
const SENHA_MIN = 6;
const HIST_MAX = 20;

const dataFile = () => path.join(app.getPath("userData"), "contas.json");

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(dataFile(), "utf8"));
    if (d && typeof d === "object" && d.users) return d;
  } catch (e) { /* primeiro uso ou arquivo ilegível */ }
  return { version: 1, users: {}, session: null };
}

function save(d) {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
}

const hashSenha = (senha, salt) =>
  crypto.scryptSync(senha, Buffer.from(salt, "hex"), 64, { N: 16384, r: 8, p: 1 }).toString("hex");

function confere(senha, u) {
  const a = Buffer.from(hashSenha(senha, u.salt), "hex");
  const b = Buffer.from(u.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const publico = (u) => u && ({ name: u.name, best: u.best, games: u.games, wins: u.wins, history: u.history, createdAt: u.createdAt });
const chave = (nome) => String(nome || "").trim().toLowerCase();
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

let atual = null; // chave do usuário logado

function validar(nome, senha) {
  if (typeof nome !== "string" || !NOME_RE.test(nome.trim()))
    return "O nome de usuário precisa ter de 3 a 20 caracteres: letras, números, ponto, hífen ou sublinhado.";
  if (typeof senha !== "string" || senha.length < SENHA_MIN)
    return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > 200) return "A senha é longa demais.";
  return null;
}

const api = {
  async register({ name, password, remember }) {
    const erro = validar(name, password);
    if (erro) return { ok: false, error: erro };
    const d = load();
    const k = chave(name);
    if (d.users[k]) return { ok: false, error: "Já existe uma conta com esse nome neste computador." };
    const salt = crypto.randomBytes(16).toString("hex");
    d.users[k] = { name: name.trim(), salt, hash: hashSenha(password, salt), createdAt: new Date().toISOString(), best: 0, games: 0, wins: 0, history: [] };
    d.session = remember ? k : null;
    save(d);
    atual = k;
    return { ok: true, user: publico(d.users[k]) };
  },

  async login({ name, password, remember }) {
    const d = load();
    const u = d.users[chave(name)];
    if (!u || typeof password !== "string" || !confere(password, u)) {
      await espera(600); // atrasa tentativas em sequência
      return { ok: false, error: "Usuário ou senha incorretos." };
    }
    atual = chave(name);
    d.session = remember ? atual : null;
    save(d);
    return { ok: true, user: publico(u) };
  },

  async logout() {
    const d = load();
    d.session = null;
    save(d);
    atual = null;
    return { ok: true };
  },

  async current() {
    if (!atual) {
      const d = load();
      if (d.session && d.users[d.session]) atual = d.session;
    }
    const d = load();
    return { ok: true, user: atual ? publico(d.users[atual]) : null };
  },

  async saveResult(r) {
    if (!atual) return { ok: false, error: "Entre na sua conta para salvar o resultado." };
    const d = load();
    const u = d.users[atual];
    if (!u) return { ok: false, error: "Conta não encontrada." };
    const score = Math.max(0, Math.floor(Number(r && r.score) || 0));
    const nivel = Math.max(-1, Math.min(3, Math.floor(Number(r && r.cleared))));
    const vitoria = !!(r && r.win);
    const novoRecorde = score > u.best;
    u.games += 1;
    if (vitoria) u.wins += 1;
    if (novoRecorde) u.best = score;
    u.history.unshift({ score, cleared: Number.isFinite(nivel) ? nivel : -1, win: vitoria, cls: String((r && r.cls) || "").slice(0, 10), date: new Date().toISOString() });
    u.history = u.history.slice(0, HIST_MAX);
    save(d);
    return { ok: true, user: publico(u), newBest: novoRecorde };
  },

  async ranking() {
    const d = load();
    const lista = Object.values(d.users)
      .filter((u) => u.games > 0)
      .sort((a, b) => b.best - a.best)
      .slice(0, 5)
      .map((u) => ({ name: u.name, best: u.best, wins: u.wins }));
    return { ok: true, ranking: lista };
  }
};

for (const [nome, fn] of Object.entries(api)) {
  ipcMain.handle(`auth:${nome}`, async (_e, arg) => {
    try { return await fn(arg || {}); }
    catch (err) { return { ok: false, error: "Não foi possível acessar os dados das contas neste computador." }; }
  });
}

/* ================= janela ================= */
const RAIZ = path.join(__dirname, "..");

function criarJanela() {
  const win = new BrowserWindow({
    width: 1200,
    height: 880,
    minWidth: 420,
    minHeight: 600,
    backgroundColor: "#0e131b",
    title: "Masmorra do Deploy",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  const fontes = fs.readFileSync(path.join(__dirname, "fonts", "fonts.css"), "utf8");
  win.webContents.on("dom-ready", () => { win.webContents.insertCSS(fontes); });

  // links externos abrem no navegador; a janela do jogo nunca navega para fora
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) { e.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); }
  });

  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(RAIZ, "index.html"));
  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [w] = BrowserWindow.getAllWindows();
    if (w) { if (w.isMinimized()) w.restore(); w.focus(); }
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    criarJanela();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) criarJanela(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
