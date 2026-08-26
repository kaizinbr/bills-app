import { Text, TextProps } from "react-native";

interface TextDefaultProps extends TextProps {
    children: React.ReactNode;
}

export default function TextDefault({ children, style, ...props }: TextDefaultProps) {
    return (
        <Text
            style={[
                {
                    color: "#eee",
                    fontWeight: 400,
                    fontFamily: "Walsheim",
                },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
}