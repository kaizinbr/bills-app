// components/core/dropdown-menu.tsx
import { useRef, useState } from "react";
import {
    View,
    Pressable,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export type DropdownItem = {
    id: string;
    name?: string;
    label: string;
};

type DropdownMenuProps = {
    items: DropdownItem[];
    selectedId: string | null;
    onSelect: (itemId: string) => void;
    placeholder: string;
    showIcon?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const MAX_MENU_HEIGHT = 280;

export default function DropdownMenu({
    items,
    selectedId,
    onSelect,
    placeholder,
    showIcon = false,
    open: controlledOpen,
    onOpenChange,
}: DropdownMenuProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const buttonRef = useRef<View>(null);

    const openMenu = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height });
            setOpen(true);
        });
    };

    const selectedItem = items.find((item) => item.id === selectedId);

    return (
        <>
            <Pressable ref={buttonRef} onPress={openMenu} style={styles.headerButton}>
                {showIcon && <View style={styles.itemIcon} />}
                <Text style={styles.headerButtonTitle} numberOfLines={1}>
                    {selectedItem?.label || selectedItem?.name || placeholder}
                </Text>
            </Pressable>

            <Modal visible={open} transparent statusBarTranslucent onRequestClose={() => setOpen(false)}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={[
                            styles.dropdownMenu,
                            {
                                position: "absolute",
                                top: anchor.y + anchor.height + 8,
                                left: anchor.x,
                                width: Math.max(anchor.width, 220),
                            },
                        ]}
                    >
                        <ScrollView
                            style={{ maxHeight: MAX_MENU_HEIGHT }}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {items.map((item) => (
                                <Pressable
                                    key={item.id}
                                    style={[
                                        styles.dropdownItem,
                                        item.id === selectedId && styles.dropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                        onSelect(item.id);
                                        setOpen(false);
                                    }}
                                >
                                    {showIcon && <View style={styles.itemIcon} />}
                                    <Text style={styles.dropdownItemText}>{item.label || item.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        maxWidth: "100%",
        backgroundColor: "#2b2b2b",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        borderWidth: 1,
        borderColor: "#3a3a3a",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    headerButtonTitle: {
        flexShrink: 1,
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    dropdownMenu: {
        backgroundColor: "#1f1f1f",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3a3a",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2d2d2d",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dropdownItemSelected: {
        backgroundColor: "#2d3a2f",
    },
    dropdownItemText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
    itemIcon: {
        height: 24,
        width: 24,
        borderRadius: 999,
        backgroundColor: "#5E8C61",
    },
});