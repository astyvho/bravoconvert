// next build 직후 실행된다 (package.json 의 postbuild).
// 루트 레이아웃이 (en)·(ko) 로 나뉘어 Next 의 기본 404.html 에는 사이트 틀이 없으므로,
// 사이트 레이아웃으로 렌더한 /page-not-found/ 를 Cloudflare Pages 가 쓰는 404.html 로 바꿔 넣는다.
import { cpSync, existsSync, rmSync } from "node:fs";

const source = "out/page-not-found/index.html";
if (!existsSync(source)) {
  console.error(`copy-404: ${source} not found — did next build run with output: 'export'?`);
  process.exit(1);
}
cpSync(source, "out/404.html");
if (existsSync("out/404/index.html")) cpSync(source, "out/404/index.html");
rmSync("out/page-not-found", { recursive: true, force: true });
rmSync("out/page-not-found.txt", { force: true });
console.log("copy-404: out/404.html now uses the site layout");
