# uzdevumi-lv-bypass

A collection of DevTools console snippets that override the browser's Page Visibility API and re-enable right-click and text selection on sites that block them.

Primarily built to bypass the anti-cheating and anti-copying measures on [uzdevumi.lv](https://www.uzdevumi.lv/) but the snippets work on any site that uses the same standard browser APIs.

No extensions. No installs. No files to download. Just paste into the browser console.

## What it bypasses

| Protection | How the site does it | How this repo defeats it |
|------------|----------------------|--------------------------|
| Tab-switch detection | Listens to `visibilitychange`, `blur`, `focus` | Overrides `document.hidden` / `document.visibilityState`, blocks the events |
| Disabled right-click | `oncontextmenu` handler | Clears the handler, stops the event in the capture phase |
| Blocked text selection | `user-select: none` CSS, `onselectstart` handler | Re-enables `user-select`, clears handlers |
| Blocked copy / cut | `oncopy` / `oncut` handlers | Clears them, stops the events |

## Usage

1. Open the target page (e.g. a test on `uzdevumi.lv`).
2. Open DevTools:
   - **Windows / Linux:** `F12` or `Ctrl` + `Shift` + `J`
   - **macOS:** `Cmd` + `Option` + `J`
3. Click the Console tab.
4. Paste one of the snippets below and press `Enter`.
5. Close DevTools. The overrides stay active until you reload the page.

> **Note (Chrome / Edge):** the first time you paste into the console, the browser may show *"Warning: Don't paste code you don't understand…"*. Type `allow pasting` and press Enter to unlock it, then paste again.

## Snippets

### 1. All-in-one (recommended) 
[all-in-one-snippet.js](https://github.com/Tw1kslv/uzdevumi-lv-bypass/blob/main/all-in-one-snippet.js)

Combines tab-switch bypass, right-click re-enable, and text-selection re-enable:

```javascript
(function () {
  'use strict';

  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });

  ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focus'].forEach(evt => {
    window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
  });

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
```

### 2. Tab-switch bypass only
[tab-switch-snippet.js](https://github.com/Tw1kslv/uzdevumi-lv-bypass/blob/main/tab-switch-snippet.js)
[You can test it on this website](https://jasonli0616.github.io/tabs-test/)

```javascript
(function() {
    'use strict';

    const patch = () => {
        try {
            document.hasFocus = () => true;
            window.hasFocus = () => true;

            Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
            ["hidden", "mozHidden", "msHidden", "webkitHidden"].forEach(p => {
                Object.defineProperty(document, p, { get: () => false, configurable: true });
            });

            window.onblur = null;
            window.onfocus = null;
            document.onblur = null;
            document.onfocus = null;
            window.onbeforeunload = null;
            document.onbeforeunload = null;
            
            window.focus = () => true;
            document.focus = () => true;

        } catch(e) { /* Silently ignore errors */ }
    };

    const blockEvents = () => {
        const eventsToBlock = [
            "visibilitychange", "webkitvisibilitychange", "mozvisibilitychange", "msvisibilitychange",
            "blur", "focus", "focusin", "focusout",
            "mouseleave", "mouseout", "mouseenter", "mouseover",
            "pageshow", "pagehide", "resume", "freeze"
        ];
        const handler = e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
        };
        eventsToBlock.forEach(ev => {
            window.addEventListener(ev, handler, true);
            document.addEventListener(ev, handler, true);
        });
    };

    const hookAddEvent = () => {
        const blocked = [
            "visibilitychange", "webkitvisibilitychange", "mozvisibilitychange", "msvisibilitychange",
            "blur", "focus", "focusin", "focusout",
            "mouseleave", "mouseout", "mouseenter", "mouseover",
            "beforeunload", "pageshow", "pagehide", "resume", "freeze"
        ];
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, opts) {
            if (blocked.includes(type)) {
                return;
            }
            return originalAddEventListener.call(this, type, listener, opts);
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
    
    console.log('%c[page-visibility-bypass] overrides applied', 'font-weight:bold');
})();
```

### 3. Right-click + text selection only
[right-click-and-selection-snippet.js](https://github.com/Tw1kslv/uzdevumi-lv-bypass/blob/main/right-click-and-selection-snippet.js)
[You can test it on this website](https://webbrowsertools.com/test-right-click/)

```javascript
(function () {
  'use strict';

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

  console.log('[page-visibility-bypass] right-click, selection, and paste re-enabled');
})();
```

## How it works

Every "protection" these sites use is client-side JavaScript and CSS. That means it can be reverted from the same tab it runs in.

**Tab-switch detection** relies on the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API). When you switch tabs, minimize the window, or move focus away, the browser fires a `visibilitychange` event and flips:

- `document.hidden` → `true`
- `document.visibilityState` → `"hidden"`

Canvas, uzdevumi.lv, and most quiz platforms listen for that event and log it — sometimes showing a counter or warning like *"Stopped viewing the quiz."*

`document.hidden` and `document.visibilityState` are **read-only native properties**, so you can't just assign to them. But you can replace their getters with `Object.defineProperty`, making them always report visible. Adding a `stopImmediatePropagation` listener in the **capture phase** stops `visibilitychange`, `blur`, and `focus` from ever reaching the page's own listeners.

**Right-click blocking** is done with `oncontextmenu`. Setting `window.oncontextmenu = null` clears an inline or assigned handler. `addEventListener(..., true)` + `stopImmediatePropagation` blocks listeners added via `addEventListener`.

**Text selection blocking** is CSS (`user-select: none`) plus `onselectstart` / `dragstart` handlers. Injecting a `<style>` with `!important` overrides the CSS, and clearing the handlers restores normal selection.

**Copy / cut blocking** is `oncopy` / `oncut` handlers, cleared the same way.

## Limitations

- The overrides **only last for the current tab** and are lost on reload. Paste again after every reload.
- If a site later adds **server-side** checks (requests to the server logging activity, WebRTC, mouse/keyboard timing), this snippet alone won't fool them.
- If a site re-applies `user-select: none` with a `MutationObserver`, you may need to loop the CSS injection. Not currently implemented.
- Chrome/Edge sometimes warn about pasting code — type `allow pasting` in the console first.
- Not tested against every exercise type on uzdevumi.lv. Some may use additional checks.
- Bookmarks with `javascript:` URLs that do the same thing may be blocked by strict Content Security Policy on some sites. The console method always works.

## Disclaimer

This project is for **educational purposes** — to demonstrate how browser APIs like the Page Visibility API work, and how easily client-side anti-cheat / anti-copy measures can be reverted.
