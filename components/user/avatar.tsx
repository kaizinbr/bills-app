import { Text, View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
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
}: {
    data?: UserProfile;
    style?: any;
    size?: number;
}) {
    const router = useRouter();

    const { data: profile, isLoading } = useProfile();


    return (
        <>
            {isLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
            ) : (<Pressable
            onPress={() =>
                router.push({
                    pathname: "/",
                    // params: { username: data.lowername },
                })
            }
            style={({ pressed }) => [
                styles.main,
                pressed && styles.mainPressed,
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
                <View style={[
                    styles.cardImage,
                    style,
                    {
                        width: size || 32,
                        height: size || 32,
                        borderRadius: 9999,
                    },
                ]} />
            )}
            <TextDefault style={{ color: "#eeeeee", fontSize: 12, marginTop: 4 }}>
                {profile.name}
            </TextDefault>
        </Pressable>)}
        </>
    );
}

export function AvatarNoPress({
    data,
    style,
    size,
    focused
}: {
    data: UserProfile | any;
    style?: any;
    size?: number;
    focused?: boolean;
}) {
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
            <Image
                source={{ uri: data.avatar_url! }}
                style={[
                    styles.cardImage,
                    style,
                    {
                        width: size || 32,
                        height: size || 32,
                        borderRadius: 9999,
                    borderWidth: focused ? 2 : 0,
                    borderColor: focused ? "#8065ef" : "transparent",
                    },
                ]}
            />
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
        backgroundColor: "#bbb",
        borderRadius: 32 * 0.306,
    },
});
