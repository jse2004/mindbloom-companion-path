import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X, Play } from "lucide-react";

// Sample video data
const videos = [
  {
    id: 1,
    title: "Understanding Anxiety",
    description: "Learn about the different types of anxiety disorders and how they affect your mind and body.",
    duration: "12:34",
    category: "Anxiety",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Mindfulness Meditation Basics",
    description: "A guided introduction to mindfulness meditation techniques to help reduce stress and improve focus.",
    duration: "15:20",
    category: "Meditation",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Cognitive Behavioral Therapy Techniques",
    description: "Practical CBT techniques you can use to challenge negative thought patterns.",
    duration: "18:45",
    category: "Therapy",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Improving Sleep Quality",
    description: "Tips and techniques for better sleep hygiene and overcoming insomnia.",
    duration: "14:12",
    category: "Sleep",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Managing Depression",
    description: "Understanding depression symptoms and effective management strategies.",
    duration: "20:30",
    category: "Depression",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Stress Reduction Techniques",
    description: "Learn practical methods to reduce stress in your daily life.",
    duration: "16:15",
    category: "Stress",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 7,
    title: "Building Emotional Resilience",
    description: "How to develop stronger emotional resilience to life's challenges.",
    duration: "22:40",
    category: "Resilience",
    thumbnail: "/placeholder.svg",
  },
  {
    id: 8,
    title: "Healthy Boundaries in Relationships",
    description: "Learn how to establish and maintain healthy boundaries in all types of relationships.",
    duration: "19:25",
    category: "Relationships",
    thumbnail: "/placeholder.svg",
  },
];

const categories = [
  "All",
  "Anxiety",
  "Depression",
  "Meditation",
  "Sleep",
  "Stress",
  "Therapy",
  "Relationships",
  "Resilience"
];

const VideoLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  const handleVideoClick = (video: (typeof videos)[0]) => {
    setSelectedVideo(video);
    setVideoDialogOpen(true);
  };

  const handleDialogClose = () => {
    setVideoDialogOpen(false);
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Therapeutic Video Library</h1>
            <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
              Expert-created videos focused on mental health prevention, coping strategies, and recovery techniques
            </p>
          </div>
          
          {/* Search and filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full md:w-auto"
            >
              <TabsList className="w-full md:w-auto flex overflow-x-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Video grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  category={video.category}
                  thumbnail={video.thumbnail}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No videos found matching your search.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVideo.title}</DialogTitle>
                <DialogDescription>{selectedVideo.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="mb-2">Video player would be integrated here</p>
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                    <Play className="mr-2 h-4 w-4" />
                    Play Video
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Category:</span> {selectedVideo.category}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {selectedVideo.duration}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default VideoLibrary;
