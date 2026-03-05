import React from 'react';
import { BarChart3, Users, Globe, Zap, Shield, Clock, TrendingUp, Award } from 'lucide-react';

export const StatsPage: React.FC = () => {
  const platformStats = [
    { label: 'Total Users', value: '12,847', icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Tasks Created', value: '84,291', icon: BarChart3, color: 'text-green-600 bg-green-100' },
    { label: 'Tasks Completed', value: '67,433', icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { label: 'Completion Rate', value: '80%', icon: Award, color: 'text-amber-600 bg-amber-100' },
  ];

  const features = [
    { label: 'Uptime', value: '99.9%', icon: Zap, description: 'Reliable and always available' },
    { label: 'Avg Response Time', value: '45ms', icon: Clock, description: 'Lightning-fast performance' },
    { label: 'Data Encrypted', value: 'AES-256', icon: Shield, description: 'Enterprise-grade security' },
    { label: 'Countries Served', value: '120+', icon: Globe, description: 'Used worldwide' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Stats</h1>
        <p className="text-gray-500 mt-1">A snapshot of TaskFlow by the numbers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.label} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <feature.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{feature.label}</p>
                <p className="text-xl font-bold text-gray-900">{feature.value}</p>
                <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About TaskFlow</h2>
        <p className="text-gray-500 leading-relaxed">
          TaskFlow is a modern task management application designed to help individuals and teams stay organized.
          With features like categories, subtasks, priority levels, and due date tracking, TaskFlow makes it
          easy to manage your work and hit your goals.
        </p>
      </div>
    </div>
  );
};
