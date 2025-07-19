import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// Mock data for demonstration
const mockData = [
  { _id: '1', logo: { url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '2', logo: { url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '3', logo: { url: 'https://images.pexels.com/photos/374016/pexels-photo-374016.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '4', logo: { url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '5', logo: { url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '6', logo: { url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '7', logo: { url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '8', logo: { url: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '9', logo: { url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
  { _id: '10', logo: { url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300&h=200' } },
];

const OurClient = () => {
  const [allClientLogo, setAllClientLogo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientLogo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:7987/api/v1/get-all-client-logo');
      const data = await response.json();
      setAllClientLogo(data.data);
    } catch (error) {
      console.log("Internal server error", error);
      // Use mock data on error
      setAllClientLogo(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientLogo();
  }, []);

  // Use mock data for demonstration, replace with actual data
  const clientLogos = allClientLogo.length > 0 ? allClientLogo : mockData;

  if (isLoading) {
    return (
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading our trusted partners...</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clientLogos.length === 0) {
    return (
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="mb-4">
                <i className="bi bi-building display-1 text-muted"></i>
              </div>
              <h5 className="text-muted">No client logos available at the moment</h5>
              <p className="text-muted">Please check back later</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light">
      <div className="container">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <div className="mb-3">
              <span className="badge bg-primary bg-gradient px-4 py-2 rounded-pill fs-6 fw-normal text-uppercase tracking-wide">
                Our Partners
              </span>
            </div>
            <h2 className="display-8 fw-bold text-dark mb-2">
              Trusted by Industry Leaders
            </h2>
            <p className="lead text-muted mx-auto mb-0" style={{ maxWidth: '700px', lineHeight: '1.2' }}>
              We're proud to collaborate with forward-thinking companies that share our vision for excellence and innovation across the globe.
            </p>
          </div>
        </div>

        {/* Swiper Carousel Section */}
        <div className="row">
          <div className="col-12">
            <div className="position-relative">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{
                  el: '.swiper-pagination-custom',
                  clickable: true,
                  bulletClass: 'swiper-pagination-bullet-custom',
                  bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                speed={800}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  576: {
                    slidesPerView: 2,
                    spaceBetween: 25,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                  992: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                  1200: {
                    slidesPerView: 5,
                    spaceBetween: 35,
                  },
                }}
                className="client-swiper"
              >
                {clientLogos.map((logo, index) => (
                  <SwiperSlide key={logo._id || index}>
                    <div className="client-logo-slide">
                      <div className="client-logo-card">
                        <div className="client-logo-wrapper">
                          <img
                            src={logo.logo.url}
                            alt={`Client Partner ${index + 1}`}
                            className="client-logo img-fluid"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Partner+${index + 1}`;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <div className="swiper-button-prev-custom swiper-nav-btn">
                <i className="bi bi-chevron-left"></i>
              </div>
              <div className="swiper-button-next-custom swiper-nav-btn">
                <i className="bi bi-chevron-right"></i>
              </div>

              {/* Custom Pagination */}
              <div className="swiper-pagination-custom mt-4 d-flex justify-content-center"></div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row mt-5 pt-2">
          <div className="col-12">
            <div className="row text-center g-4">
              <div className="col-6 col-md-3">
                <div className="stat-card p-4">
                  <div className="stat-icon mb-3">
                    <i className="bi bi-people-fill text-primary display-4"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-primary mb-2">{clientLogos.length}+</h3>
                  <p className="text-muted mb-0 fw-medium">Trusted Partners</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4">
                  <div className="stat-icon mb-3">
                    <i className="bi bi-globe text-success display-4"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-success mb-2">50+</h3>
                  <p className="text-muted mb-0 fw-medium">Countries</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4">
                  <div className="stat-icon mb-3">
                    <i className="bi bi-star-fill text-warning display-4"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-warning mb-2">99%</h3>
                  <p className="text-muted mb-0 fw-medium">Satisfaction Rate</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4">
                  <div className="stat-icon mb-3">
                    <i className="bi bi-headset text-info display-4"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-info mb-2">24/7</h3>
                  <p className="text-muted mb-0 fw-medium">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurClient;