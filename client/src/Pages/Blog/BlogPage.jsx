import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom';
import './blog.css'
import MetaTag from '../../Components/Meta/MetaTag';

function BlogPage() {
    const [allBlog, setAllBlog] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchAllBlog = async (page) => {
        try {
            const res = await axios.get(`https://www.api.blueaceindia.com/api/v1/get-all-blogs?page=${page}&limit=6`);
            const sorted = (res.data.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAllBlog(sorted);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.log("Internal server error in getting all blogs");
        }
    };

    useEffect(() => {
        fetchAllBlog(currentPage);
    }, [currentPage]);

    // Function to handle pagination
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Limited page numbers: 1 ... 4 5 6 ... 10
    const getPageNumbers = () => {
        const delta = 1;
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [])

    return (
        <>
            <MetaTag title={'Blog | Blueace Limited - Tips, Guides & Insights'} description='Read the Blueace Limited HVAC blog for expert tips, helpful guides, maintenance advice, energy-saving ideas, and insights to improve comfort and efficiency.' canonical='https://www.blueaceindia.com/blog' />
            <div style={{ backgroundColor: '#00225F' }} class=" py-3">
                <div class="container">
                    <div class="row">
                        <div class="colxl-12 col-lg-12 col-md-12">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb mb-0">
                                    <li class="breadcrumb-item"><Link to={'/'} style={{ color: 'white' }}>Home</Link></li>
                                    <li class="breadcrumb-item" style={{ color: 'white' }}>/</li>
                                    <li class="breadcrumb-item active" style={{ color: 'white' }} aria-current="page">Blogs</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <section className="middle">
                <div className="container">

                    <div className="row justify-content-center">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div className="sec_title position-relative text-center mb-5">
                                <h6 className="theme-cl mb-0">Latest Updates</h6>
                                <h2 className="ft-bold">View Recent Updates</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">

                        {
                            allBlog && allBlog.map((item, index) => (
                                <div key={index} className="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                                    <div className="gup_blg_grid_box">
                                        <div className="gup_blg_grid_thumb">
                                            <Link to={`/blog/${item.slug}`}><img src={item.smallImage?.url} className="img-fluid" alt={item.title} /></Link>
                                        </div>
                                        <div className="gup_blg_grid_caption">
                                            <div className="blg_title"><h4><Link to={`/blog/${item.slug}`}>{item.title}</Link></h4></div>
                                            <div className="blg_desc"><p dangerouslySetInnerHTML={{ __html: item.content || 'No description available.' }}></p></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                    </div>

                    {totalPages > 1 && (
                        <div className="row justify-content-center">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <nav aria-label="Blog pagination">
                                    <ul className="pagination justify-content-center flex-wrap">

                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                type="button"
                                                className="page-link"
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                style={{ color: '#00225F', borderColor: '#00225F' }}
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {getPageNumbers().map((page, idx) =>
                                            page === '...' ? (
                                                <li key={`dots-${idx}`} className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            ) : (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button
                                                        type="button"
                                                        className="page-link"
                                                        onClick={() => handlePageChange(page)}
                                                        style={{
                                                            backgroundColor: currentPage === page ? '#00225F' : '#fff',
                                                            color: currentPage === page ? '#fff' : '#00225F',
                                                            borderColor: '#00225F'
                                                        }}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            )
                                        )}

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                type="button"
                                                className="page-link"
                                                disabled={currentPage === totalPages}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                style={{ color: '#00225F', borderColor: '#00225F' }}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </>
    );
}

export default BlogPage;