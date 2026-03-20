import React from 'react';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Project overview and key metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Productivity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">87%</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Now</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
            <div>
              <p className="text-sm text-gray-900">Project "Website Redesign" completed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm text-gray-900">New team member added to "Mobile App"</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
            <div>
              <p className="text-sm text-gray-900">Sprint review scheduled for next week</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
            <div>
              <p className="text-sm text-gray-900">Deployment pipeline updated</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Development</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full">
                  <div className="w-3/4 h-2 bg-blue-500 rounded-full" />
                </div>
                <span className="text-xs text-gray-500">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Design</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full">
                  <div className="w-1/2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-xs text-gray-500">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Marketing</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full">
                  <div className="w-1/3 h-2 bg-yellow-500 rounded-full" />
                </div>
                <span className="text-xs text-gray-500">33%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tasks completed this week</span>
              <span className="text-sm font-semibold text-gray-900">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Average completion time</span>
              <span className="text-sm font-semibold text-gray-900">2.4 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">On-time delivery rate</span>
              <span className="text-sm font-semibold text-gray-900">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tasks in progress</span>
              <span className="text-sm font-semibold text-gray-900">7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
