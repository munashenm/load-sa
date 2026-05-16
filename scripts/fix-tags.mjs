import fs from "fs";

const files = process.argv.slice(2);
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replaceAll("<motion", "<div");
  content = content.replaceAll("</motion>", "</div>");
  fs.writeFileSync(file, content);
  console.log("fixed", file);
}
