import React, { useState, useEffect } from 'react';

const TrackYourComplain = () => {
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [searchComplaintId, setSearchComplaintId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiData, setApiData] = useState({});



    const getComplaints = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get('https://api.chatbot.adsdigitalmedia.com/api/auth/complaints?metacode=chatbot-QUP9P-CCQS2');
            setComplaints(data.bookings || []);
            setApiData({
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
                message: data.message
            });
        } catch (error) {
            console.log("Internal server error", error);
            setError('Failed to fetch complaints. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const fullComplaintId = `COMP-${searchComplaintId.trim()}`;

        if (!searchComplaintId.trim()) {
            setError('Please enter a complaint number after COMP-');
            return;
        }

        const foundComplaint = complaints.find(
            complaint => complaint.complaintId.toLowerCase() === fullComplaintId.toLowerCase()
        );

        if (foundComplaint) {
            setSelectedComplaint(foundComplaint);
            setError('');
        } else {
            setError('Complaint ID not found');
            setSelectedComplaint(null);
        }
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-warning text-dark';
            case 'resolved':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            case 'in-progress':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    useEffect(() => {
        getComplaints();
    }, []);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [])

    return (
        <div className="container mt-4" style={{ minHeight: '80vh' }}>
            {/* Bootstrap CSS CDN */}
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
                rel="stylesheet"
            />

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-search me-2"></i>
                                Track Your Complaint
                            </h3>
                        </div>
                        <div className="card-body">
                            {/* Search Section */}
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <div className="input-group">
                                        <span className="input-group-text">COMP-</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="998522-357"
                                            value={searchComplaintId}
                                            onChange={(e) => setSearchComplaintId(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            type="button"
                                            onClick={handleSearch}
                                            disabled={loading}
                                        >
                                            {loading ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>

                                </div>
                                <div className="col-md-4">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={getComplaints}
                                        disabled={loading}
                                    >
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading complaints...</p>
                                </div>
                            )}

                            {/* API Summary */}
                            {/* {!loading && complaints.length > 0 && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="alert alert-info">
                                            <strong>Database Summary:</strong> {apiData.message} |
                                            Total: {apiData.total} complaints |
                                            Page: {apiData.page} of {apiData.totalPages} |
                                            Showing: {complaints.length} complaints
                                        </div>
                                    </div>
                                </div>
                            )} */}

                            {/* Selected Complaint Details */}
                            {selectedComplaint && (
                                <div className="card border-success mb-4">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="card-title mb-0">
                                            <i className="fas fa-file-alt me-2"></i>
                                            Complaint Details
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Complaint ID:</label>
                                                    <p className="text-primary fw-bold fs-5">{selectedComplaint.complaintId}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Customer Name:</label>
                                                    <p className="mb-0">{selectedComplaint.name}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Phone Number:</label>
                                                    <p className="mb-0">{selectedComplaint.phone}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Status:</label>
                                                    <br />
                                                    <span className={`badge ${getStatusBadgeClass(selectedComplaint.status)} fs-6`}>
                                                        {selectedComplaint.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Category:</label>
                                                    <p className="mb-0">{selectedComplaint.selectedCategory}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Service:</label>
                                                    <p className="mb-0">{selectedComplaint.selectedService}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Created At:</label>
                                                    <p className="mb-0">{formatDate(selectedComplaint.createdAt)}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Last Updated:</label>
                                                    <p className="mb-0">{formatDate(selectedComplaint.updatedAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Description:</label>
                                                    <div className="bg-light p-3 rounded">
                                                        <p className="mb-0">{selectedComplaint.description}</p>
                                                    </div>
                                                </div>
                                                {selectedComplaint.resolution && (
                                                    <div className="mb-3">
                                                        <label className="form-label fw-bold">Resolution:</label>
                                                        <div className="bg-success bg-opacity-10 p-3 rounded border border-success">
                                                            <p className="mb-0">{selectedComplaint.resolution}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Data State */}
                            {!loading && complaints.length === 0 && (
                                <div className="text-center py-5">
                                    <i className="fas fa-inbox fa-3x text-muted"></i>
                                    <h4 className="mt-3 text-muted">No Complaints Found</h4>
                                    <p className="text-muted">No complaints are available at the moment.</p>
                                    <button className="btn btn-primary" onClick={getComplaints}>
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackYourComplain;