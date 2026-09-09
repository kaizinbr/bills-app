import {
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { useRouter, Href, Link } from "expo-router";
import { Image } from "expo-image";
import { UserProfile } from "@/lib/types";
import { useAuth } from "@/components/core/auth-provider";
import TextDefault from "@/components/core/text-core";
import { useProfile } from "@/hooks/use-profile";

export default function Avatar({
    data,
    style,
    size,
    fontSize,
}: {
    data?: UserProfile;
    style?: any;
    size?: number;
    fontSize?: number;
}) {
    const router = useRouter();

    const { data: profile, isLoading } = useProfile();

    return (
        <>
            {isLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
            ) : (
                <View style={[styles.main]}>
                    {profile.image ? (
                        <Image
                            source={{ uri: profile.image }}
                            style={[
                                styles.cardImage,
                                style,
                                {
                                    width: size || 32,
                                    height: size || 32,
                                    borderRadius: 9999,
                                },
                            ]}
                        />
                    ) : (
                        <View
                            style={[
                                styles.cardImage,
                                style,
                                {
                                    width: size || 32,
                                    height: size || 32,
                                    borderRadius: 9999,
                                },
                            ]}
                        >
                            <TextDefault style={styles.cardImageText}>
                                {profile.name?.[0].toUpperCase()}
                            </TextDefault>
                        </View>
                    )}
                    <TextDefault
                        style={{
                            color: "#eeeeee",
                            fontSize: fontSize || 12,
                            marginTop: 0,
                            fontWeight: "600",
                        }}
                        numberOfLines={1}
                    >
                        {profile.name}
                    </TextDefault>
                </View>
            )}
        </>
    );
}

export function AvatarNoPress({
    data,
    style,
    size,
    fontSize,
    focused,
}: {
    data?: UserProfile | any;
    style?: any;
    size?: number;
    fontSize?: number;
    focused?: boolean;
}) {
    const { data: profile, isLoading } = useProfile();
    return (
        <View
            style={[
                styles.main,
                {
                    width: size || 32,
                    height: size || 32,
                    borderRadius: 9999,
                },
            ]}
        >
            {profile.image ? (
                <Image
                    source={{ uri: profile.image }}
                    style={[
                        styles.cardImage,
                        style,
                        {
                            width: size || 32,
                            height: size || 32,
                            borderRadius: 9999,
                        },
                    ]}
                />
            ) : (
                <View
                    style={[
                        styles.cardImage,
                        style,
                        {
                            width: size || 32,
                            height: size || 32,
                            borderRadius: 9999,
                        },
                    ]}
                >
                    <TextDefault style={[styles.cardImageText, { fontSize: fontSize || 16 }]}>
                        {profile.name?.[0].toUpperCase()}
                    </TextDefault>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        backgroundColor: "transparent",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
    },
    mainPressed: {
        backgroundColor: "#1e1e1e",
    },
    cardImage: {
        width: 32,
        height: 32,
        backgroundColor: "#009C7A",
        borderRadius: 32 * 0.306,
        alignItems: "center",
        justifyContent: "center",
    },
    cardImageText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
    },
});
