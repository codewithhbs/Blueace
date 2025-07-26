import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from 'axios';

const CaseStudy = () => {
    const [allCaseStudy, setAllCaseStudy] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCaseStudy = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:7987/api/v1/get-all-case-study');
            let data = res.data.data;

            // Shuffle the array
            for (let i = data.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [data[i], data[j]] = [data[j], data[i]];
            }
            const filteredData = data.filter(item => item.isPublished);
            setAllCaseStudy(filteredData);
            // setAllCaseStudy(data);
        } catch (error) {
            console.log("Internal server error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaseStudy();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .case-study-section {
                    background: linear-gradient(135deg, #0052b4 0%, #0c7ab8 100%);
                    padding: 80px 0;
                    position: relative;
                    overflow: hidden;
                }

                .case-study-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .section-title {
                    position: relative;
                    z-index: 2;
                    margin-bottom: 60px;
                }

                .section-title h6 {
                    color: #fff;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .section-title h2 {
                    color: #fff;
                    font-weight: 700;
                    font-size: 2rem;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                }

                .section-title p {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .case-study-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    height: 100%;
                    position: relative;
                    z-index: 2;
                }

                .case-study-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
                }

                .card-image-wrapper {
                    position: relative;
                    height: 190px;
                    overflow: hidden;
                }

                .card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .case-study-card:hover .card-image {
                    transform: scale(1.05);
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .case-study-card:hover .card-overlay {
                    opacity: 1;
                }

                .overlay-content {
                    text-align: center;
                    color: white;
                    transform: translateY(20px);
                    transition: transform 0.3s ease;
                }

                .case-study-card:hover .overlay-content {
                    transform: translateY(0);
                }

                .card-content {
                    padding: 19px;
                }

                .category-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }

                .card-title {
                    color: #003279ff;
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    line-height: 1.2;
                }

                .card-description {
                    color: #7f8c8d;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #ecf0f1;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    color: #95a5a6;
                    font-size: 0.85rem;
                }

                .meta-item i {
                    margin-right: 8px;
                    color: #667eea;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .client-info {
                    display: flex;
                    align-items: center;
                    color: #34495e;
                    font-weight: 600;
                }

                .client-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    margin-right: 12px;
                    font-size: 0.8rem;
                }

                .view-details-btn {
                    background: linear-gradient(135deg, #00214e, #217abe);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .view-details-btn:hover {
                    background: linear-gradient(135deg, #764ba2, #667eea);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                .swiper-pagination-bullet {
                    background: rgba(255, 255, 255, 0.5);
                    width: 12px;
                    height: 12px;
                    opacity: 1;
                }

                .swiper-pagination-bullet-active {
                    background: #fff;
                    transform: scale(1.2);
                }

                .swiper-button-next,
                .swiper-button-prev {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    margin-top: -25px;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .swiper-button-next:after,
                .swiper-button-prev:after {
                    font-size: 20px;
                }

                .technologies-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 15px;
                }

                .tech-tag {
                    background: #f8f9fa;
                    color: #667eea;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    border: 1px solid #e9ecef;
                }

                @media (max-width: 768px) {
                    .section-title h2 {
                        font-size: 2rem;
                    }
                    
                    .card-content {
                        padding: 20px;
                    }
                    
                    .card-meta {
                        flex-direction: column;
                        gap: 10px;
                        align-items: flex-start;
                    }
                }
            `}</style>

            <div className="case-study-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-10">
                            <div className="section-title text-center">
                                <h6>Portfolio</h6>
                                <h2>Our Case Studies</h2>
                                <p>Explore our successful projects and discover how we've helped businesses achieve their goals through innovative solutions.</p>
                            </div>
                        </div>
                    </div>

                    <Swiper
                        slidesPerView={3}
                        spaceBetween={30}
                        freeMode={true}
                        navigation={true}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 25,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                            1400: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                        modules={[FreeMode, Pagination, Navigation, Autoplay]}
                        className="mySwiper"
                    >
                        {allCaseStudy && allCaseStudy.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="case-study-card">
                                    <div className="card-image-wrapper">
                                        <img
                                            src={item.smallImage?.url || item.largeImage?.url}
                                            alt={item.title}
                                            className="card-image"
                                        />
                                        <div className="card-overlay">
                                            <div className="overlay-content">
                                                <h5 className="mb-2">View Details</h5>
                                                <p className="mb-0">Click to explore this project</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        {/* <div className="category-badge">
                                            {item.category}
                                        </div> */}

                                        <h4 className="card-title">
                                            {item.title?.length > 25 ? item.title.slice(0, 25) + "..." : item.title}
                                        </h4>

                                        <p className="card-description">
                                            {item.smallDes?.length > 60 ? item.smallDes.slice(0, 60) + "..." : item.smallDes}
                                        </p>


                                        <div className="card-footer">

                                            <Link
                                                to={`/case-study/${item._id}`}
                                                className="view-details-btn"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </>
    );
};

export default CaseStudy;