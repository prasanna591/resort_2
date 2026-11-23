(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var $ = window.jQuery;

    if ($ && $.fn.datepicker) {
      var checkIn = $("#datepicker_1");
      var checkOut = $("#datepicker_2");
      checkIn.datepicker();
      checkOut.datepicker();
      checkIn.on("change", function () {
        checkOut.datepicker("option", "minDate", $(this).val());
      });
    }

    var button = document.querySelector(".menu-button");
    var menu = document.querySelector(".menu-mobile");

    if (button && menu) {
      button.setAttribute("aria-label", "Toggle menu");
      button.setAttribute("aria-expanded", "false");

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var open = menu.classList.toggle("is-open");
        menu.style.top = open ? "0px" : "-100vh";
        menu.style.opacity = open ? "1" : "0";
        document.body.classList.toggle("overflow", open);
        button.setAttribute("aria-expanded", String(open));
      });

      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.remove("is-open");
          menu.style.top = "-100vh";
          menu.style.opacity = "0";
          document.body.classList.remove("overflow");
          button.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
})();
