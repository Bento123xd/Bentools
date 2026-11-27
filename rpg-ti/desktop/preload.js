"use strict";

const { contextBridge, ipcRenderer } = require("electron");

const chamar = (nome) => (arg) => ipcRenderer.invoke(`auth:${nome}`, arg);

contextBridge.exposeInMainWorld("masmorraDesktop", {
  kind: "desktop",
  platform: process.platform,
  register: chamar("register"),
  login: chamar("login"),
  logout: chamar("logout"),
  current: chamar("current"),
  saveResult: chamar("saveResult"),
  ranking: chamar("ranking")
});
