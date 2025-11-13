import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;

      const response = await reportsAPI.getDealsReport(params);
      setReport(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value
    });
  };

  const applyFilter = () => {
    fetchReport();
  };

  const clearFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setTimeout(fetchReport, 100);
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (!report) {
    return <div className="error">Failed to load report data</div>;
  }

  const { summary, dealsByStage, dealsByUser, wonDeals, lostDeals } = report;

  const stageChartData = dealsByStage.map(item => ({
    name: item._id,
    count: item.count,
    amount: item.totalAmount,
    avgAmount: item.avgAmount
  }));

  const STAGE_COLORS = {
    'New': '#2196F3',
    'In Progress': '#FF9800',
    'Won': '#4CAF50',
    'Lost': '#F44336'
  };

  return (
    <div className="reports-container">
      <h1>Deals Report</h1>

      {/* Date Filter */}
      <div className="card filter-card">
        <h3>Filter by Date Range</h3>
        <div className="date-filters">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={dateFilter.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={dateFilter.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-actions">
            <button onClick={applyFilter} className="btn btn-primary">Apply</button>
            <button onClick={clearFilter} className="btn btn-secondary">Clear</button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card won">
          <h3>Total Revenue</h3>
          <p className="amount">${summary.totalRevenue.toLocaleString()}</p>
          <span className="label">From Won Deals</span>
        </div>
        <div className="summary-card">
          <h3>Won Deals</h3>
          <p className="count">{summary.wonDealsCount}</p>
          <span className="label">Successfully Closed</span>
        </div>
        <div className="summary-card">
          <h3>Lost Deals</h3>
          <p className="count">{summary.lostDealsCount}</p>
          <span className="label">Unsuccessfully Closed</span>
        </div>
        <div className="summary-card">
          <h3>Win Rate</h3>
          <p className="percentage">{summary.winRate}%</p>
          <span className="label">Success Rate</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="card chart-card">
          <h3>Deals by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#667eea" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Revenue by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, amount }) => `${name}: $${amount.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {stageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.name] || '#999'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance by User */}
      {dealsByUser.length > 0 && (
        <div className="card">
          <h3>Performance by User</h3>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Total Deals</th>
                <th>Won Deals</th>
                <th>Total Revenue</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {dealsByUser.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.userName}</strong>
                    <br />
                    <small>{user.userEmail}</small>
                  </td>
                  <td>{user.totalDeals}</td>
                  <td>{user.wonDeals}</td>
                  <td>${user.totalRevenue.toLocaleString()}</td>
                  <td>{user.winRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Won Deals List */}
      {wonDeals.length > 0 && (
        <div className="card">
          <h3>Won Deals</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Assigned To</th>
                <th>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {wonDeals.map((deal) => (
                <tr key={deal._id}>
                  <td>{deal.title}</td>
                  <td>${deal.amount.toLocaleString()}</td>
                  <td>{deal.assignedTo?.name}</td>
                  <td>{deal.actualCloseDate ? new Date(deal.actualCloseDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lost Deals List */}
      {lostDeals.length > 0 && (
        <div className="card">
          <h3>Lost Deals</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Assigned To</th>
                <th>Lost Reason</th>
              </tr>
            </thead>
            <tbody>
              {lostDeals.map((deal) => (
                <tr key={deal._id}>
                  <td>{deal.title}</td>
                  <td>${deal.amount.toLocaleString()}</td>
                  <td>{deal.assignedTo?.name}</td>
                  <td>{deal.lostReason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
