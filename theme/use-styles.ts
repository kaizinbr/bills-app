import { useMemo } from "react";
import { Colors } from "./colors";
import { useAppTheme } from "./theme-context"; // ajuste se seu arquivo tiver outro nome

export function useStyles<T>(factory: (colors: Colors) => T): T {
    const { colors } = useAppTheme();
    return useMemo(() => factory(colors), [colors, factory]);
}