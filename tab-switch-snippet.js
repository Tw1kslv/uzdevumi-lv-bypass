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

        } catch(e) {  }
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