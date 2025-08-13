const contentEl = document.getElementById('content');
const siteDescriptionEl = document.getElementById('site-description');
let globalDataCache;

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

function renderHome(globalData) {
  siteDescriptionEl.textContent = globalData.description;
  contentEl.innerHTML = '';
  for (const [categoryName, categoryData] of Object.entries(globalData.categories)) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${categoryData.image ? `<img class="thumb" src="${categoryData.image}" alt="${categoryName} thumbnail">` : ''}
      <h2>${categoryName}</h2>
      <p>${categoryData.description}</p>
    `;
    card.onclick = () => renderCategory(categoryName, categoryData);
    contentEl.appendChild(card);
  }
}

function renderCategory(name, data) {
  contentEl.innerHTML = '';
  makeBackButton(() => renderHome(globalDataCache));
  const title = document.createElement('h2');
  title.textContent = name;
  contentEl.appendChild(title);
  const desc = document.createElement('p');
  desc.textContent = data.description;
  contentEl.appendChild(desc);
  for (const [subName, subData] of Object.entries(data.subcategories)) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${subData.image ? `<img class="thumb" src="${subData.image}" alt="${subName} thumbnail">` : ''}
      <h3>${subName}</h3>
    `;
    card.onclick = () => renderSubcategory(name, subName, subData);
    contentEl.appendChild(card);
  }
}

function renderSubcategory(categoryName, subName, subData) {
  contentEl.innerHTML = '';
  makeBackButton(() => renderCategory(categoryName, globalDataCache.categories[categoryName]));
  const title = document.createElement('h2');
  title.textContent = `${categoryName} / ${subName}`;
  contentEl.appendChild(title);
  subData.articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${article.image ? `<img class="thumb" src="${article.image}" alt="${article.title} thumbnail">` : ''}
      <h3>${article.title}</h3>
      <p>${article.abstract}</p>
    `;
    card.onclick = () => renderArticle(categoryName, subName, article);
    contentEl.appendChild(card);
  });
}

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
