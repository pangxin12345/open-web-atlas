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
  const block = [`<a id="${categoryIds[category]}"></a>`,`<details open>`,`<summary><strong>${categories[category]} · ${rows.length} 个</strong></summary>`,'',table(rows)]
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
if (!output.includes('**📖 完整展开版（当前）**')) output = output.replace('## 🧭 精选网站', '## 🧭 精选网站\n\n**📖 完整展开版（当前）** · [📁 查看紧凑目录](docs/COMPACT.md)')
await writeFile(readmeUrl, `${output.trimEnd()}\n`)

const compact = `# 📁 开源星图 · 紧凑目录

[← 返回完整展开版](../README.md) · [🌐 在线打开导航](https://pangxin12345.github.io/open-web-atlas/)

> 130 个网站 · 14 个分类。点击分类进入完整表格，或直接打开在线导航进行搜索和筛选。

${categories.slice(1).map((name,index)=>`- [${name} · ${sites.filter(site=>site.category===index+1).length} 个](../README.md#${categoryIds[index+1]})`).join('\n')}
`
await writeFile(new URL('../docs/COMPACT.md', import.meta.url), compact)

const locales = {
  en:{file:'README.en.md',title:'Open Web Atlas',intro:'130 curated websites across 14 categories. Every row includes a local icon, primary use, practical experience and pricing.',headers:['Icon','Website','Primary use','Experience','Price'],cats:['AI Assistants','Development','Design','Productivity','Learning','Search','Creation','Privacy & Security','Open Source','Movies','TV','Games','Quant Finance','Crypto News'],uses:['AI conversation, creation and assistance','Code, documentation and deployment','Visual design and inspiration','Tasks and collaboration','Learning, verification and research','Finding reliable information','Text, image, audio and video creation','Privacy and security tools','Open-source tools and projects','Film information and legal availability','Series discovery and progress tracking','Game stores, information and tracking','Financial data, research, backtesting and risk','Cross-checking professional secondary sources'],exp:['⭐ Mature and reliable','👍 Smooth and worth trying','🎯 Best for specific needs'],prices:['🆓 Free','🟢 Freemium','💳 Paid']},
  es:{file:'README.es.md',title:'Atlas Web Abierto',intro:'130 sitios seleccionados en 14 categorías, con icono local, uso principal, experiencia y precio.',headers:['Icono','Sitio','Uso principal','Experiencia','Precio'],cats:['Asistentes IA','Desarrollo','Diseño','Productividad','Aprendizaje','Búsqueda','Creación','Privacidad y seguridad','Código abierto','Películas','Series','Juegos','Finanzas cuantitativas','Noticias cripto'],uses:['Conversación, creación y asistencia con IA','Código, documentación y despliegue','Diseño visual e inspiración','Tareas y colaboración','Aprendizaje, verificación e investigación','Encontrar información fiable','Creación de texto, imagen, audio y vídeo','Herramientas de privacidad y seguridad','Herramientas y proyectos abiertos','Información de cine y disponibilidad legal','Descubrir series y seguir el progreso','Tiendas, información y registro de juegos','Datos, investigación, backtesting y riesgo','Contrastar medios profesionales secundarios'],exp:['⭐ Maduro y fiable','👍 Fácil de usar; vale la pena','🎯 Para necesidades específicas'],prices:['🆓 Gratis','🟢 Freemium','💳 De pago']},
  pt:{file:'README.pt-BR.md',title:'Atlas Web Aberto',intro:'130 sites selecionados em 14 categorias, com ícone local, uso principal, experiência e preço.',headers:['Ícone','Site','Uso principal','Experiência','Preço'],cats:['Assistentes de IA','Desenvolvimento','Design','Produtividade','Aprendizado','Busca','Criação','Privacidade e segurança','Código aberto','Filmes','Séries','Jogos','Finanças quantitativas','Notícias cripto'],uses:['Conversa, criação e assistência com IA','Código, documentação e implantação','Design visual e inspiração','Tarefas e colaboração','Aprendizado, verificação e pesquisa','Encontrar informação confiável','Criação de texto, imagem, áudio e vídeo','Ferramentas de privacidade e segurança','Ferramentas e projetos abertos','Informações de filmes e disponibilidade legal','Descoberta de séries e progresso','Lojas, informações e registro de jogos','Dados, pesquisa, backtesting e risco','Comparar fontes profissionais secundárias'],exp:['⭐ Maduro e confiável','👍 Fácil e vale testar','🎯 Para necessidades específicas'],prices:['🆓 Grátis','🟢 Freemium','💳 Pago']},
  de:{file:'README.de.md',title:'Offener Webatlas',intro:'130 kuratierte Websites in 14 Kategorien mit lokalem Symbol, Hauptzweck, Nutzungseindruck und Preis.',headers:['Symbol','Website','Hauptzweck','Nutzung','Preis'],cats:['KI-Assistenten','Entwicklung','Design','Produktivität','Lernen','Suche','Kreation','Datenschutz & Sicherheit','Open Source','Filme','Serien','Spiele','Quantitative Finanzen','Krypto-News'],uses:['KI-Dialog, Kreation und Assistenz','Code, Dokumentation und Bereitstellung','Visuelles Design und Inspiration','Aufgaben und Zusammenarbeit','Lernen, Prüfen und Forschen','Zuverlässige Informationen finden','Text-, Bild-, Audio- und Videoerstellung','Datenschutz- und Sicherheitswerkzeuge','Offene Werkzeuge und Projekte','Filminformationen und legale Angebote','Serien entdecken und Fortschritt verfolgen','Shops, Informationen und Spielelisten','Finanzdaten, Forschung, Backtests und Risiko','Professionelle Sekundärquellen vergleichen'],exp:['⭐ Ausgereift und zuverlässig','👍 Einfach und einen Versuch wert','🎯 Für bestimmte Anforderungen'],prices:['🆓 Kostenlos','🟢 Freemium','💳 Kostenpflichtig']},
  fr:{file:'README.fr.md',title:'Atlas Web Ouvert',intro:'130 sites sélectionnés dans 14 catégories, avec icône locale, usage principal, expérience et prix.',headers:['Icône','Site','Usage principal','Expérience','Prix'],cats:['Assistants IA','Développement','Design','Productivité','Apprentissage','Recherche','Création','Confidentialité et sécurité','Open source','Films','Séries','Jeux','Finance quantitative','Actualités crypto'],uses:['Dialogue, création et assistance IA','Code, documentation et déploiement','Design visuel et inspiration','Tâches et collaboration','Apprentissage, vérification et recherche','Trouver des informations fiables','Création de texte, image, audio et vidéo','Outils de confidentialité et sécurité','Outils et projets ouverts','Informations cinéma et offres légales','Découverte de séries et suivi','Boutiques, informations et suivi des jeux','Données, recherche, backtesting et risque','Recouper des sources professionnelles secondaires'],exp:['⭐ Mature et fiable','👍 Simple et à essayer','🎯 Pour des besoins précis'],prices:['🆓 Gratuit','🟢 Freemium','💳 Payant']},
  ja:{file:'README.ja.md',title:'オープンウェブ地図',intro:'14カテゴリ・130サイトを、ローカルアイコン、主な用途、使用感、料金とともに掲載。',headers:['アイコン','サイト','主な用途','使用感','料金'],cats:['AIアシスタント','開発','デザイン','生産性','学習','検索','制作','プライバシーと安全','オープンソース','映画','テレビ','ゲーム','クオンツ金融','暗号資産ニュース'],uses:['AI対話・制作・支援','コード・文書・デプロイ','視覚デザインと着想','タスクと共同作業','学習・検証・研究','信頼できる情報の検索','文章・画像・音声・動画制作','プライバシーと安全ツール','オープンなツールとプロジェクト','映画情報と正規配信','シリーズ発見と進捗管理','ゲーム購入・情報・記録','金融データ・研究・バックテスト・リスク','専門二次情報の照合'],exp:['⭐ 成熟して信頼できる','👍 使いやすく試す価値あり','🎯 特定用途向け'],prices:['🆓 無料','🟢 フリーミアム','💳 有料']},
  ko:{file:'README.ko.md',title:'오픈 웹 아틀라스',intro:'14개 분류의 130개 사이트를 로컬 아이콘, 주요 용도, 사용 경험, 가격과 함께 제공합니다.',headers:['아이콘','사이트','주요 용도','사용 경험','가격'],cats:['AI 도우미','개발','디자인','생산성','학습','검색','창작','개인정보와 보안','오픈 소스','영화','TV','게임','퀀트 금융','암호화폐 뉴스'],uses:['AI 대화·창작·지원','코드·문서·배포','시각 디자인과 영감','작업과 협업','학습·검증·연구','신뢰할 정보 검색','글·이미지·오디오·영상 제작','개인정보와 보안 도구','오픈 도구와 프로젝트','영화 정보와 합법 시청','시리즈 발견과 진행 관리','게임 상점·정보·기록','금융 데이터·연구·백테스트·위험','전문 2차 출처 교차 확인'],exp:['⭐ 성숙하고 신뢰할 만함','👍 쓰기 쉽고 시도할 만함','🎯 특정 요구에 적합'],prices:['🆓 무료','🟢 부분 유료','💳 유료']},
  id:{file:'README.id.md',title:'Atlas Web Terbuka',intro:'130 situs pilihan dalam 14 kategori, dengan ikon lokal, kegunaan utama, pengalaman, dan harga.',headers:['Ikon','Situs','Kegunaan utama','Pengalaman','Harga'],cats:['Asisten AI','Pengembangan','Desain','Produktivitas','Belajar','Pencarian','Kreasi','Privasi & keamanan','Sumber terbuka','Film','Serial TV','Game','Keuangan kuantitatif','Berita kripto'],uses:['Percakapan, kreasi, dan bantuan AI','Kode, dokumentasi, dan penerapan','Desain visual dan inspirasi','Tugas dan kolaborasi','Belajar, verifikasi, dan riset','Menemukan informasi tepercaya','Pembuatan teks, gambar, audio, dan video','Alat privasi dan keamanan','Alat dan proyek terbuka','Informasi film dan tayangan legal','Menemukan serial dan melacak progres','Toko, informasi, dan catatan game','Data, riset, backtesting, dan risiko','Membandingkan sumber sekunder profesional'],exp:['⭐ Matang dan tepercaya','👍 Mudah dan layak dicoba','🎯 Untuk kebutuhan khusus'],prices:['🆓 Gratis','🟢 Freemium','💳 Berbayar']},
  vi:{file:'README.vi.md',title:'Bản đồ Web Mở',intro:'130 trang chọn lọc trong 14 danh mục, kèm biểu tượng cục bộ, mục đích, trải nghiệm và giá.',headers:['Biểu tượng','Trang','Mục đích chính','Trải nghiệm','Giá'],cats:['Trợ lý AI','Phát triển','Thiết kế','Năng suất','Học tập','Tìm kiếm','Sáng tạo','Riêng tư & bảo mật','Mã nguồn mở','Phim','Phim bộ','Trò chơi','Tài chính định lượng','Tin tức crypto'],uses:['Hội thoại, sáng tạo và hỗ trợ AI','Mã, tài liệu và triển khai','Thiết kế trực quan và cảm hứng','Công việc và cộng tác','Học tập, xác minh và nghiên cứu','Tìm thông tin đáng tin cậy','Tạo văn bản, ảnh, âm thanh và video','Công cụ riêng tư và bảo mật','Công cụ và dự án mở','Thông tin phim và nguồn xem hợp pháp','Khám phá phim bộ và theo dõi tiến độ','Cửa hàng, thông tin và ghi lại trò chơi','Dữ liệu, nghiên cứu, backtest và rủi ro','Đối chiếu nguồn tin chuyên nghiệp thứ cấp'],exp:['⭐ Hoàn thiện và đáng tin','👍 Dễ dùng và đáng thử','🎯 Cho nhu cầu cụ thể'],prices:['🆓 Miễn phí','🟢 Freemium','💳 Trả phí']}
}

const languageLinks='[简体中文](../README.md) · [English](README.en.md) · [Español](README.es.md) · [Português](README.pt-BR.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Indonesia](README.id.md) · [Tiếng Việt](README.vi.md)'
const localeContext={
en:['Why this directory','Open Web Atlas favors official destinations and websites that solve a clear task instead of chasing the longest list. Ratings are editorial shortcuts, not security guarantees; pricing and capabilities should be verified on the official site.','How to read it','⭐ long-term choice · 👍 worth trying · 🎯 specific use · 🆓 free · 🟢 freemium · 💳 paid'],
es:['Por qué existe','Open Web Atlas prioriza sitios oficiales y tareas claras, no la lista más larga. Las valoraciones orientan, pero no garantizan seguridad; confirma precio y funciones en el sitio oficial.','Cómo leerlo','⭐ uso a largo plazo · 👍 vale la pena · 🎯 uso específico · 🆓 gratis · 🟢 freemium · 💳 de pago'],
pt:['Por que existe','O Open Web Atlas prioriza destinos oficiais e tarefas claras, não a lista mais longa. As avaliações orientam, mas não garantem segurança; confirme preço e recursos no site oficial.','Como ler','⭐ uso duradouro · 👍 vale testar · 🎯 uso específico · 🆓 grátis · 🟢 freemium · 💳 pago'],
de:['Warum dieses Verzeichnis','Open Web Atlas bevorzugt offizielle Ziele und klar nützliche Websites statt möglichst vieler Links. Bewertungen sind Orientierung, keine Sicherheitsgarantie; Preise und Funktionen bitte offiziell prüfen.','Legende','⭐ langfristig · 👍 ausprobieren · 🎯 spezieller Einsatz · 🆓 kostenlos · 🟢 Freemium · 💳 kostenpflichtig'],
fr:['Pourquoi cet annuaire','Open Web Atlas privilégie les sites officiels et les tâches utiles plutôt que le nombre de liens. Les avis orientent sans garantir la sécurité ; vérifiez prix et fonctions sur le site officiel.','Comment le lire','⭐ usage durable · 👍 à essayer · 🎯 usage précis · 🆓 gratuit · 🟢 freemium · 💳 payant'],
ja:['このディレクトリの目的','Open Web Atlasはリンク数ではなく、公式入口と明確な用途を優先します。評価は目安であり安全保証ではありません。料金と機能は公式サイトで確認してください。','表示の見方','⭐ 長期利用向け · 👍 試す価値あり · 🎯 特定用途 · 🆓 無料 · 🟢 フリーミアム · 💳 有料'],
ko:['이 디렉터리의 목적','Open Web Atlas는 링크 수보다 공식 사이트와 명확한 용도를 우선합니다. 평가는 참고 정보이며 보안 보장이 아닙니다. 가격과 기능은 공식 사이트에서 확인하세요.','표시 읽기','⭐ 장기 사용 · 👍 시도할 만함 · 🎯 특정 용도 · 🆓 무료 · 🟢 부분 유료 · 💳 유료'],
id:['Mengapa direktori ini','Open Web Atlas mengutamakan situs resmi dan tugas yang jelas, bukan jumlah tautan. Penilaian adalah panduan, bukan jaminan keamanan; cek harga dan fitur di situs resmi.','Cara membaca','⭐ pilihan jangka panjang · 👍 layak dicoba · 🎯 kebutuhan khusus · 🆓 gratis · 🟢 freemium · 💳 berbayar'],
vi:['Vì sao có danh mục này','Open Web Atlas ưu tiên trang chính thức và nhiệm vụ rõ ràng thay vì số lượng liên kết. Đánh giá chỉ để tham khảo, không bảo đảm an toàn; hãy kiểm tra giá và tính năng trên trang chính thức.','Cách đọc','⭐ dùng lâu dài · 👍 đáng thử · 🎯 nhu cầu cụ thể · 🆓 miễn phí · 🟢 freemium · 💳 trả phí']}
for(const locale of Object.values(locales)){
  const key=Object.keys(locales).find(key=>locales[key]===locale),context=localeContext[key]
  const parts=[`# 🗺️ ${locale.title}`,languageLinks,locale.intro,'[🌐 Open Web Atlas](https://pangxin12345.github.io/open-web-atlas/)',`## 💡 ${context[0]}\n\n${context[1]}`,`## 🏷️ ${context[2]}\n\n${context[3]}`]
  for(let category=1;category<categories.length;category++){
    const rows=sites.filter(site=>site.category===category)
    const rendered=rows.map(site=>{const rank=star.has(site.name)?0:niche.has(site.name)?2:1;const tier=paid.has(site.name)?2:freemium.has(site.name)?1:0;return `| ${icon(site).replace('src="icons/','src="../icons/')} | [${site.name}](${site.url}) | ${locale.uses[category-1]} | ${locale.exp[rank]} | ${locale.prices[tier]} |`})
    parts.push(`<a id="${categoryIds[category]}"></a>\n<details open>\n<summary><strong>${E(category)} ${locale.cats[category-1]} · ${rows.length}</strong></summary>\n\n| ${locale.headers.join(' | ')} |\n| :---: | --- | --- | --- | :---: |\n${rendered.join('\n')}\n\n</details>`)
  }
  await writeFile(new URL(`../docs/${locale.file}`,import.meta.url),`${parts.join('\n\n')}\n`)
}

function E(category){return ['','🤖','💻','🎨','⚡','📚','🔎','✨','🛡️','🧩','🎬','📺','🎮','📈','🛰️'][category]}
console.log(`README refreshed with ${sites.length} website rows.`)
