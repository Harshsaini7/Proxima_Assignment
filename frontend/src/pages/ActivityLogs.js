import React, { useState, useEffect } from 'react';
import { activityLogsAPI } from '../services/api';
import { FiActivity } from 'react-icons/fi';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    module: '',
    action: ''
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filters.module && { module: filters.module }),
        ...(filters.action && { action: filters.action })
      };

      const response = await activityLogsAPI.getAll(params);
      setLogs(response.data.data.activityLogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1);
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return 'badge-won';
      case 'UPDATE':
        return 'badge-in-progress';
      case 'DELETE':
        return 'badge-lost';
      case 'LOGIN':
        return 'badge-new';
      default:
        return 'badge-new';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="activity-logs-container">
      <div className="page-header">
        <h1>
          <FiActivity /> Activity Logs
        </h1>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          name="module"
          value={filters.module}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Modules</option>
          <option value="Lead">Lead</option>
          <option value="Contact">Contact</option>
          <option value="Deal">Deal</option>
          <option value="User">User</option>
          <option value="Auth">Auth</option>
        </select>

        <select
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
      </div>

      {/* Activity Logs */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading activity logs...</div>
        ) : logs.length > 0 ? (
          <>
            <div className="activity-timeline">
              {logs.map((log) => (
                <div key={log._id} className="activity-item">
                  <div className="activity-icon">
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4>{log.user?.name || 'Unknown User'}</h4>
                      <span className="activity-time">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="activity-description">
                      <strong>{log.action}</strong> {log.module}
                      {log.recordTitle && `: ${log.recordTitle}`}
                    </p>
                    {log.user && (
                      <div className="activity-meta">
                        <span>Email: {log.user.email}</span>
                        <span>Role: {log.user.role}</span>
                      </div>
                    )}
                    {log.ipAddress && (
                      <div className="activity-meta">
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">No activity logs found</div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
