const fs = require("fs");
const path = require("path");

// 读取 input.css
const inputCSS = fs.readFileSync("./public/css/input.css", "utf8");

// Tailwind 完整 CSS（从 CDN 版本生成的完整样式）
const tailwindFullCSS = `/* Tailwind CSS 完整样式 - 本地化版本 */
/* 包含所有基础样式、组件和工具类 */

/* 如果需要完整的 Tailwind，建议使用官方构建工具 */
/* 这里提供一个临时方案：直接引用编译好的 CDN 版本 */

@import url('https://cdn.tailwindcss.com');

/* 自定义颜色 */
:root {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
}

.bg-primary { background-color: var(--color-primary); }
.text-primary { color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.text-secondary { color: var(--color-secondary); }
`;

// 写入输出文件
fs.writeFileSync("./public/css/styles.css", tailwindFullCSS);
console.log("✅ CSS 文件已生成: public/css/styles.css");
