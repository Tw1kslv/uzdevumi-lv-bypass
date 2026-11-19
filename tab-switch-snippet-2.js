(function () {
    'use strict';

    const TARGET_INTERVAL = 100;
    const BLOCKED_EVENTS = [
        'visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange',
        'blur', 'focus', 'focusin', 'focusout',
        'mouseleave', 'mouseout', 'mouseenter', 'mouseover',
        'pageshow', 'pagehide', 'resume', 'freeze',
        'beforeunload'
    ];

    const patchProperties = () => {
        try {
            document.hasFocus = () => true;
            window.hasFocus = () => true;

            const visibilityProps = {
                hidden: false,
                visibilityState: 'visible',
                webkitHidden: false,
                webkitVisibilityState: 'visible',
                mozHidden: false,
                msHidden: false
            };

            Object.keys(visibilityProps).forEach(prop => {
                try {
                    Object.defineProperty(document, prop, {
                        get: () => visibilityProps[prop],
                        set: () => {},
                        configurable: false
                    });
                } catch (e) { /* ignore if property doesn't exist */ }
            });

            window.onblur = null;
            window.onfocus = null;
            document.onblur = null;
            document.onfocus = null;
            window.onbeforeunload = null;
            document.onbeforeunload = null;

            window.focus = () => true;
            document.focus = () => true;

        } catch (e) { /* Silent fail */ }
    };
  
    const blockEvents = () => {
        const handler = (e) => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
        };
        BLOCKED_EVENTS.forEach(ev => {
            window.addEventListener(ev, handler, true);
            document.addEventListener(ev, handler, true);
        });
    };

    const hookAddEventListener = () => {
        if (EventTarget.prototype.addEventListener.__isHooked) return;

        const originalAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, opts) {
            if (BLOCKED_EVENTS.includes(type)) {
                return;
            }
            return originalAdd.call(this, type, listener, opts);
        };
        EventTarget.prototype.addEventListener.__isHooked = true;
    };

    const patchTiming = () => {
        try {
            const originalRAF = window.requestAnimationFrame;
            window.requestAnimationFrame = function(callback) {
                return originalRAF.call(window, () => callback(performance.now()));
            };
        } catch (e) { /* Silent fail */ }
    };

    const applyAll = () => {
        patchProperties();
        blockEvents();
        hookAddEventListener();
        patchTiming();
    };

    applyAll();

    setInterval(applyAll, TARGET_INTERVAL);

    console.log('%c[page-visibility-bypass] Advanced tab-switch bypass active.', 'color:#0a0;font-weight:bold;font-size:14px');
})();
