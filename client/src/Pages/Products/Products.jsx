import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaRupeeSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('https://www.api.blueaceindia.com/api/v1/get-all-products');
                setProducts(data.data);
            } catch (error) {
                console.log("Internal server error", error);
            }
        }
        fetchProducts();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = products.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.smalldesc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
            <section className="gray py-5">
                <div className="container">
                    <div className="row">

                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div className="row gx-3">
                                {currentProducts && currentProducts.map((item, index) => (
                                    <div key={index} className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
                                        <div className="Goodup-grid-wrap">
                                            <div className="Goodup-grid-upper">
                                                <div className="Goodup-grid-thumb">
                                                    <Link to={`/product/${item.title.replace(/\s+/g, '-').toLowerCase()}`} className="d-block text-center m-auto">
                                                        <img src={item.smallImage?.url} className="img-fluid" alt="" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="Goodup-grid-fl-wrap">
                                                <div className="Goodup-caption px-3 py-2">
                                                    {/* <div className="Goodup-author">
                                                        <Link to={`/product/${item.title.replace(/\s+/g, '-').toLowerCase()}`}>
                                                            <img src="assets/img/t-1.png" className="img-fluid circle" alt="" />
                                                        </Link>
                                                    </div> */}
                                                    <h4 style={{fontWeight:'bold'}} className="mb-0 ft-medium medium bold">
                                                        <Link to={`/product/${item.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-dark fs-md">
                                                            {item.title}
                                                            <span className="verified-badge"><i className="fas fa-check-circle"></i></span>
                                                        </Link>
                                                    </h4>
                                                    <div className="Goodup-price">
                                                        <span className="ft-medium">{item.smalldesc}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12">
                                    <ul className="pagination justify-content-center">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const isActive = index + 1 === currentPage;
                                            return (
                                                <li key={index} className="page-item">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            paginate(index + 1);
                                                        }}
                                                        className={`page-link px-3 py-2 rounded mx-1 border ${isActive
                                                            ? 'bg-dark text-white border-dark'
                                                            : 'bg-light text-dark border-secondary'
                                                            }`}
                                                        style={{
                                                            outline: 'none',
                                                            boxShadow: isActive
                                                                ? '0 0 0 2px #343a40'
                                                                : '0 0 0 0 rgba(0,0,0,0)',
                                                            transition: 'box-shadow 0.2s ease-in-out',
                                                        }}
                                                        onFocus={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 0 0 2px #0d6efd';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.boxShadow = isActive
                                                                ? '0 0 0 2px #343a40'
                                                                : 'none';
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}

export default Products