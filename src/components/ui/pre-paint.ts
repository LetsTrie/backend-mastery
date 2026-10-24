/**
 * Reader preferences restored before first paint, inlined in the root layout's <head>.
 * Kept out of the "use client" toggles: a server component importing a value from a client
 * module receives a client reference, not the string.
 */
export const THEME_STORAGE_KEY = "theme";
export const TOC_STORAGE_KEY = "toc";

export const prePaintScript =
  `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;` +
  `if(localStorage.getItem("${TOC_STORAGE_KEY}")==="collapsed")document.documentElement.dataset.toc="collapsed"}catch(e){}`;
