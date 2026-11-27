// Grava ícone e informações de versão no executável do Windows sem precisar do Wine (rcedit).
// Uso: node desktop/windows/patch-exe.js "dist/win-unpacked/Masmorra do Deploy.exe"
const ResEdit = require("resedit");
const fs = require("fs"), path = require("path");
const pkg = require("../../package.json");

const exePath = process.argv[2];
const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
const res = ResEdit.NtExecutableResource.from(exe);

const ico = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, "icon.ico")));
const grupos = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
const grupoId = grupos.length ? grupos[0].id : 1;
const lang = grupos.length ? grupos[0].lang : 1033;
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, grupoId, lang, ico.icons.map((i) => i.data));

const [v] = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
const [ma, mi, pa] = pkg.version.split(".").map(Number);
v.setFileVersion(ma, mi, pa, 0, lang);
v.setProductVersion(ma, mi, pa, 0, lang);
const strings = {
  FileDescription: pkg.productName,
  ProductName: pkg.productName,
  CompanyName: pkg.author.name,
  LegalCopyright: pkg.build.copyright,
  InternalName: pkg.productName,
  OriginalFilename: `${pkg.productName}.exe`,
  FileVersion: pkg.version,
  ProductVersion: pkg.version
};
for (const t of v.getAllLanguagesForStringValues()) v.setStringValues(t, strings);
v.outputToResourceEntries(res.entries);

res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
console.log("exe atualizado:", exePath, "| versão", pkg.version);
