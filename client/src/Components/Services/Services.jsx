import { Link } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import axios from 'axios';
import './service.css'

function Services() {

  const [allService, setAllService] = useState([])

  const fetchServiceData = async () => {
    try {
      const res = await axios.get('http://localhost:7987/api/v1/get-all-service-category');
      const data = res.data.data;
      let filterData = data.filter((item) => item.isPopular)


      for (let i = filterData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filterData[i], filterData[j]] = [filterData[j], filterData[i]];
      }

      setAllService(filterData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, []);


  return (
    <>


      {/* <!-- ======================= Listing Categories ======================== --> */}
      <section className="space min gray">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="sec_title position-relative text-center mb-2">
                {/* <h6 className="mb-0 theme-cl">Popular Services</h6> */}
                <h2 className="ft-bold mb-3">Our Top Services</h2>
              </div>
            </div>
          </div>

          {/* <!-- row --> */}
          <div className="row align-items-center pb-5">
            <Swiper slidesPerView={4} spaceBetween={30} pagination={{ clickable: true, }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                375: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                425: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 40,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
              }}

              modules={[Pagination]}
              className="mySwiper"
            >
              {
                allService && allService.map((item, index) => (
                  <SwiperSlide className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-6" key={index}>
                    {/* <div className="cats-wrap text-center services-bg">
                      <Link to='/maintenance-ahu-fcu'>
                        <div style={{ height: '250px', overflow: 'hidden' }} className="img">
                          <img style={{height:'100%', objectFit:"cover"}} src={item.image?.url} className='img-fluid' alt='AHU' />
                        </div>
                        <div style={{}} className="Goodup-catg-caption m-2">
                          <h4 className="services-box-title mb-0 mt-4 ft-medium m-catrio">
                            {item.name}
                          </h4>
                        </div>
                      </Link>
                    </div> */}
                    <Link to={`/service/${item.name.replace(/\s+/g, '-').toLowerCase()}`} className="hitesh-service-main-box">
                      <div className="img">
                      <img src={item.image?.url} className='img-fluid' alt={item.name} />
                      </div>
                      <div className="content">
                      <h4>
                            {item.name}
                          </h4>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))
              }

            </Swiper>
            {/* {serviceBox && serviceBox.map((item, index) => (
              <div key={index} className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-6" >

                <div className="cats-wrap text-center services-bg">
                  <Link to='/maintenance-ahu-fcu' className="">
                    <img src={item.img} className='img-fluid' alt='AHU' />
                    <div className="Goodup-catg-caption">
                      <h4 className="services-box-title mb-1 mt-4 ft-medium m-catrio">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                </div>
              </div>
            ))

            } */}

          </div>

        </div>
      </section>
    </>
  );
}

export default Services;
