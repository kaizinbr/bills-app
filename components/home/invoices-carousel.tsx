// import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import TextDefault from "@/components/core/text-core";
import { useSharedValue } from "react-native-reanimated";
import { Carousel } from "react-native-reanimated-carousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// import { window } from "@/constants/sizes";

const defaultDataWith6Colors = [
    "Fatura 1",
    "Fatura 2",
    "Fatura 3",
    "Fatura 4",
    "Fatura 5",
    "Fatura 6",
];

function Index() {
    const scrollOffsetValue = useSharedValue<number>(0);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View
                id="carousel-component"
                // dataSet={{ kind: "basic-layouts", name: "normal" }}
            >
                <Carousel
                    testID={"normal-carousel-demo"}
                    loop={false}
                    data={defaultDataWith6Colors}
                    scrollOffsetValue={scrollOffsetValue}
                    style={{ width: "100%", height: 32 }}
                    orientation="horizontal"
                    onScrollStart={() => {
                        console.log("Scroll start");
                    }}
                    onSnapToItem={(index: number) =>
                        console.log("current index:", index)
                    }
                    renderItem={({ item }) => (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TextDefault>{item}</TextDefault>
                        </View>
                    )}
                    
                />
            </View>
        </GestureHandlerRootView>
    );
}

export default Index;
