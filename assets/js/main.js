/* HumanLens IT Solutions - small progressive enhancements.
   The site works without this file; it adds the mobile menu,
   service pre-selection on the contact form and form submission. */
(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  // Pre-select a service on the contact form, e.g. /contact?service=Database+Solutions
  var select = document.getElementById('service');
  if (select) {
    var requested = new URLSearchParams(window.location.search).get('service');
    if (requested) {
      var match = Array.prototype.find.call(select.options, function (o) {
        return o.value === requested;
      });
      if (match) select.value = requested;
    }
  }

  // Contact form
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var endpoint = form.getAttribute('data-endpoint') || '';

  function showStatus(type, text) {
    status.className = 'status ' + type;
    status.textContent = text;
    status.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: real visitors never fill this field.
    if (form.website && form.website.value) return;
    if (!form.reportValidity()) return;

    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key !== 'website') data[key] = value;
    });

    // No endpoint configured yet: open the visitor's email app with the message filled in.
    if (!endpoint) {
      var subject = 'Website enquiry: ' + (data.service || 'General');
      var body =
        'Name: ' + data.name + '\n' +
        'Email: ' + data.email + '\n' +
        'Phone: ' + (data.phone || '-') + '\n' +
        'Company: ' + (data.company || '-') + '\n' +
        'Service: ' + data.service + '\n\n' +
        data.message;
      window.location.href =
        'mailto:humanlens.contact@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      showStatus('ok', 'Your email app should open with your message ready to send. If it does not, email humanlens.contact@gmail.com.');
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        showStatus('ok', 'Thank you. Your message has been sent and we will be in touch.');
      })
      .catch(function () {
        showStatus('err', 'Sorry, your message could not be sent. Please call or email us directly.');
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
