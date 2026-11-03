// Mobile navigation
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 1081px)").addEventListener("change", function (mq) {
    if (mq.matches) setOpen(false);
  });
})();

// Contact form
// If the form has a data-endpoint (e.g. a Formspree or server URL) the enquiry is
// posted there. Without one, the visitor's email program opens with the message filled in.
(function () {
  var form = document.querySelector("form[data-enquiry]");
  if (!form) return;
  var status = form.querySelector(".form-status");

  function show(msg) {
    status.textContent = msg;
    status.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    var endpoint = form.getAttribute("data-endpoint");

    if (endpoint) {
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          show("Thank you. Your enquiry has been sent and we will be in touch shortly.");
        })
        .catch(function () {
          show("Sorry, your enquiry could not be sent. Please call us on (03) 9742 6235 or email info@wynpower.com.au.");
        })
        .finally(function () {
          button.disabled = false;
        });
      return;
    }

    var lines = [
      "Name: " + data.get("name"),
      "Email: " + data.get("email"),
      "Phone: " + (data.get("phone") || "-"),
      "Enquiry about: " + data.get("topic"),
      "",
      data.get("message")
    ];
    var subject = "Website enquiry: " + data.get("topic");
    window.location.href =
      "mailto:" + form.getAttribute("data-mailto") +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    show("Your email program should now open with your enquiry ready to send. If it doesn't, please email info@wynpower.com.au directly.");
  });
})();
