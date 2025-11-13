import React, { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../services/api';
import { notify, sendEmailNotification } from '../utils/notifications';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import './Common.css';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    source: 'Other',
    status: 'New',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [page, search, statusFilter, sourceFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(sourceFilter && { source: sourceFilter })
      };

      const response = await leadsAPI.getAll(params);
      setLeads(response.data.data.leads);
      setPagination(response.data.pagination);
    } catch (error) {
      notify.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingLead) {
        await leadsAPI.update(editingLead._id, formData);
        notify.success('Lead updated successfully');

        // Mock email notification
        sendEmailNotification(
          formData.email,
          'Lead Updated',
          `Your lead information has been updated.`
        );
      } else {
        await leadsAPI.create(formData);
        notify.success('Lead created successfully');

        // Mock email notification
        sendEmailNotification(
          formData.email,
          'Welcome - New Lead',
          `Thank you for your interest! We'll be in touch soon.`
        );
      }

      closeModal();
      fetchLeads();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || '',
      jobTitle: lead.jobTitle || '',
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo?._id || '',
      notes: lead.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(id);
        notify.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        notify.error('Failed to delete lead');
      }
    }
  };

  const openModal = () => {
    setEditingLead(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      source: 'Other',
      status: 'New',
      assignedTo: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSourceFilterChange = (e) => {
    setSourceFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Leads Management</h1>
        <button onClick={openModal} className="btn btn-primary">
          <FiPlus /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <select value={statusFilter} onChange={handleStatusFilterChange} className="filter-select">
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Unqualified">Unqualified</option>
          <option value="Converted">Converted</option>
        </select>
        <select value={sourceFilter} onChange={handleSourceFilterChange} className="filter-select">
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Social Media">Social Media</option>
          <option value="Cold Call">Cold Call</option>
          <option value="Email Campaign">Email Campaign</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.firstName} {lead.lastName}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.company || '-'}</td>
                    <td>{lead.source}</td>
                    <td>
                      <span className={`badge badge-${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>{lead.assignedTo?.name || '-'}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
          <div className="no-data">No leads found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    className="form-control"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    className="form-control"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Source</label>
                  <select
                    name="source"
                    className="form-control"
                    value={formData.source}
                    onChange={handleInputChange}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Unqualified">Unqualified</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  name="assignedTo"
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
