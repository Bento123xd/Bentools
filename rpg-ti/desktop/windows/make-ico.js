// Gera desktop/windows/icon.ico (16 a 256 px, entradas PNG) a partir de desktop/icon.png.
// Uso: node desktop/windows/make-ico.js  (precisa do Playwright com Chromium)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const SIZES = [16, 24, 32, 48, 64, 128, 256];
(async () => {
  const src = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "..", "icon.png")).toString("base64");
  const b = await chromium.launch();
  const p = await b.newPage();
  const pngs = await p.evaluate(async ({ src, SIZES }) => {
    const img = new Image(); img.src = src; await img.decode();
    return SIZES.map((s) => {
      const c = document.createElement("canvas"); c.width = c.height = s;
      const ctx = c.getContext("2d"); ctx.imageSmoothingQuality = "high"; ctx.drawImage(img, 0, 0, s, s);
      return c.toDataURL("image/png").split(",")[1];
    });
  }, { src, SIZES });
  await b.close();
  const bufs = pngs.map((b64) => Buffer.from(b64, "base64"));
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(bufs.length, 4);
  let off = 6 + 16 * bufs.length;
  const dir = bufs.map((buf, i) => {
    const e = Buffer.alloc(16), s = SIZES[i];
    e.writeUInt8(s >= 256 ? 0 : s, 0); e.writeUInt8(s >= 256 ? 0 : s, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(off, 12);
    off += buf.length; return e;
  });
  fs.writeFileSync(path.join(__dirname, "icon.ico"), Buffer.concat([head, ...dir, ...bufs]));
  console.log("icon.ico:", SIZES.join(", "));
})();
