'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { ChevronDown } from 'lucide-react';

interface AnalyticsData {
  [key: string]: string | number;
  date: string;
  clicks: number;
}

interface AnalyticsChartProps {
  data?: AnalyticsData[];
}

type TimePeriod = 'week' | 'month' | 'year';

export default function AnalyticsChart({ }: AnalyticsChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartData, setChartData] = useState<AnalyticsData[]>([]);

  const periodLabels = {
    week: 'Last 7 days',
    month: 'Last 30 days',
    year: 'Last 12 months'
  };

  // Fonction pour récupérer les données selon la période
  const fetchAnalyticsData = useCallback(async (period: TimePeriod) => {
    try {
      const response = await fetch(`/api/analytics/period?period=${period}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
    return generateMockData(period);
  }, []);

  // Générer des données fictives si pas de données réelles
  const generateMockData = (period: TimePeriod): AnalyticsData[] => {
    const now = new Date();
    const data: AnalyticsData[] = [];

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          clicks: Math.floor(Math.random() * 200) + 50
        });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          clicks: Math.floor(Math.random() * 300) + 100
        });
      }
    } else if (period === 'year') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          clicks: Math.floor(Math.random() * 2000) + 500
        });
      }
    }

    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      const newData = await fetchAnalyticsData(selectedPeriod);
      setChartData(newData);
    };
    loadData();
  }, [selectedPeriod, fetchAnalyticsData]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
  const averageClicks = chartData.length > 0 ? Math.round(totalClicks / chartData.length) : 0;

  const getGrowthPercentage = () => {
    if (chartData.length < 2) return 0;
    const firstValue = chartData[0].clicks;
    const lastValue = chartData[chartData.length - 1].clicks;
    return firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0;
  };

  const growthPercentage = getGrowthPercentage();

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-lg font-[200]">Analytics</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-sm text-gray-400">
              Total: <span className="text-white font-[200]">{totalClicks.toLocaleString()}</span> clicks
            </div>
            <div className="text-sm text-gray-400">
              Average: <span className="text-white font-[200]">{averageClicks}</span> per day
            </div>
            {growthPercentage !== 0 && (
              <div className={`text-sm ${growthPercentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {growthPercentage > 0 ? '+' : ''}{growthPercentage}%
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-black rounded-full px-4 py-2 text-white hover:bg-gray-900 transition-colors"
          >
            <span className="text-sm font-[200]">{periodLabels[selectedPeriod]}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-10">
              {Object.entries(periodLabels).map(([period, label]) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period as TimePeriod)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors font-[200] ${
                    selectedPeriod === period ? 'bg-purple-600 text-white' : 'text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart - Takes full width and remaining height */}
      <div className="flex-1 bg-gray-900/50 rounded-xl p-4 min-h-0">
        {chartData.length > 0 ? (
          <LineChart
            dataset={chartData}
            xAxis={[{
              scaleType: 'band',
              dataKey: 'date',
              tickLabelStyle: { fill: '#9CA3AF', fontSize: 12 }
            }]}
            series={[{
              dataKey: 'clicks',
              color: '#A855F7',
              label: 'Clicks',
              curve: 'catmullRom',
              area: true
            }]}
            width={undefined}
            height={undefined}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
            sx={{
              width: '100% !important',
              height: '100% !important',
              '& .MuiChartsAxis-line': { stroke: '#374151' },
              '& .MuiChartsAxis-tick': { stroke: '#374151' },
              '& .MuiChartsAxis-tickLabel': { fill: '#9CA3AF', fontSize: '12px' },
              '& .MuiChartsGrid-line': { stroke: '#374151', strokeDasharray: '3 3' },
              '& .MuiChartsTooltip-paper': {
                backgroundColor: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151'
              },
              '& .MuiChartsAreaElement-root': {
                fillOpacity: 0.1
              },
              '& .MuiChartsLegend-series': {
                display: 'none'
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 font-[200]">No data available</span>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1 font-[200]">Peak Day</div>
          <div className="text-white font-[200]">
            {chartData.length > 0
              ? chartData.reduce((max, current) => current.clicks > max.clicks ? current : max, chartData[0]).date
              : 'N/A'
            }
          </div>
          <div className="text-purple-400 text-sm font-[200]">
            {chartData.length > 0
              ? Math.max(...chartData.map(d => d.clicks)).toLocaleString() + ' clicks'
              : '0 clicks'
            }
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1 font-[200]">Low Day</div>
          <div className="text-white font-[200]">
            {chartData.length > 0
              ? chartData.reduce((min, current) => current.clicks < min.clicks ? current : min, chartData[0]).date
              : 'N/A'
            }
          </div>
          <div className="text-gray-400 text-sm font-[200]">
            {chartData.length > 0
              ? Math.min(...chartData.map(d => d.clicks)).toLocaleString() + ' clicks'
              : '0 clicks'
            }
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1 font-[200]">Trend</div>
          <div className="text-white font-[200]">
            {growthPercentage > 0 ? 'Growing' : growthPercentage < 0 ? 'Declining' : 'Stable'}
          </div>
          <div className={`text-sm font-[200] ${growthPercentage > 0 ? 'text-green-400' : growthPercentage < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {growthPercentage !== 0 ? `${growthPercentage > 0 ? '+' : ''}${growthPercentage}%` : '0%'}
          </div>
        </div>
      </div>
    </div>
  );
}