const lang = document.documentElement.lang;
const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.navlinks').classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') menu.click();
});
const preferred = navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
const hint = document.querySelector('.language-hint');
if (hint && preferred !== lang) hint.hidden = false;
hint?.querySelector('button').addEventListener('click', () => { hint.hidden = true; });
const search = document.querySelector('#search');
const filters = ['type', 'year', 'discipline'].map(id => document.getElementById(id));
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function filter() {
  let count = 0;
  document.querySelectorAll('.pub-row').forEach(row => {
    const match = normalize(row.textContent).includes(normalize(search.value)) && filters.every(select => !select.value || row.dataset[select.id] === select.value);
    row.hidden = !match;
    if (match) count++;
  });
  document.querySelector('#result-count').textContent = `${count} publication(s)`;
  document.querySelector('#no-results').hidden = count !== 0;
}
search?.addEventListener('input', filter);
filters.forEach(select => select?.addEventListener('change', filter));
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const field = document.getElementById(button.dataset.copy);
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = lang === 'fr' ? 'Citation copiée.' : 'Citation copied.';
    } catch {
      field.focus();
      field.select();
      status.textContent = lang === 'fr' ? 'Sélectionnez et copiez la citation ci-dessus.' : 'Select and copy the citation above.';
    }
  });
});
