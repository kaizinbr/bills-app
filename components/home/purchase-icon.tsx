import { Bag3Icon } from "@solar-icons/react-native/linear/bag-3";
import { BagCheckIcon } from "@solar-icons/react-native/linear/bag-check";
import { CardIcon } from "@solar-icons/react-native/linear/card";
import { RefreshCircleIcon } from "@solar-icons/react-native/linear/refresh-circle";
import { UserCircleIcon } from "@solar-icons/react-native/linear/user-circle";
import { WalletIcon } from "@solar-icons/react-native/linear/wallet";
import { StyleSheet, View } from "react-native";
import { DonutIcon } from '@solar-icons/react-native/linear/donut'
import { CartLarge4Icon } from '@solar-icons/react-native/linear/cart-large-4'
import { ChefHatIcon } from '@solar-icons/react-native/linear/chef-hat'
import { PillIcon } from '@solar-icons/react-native/linear/pill'
import { BusIcon } from '@solar-icons/react-native/linear/bus'
import { ClapperboardOpenIcon } from '@solar-icons/react-native/linear/clapperboard-open'
import { MusicNote3Icon } from '@solar-icons/react-native/linear/music-note-3'

type PurchaseIconProps = {
    categoryKey?: string | null;
};

const iconProps = {
    size: 20,
    color: "#111827",
    strokeWidth: 1.8,
};

export function PurchaseIcon({ categoryKey }: PurchaseIconProps) {
    let Icon = Bag3Icon;

    switch (categoryKey) {
        case "lanche":
            Icon = DonutIcon;
            break;
        case "mercado":
            Icon = CartLarge4Icon;
            break;
        case "compras":
            Icon = Bag3Icon;
            break;
        case "restaurante":
            Icon = ChefHatIcon;
            break;
        case "farmacia":
            Icon = PillIcon;
            break;
        case "transporte":
            Icon = BusIcon;
            break;
        case "contas":
            Icon = WalletIcon;
            break;
        case "parcela":
        case "netflix":
        case "hbo":
        case "prime-video":
        case "disney-plus":
        case "youtube-premium":
            Icon = ClapperboardOpenIcon;
            break;
        case "spotify":
        case "deezer":
        case "apple-music":
            Icon = MusicNote3Icon;
            break;
        case "emprestimo":
            Icon = WalletIcon;
            break;
    }

    return (
        <View style={styles.container}>
            <Icon {...iconProps} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00C89B",
        borderRadius: 999,
    },
});
