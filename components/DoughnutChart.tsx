import React from 'react';

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  data: ChartDataItem[];
  title: string;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, title }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-gray-300 mt-4">No data available to display chart.</p>
      </div>
    );
  }

  let cumulativePercent = 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map(item => {
    const percent = (item.value / total) * 100;
    const strokeDashoffset = circumference * (1 - cumulativePercent / 100);
    const strokeDasharray = `${(circumference * percent) / 100} ${circumference * (1 - percent / 100)}`;
    cumulativePercent += percent;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="-rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="30"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
            />
          ))}
        </svg>
      </div>
      <div className="mt-4 w-full grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map(item => (
          <div key={item.label} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-200">{item.label}:</span>
            <span className="font-semibold ml-auto text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChart;