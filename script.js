const contentEl = document.getElementById('content');
const siteDescriptionEl = document.getElementById('site-description');
let globalDataCache;

/* utility: build a card, optionally with full-bleed background image */
function createCard({ title, description = "", image = null, level = "category", onClick }) {
  const card = document.createElement('div');
  card.className = 'card';
  if (image) {
    card.classList.add('bg');
    // use CSS var for ::before background-image
    card.style.setProperty('--bg', `url('${image}')`);
  }

  const inner = document.createElement('div');
  inner.className = 'card-content';
  inner.innerHTML = `
    ${level === 'category' ? `<h2>${title}</h2>` : `<h3>${title}</h3>`}
    ${description ? `<p>${description}</p>` : ''}
  `;

  card.appendChild(inner);
  if (typeof onClick === 'function') card.onclick = onClick;
  return card;
}

async function loadData() {
  const res = await fetch('data.json');
  const data = await res.json();
  globalDataCache = data.global;
  renderHome(globalDataCache);
}

function makeBackButton(callback) {
  const btn = document.createElement('div');
  btn.className = 'back-btn';
  btn.textContent = '← Back';
  btn.onclick = callback;
  contentEl.appendChild(btn);
}

function applyStaggeredAnimation() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.08}s`; // 80ms stagger
  });
}

/* HOME: show main categories with full background images */
function renderHome(globalData) {
  siteDescriptionEl.textContent = globalData.description;
  contentEl.innerHTML = '';

  for (const [categoryName, categoryData] of Object.entries(globalData.categories)) {
    const card = createCard({
      title: categoryName,
      description: categoryData.description,
      image: categoryData.image || null,          // full-bleed background
      level: 'category',
      onClick: () => renderCategory(categoryName, categoryData),
    });
    contentEl.appendChild(card);
  }

  applyStaggeredAnimation();
}

/* CATEGORY: show subcategories, you can also give them background images if present */
function renderCategory(name, data) {
  contentEl.innerHTML = '';
  makeBackButton(() => renderHome(globalDataCache));

  const title = document.createElement('h2');
  title.textContent = name;
  contentEl.appendChild(title);

  const desc = document.createElement('p');
  desc.id = 'site-description';
  desc.textContent = data.description;
  contentEl.appendChild(desc);

  for (const [subName, subData] of Object.entries(data.subcategories)) {
    const card = createCard({
      title: subName,
      description: '',                            // cleaner look for subcards
      image: subData.image || null,               // if provided, will be full background
      level: 'subcategory',
      onClick: () => renderSubcategory(name, subName, subData),
    });
    contentEl.appendChild(card);
  }

  applyStaggeredAnimation();
}

/* SUBCATEGORY: list articles, you can keep card backgrounds here too */
function renderSubcategory(categoryName, subName, subData) {
  contentEl.innerHTML = '';
  makeBackButton(() => renderCategory(categoryName, globalDataCache.categories[categoryName]));

  const title = document.createElement('h2');
  title.textContent = `${categoryName} / ${subName}`;
  contentEl.appendChild(title);

  subData.articles.forEach(article => {
    const card = createCard({
      title: article.title,
      description: article.abstract || '',
      image: article.image || null,               // article card background if you want
      level: 'article',
      onClick: () => renderArticle(categoryName, subName, article),
    });
    contentEl.appendChild(card);
  });

  applyStaggeredAnimation();
}

/* ARTICLE: render mixed content blocks */
function renderArticle(categoryName, subName, article) {
  contentEl.innerHTML = '';
  makeBackButton(() => renderSubcategory(categoryName, subName, globalDataCache.categories[categoryName].subcategories[subName]));

  const title = document.createElement('h2');
  title.textContent = article.title;
  contentEl.appendChild(title);

  const articleContainer = document.createElement('div');
  articleContainer.className = 'article-content';

  article.content.forEach(block => {
    if (block.type === 'heading') {
      const h3 = document.createElement('h3');
      h3.textContent = block.text;
      articleContainer.appendChild(h3);
    } else if (block.type === 'paragraph') {
      const p = document.createElement('p');
      p.textContent = block.text;
      articleContainer.appendChild(p);
    } else if (block.type === 'image') {
      const img = document.createElement('img');
      img.src = block.src;
      img.alt = block.alt || '';
      articleContainer.appendChild(img);
    }
  });

  contentEl.appendChild(articleContainer);
}

loadData();
