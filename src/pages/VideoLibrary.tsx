
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X, Play, ExternalLink } from "lucide-react";

// Real YouTube videos for mental health
const videos = [
  {
    id: 1,
    title: "Understanding Anxiety and Panic Attacks",
    description: "Learn about anxiety disorders, their symptoms, and effective coping strategies from mental health professionals.",
    duration: "12:34",
    category: "Anxiety",
    thumbnail: "https://img.youtube.com/vi/jryCoo0BrRk/maxresdefault.jpg",
    youtubeId: "jryCoo0BrRk",
  },
  {
    id: 2,
    title: "10 Minute Mindfulness Meditation",
    description: "A guided mindfulness meditation to help reduce stress, improve focus, and promote mental wellbeing.",
    duration: "10:15",
    category: "Meditation",
    thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg",
    youtubeId: "ZToicYcHIOU",
  },
  {
    id: 3,
    title: "Cognitive Behavioral Therapy Techniques",
    description: "Learn practical CBT techniques to challenge negative thought patterns and improve mental health.",
    duration: "18:45",
    category: "Therapy",
    thumbnail: "https://img.youtube.com/vi/0ViaCs0k2Mc/maxresdefault.jpg",
    youtubeId: "0ViaCs0k2Mc",
  },
  {
    id: 4,
    title: "Sleep Hygiene for Better Mental Health",
    description: "Tips and techniques for improving sleep quality and its impact on mental wellbeing.",
    duration: "14:12",
    category: "Sleep",
    thumbnail: "https://img.youtube.com/vi/t0kACis_dJE/maxresdefault.jpg",
    youtubeId: "t0kACis_dJE",
  },
  {
    id: 5,
    title: "Understanding and Managing Depression",
    description: "Professional insights into depression symptoms, causes, and effective treatment approaches.",
    duration: "20:30",
    category: "Depression",
    thumbnail: "https://img.youtube.com/vi/z-IR48Mb3W0/maxresdefault.jpg",
    youtubeId: "z-IR48Mb3W0",
  },
  {
    id: 6,
    title: "Stress Management Techniques",
    description: "Learn practical methods to reduce stress and build resilience in your daily life.",
    duration: "16:15",
    category: "Stress",
    thumbnail: "https://img.youtube.com/vi/hnpQrMqDoqE/maxresdefault.jpg",
    youtubeId: "hnpQrMqDoqE",
  },
  {
    id: 7,
    title: "Building Emotional Resilience",
    description: "Strategies for developing stronger emotional resilience to cope with life's challenges.",
    duration: "22:40",
    category: "Resilience",
    thumbnail: "https://img.youtube.com/vi/NWH8N-BvhAw/maxresdefault.jpg",
    youtubeId: "NWH8N-BvhAw",
  },
  {
    id: 8,
    title: "Healthy Boundaries in Relationships",
    description: "Learn how to establish and maintain healthy boundaries in personal and professional relationships.",
    duration: "19:25",
    category: "Relationships",
    thumbnail: "https://img.youtube.com/vi/5XS8dhwyQzY/maxresdefault.jpg",
    youtubeId: "5XS8dhwyQzY",
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
        <DialogContent className="max-w-5xl w-full">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVideo.title}</DialogTitle>
                <DialogDescription>{selectedVideo.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Category:</span> 
                  <span className="px-2 py-1 bg-support-100 text-support-700 rounded-md text-sm">{selectedVideo.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">Duration:</span> {selectedVideo.duration}
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <a 
                      href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Watch on YouTube
                    </a>
                  </Button>
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
