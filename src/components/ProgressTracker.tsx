
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Sample data - in a real app, this would come from an API
const data = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 59 },
  { day: "Wed", score: 80 },
  { day: "Thu", score: 81 },
  { day: "Fri", score: 56 },
  { day: "Sat", score: 70 },
  { day: "Sun", score: 75 },
];

const getScoreColor = (score: number) => {
  if (score < 40) return "#ef4444"; // Red for low scores
  if (score < 70) return "#f59e0b"; // Amber for medium scores
  return "#22c55e"; // Green for high scores
};

type ProgressTrackerProps = {
  title: string;
  description: string;
  currentScore: number;
  averageScore: number;
};

const ProgressTracker = ({ title, description, currentScore, averageScore }: ProgressTrackerProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Today's Score</p>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold" style={{ color: getScoreColor(currentScore) }}>
              {currentScore}
            </span>
            <span className="text-sm text-gray-500 ml-1">/100</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Weekly Average</p>
          <div className="mt-1 flex items-center">
            <span className="text-2xl font-bold" style={{ color: getScoreColor(averageScore) }}>
              {averageScore}
            </span>
            <span className="text-sm text-gray-500 ml-1">/100</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Score']}
              contentStyle={{ 
                borderRadius: '0.5rem', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Bar 
              dataKey="score" 
              radius={[4, 4, 0, 0]}
              fill="#a855f7" 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressTracker;
