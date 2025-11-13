import React, { useState, useEffect } from 'react';
import { contactsAPI, usersAPI } from '../services/api';
import { notify, sendEmailNotification } from '../utils/notifications';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import './Common.css';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    type: 'Customer',
    assignedTo: '',
    notes: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    fetchContacts();
    fetchUsers();
  }, [page, search, typeFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter })
      };

      const response = await contactsAPI.getAll(params);
      setContacts(response.data.data.contacts);
      setPagination(response.data.pagination);
    } catch (error) {
      notify.error('Failed to fetch contacts');
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
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingContact) {
        await contactsAPI.update(editingContact._id, formData);
        notify.success('Contact updated successfully');

        sendEmailNotification(
          formData.email,
          'Contact Updated',
          `Your contact information has been updated.`
        );
      } else {
        await contactsAPI.create(formData);
        notify.success('Contact created successfully');

        sendEmailNotification(
          formData.email,
          'Welcome to CRM',
          `You have been added as a contact in our CRM system.`
        );
      }

      closeModal();
      fetchContacts();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      type: contact.type,
      assignedTo: contact.assignedTo?._id || '',
      notes: contact.notes || '',
      address: contact.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsAPI.delete(id);
        notify.success('Contact deleted successfully');
        fetchContacts();
      } catch (error) {
        notify.error('Failed to delete contact');
      }
    }
  };

  const openModal = () => {
    setEditingContact(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      type: 'Customer',
      assignedTo: '',
      notes: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contacts Management</h1>
        <button onClick={openModal} className="btn btn-primary">
          <FiPlus /> Add Contact
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="filter-select">
          <option value="">All Types</option>
          <option value="Customer">Customer</option>
          <option value="Partner">Partner</option>
          <option value="Vendor">Vendor</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading contacts...</div>
        ) : contacts.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.firstName} {contact.lastName}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.company || '-'}</td>
                    <td>
                      <span className="badge badge-new">
                        {contact.type}
                      </span>
                    </td>
                    <td>{contact.assignedTo?.name || '-'}</td>
                    <td className="actions">
                      <button onClick={() => handleEdit(contact)} className="btn btn-sm btn-secondary" title="Edit">
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDelete(contact._id)} className="btn btn-sm btn-danger" title="Delete">
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
          <div className="no-data">No contacts found</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
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
                  <label>Type</label>
                  <select
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Other">Other</option>
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

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  className="form-control"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    className="form-control"
                    value={formData.address.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    className="form-control"
                    value={formData.address.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    className="form-control"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    className="form-control"
                    value={formData.address.country}
                    onChange={handleInputChange}
                  />
                </div>
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
                  {editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
