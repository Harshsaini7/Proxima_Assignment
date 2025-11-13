import React, { useState, useEffect } from 'react';
import { dealsAPI, contactsAPI, usersAPI } from '../services/api';
import { notify, sendEmailNotification, sendSMSNotification } from '../utils/notifications';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import './Common.css';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    stage: 'New',
    probability: '',
    expectedCloseDate: '',
    contact: '',
    assignedTo: '',
    lostReason: '',
    notes: ''
  });

  useEffect(() => {
    fetchDeals();
    fetchContacts();
    fetchUsers();
  }, [page, search, stageFilter]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(stageFilter && { stage: stageFilter })
      };

      const response = await dealsAPI.getAll(params);
      setDeals(response.data.data.deals);
      setPagination(response.data.pagination);
    } catch (error) {
      notify.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsAPI.getAll({ limit: 1000 });
      setContacts(response.data.data.contacts);
    } catch (error) {
      console.error('Failed to fetch contacts');
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-set probability based on stage
    if (name === 'stage') {
      let defaultProbability = formData.probability;
      if (value === 'New' && !formData.probability) {
        defaultProbability = '10';
      } else if (value === 'In Progress' && !formData.probability) {
        defaultProbability = '50';
      } else if (value === 'Won') {
        defaultProbability = '100';
      } else if (value === 'Lost') {
        defaultProbability = '0';
      }
      setFormData(prev => ({ ...prev, probability: defaultProbability }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        probability: parseFloat(formData.probability || 0)
      };

      if (editingDeal) {
        await dealsAPI.update(editingDeal._id, submitData);
        notify.success('Deal updated successfully');

        // Send notification if stage changed
        if (editingDeal.stage !== formData.stage) {
          const contact = contacts.find(c => c._id === formData.contact);
          if (contact) {
            if (formData.stage === 'Won') {
              sendEmailNotification(
                contact.email,
                'Deal Won - Congratulations!',
                `Great news! Your deal "${formData.title}" has been marked as Won.`
              );
              sendSMSNotification(
                contact.phone,
                `Congratulations! Your deal "${formData.title}" has been won!`
              );
            } else if (formData.stage === 'Lost') {
              sendEmailNotification(
                contact.email,
                'Deal Update',
                `Unfortunately, the deal "${formData.title}" has been closed as Lost.`
              );
            } else {
              sendEmailNotification(
                contact.email,
                'Deal Stage Updated',
                `Your deal "${formData.title}" has been moved to ${formData.stage} stage.`
              );
            }
          }
        }
      } else {
        await dealsAPI.create(submitData);
        notify.success('Deal created successfully');

        const contact = contacts.find(c => c._id === formData.contact);
        if (contact) {
          sendEmailNotification(
            contact.email,
            'New Deal Created',
            `A new deal "${formData.title}" has been created for you.`
          );
        }
      }

      closeModal();
      fetchDeals();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      amount: deal.amount.toString(),
      stage: deal.stage,
      probability: deal.probability.toString(),
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
      contact: deal.contact?._id || '',
      assignedTo: deal.assignedTo?._id || '',
      lostReason: deal.lostReason || '',
      notes: deal.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await dealsAPI.delete(id);
        notify.success('Deal deleted successfully');
        fetchDeals();
      } catch (error) {
        notify.error('Failed to delete deal');
      }
    }
  };

  const openModal = () => {
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      amount: '',
      stage: 'New',
      probability: '10',
      expectedCloseDate: '',
      contact: '',
      assignedTo: '',
      lostReason: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeal(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Deals Management</h1>
        <button onClick={openModal} className="btn btn-primary">
          <FiPlus /> Add Deal
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">All Stages</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading deals...</div>
        ) : deals.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Contact</th>
                  <th>Assigned To</th>
                  <th>Expected Close</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal._id}>
                    <td>{deal.title}</td>
                    <td>${deal.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${deal.stage.toLowerCase().replace(' ', '-')}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td>{deal.probability}%</td>
                    <td>{deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '-'}</td>
                    <td>{deal.assignedTo?.name || '-'}</td>
                    <td>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}</td>
                    <td className="actions">
                      <button onClick={() => handleEdit(deal)} className="btn btn-sm btn-secondary" title="Edit">
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDelete(deal._id)} className="btn btn-sm btn-danger" title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages}>
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">No deals found</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stage *</label>
                  <select
                    name="stage"
                    className="form-control"
                    value={formData.stage}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Probability (%)</label>
                  <input
                    type="number"
                    name="probability"
                    className="form-control"
                    value={formData.probability}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Expected Close Date *</label>
                  <input
                    type="date"
                    name="expectedCloseDate"
                    className="form-control"
                    value={formData.expectedCloseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact *</label>
                  <select
                    name="contact"
                    className="form-control"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((contact) => (
                      <option key={contact._id} value={contact._id}>
                        {contact.firstName} {contact.lastName} ({contact.email})
                      </option>
                    ))}
                  </select>
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
              </div>

              {formData.stage === 'Lost' && (
                <div className="form-group">
                  <label>Lost Reason</label>
                  <textarea
                    name="lostReason"
                    className="form-control"
                    value={formData.lostReason}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
              )}

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
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;
