import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Colors, palette, Scheme } from "./colors";

export type ThemePref = "system" | "light" | "dark";

type ThemeContextValue = {
    colors: Colors;
    scheme: Scheme;
    pref: ThemePref;
    setPref: (pref: ThemePref) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme(); // 'light' | 'dark' | 'unspecified' | null | undefined
    const [pref, setPrefState] = useState<ThemePref>("system");

    // Normaliza qualquer valor diferente de 'dark' para 'light'
    const scheme: Scheme = systemScheme === "dark" ? "dark" : "light";
    const colors = palette[scheme];

    const setPref = useCallback((next: ThemePref) => {
        setPrefState(next);
        // 'unspecified' devolve o controle ao tema do sistema
        Appearance.setColorScheme(next === "system" ? "unspecified" : next);
    }, []);

    const navTheme = useMemo(() => {
        const base = scheme === "dark" ? DarkTheme : DefaultTheme;
        return {
            ...base,
            colors: {
                ...base.colors,
                background: colors.background,
                card: colors.card,
                text: colors.text,
                border: colors.border,
                primary: colors.primary,
            },
        };
    }, [scheme, colors]);

    const value = useMemo(
        () => ({ colors, scheme, pref, setPref }),
        [colors, scheme, pref, setPref],
    );

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider value={navTheme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error(
            "useAppTheme deve ser usado dentro de AppThemeProvider",
        );
    return ctx;
}
