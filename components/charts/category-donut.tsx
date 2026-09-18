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
    // espaço entre as listras, em px. Se não passar, calcula um valor
    // proporcional ao strokeWidth (ver comentário abaixo do porquê).
    gap?: number;
    centerLabel: string;
    centerSubLabel?: string;
};

export function CategoryDonut({
    segments,
    size = 200,
    strokeWidth = 16,
    gap,
    centerLabel,
    centerSubLabel,
}: CategoryDonutProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((sum, s) => sum + s.value, 0);

    // strokeLinecap="round" faz cada ponta da listra "estourar" pra fora do
    // fim do traço em ~strokeWidth/2. Com um gap menor que o strokeWidth
    // (era 3px pra um strokeWidth de 16), as pontas arredondadas de listras
    // vizinhas se sobrepõem e criam aquele efeito de "beliscão" em vez de
    // separação limpa. Por padrão, o gap agora escala com o strokeWidth.
    const resolvedGap = gap ?? strokeWidth * 1.1;
    const effectiveGap = segments.length > 1 ? resolvedGap : 0;
    const halfGap = effectiveGap / 2;

    let cumulative = 0;

    return (
        <View
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Svg
                width={size}
                height={size}
                style={{ transform: [{ rotate: "-90deg" }] }}
            >
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
                        const visibleLength = Math.max(
                            segmentLength - effectiveGap,
                            0,
                        );

                        // desloca o início em meio gap pra que a folga fique
                        // centrada entre as listras, não jogada só no fim de
                        // cada uma (o que gerava assimetria antes)
                        const dashOffset = -(cumulative + halfGap);
                        cumulative += segmentLength;

                        return (
                            <Circle
                                key={segment.id}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${visibleLength} ${circumference}`}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                fill="none"
                            />
                        );
                    })}
            </Svg>

            <View style={{ position: "absolute", alignItems: "center" }}>
                <TextDefault
                    style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}
                >
                    {centerLabel}
                </TextDefault>
                {centerSubLabel && (
                    <TextDefault
                        style={{
                            color: "#B6B6B6",
                            fontSize: 12,
                            marginTop: 2,
                        }}
                    >
                        {centerSubLabel}
                    </TextDefault>
                )}
            </View>
        </View>
    );
}