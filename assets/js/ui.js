document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('language');

  if (!select) return;

  // установить текущее значение из URL
  const path = window.location.pathname.split('/')[1];
  if (path) select.value = path;

  select.addEventListener('change', function () {
    const lang = this.value;

    // сохраняем
    document.cookie = 'lang=' + lang + '; path=/; max-age=31536000';

    // редирект
    window.location.href = '/' + lang + '/';
  });
});