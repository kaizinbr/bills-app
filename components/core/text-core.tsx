import { Text, TextProps } from "react-native";
import { useAppTheme } from "@/theme/theme-context";

interface TextDefaultProps extends TextProps {
    children: React.ReactNode;
}

export default function TextDefault({
    children,
    style,
    ...props
}: TextDefaultProps) {
    const { colors } = useAppTheme();

    return (
        <Text
            style={[
                { color: colors.text, fontWeight: 400, fontFamily: "ana" },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
}
