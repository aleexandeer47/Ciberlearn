export type ThemePref = "system" | "light" | "dark";

export const THEME_KEY = "ciberlearn-theme";

/**
 * Se ejecuta en <head> antes de pintar: aplica el tema guardado (o el del sistema)
 * para que no haya un destello blanco al cargar en modo oscuro.
 */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;
