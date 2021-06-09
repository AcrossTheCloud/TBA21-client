import { useCallback, useEffect, useState } from "react";

const themes = ["light", "dark", "rainbow", "auto"];
const themeToClassName = {
  light: "",
  dark: "story--dark-theme",
  rainbow: "story--rainbow-theme",
};

const LOCAL_STORAGE_KEY = {
  THEME: "OCEAN_ARCHIVE__THEME",
};

const useStoryTheme = () => {
  const [theme, setInternalTheme] = useState(
    localStorage.getItem(LOCAL_STORAGE_KEY.THEME) || "light"
  );
  // to trigger theme rerender
  const [ts, setTs] = useState(new Date());

  useEffect(() => {
    let media =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

    function mediaChangeListener() {
      setTs(new Date());
    }

    if (media && theme === "auto") {
      media.addEventListener("change", mediaChangeListener);
    }
    return () => {
      media.removeEventListener("change", mediaChangeListener);
    };
  }, [theme, ts]);

  const themeClassName =
    theme === "auto"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? themeToClassName["dark"]
        : themeToClassName["light"]
      : themeToClassName[theme];

  const setTheme = useCallback((t) => {
    setInternalTheme(t);
    localStorage.setItem(LOCAL_STORAGE_KEY.THEME, t);
  }, []);

  return { theme, setTheme, themes, themeClassName };
};

export default useStoryTheme;