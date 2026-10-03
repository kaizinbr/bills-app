import { useEffect, useState } from "react";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import BackBtn from "@/components/core/back-btn";
import Input from "@/components/core/input";
import ProfileImagePicker from "@/components/user/profile-image-picker";
import { useProfile } from "@/hooks/use-profile";
import api from "@/lib/api";

const DEFAULT_COLOR = "#009C7A";

export default function EditProfile() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();

    const { data: profile, isLoading, refetch, isFetching } = useProfile();

    const [saving, setSaving] = useState(false);

    // rascunho local: só vai pro banco ao clicar em Salvar
    const [name, setName] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [color, setColor] = useState<string | null>(null);

    // inicializa o rascunho quando o perfil carrega.
    // Depende só do id para um refetch não sobrescrever o que o usuário editou.
    useEffect(() => {
        if (!profile) return;
        setName(profile.name ?? "");
        setImage(profile.image ?? null);
        setColor(profile.color ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.id]);

    const trimmedName = name.trim();
    const nameChanged = !!profile && trimmedName !== (profile.name ?? "");
    const imageChanged = !!profile && image !== (profile.image ?? null);
    const canSubmit =
        !saving && trimmedName.length > 0 && (nameChanged || imageChanged);

    const onRefresh = async () => {
        try {
            await refetch();
        } catch (error) {
            console.error("Error refreshing profile data:", error);
        }
    };

    const onSave = async () => {
        if (!profile || !canSubmit) return;

        setSaving(true);
        try {
            const payload: { name?: string; image?: string; color?: string } =
                {};

            if (nameChanged) payload.name = trimmedName;
            if (imageChanged && image && color) {
                payload.image = image;
                payload.color = color;
            }

            const { data } = await api.patch("/profile", payload);

            queryClient.setQueryData(["profile", profile.id], {
                ...profile,
                ...data,
            });
            await queryClient.invalidateQueries({
                queryKey: ["profile", profile.id],
            });

            router.back();
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Erro", "Não foi possível salvar o perfil.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            <BackBtn />
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={"#00c89b"} size={"large"} />
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <Animated.ScrollView
                        horizontal={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            paddingBottom: 64,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 16,
                            paddingTop: insets.top + 64,
                        }}
                        style={styles.container}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={onRefresh}
                                progressViewOffset={
                                    Platform.OS === "android"
                                        ? 64 + insets.top
                                        : 0
                                }
                                progressBackgroundColor="#282828"
                                colors={["#5E8C61", "#5E8C61"]}
                                style={{
                                    borderWidth: 0.5,
                                    borderColor: "#56595D",
                                }}
                            />
                        }
                    >
                        {/* gradiente com a cor dominante em preview */}
                        <LinearGradient
                            colors={[color || DEFAULT_COLOR, "#161718"]}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: insets.top + 164,
                                zIndex: -5,
                                opacity: 0.5,
                            }}
                        />

                        <View style={styles.content}>
                            <ProfileImagePicker
                                size={96}
                                image={image}
                                color={color}
                                name={name}
                                disabled={saving}
                                onChange={({
                                    image: newImage,
                                    color: newColor,
                                }) => {
                                    setImage(newImage);
                                    setColor(newColor);
                                }}
                            />

                            <TextDefault style={styles.title}>
                                {name}
                            </TextDefault>

                            <Input
                                placeholder="Nome"
                                value={name}
                                onChangeText={setName}
                                maxLength={20}
                                editable={!saving}
                            />

                            <Pressable
                                onPress={onSave}
                                disabled={!canSubmit}
                                style={({ pressed }) => [
                                    styles.submitBtn,
                                    {
                                        opacity: canSubmit ? 1 : 0.5,
                                        backgroundColor: pressed
                                            ? "#007B5E"
                                            : DEFAULT_COLOR,
                                    },
                                ]}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <TextDefault
                                        style={{
                                            color: "#fff",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Salvar
                                    </TextDefault>
                                )}
                            </Pressable>
                        </View>
                    </Animated.ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    container: {
        flex: 1,
        zIndex: 1,
    },
    content: {
        width: "100%",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        paddingHorizontal: 24,
    },
    submitBtn: {
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
    },
});
