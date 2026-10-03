import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import TextDefault from "@/components/core/text-core";
import api from "@/lib/api";

const FALLBACK_COLOR = "#009C7A";

type AvatarUploadResponse = { image: string; color: string };

type Props = {
    size?: number;
    image?: string | null;
    color?: string | null;
    name?: string;
    onChange: (value: { image: string; color: string }) => void;
    disabled?: boolean;
};

export default function ProfileImagePicker({
    size = 96,
    image,
    color,
    name,
    onChange,
    disabled,
}: Props) {
    const [isUploading, setIsUploading] = useState(false);

        const chooseImage = async () => {
        if (isUploading || disabled) return;

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                "Permissão necessária",
                "Permita o acesso às fotos para escolher uma imagem de perfil.",
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
            exif: false,
        });

        if (result.canceled || !result.assets[0]?.uri) return;

        setIsUploading(true);
        try {
            const asset = result.assets[0];
            const contentType = asset.mimeType || "image/jpeg";

            const imageResponse = await fetch(asset.uri);
            const imageBuffer = await imageResponse.arrayBuffer();

            const response = await api.post<AvatarUploadResponse>(
                "/avatar/upload",
                imageBuffer,
                {
                    headers: { "Content-Type": contentType },
                    // impede o axios de tentar serializar o corpo como JSON
                    transformRequest: [(data) => data],
                    timeout: 120_000,
                },
            );

            console.log("Avatar upload:", response.data);
            onChange({ image: response.data.image, color: response.data.color });
        } catch (error) {
            console.error("Error uploading profile image:", error);
            Alert.alert("Erro", "Não foi possível enviar a foto de perfil.");
        } finally {
            setIsUploading(false);
        }
    };

    const imageColor = color || FALLBACK_COLOR;
    const imageSize = { width: size, height: size, borderRadius: size / 2 };

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            disabled={isUploading || disabled}
            onPress={chooseImage}
            style={({ pressed }) => [
                styles.container,
                imageSize,
                { borderColor: imageColor, opacity: pressed ? 0.8 : 1 },
            ]}
        >
            {image ? (
                <Image
                    source={{ uri: image }}
                    style={{
                        width: size - 6,
                        height: size - 6,
                        borderRadius: (size - 6) / 2,
                    }}
                    contentFit="cover"
                    onError={(e) => console.error("Avatar image error:", e.error)}
                />
            ) : (
                <View style={[styles.fallback, imageSize, { backgroundColor: imageColor }]}>
                    <TextDefault style={[styles.initial, { fontSize: size / 2.5 }]}>
                        {name?.[0]?.toUpperCase()}
                    </TextDefault>
                </View>
            )}
            <View style={styles.badge}>
                {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <TextDefault style={styles.badgeText}>Trocar</TextDefault>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { borderWidth: 3, alignItems: "center", justifyContent: "center", position: "relative" },
    // image: { position: "absolute" },
    fallback: { alignItems: "center", justifyContent: "center" },
    initial: { color: "#fff", fontWeight: "700" },
    badge: {
        position: "absolute",
        bottom: -10,
        backgroundColor: "#161718",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});