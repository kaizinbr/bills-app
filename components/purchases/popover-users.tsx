// components/core/dropdown-menu.tsx
import { useState, useRef } from "react";
import {
    View,
    Pressable,
    Text,
    StyleSheet,
    Modal,
    findNodeHandle,
    UIManager,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import DropdownMenu from "@/components/core/dropdown-menu";

export default function PopoverUsers({
    items,
    selectedId,
    onSelect,
    placeholder,
}: {
    items: any[];
    selectedId: string | null;
    onSelect: (itemId: string | null) => void;
    placeholder: string;
}) {
    console.log("PopoverUsers items:", items);
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const buttonRef = useRef<View>(null);

    const openMenu = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height });
            setOpen(true);
        });
    };

    return (
        <DropdownMenu
            items={items}
            selectedId={selectedId}
            onSelect={onSelect}
            placeholder={placeholder}
            showIcon
        />
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
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
    headerButtonActive: {
        borderColor: "#5E8C61",
        backgroundColor: "#303a32",
    },
    headerButtonTitle: {
        flexShrink: 1,
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "left",
    },
    popover: {
        backgroundColor: "#1f1f1f",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3a3a",
        overflow: "hidden",
        width: 220,
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    dropdownMenu: {
        width: 220,
        backgroundColor: "#1f1f1f",
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
    userImage: {
        height: 24,
        width: 24,
        borderRadius: 999,
        backgroundColor: "#5E8C61",
    },
});
