/* tslint:disable */
// Opera 8.0+
// @ts-ignore
// eslint-disable-next-line
const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
// @ts-ignore
const isFirefox = typeof InstallTrigger !== 'undefined';
// Safari 3.0+ "[object HTMLElementConstructor]"
// @ts-ignore
// eslint-disable-next-line
const isSafari = /constructor/i.test(window.HTMLElement) || (p => p.toString() === '[object SafariRemoteNotification]')(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification));
// Internet Explorer 6-11
// @ts-ignore
const isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
// @ts-ignore
const isEdge = !isIE && !!window.StyleMedia;
// Chrome 1 - 71
// @ts-ignore
const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
// Blink engine detection
// @ts-ignore
const isBlink = (isChrome || isOpera) && !!window.CSS;
/* tslint:enable */

export const browser = (): string => {
 if (isOpera) {
    // Opera 8.0+
    return 'opera';
 } else if (isFirefox) {
   // Firefox 1.0+
  return 'firefox';
 } else if (isSafari) {
   // Safari 3.0+ "[object HTMLElementConstructor]"
  return 'safari';
 } else if (isIE) {
  // Internet Explorer 6-11
   return 'ie6-11';
 } else if (!isIE && isEdge) {
  // Edge 20+
  return 'edge';
 } else if (isChrome) {
   return 'chrome';
 } else if (isBlink) {
   return 'blink';
 } else {
   return 'unknown';
 }
};
