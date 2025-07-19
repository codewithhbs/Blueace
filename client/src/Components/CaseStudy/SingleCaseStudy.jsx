import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SingleCaseStudy = () => {
    const { id } = useParams();
    const [caseStudy, setCaseStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCaseStudy = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:7987/api/v1/get-single-case-study/${id}`);
            setCaseStudy(response.data.data);
            setError(null);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch case study');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaseStudy();
        window.scrollTo(0, 0);
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const parseTechnologies = (techArray) => {
        if (!techArray || techArray.length === 0) return [];
        try {
            return JSON.parse(techArray[0]);
        } catch (e) {
            return techArray;
        }
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading case study...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="alert alert-danger" role="alert">
                            <h4 className="alert-heading">Error!</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!caseStudy) {
        return (
            <div className="container-fluid py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="alert alert-warning" role="alert">
                            <h4 className="alert-heading">Not Found!</h4>
                            <p>Case study not found.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container-fluid px-0">
                {/* Hero Section with Large Image */}
                <div className="position-relative overflow-hidden hero-section">
                    <img 
                        src={caseStudy.largeImage?.url} 
                        alt={caseStudy.title}
                        className="w-100 h-100 hero-image"
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-end">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <div className="text-white p-4">
                                        <span className="badge bg-primary fs-6 mb-3">{caseStudy.category}</span>
                                        <h1 className="display-4 fw-bold mb-3">{caseStudy.title}</h1>
                                        <p className="lead mb-4">{caseStudy.smallDes}</p>
                                        <div className="d-flex flex-wrap gap-3 text-sm">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-building me-2"></i>
                                                <span>{caseStudy.clientName}</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                <span>{caseStudy.location}</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-calendar-check me-2"></i>
                                                <span>{formatDate(caseStudy.completionDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container py-5">
                    <div className="row g-5">
                        {/* Main Content */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-lg">
                                <div className="card-body p-5">
                                    <h2 className="h3 mb-4 text-dark fw-bold">Project Overview</h2>
                                    <div 
                                        className="content-html"
                                        dangerouslySetInnerHTML={{ __html: caseStudy.longDes }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            <div className="sticky-top sidebar-sticky">
                                {/* Project Info Card */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <h3 className="h5 mb-4 text-dark fw-bold">Project Details</h3>
                                        
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">Client</h6>
                                            <p className="mb-0 fw-medium">{caseStudy.clientName}</p>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">Category</h6>
                                            <span className="badge bg-primary-subtle text-primary fs-6">
                                                {caseStudy.category}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">Location</h6>
                                            <p className="mb-0 small">{caseStudy.location}</p>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">Completion Date</h6>
                                            <p className="mb-0 fw-medium">{formatDate(caseStudy.completionDate)}</p>
                                        </div>
                                        
                                        <div className="mb-0">
                                            <h6 className="text-muted mb-2">Status</h6>
                                            <span className={`badge ${caseStudy.isPublished ? 'bg-success' : 'bg-warning'} fs-6`}>
                                                {caseStudy.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Technologies Used */}
                                {caseStudy.technologiesUsed && caseStudy.technologiesUsed.length > 0 && (
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body p-4">
                                            <h3 className="h5 mb-4 text-dark fw-bold">Technologies Used</h3>
                                            <div className="d-flex flex-wrap gap-2">
                                                {parseTechnologies(caseStudy.technologiesUsed).map((tech, index) => (
                                                    <span key={index} className="badge bg-secondary-subtle text-secondary fs-6">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Small Image */}
                                <div className="card border-0 shadow-sm">
                                    <img 
                                        src={caseStudy.smallImage?.url} 
                                        alt={`${caseStudy.title} - Preview`}
                                        className="card-img-top rounded-top small-image"
                                    />
                                    <div className="card-body p-3">
                                        <p className="text-muted mb-0 small">Project Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Top Button */}
                <button 
                    className="btn btn-primary position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg back-to-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <i className="bi bi-arrow-up"></i>
                </button>
            </div>

            <style jsx>{`
                .hero-section {
                    height: 70vh;
                }
                
                .hero-image {
                    object-fit: cover;
                    object-position: center;
                }
                
                .sidebar-sticky {
                    top: 2rem;
                }
                
                .small-image {
                    height: 200px;
                    object-fit: cover;
                }
                
                .back-to-top {
                    width: 50px;
                    height: 50px;
                    z-index: 1050;
                }
                
                .content-html {
                    line-height: 1.8;
                    font-size: 1.1rem;
                    color: #555;
                }
                
                .content-html p {
                    margin-bottom: 1.5rem;
                }
                
                .content-html h1, .content-html h2, .content-html h3 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                
                .bg-primary-subtle {
                    background-color: rgba(13, 110, 253, 0.1) !important;
                }
                
                .bg-secondary-subtle {
                    background-color: rgba(108, 117, 125, 0.1) !important;
                }
                
                .text-primary {
                    color: #0d6efd !important;
                }
                
                .text-secondary {
                    color: #6c757d !important;
                }
                
                @media (max-width: 768px) {
                    .display-4 {
                        font-size: 2rem !important;
                    }
                    
                    .lead {
                        font-size: 1rem !important;
                    }
                    
                    .hero-section {
                        height: 50vh;
                    }
                }
            `}</style>
        </>
    );
};

export default SingleCaseStudy;