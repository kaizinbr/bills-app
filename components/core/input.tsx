import {
    StyleSheet,
    TextInput,
    TextInputProps
} from "react-native";

export default function Input({
    placeholder,
    value,
    onChangeText,
    error,
    style,
    ...props
}: TextInputProps & {
    placeholder?: string;
    value?: string | number | undefined | null | boolean | any;
    onChangeText?: (text: string) => void;
    error?: boolean;
    style?: any;
}) {
    return (
        <TextInput
            style={[styles.input, error && styles.error, style]}
            placeholder={placeholder}
            placeholderTextColor={"#BABABA"}
            value={value}
            onChangeText={onChangeText}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#161718",
        width: "100%",
        gap: 16,
    },
    input: {
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#262626",
        backgroundColor: "#212223",
        borderRadius: 12,
        color: "#eeeeee",
        fontFamily: "Walsheim",
        fontWeight: 400,
        
    },
    error: {
        borderColor: "#ff4d4f",
        backgroundColor: "#ff4d4f22",
    },
});
