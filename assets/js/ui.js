document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('language');
  if (!select) return;

  // The change handler is registered in base.js.
  const lang = window.location.pathname.split('/')[1];
  if (lang) select.value = lang;
});
