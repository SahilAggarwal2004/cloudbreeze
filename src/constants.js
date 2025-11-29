const accounts = [
  { username: "dd04ac99db2364f5ca8099ff", credential: "anUIE98Lhv76fqoa" },
  { username: "ac225820ee7ebeab86dfa3f6", credential: "+U3jTgFpmEvq7ZOM" },
  { username: "de634c5368a4108018a3592d", credential: "HAvcyZqALRzC7EFG" },
];

export const sizes = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }; // In bytes

export const chunkSize = 64 * sizes.KB;

export const cloudLimitMB = 100;

export const cloudLimit = cloudLimitMB * sizes.MB;

export const fetchHistory = ["/account", "/account/history"];

export const hideNavbar = ["/_error", "/account/confirm/[token]"];

export const maxBufferSize = 4 * chunkSize;

export const onlyGuest = ["/account/signup", "/account/login", "/account/forgot"];

export const options = { upload: "Uploaded", transfer: "Transferred", download: "Downloaded" };

export const peerOptions = {
  host: "cloudbreeze-peer.onrender.com",
  secure: true,
  pingInterval: 5000,
  config: {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.relay.metered.ca:80"] }].concat(
      accounts.map((account) => ({
        urls: ["turn:standard.relay.metered.ca:80", "turn:standard.relay.metered.ca:80?transport=tcp", "turn:standard.relay.metered.ca:443", "turns:standard.relay.metered.ca:443?transport=tcp"],
        ...account,
      })),
    ),
  },
};

export const showModal = ["/account", "/account/history", "/file/download", "/p2p"];

export const regex = /^cloudbreeze_.*\.zip$/;

const transferLimitGB = 2;

export const transferLimit = transferLimitGB * sizes.GB;

export const types = ["normal", "premium"];

export const unavailable = Object.keys(options).concat("error");
