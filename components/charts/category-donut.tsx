import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import TextDefault from "@/components/core/text-core";

export type DonutSegment = {
    id: string;
    key: string;
    label: string;
    value: number;
    color: string;
};

type CategoryDonutProps = {
    segments: DonutSegment[];
    size?: number;
    strokeWidth?: number;
    centerLabel: string;
    centerSubLabel?: string;
};

export function CategoryDonut({
    segments,
    size = 200,
    strokeWidth = 28,
    centerLabel,
    centerSubLabel,
}: CategoryDonutProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((sum, s) => sum + s.value, 0);

    let cumulative = 0;

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#232323"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {total > 0 &&
                    segments.map((segment) => {
                        const fraction = segment.value / total;
                        const segmentLength = fraction * circumference;
                        const gap = segments.length > 1 ? 3 : 0;
                        const dashOffset = -cumulative;
                        cumulative += segmentLength;

                        return (
                            <Circle
                                key={segment.id}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${Math.max(segmentLength - gap, 0)} ${circumference}`}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                fill="none"
                            />
                        );
                    })}
            </Svg>

            <View style={{ position: "absolute", alignItems: "center" }}>
                <TextDefault style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>
                    {centerLabel}
                </TextDefault>
                {centerSubLabel && (
                    <TextDefault style={{ color: "#B6B6B6", fontSize: 12, marginTop: 2 }}>
                        {centerSubLabel}
                    </TextDefault>
                )}
            </View>
        </View>
    );
}