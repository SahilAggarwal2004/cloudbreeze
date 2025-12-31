import { getStorage, setStorage } from "./storage";

async function getLatestVersion() {
  try {
    const res = await fetch("/manifest.json");
    const { version } = await res.json();
    return version;
  } catch {}
}

export async function handleVersionUpdate() {
  const newVersion = await getLatestVersion();
  const oldVersion = getStorage("version", newVersion);
  if (newVersion && oldVersion !== newVersion) {
    setStorage("version", newVersion);
    if (newVersion.split(".")[0] > oldVersion.split(".")[0]) {
      alert("Hey! We've made some big changes. Reloading now to keep things smooth!");
      window.location.reload();
    } else if (confirm("New update available! Want to refresh now?")) {
      window.location.reload();
    }
  }
}