import { getStorage, setStorage } from "./storage";

const parseVersion = (v) => v.split(".").map(Number);

function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);
  let diff = 0;

  for (let i = 0; i < len; i++) {
    diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff) break;
  }

  return diff;
}

async function getLatestVersion() {
  try {
    const res = await fetch("/manifest.json");
    const { version } = await res.json();
    return version;
  } catch {}
}

export async function handleVersionUpdate() {
  const newVersion = await getLatestVersion();
  if (!newVersion) return;

  const oldVersion = getStorage("version");
  setStorage("version", newVersion);
  if (!oldVersion) return;

  const diff = compareVersions(newVersion, oldVersion);
  if (!diff) return;

  // downgrade
  if (diff < 0) {
    alert("We rolled back an update. Reloading now.");
    return window.location.reload();
  }

  // major upgrade
  if (parseVersion(newVersion)[0] > parseVersion(oldVersion)[0]) {
    alert("Hey! We've made some big changes. Reloading now!");
    return window.location.reload();
  }

  // minor / patch upgrade
  if (confirm("New update available! Want to refresh now?")) window.location.reload();
}
