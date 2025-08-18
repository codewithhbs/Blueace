import React, { useState, useEffect } from 'react';
import './BookingsChatBot.css';
import axios from 'axios';
import toast from 'react-hot-toast';

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const allowedStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.chatbot.adsdigitalmedia.com/api/auth/complaints?metacode=chatbot-QUP9P-CCQS2&page=${page}&limit=10`
      );
      const data = await response.json();

      if (data && data.bookings) {
        setComplaints(data.bookings);
        setTotalComplaints(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(
        'https://api.chatbot.adsdigitalmedia.com/api/auth/change-status-complains',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: complaintId,
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint._id === complaintId
              ? { ...complaint, status: newStatus }
              : complaint
          )
        );
        alert('Status updated successfully!');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const createOrder = async (complaintId) => {
    try {
      setCreateOrderLoading(true);
      const response = await axios.post(
        `https://www.api.blueaceindia.com/api/v1/create-order-from-chatbot/${complaintId}?type=complaint`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      if (result.success) {
        setSuccess('Order created successfully!');
        toast.success('Order created successfully!');
        fetchComplaints(currentPage);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (err) {
      console.log('Internal server error', err)
      toast.error('Failed to create order: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setCreateOrderLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchComplaints(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + 4);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      searchTerm === '' ||
      complaint.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintId?.toLowerCase().includes(`comp-${searchTerm}`.toLowerCase());

    const matchesName =
      nameFilter === '' ||
      complaint.name?.toLowerCase().includes(nameFilter.toLowerCase());

    const matchesPhone =
      phoneFilter === '' || complaint.phone?.includes(phoneFilter);

    const matchesStatus = statusFilter === '' || complaint.status === statusFilter;

    const complaintDate = new Date(complaint.createdAt);
    const matchesDateFrom =
      dateFromFilter === '' || complaintDate >= new Date(dateFromFilter);
    const matchesDateTo =
      dateToFilter === '' || complaintDate <= new Date(dateToFilter + 'T23:59:59');

    return (
      matchesSearch &&
      matchesName &&
      matchesPhone &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'comp-status-pending';
      case 'in-progress':
        return 'comp-status-progress';
      case 'resolved':
        return 'comp-status-resolved';
      case 'rejected':
        return 'comp-status-rejected';
      default:
        return 'comp-status-default';
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setNameFilter('');
    setPhoneFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setStatusFilter('');
  };

  if (loading) {
    return (
      <div className="comp-container">
        <div className="comp-loading">
          <div className="comp-spinner"></div>
          <span>Loading complaints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="comp-container">
      <div className="comp-card">
        <div className="comp-header">
          <h1 className="comp-title">Complaint Management System</h1>
          <div className="comp-badge">{totalComplaints} Total</div>
        </div>

        {/* Filters */}
        <div className="comp-filters-grid">
          {/* your filter components... */}
        </div>

        {/* Table */}
        <div className="comp-table-container">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Service</th>
                <th>Description</th>
                <th>Status</th>
                <th>Address</th>
                <th>Service Date</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="comp-table-empty">
                    <p>No complaints found.</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    {console.log("complaint", complaint)}
                    <td>{complaint.complaintId}</td>
                    <td>{complaint.name}</td>
                    <td>{complaint.phone}</td>
                    <td>{complaint.selectedCategory}</td>
                    <td>{complaint.selectedService}</td>
                    <td>{complaint.description}</td>
                    <td>
                      <span className={`comp-status ${getStatusClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{complaint.address || 'N/A'}</td>
                    <td>
                      {complaint.serviceDate
                        ? new Date(complaint.serviceDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                        : 'N/A'}
                    </td>

                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>
                      <div className="comp-actions-cell">
                        <StatusDropdown
                          complaint={complaint}
                          allowedStatuses={allowedStatuses}
                          onStatusChange={changeStatus}
                        />
                        <ActionButtons
                          complaint={complaint}
                          onCreateOrder={createOrder}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="comp-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`comp-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButtons = ({ complaint, onCreateOrder }) => {
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = async () => {
    if (loading) return;
    setLoading(true);
    await onCreateOrder(complaint._id);
    setLoading(false);
  };

  return (
    <div className="comp-action-buttons">
      <button
        className="comp-btn comp-btn-small comp-btn-green"
        onClick={handleCreateOrder}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Order'}
      </button>
    </div>
  );
};

// Status Dropdown
const StatusDropdown = ({ complaint, allowedStatuses, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus) => {
    onStatusChange(complaint._id, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="comp-dropdown">
      <button className="comp-dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        Change Status ▼
      </button>
      {isOpen && (
        <div className="comp-dropdown-menu show">
          {allowedStatuses.map((status) => (
            <button
              key={status}
              className={`comp-dropdown-item ${complaint.status === status ? 'active' : ''}`}
              onClick={() => handleStatusChange(status)}
              disabled={complaint.status === status}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {complaint.status === status && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaint;
