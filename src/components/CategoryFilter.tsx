import { Button } from "./ui/button";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = ["all", "video", "audio", "link"];

  return (
    <div className="flex gap-2 mb-6 animate-slide-in">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className="capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};