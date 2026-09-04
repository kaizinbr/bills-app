// components/home/popover-categories.tsx
import DropdownMenu from "@/components/core/dropdown-menu";

type CategoryItem = { id: string; label: string };

export default function PopoverCategories({
    items,
    selectedId,
    onSelect,
    placeholder,
}: {
    items: CategoryItem[];
    selectedId: string | null;
    onSelect: (itemId: string | null) => void;
    placeholder: string;
}) {
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