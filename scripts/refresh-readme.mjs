import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const readmeUrl = new URL('../README.md', import.meta.url)
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const readme = await readFile(readmeUrl, 'utf8')
const statusCode = await readFile(new URL('../status.js', import.meta.url), 'utf8')

const sites = [...html.matchAll(/\['([^']+)','(https:\/\/[^']+)',(\d+),(\d+)\]/g)].map(([, name, url, category]) => ({ name, url, category: Number(category) }))
const iconMap = JSON.parse(statusCode.match(/window\.SITE_ICONS=(\{.*?\});/s)?.[1] || '{}')
const purposes = new Map()
const experiences = new Map()

for (const line of readme.split('\n')) {
  const row = line.match(/^\|(?:\s*<img[^>]*>\s*\|)?\s*\[([^\]]+)\]\((https:\/\/[^)]+)\)\s*\|\s*([^|]+?)\s*\|(?:\s*([^|]+?)\s*\|)?/)
  if (!row) continue
  purposes.set(row[2].replace(/\/$/, ''), row[3].trim())
  if (row[4] && !/^(免费|免费增值|付费)$/.test(row[4].trim())) experiences.set(row[2].replace(/\/$/, ''), row[4].trim())
}

const star = new Set(['Once Email','ChatGPT','Claude','Gemini','Perplexity','DeepSeek','GitHub','MDN Web Docs','Figma','Notion','Wikipedia','Internet Archive','Project Gutenberg','Google','DuckDuckGo','Wolfram Alpha','Google Scholar','AlternativeTo','Unsplash','Photopea','OBS Studio','Have I Been Pwned','Bitwarden','VirusTotal','Privacy Guides','Brave','VS Code','Linux','Blender','VLC','IMDb','TMDB','JustWatch Movies','Steam','GOG','VNDB','GitHub Copilot','Cursor','Runway','NotebookLM','Microsoft Qlib','LEAN','VeighNa','AKShare'])
const niche = new Set(['Character.AI','Coze','Meta AI','Tabnine','Blackbox AI','Midjourney','Leonardo.Ai','Pika','Cobalt','Privnote','trace.moe','MUBI','TVmaze','Backloggd','JAST USA','MangaGamer','DLsite','Sekai Project'])
const paid = new Set(['MUBI','Netflix','Disney+','Prime Video','Apple TV+','JAST USA','MangaGamer','DLsite','Sekai Project','Midjourney'])
const freemium = new Set(['ChatGPT','Claude','Gemini','Perplexity','Hugging Face','Vercel','Cloudflare','Figma','Canva','Notion','Trello','Todoist','Google Drive','Calendly','Coursera','edX','Remove.bg','Descript','Bitwarden','GitHub','Letterboxd','Trakt','Steam','GOG','Cleanup.pictures','TinyWow','Flightradar24','Doubao','Kimi','Tencent Yuanbao','Grok','Poe','Character.AI','Qwen','Coze','Mistral Le Chat','Meta AI','GitHub Copilot','Cursor','Windsurf','Replit','Tabnine','v0','Lovable','Bolt','Phind','Blackbox AI','Adobe Firefly','Ideogram','Leonardo.Ai','Runway','Pika','ElevenLabs','Suno','NotebookLM','Gamma','The Block'])
const categories = ['','🤖 AI 助手','💻 开发','🎨 设计','⚡ 效率','📚 学习','🔎 搜索','✨ 创作','🛡️ 隐私与安全','🧩 开源项目','🎬 电影','📺 电视剧','🎮 游戏','📈 量化金融','🛰️ 加密资讯与多源核验']
const categoryIds = ['','ai','development','design','productivity','learning','search','creation','privacy','open-source','movies','tv','games','quant','crypto-news']
const fallbackPurpose = ['','智能对话、创作或辅助决策','代码、文档与部署','视觉设计与灵感','任务与协作效率','学习、查证与研究','查找可靠信息','文字、图片、音视频创作','隐私与安全工具','开放源码工具与项目','电影资料与正规观看信息','剧集发现与进度管理','游戏购买、资料与记录','金融数据、研究、回测与风险分析','专业媒体与二手信源交叉核验']

function normalized(url) { return url.replace(/\/$/, '') }
function purpose(site) { return purposes.get(normalized(site.url)) || fallbackPurpose[site.category] }
function experience(site) { return experiences.get(normalized(site.url)) || (star.has(site.name) ? '⭐ 成熟稳定，适合长期使用' : niche.has(site.name) ? '🎯 适合特定场景，先确认限制' : '👍 上手顺畅，值得按需尝试') }
function price(site) { return paid.has(site.name) ? '💳 付费' : freemium.has(site.name) ? '🟢 免费增值' : '🆓 免费' }
function icon(site) { const src = iconMap[site.url]; return src ? `<img src="${src}" width="24" height="24" alt="${site.name} 图标">` : '🌐' }
function row(site) { return `| ${icon(site)} | [${site.name}](${site.url}) | ${purpose(site)} | ${experience(site)} | ${price(site)} |` }
function table(rows) { return ['| 图标 | 网站 | 主要用途 | 使用体验 | 是否收费 |','| :---: | --- | --- | --- | :---: |',...rows.map(row)].join('\n') }

const sections = []
sections.push('## 🧭 精选网站')
sections.push('每条记录都提供本地图标、主要用途、实际使用体验和收费类型。点击分类即可展开；价格仅用于快速判断，服务商可能调整方案，请以官方网站为准。')
sections.push(`### 📚 分类导航

| | | | |
| --- | --- | --- | --- |
| [🤖 AI 助手](#ai) | [💻 开发](#development) | [🎨 设计](#design) | [⚡ 效率](#productivity) |
| [📚 学习](#learning) | [🔎 搜索](#search) | [✨ 创作](#creation) | [🛡️ 隐私安全](#privacy) |
| [🧩 开源项目](#open-source) | [🎬 电影](#movies) | [📺 电视剧](#tv) | [🎮 游戏](#games) |
| [📈 量化金融](#quant) | [🛰️ 加密资讯](#crypto-news) | [👤 作者](#-作者与项目) | [🤝 参与贡献](#参与贡献) |`)

for (let category = 1; category < categories.length; category++) {
  const rows = sites.filter(site => site.category === category)
  if (!rows.length) continue
  const block = [`<a id="${categoryIds[category]}"></a>`,`<details>`,`<summary><strong>${categories[category]} · ${rows.length} 个</strong></summary>`,'',table(rows)]
  if (category === 13) block.push('','> 📌 这些项目用于数据研究、策略验证和风险分析，不构成投资建议。回测结果不代表未来收益。')
  if (category === 14) block.push('','> 🔀 可在网页点击“多源核验”筛出四家媒体。它们属于专业媒体或二手信源，重要消息仍应回查原始资料。')
  block.push('','</details>')
  sections.push(block.join('\n'))
}

const start = readme.includes('## ⭐ 本站特别推荐') ? readme.indexOf('## ⭐ 本站特别推荐') : readme.indexOf('## 🧭 精选网站')
const end = readme.indexOf('## 使用')
if (start < 0 || end < 0 || end <= start) throw new Error('README content markers not found')
let output = `${readme.slice(0, start)}${sections.join('\n\n')}\n\n${readme.slice(end)}`
output = output.replace(/## ✨ 使用体验\n[\s\S]*?(?=## 🧭 精选网站)/, '')
output = output.replace(/\n## 特殊网站收录\n[\s\S]*?(?=\n## 项目元数据)/, '')
output = output.replace(/\n## 设计说明\n[\s\S]*$/, '\n')
if (!output.includes('## 👤 作者与项目')) output = output.replace(/\n## 参与贡献/, '\n## 👤 作者与项目\n\n- 作者：[pangxin12345](https://github.com/pangxin12345)\n- 作者网站：[Once Email](https://once-email.com)\n- 项目用途：临时接收电子邮件验证码和确认链接，并隔离已获授权的邮件流程测试\n- 开源导航：[Open Web Atlas](https://github.com/pangxin12345/open-web-atlas)\n\n## 参与贡献')
await writeFile(readmeUrl, `${output.trimEnd()}\n`)
console.log(`README refreshed with ${sites.length} website rows.`)
