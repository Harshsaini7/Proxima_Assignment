import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers, FiUserCheck, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await reportsAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  const { overview, dealsByStage, leadsByStatus, recentActivities } = stats;

  // Prepare data for charts
  const dealsChartData = [
    { name: 'New', value: dealsByStage.new, color: '#2196F3' },
    { name: 'In Progress', value: dealsByStage.inProgress, color: '#FF9800' },
    { name: 'Won', value: dealsByStage.won, color: '#4CAF50' },
    { name: 'Lost', value: dealsByStage.lost, color: '#F44336' }
  ];

  const leadsChartData = leadsByStatus.map(item => ({
    name: item._id,
    value: item.count
  }));

  const COLORS = ['#2196F3', '#FF9800', '#4CAF50', '#F44336', '#9C27B0'];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiUsers />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Leads</p>
            <h3 className="stat-value">{overview.totalLeads}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiUserCheck />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Contacts</p>
            <h3 className="stat-value">{overview.totalContacts}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FiDollarSign />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Deals</p>
            <h3 className="stat-value">{overview.totalDeals}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FiTrendingUp />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">${overview.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Deals by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dealsChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dealsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#667eea" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <div className="activity-section">
          <h3>Recent Leads</h3>
          {recentActivities.recentLeads.length > 0 ? (
            <div className="activity-list">
              {recentActivities.recentLeads.map((lead) => (
                <div key={lead._id} className="activity-item">
                  <div>
                    <p className="activity-title">{lead.firstName} {lead.lastName}</p>
                    <p className="activity-meta">{lead.email} • {lead.company}</p>
                  </div>
                  <span className={`badge badge-${lead.status.toLowerCase().replace(' ', '-')}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent leads</p>
          )}
        </div>

        <div className="activity-section">
          <h3>Recent Deals</h3>
          {recentActivities.recentDeals.length > 0 ? (
            <div className="activity-list">
              {recentActivities.recentDeals.map((deal) => (
                <div key={deal._id} className="activity-item">
                  <div>
                    <p className="activity-title">{deal.title}</p>
                    <p className="activity-meta">
                      ${deal.amount.toLocaleString()} • {deal.contact?.firstName} {deal.contact?.lastName}
                    </p>
                  </div>
                  <span className={`badge badge-${deal.stage.toLowerCase().replace(' ', '-')}`}>
                    {deal.stage}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent deals</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
