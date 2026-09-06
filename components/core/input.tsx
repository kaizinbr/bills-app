import { StyleSheet, TextInput, TextInputProps } from "react-native";
import React, { useState } from "react";

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
    const [isFocused, setIsFocused] = useState(false);
    return (
        <TextInput
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                styles.input,
                error && styles.error,
                style,
                isFocused && { borderBottomColor: "#00C89B" },
            ]}
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#212223",
        // backgroundColor: "#212223",
        // borderRadius: 12,
        color: "#eeeeee",
        fontFamily: "ana",
        fontWeight: 400,
    },
    error: {
        borderColor: "#ff4d4f",
        backgroundColor: "#ff4d4f22",
    },
});
