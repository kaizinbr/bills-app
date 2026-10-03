export type Scheme = "light" | "dark";

export type Colors = {
    background: string; // fundo das telas
    card: string;       // cards, superfícies elevadas
    text: string;       // texto principal
    textMuted: string;  // texto secundário
    placeholder: string;
    border: string;
    borderFocus: string; // borda do input focado
    primary: string;     // links e destaques
    error: string;
    errorBg: string;
    buttonBg: string;
    buttonText: string;
};

export const palette: Record<Scheme, Colors> = {
    dark: {
        background: "#161718",
        card: "#212223",
        text: "#eeeeee",
        textMuted: "#BABABA",
        placeholder: "#BABABA",
        border: "#212223",
        borderFocus: "#00C89B",
        primary: "#00c89b",
        error: "#ff4d4f",
        errorBg: "#ff4d4f22",
        buttonBg: "#009C7A",
        buttonText: "#ffffff",
    },
    light: {
        background: "#161718",
        card: "#212223",
        text: "#eeeeee",
        textMuted: "#BABABA",
        placeholder: "#BABABA",
        border: "#212223",
        borderFocus: "#00C89B",
        primary: "#00c89b",
        error: "#ff4d4f",
        errorBg: "#ff4d4f22",
        buttonBg: "#009C7A",
        buttonText: "#ffffff",
    },
    // light: {
    //     background: "#EEEEEF",
    //     card: "#ffffff",
    //     text: "#161718",
    //     textMuted: "#6b6e72",
    //     placeholder: "#8a8d91",
    //     border: "#d3d4d6",
    //     borderFocus: "#00A67F",
    //     primary: "#00c89b",
    //     error: "#d92d34",
    //     errorBg: "#d92d3414",
    //     buttonBg: "#009C7A",
    //     buttonText: "#ffffff",
    // },
};