import fs from "fs";
import withSerwistInit from "@serwist/next";
import packageJSON from "./package.json" with { type: "json" };

const pages = ["/", "/account", "/account/forgot", "/account/history", "/account/login", "/account/signup", "/file/upload", "/file/download", "/p2p", "/_offline"];
const images = ["account.webp", "upload.webp", "download.webp", "p2p.webp", "arrow.png", "logo.webp"].map((image) => `/images/${image}`);
const revision = Date.now().toString();

const withPWA = withSerwistInit({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  exclude: [/public\/sw.js/, /dynamic-css-manifest.json/],
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
  additionalPrecacheEntries: pages.concat(images).map((url) => ({ url, revision })),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
};

const manifestPath = "./public/manifest.json";

const updateManifestVersion = () => {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.version = packageJSON.version;
    manifest.id = packageJSON.version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`✅ Manifest version updated to ${packageJSON.version}`);
  } else {
    console.warn("⚠️  manifest.json not found!");
  }
};

updateManifestVersion();

export default withPWA(nextConfig);
