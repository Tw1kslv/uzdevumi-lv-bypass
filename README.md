# uzdevumi-lv-bypass

A collection of DevTools console snippets that override the browser's Page Visibility API and re-enable right-click and text selection on sites that block them.

Primarily built to bypass the anti-cheating and anti-copying measures on [uzdevumi.lv](https://www.uzdevumi.lv/) but the snippets work on any site that uses the same standard browser APIs.

No extensions. No installs. No files to download. Just paste into the browser console.

## What it bypasses

| Protection | How the site does it | How this repo defeats it |
|------------|----------------------|--------------------------|
| **Tab-switch detection** | `visibilitychange` / `blur` / `focus` events, `document.hasFocus()`, and intercepting event registration | Overrides visibility and focus APIs, hooks `addEventListener` to block registration, stops events in the capture phase, and continuously re-applies overrides |
| **Disabled right-click** | `oncontextmenu` handlers and invisible absolute-positioned overlays | Clears handlers, stops the event, and removes empty full-screen overlays |
| **Blocked text selection** | `user-select: none` CSS, `selectstart` events, `Selection.removeAllRanges()`, and transparent `::selection` CSS | Re-enables `user-select`, stops events, overrides the Selection API to prevent clearing, and forces visible highlight colors |
| **Blocked copy / cut** | `oncopy` / `oncut` handlers | Clears them, stops the events in the capture phase |
| **Blocked paste** | `paste` event blocking and `input` event truncation | Stops `paste` and `input` events, and adds a value-restoration guard to form fields |

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

### 2. Tab-switch bypass only
[tab-switch-snippet.js](https://github.com/Tw1kslv/uzdevumi-lv-bypass/blob/main/tab-switch-snippet.js)
[You can test it on this website](https://jasonli0616.github.io/tabs-test/)

### 3. Right-click + text selection only
[right-click-and-selection-snippet.js](https://github.com/Tw1kslv/uzdevumi-lv-bypass/blob/main/right-click-and-selection-snippet.js)
[You can test it on this website](https://webbrowsertools.com/test-right-click/)

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
