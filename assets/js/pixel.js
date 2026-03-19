// === META PIXEL INIT ===
(function () {
  if (window.fbq) return;

  var n = (window.fbq = function () {
    n.callMethod
      ? n.callMethod.apply(n, arguments)
      : n.queue.push(arguments);
  });

  if (!window._fbq) window._fbq = n;

  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  var t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";

  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(t, s);

  fbq("init", "675997335920840");
  fbq("track", "PageView");
})();


// === EVENTS ===
document.addEventListener("DOMContentLoaded", function () {

  // 50+
  document.getElementById("download-50plus")?.addEventListener("click", function () {
    fbq("trackCustom", "Checklist_50Plus_Downloaded");
  });

  // Обои
  document.getElementById("download-wallpapers")?.addEventListener("click", function () {
    fbq("trackCustom", "Checklist_Wallpapers_Downloaded");
  });

  // Packing
  document.getElementById("download-packing")?.addEventListener("click", function () {
    fbq("trackCustom", "Checklist_Packing_Downloaded");
  });

  // Safari seasons
  document.getElementById("download-safari-seasons")?.addEventListener("click", function () {
    fbq("trackCustom", "Checklist_Safari_Seasons_Downloaded");
  });

  // Egypt
  document.getElementById("egypt-link")?.addEventListener("click", function () {
    fbq("trackCustom", "Egypt_Interest_Click");
  });

});


// === PRESENCE (7 sec) ===
setTimeout(function () {
  fbq("trackCustom", "ViewContent_hub_7s");
}, 7000);
document.getElementById("group-50plus")?.addEventListener("click", function () {
  fbq("trackCustom", "Group_50Plus_Click");
});

document.getElementById("group-kids")?.addEventListener("click", function () {
  fbq("trackCustom", "Group_Kids_Click");
});