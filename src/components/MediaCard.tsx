import { Play, Headphones, Link } from "lucide-react";
import { Card } from "./ui/card";

interface MediaCardProps {
  type: "video" | "audio" | "link";
  title: string;
  description: string;
  thumbnail: string;
  onClick: () => void;
}

export const MediaCard = ({ type, title, description, thumbnail, onClick }: MediaCardProps) => {
  const icons = {
    video: Play,
    audio: Headphones,
    link: Link,
  };
  const Icon = icons[type];

  return (
    <Card 
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video relative">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon className="w-12 h-12 text-white" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Card>
  );
};