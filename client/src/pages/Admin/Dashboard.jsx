import React from 'react';
import { Users, BookOpen, MessageSquare, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-indigo-600' },
        { title: 'Active Courses', value: '12', icon: BookOpen, color: 'bg-green-500' },
        { title: 'New Inquiries', value: '45', icon: MessageSquare, color: 'bg-yellow-500' },
        { title: 'Job Postings', value: '8', icon: Briefcase, color: 'bg-blue-500' },
    ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Inquiries</h2>
              <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                          <div>
                              <p className="font-medium text-gray-900">Jane Doe</p>
                              <p className="text-sm text-gray-500">Full Stack Course</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">New</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Quick Actions */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors text-center">
                     Add New Course
                  </button>
                  <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors text-center">
                     Post Job
                  </button>
                  <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors text-center">
                     Write Blog
                  </button>
                  <button className="p-4 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors text-center">
                     View Reports
                  </button>
              </div>
           </div>
      </div>
    </div>
  );
};

export default Dashboard;
