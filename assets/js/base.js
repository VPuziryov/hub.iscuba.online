(function () {
  const supported = ['ru','en','de','fr','it','pl','lv'];
  const ruGroup = ['ru','uk','be','kk'];

  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
  }

  function setCookie(name, value) {
    document.cookie = name + '=' + value + '; path=/; max-age=31536000';
  }

  function detectLang() {
    const saved = getCookie('lang');
    if (saved && supported.includes(saved)) return saved;

    let lang = (navigator.language || '').toLowerCase().slice(0,2);

    if (ruGroup.includes(lang)) return 'ru';
    if (supported.includes(lang)) return lang;

    return 'en';
  }

  function redirect() {
    const path = window.location.pathname;

    // если уже в /ru/ или /en/ и т.д. — не трогаем
    if (supported.some(l => path.startsWith('/' + l + '/'))) return;

    const lang = detectLang();
    setCookie('lang', lang);

    window.location.href = '/' + lang + '/';
  }

  redirect();
})();