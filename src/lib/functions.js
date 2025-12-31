import { wait } from "utility-kit";
import { toast } from "react-toastify";
import { sizes } from "../constants";

const { KB, MB } = sizes;
const production = process.env.NODE_ENV === "production";

export const round = (number, digits = 2) => (digits ? number.toFixed(digits) : Math.floor(number));

export const getUploadUrl = (mode, server) => (production ? `https://cloudbreeze-${mode === "save" ? "upload" : mode}-${server}.onrender.com` : mode === "save" ? "http://localhost:5002" : "") + "/file/upload";

export const getDownloadUrl = (fileId, mode, server) => (server && production ? `https://cloudbreeze-transfer-${server}.onrender.com` : "") + `/file/get/${fileId}` + `?mode=${mode}`;

export const getDeleteUrl = (fileId, server) => (server && production ? `https://cloudbreeze-transfer-${server}.onrender.com` : "") + `/file/delete/${fileId}`;

export const bytesToUnit = (bytes) => (bytes >= MB ? "MB" : bytes >= KB ? "KB" : "B");

export const bytesToSize = (bytes, max, unitSize) => round(bytes / unitSize, bytes === max ? 2 : 0);

export const bytesToFraction = (bytes, max, unitSize) => `${bytesToSize(bytes, max, unitSize)} / ${round(max / unitSize)}`;

export const speed = (bytes, unitSize, startTime = 0) => round((bytes * 1000) / (unitSize * (Date.now() - startTime || 1)));

export function relativeTime(minutes) {
  let result = "";
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const displayHours = hours % 24;
  const displayMinutes = minutes % 60;
  if (days) result += days + " day(s)";
  if (days && displayHours) result += ", ";
  if (displayHours) result += displayHours + " hours(s)";
  return hours ? result : displayMinutes ? displayMinutes + " minute(s)" : "Less than a minute";
}

export function remove(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) arr.splice(index, 1);
}

export function verifyUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === window.location.origin ? { verified: true, pathname: url.pathname } : { verified: false, error: "Please enter a valid URL!" };
  } catch {
    return { verified: false };
  }
}

export function generateId(value, type) {
  const { verified, error } = verifyUrl(value);
  if (verified) return value.split(`${type}/`)[1];
  if (!error) return value;
  toast.warning(error);
}

export function fileDetails(files) {
  const length = files.length,
    names = [],
    sizes = [];
  let totalSize = 0;
  for (let i = 0; i < length; i++) {
    const { name, size } = files[i];
    names.push(name);
    sizes.push(size);
    totalSize += size;
  }
  return { length, names, sizes, totalSize };
}

export async function resolvePromises(promises) {
  try {
    const data = await Promise.allSettled(promises);
    return data.map(({ value }) => value);
  } catch {}
}

export async function download(source, name) {
  if (source instanceof Blob) {
    var url = URL.createObjectURL(source);
    var shouldRevoke = true;
  } else url = source;

  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();

  if (shouldRevoke) URL.revokeObjectURL(url);
  await wait(100);
}

export async function fetchResource(src, type, signal) {
  const res = await fetch(src, { signal });
  if (!res.ok) throw new Error();
  return res[type]();
}
