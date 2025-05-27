
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecommendationCardProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: number;
  completed: boolean;
  onUpdate: () => void;
}

const RecommendationCard = ({ 
  id, 
  title, 
  description, 
  category, 
  priority, 
  completed,
  onUpdate 
}: RecommendationCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCompleted = async () => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success(completed ? "Marked as incomplete" : "Marked as completed");
      onUpdate();
    } catch (error: any) {
      console.error('Error updating recommendation:', error);
      toast.error("Failed to update recommendation");
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "text-red-500";
    if (priority <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "professional":
        return "👩‍⚕️";
      case "anxiety":
        return "🫁";
      case "anger":
        return "😤";
      case "trauma":
        return "🧠";
      case "depression":
        return "💙";
      default:
        return "🌟";
    }
  };

  return (
    <Card className={`transition-all duration-200 ${completed ? 'opacity-75 bg-green-50' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <div>
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              <CardDescription className="text-sm capitalize">
                {category} • Priority {priority}
                <Star className={`inline ml-1 h-3 w-3 ${getPriorityColor(priority)}`} />
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCompleted}
            disabled={isUpdating}
            className="p-1"
          >
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      {description && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default RecommendationCard;
