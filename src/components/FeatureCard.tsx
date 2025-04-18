
import { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
};

const FeatureCard = ({ icon: Icon, title, description, iconColor = "text-support-500" }: FeatureCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover">
      <div className={`${iconColor} bg-gray-50 p-3 rounded-full w-fit`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
