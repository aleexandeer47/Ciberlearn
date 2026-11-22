export type ThemePref = "system" | "light" | "dark";

export const THEME_KEY = "ciberlearn-theme";
/** Modo sencillo (letra grande y más contraste), pensado para personas mayores. */
export const SIMPLE_KEY = "ciberlearn-simple";

/**
 * Se ejecuta en <head> antes de pintar: aplica el tema guardado (o el del sistema)
 * y el modo sencillo, para que no haya un destello al cargar.
 */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";if(localStorage.getItem("${SIMPLE_KEY}")==="1")document.documentElement.dataset.simple="1";}catch(e){}})();`;
