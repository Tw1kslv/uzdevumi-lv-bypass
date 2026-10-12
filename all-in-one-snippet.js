(function () {
  'use strict';

  const patch = () => {
    try {
      document.hasFocus = () => true;
      window.hasFocus = () => true;

      Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
      Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });

      ['mozHidden', 'msHidden', 'webkitHidden'].forEach(p => {
        Object.defineProperty(document, p, { get: () => false, configurable: true });
      });

      ['mozVisibilityState', 'msVisibilityState', 'webkitVisibilityState'].forEach(p => {
        Object.defineProperty(document, p, { get: () => 'visible', configurable: true });
      });

      window.onblur = null;
      window.onfocus = null;
      document.onblur = null;
      document.onfocus = null;
      window.onbeforeunload = null;
      document.onbeforeunload = null;

      window.focus = () => true;
      document.focus = () => true;
    } catch (e) {}
  };

  const blockedEvents = [
    'visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange',
    'blur', 'focus', 'focusin', 'focusout',
    'mouseleave', 'mouseout', 'mouseenter', 'mouseover',
    'pageshow', 'pagehide', 'resume', 'freeze',
    'beforeunload'
  ];

  const blockHandler = e => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  };

  const blockEvents = () => {
    blockedEvents.forEach(ev => {
      window.addEventListener(ev, blockHandler, true);
      document.addEventListener(ev, blockHandler, true);
    });
  };

  const hookAddEvent = () => {
    const originalAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, opts) {
      if (blockedEvents.includes(type)) return;
      return originalAdd.call(this, type, listener, opts);
    };
  };

  patch();
  blockEvents();
  hookAddEvent();

  setInterval(() => {
    patch();
    blockEvents();
    hookAddEvent();
  }, 100);

  window.oncontextmenu = null;
  document.oncontextmenu = null;
  if (document.body) document.body.oncontextmenu = null;
  window.addEventListener('contextmenu', e => e.stopImmediatePropagation(), true);

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
    }
    ::selection {
      background-color: #3297fd !important;
      color: #fff !important;
    }
    ::-moz-selection {
      background-color: #3297fd !important;
      color: #fff !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  window.onselectstart = null;
  document.onselectstart = null;
  if (document.body) document.body.onselectstart = null;

  window.ondragstart = null;
  document.ondragstart = null;
  window.oncopy = null;
  document.oncopy = null;
  window.oncut = null;
  document.oncut = null;

  ['selectstart', 'dragstart', 'copy', 'cut'].forEach(evt => {
    window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
  });

  if (window.Selection && Selection.prototype) {
    Selection.prototype.removeAllRanges = function () {};
    Selection.prototype.empty = function () {};
    Selection.prototype.removeRange = function () {};
  }

  const style12 = document.createElement('style');
  style12.textContent = `
    #test-right-click-12 :not(input):not(textarea)::selection {
      background-color: #3297fd !important;
      color: #fff !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style12);

  document.querySelectorAll(
    'div[style*="position:absolute"][style*="inset:0"], ' +
    'div[style*="position: absolute"][style*="inset: 0"]'
  ).forEach(el => {
    if (!el.textContent.trim() && !el.children.length) {
      el.remove();
    }
  });

  ['paste', 'input'].forEach(evt => {
    window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
  });

  document.querySelectorAll('input, textarea').forEach(el => {
    let lastValue = el.value;
    el.addEventListener('input', (e) => {
      if (el.value.length < lastValue.length) {
        el.value = lastValue;
        e.stopImmediatePropagation();
      } else {
        lastValue = el.value;
      }
    }, true);
  });

  console.log('%c[page-visibility-bypass] ALL overrides applied', 'font-weight:bold');
})();