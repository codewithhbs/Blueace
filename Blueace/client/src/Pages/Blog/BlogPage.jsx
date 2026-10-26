import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './blog.css';
import MetaTag from '../../Components/Meta/MetaTag';

function BlogPage() {
    const [allBlog, setAllBlog] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [loading, setLoading] = useState(true);

    const blogsPerPage = 6;

    useEffect(() => {
        const fetchAllBlog = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    'https://www.api.blueaceindia.com/api/v1/get-all-blogs',
                    { params: { page: currentPage, limit: blogsPerPage } }
                );
                setAllBlog(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalBlogs(res.data.totalBlogs || 0);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setAllBlog([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllBlog();
    }, [currentPage]);

    const startIndex = (currentPage - 1) * blogsPerPage;
    const currentBlogs = allBlog;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <MetaTag
                title="Blog | Blueace Limited - Tips, Guides & Insights"
                description="Read the Blueace Limited HVAC blog for expert tips, helpful guides, maintenance advice, energy-saving ideas, and insights to improve comfort and efficiency."
                canonical="https://www.blueaceindia.com/blog"
            />

            <div style={{ backgroundColor: '#00225F' }} className="py-3">
                <div className="container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/" style={{ color: 'white' }}>
                                    Home
                                </Link>
                            </li>
                            <li className="breadcrumb-item" style={{ color: 'white' }}>
                                /
                            </li>
                            <li
                                className="breadcrumb-item active"
                                style={{ color: 'white' }}
                                aria-current="page"
                            >
                                Blogs
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <section className="middle">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="sec_title position-relative text-center mb-5">
                                <h6 className="theme-cl mb-0">Latest Updates</h6>
                                <h2 className="ft-bold">View Recent Updates</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <p>Loading blogs...</p>
                            </div>
                        ) : currentBlogs.length > 0 ? (
                            currentBlogs.map((item, index) => (
                                <div
                                    key={item._id || item.slug || index}
                                    className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4"
                                >
                                    <div className="gup_blg_grid_box h-100">
                                        <div className="gup_blg_grid_thumb">
                                            <Link to={`/blog/${item.slug}`}>
                                                <img
                                                    src={item.smallImage?.url}
                                                    className="img-fluid"
                                                    alt={item.title || 'Blog image'}
                                                />
                                            </Link>
                                        </div>

                                        <div className="gup_blg_grid_caption">
                                            <div className="blg_title">
                                                <h4>
                                                    <Link to={`/blog/${item.slug}`}>
                                                        {item.title}
                                                    </Link>
                                                </h4>
                                            </div>

                                            <div className="blg_desc">
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            item.content ||
                                                            'No description available.'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <p>No blogs found.</p>
                            </div>
                        )}
                    </div>

                    {/* Backend Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="row justify-content-center mt-4 mb-5">
                            <div className="col-12">
                                <nav aria-label="Blog pagination">
                                    <ul className="pagination justify-content-center flex-wrap">

                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                type="button"
                                                className="page-link"
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        ).map((page) => (
                                            <li
                                                key={page}
                                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="page-link"
                                                    onClick={() => handlePageChange(page)}
                                                    style={{
                                                        backgroundColor:
                                                            currentPage === page
                                                                ? '#00225F'
                                                                : '#fff',
                                                        color:
                                                            currentPage === page
                                                                ? '#fff'
                                                                : '#00225F',
                                                        borderColor: '#00225F'
                                                    }}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                type="button"
                                                className="page-link"
                                                disabled={currentPage === totalPages}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>

                                <p className="text-center text-muted mt-3">
                                    Showing {startIndex + 1}–{Math.min(startIndex + blogsPerPage, totalBlogs)}
                                    {' '}of {totalBlogs} blogs
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default BlogPage;