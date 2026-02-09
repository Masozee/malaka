"use strict";
const electron = require("electron");
const api = {
  getAppVersion: () => process.env.npm_package_version || "1.0.0",
  getPlatform: () => process.platform
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.api = api;
}
