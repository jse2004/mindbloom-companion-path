
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type VideoCardProps = {
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  onClick: () => void;
};

const VideoCard = ({
  title,
  description,
  duration,
  category,
  thumbnail,
  onClick,
}: VideoCardProps) => {
  return (
    <Card className="overflow-hidden card-hover">
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={onClick}
          >
            <Play className="h-8 w-8 text-white" fill="white" />
          </Button>
        </div>
        <Badge className="absolute top-2 right-2 bg-support-500">{category}</Badge>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full text-support-600 hover:text-support-700 hover:bg-support-50"
          onClick={onClick}
        >
          Watch Video
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
