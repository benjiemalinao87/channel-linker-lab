import { useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import { CategoryFilter } from "@/components/CategoryFilter";

const DEMO_CONTENT = [
  {
    type: "video" as const,
    title: "Getting Started Tutorial",
    description: "Learn the basics of our platform",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
  {
    type: "audio" as const,
    title: "Platform Overview",
    description: "Audio guide to key features",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  },
  {
    type: "link" as const,
    title: "Documentation",
    description: "Detailed platform documentation",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  },
];

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredContent = DEMO_CONTENT.filter(
    (item) => activeCategory === "all" || item.type === activeCategory
  );

  const handleMediaClick = (type: string, title: string) => {
    console.log(`Clicked ${type} item: ${title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Media Dashboard</h1>
        
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item, index) => (
            <MediaCard
              key={index}
              {...item}
              onClick={() => handleMediaClick(item.type, item.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};