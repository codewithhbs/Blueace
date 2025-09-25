import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SingleProduct = () => {
    const { title } = useParams();
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({
        productId: '',
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const formatTitle = (title) => {
        return title
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    const newTitle = formatTitle(title);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`https://www.api.blueaceindia.com/api/v1/get-product-by-name/${newTitle}`);
                setProduct(data.data);
            } catch (error) {
                console.log("Internal server error", error);
            }
        }
        fetchProduct();
    }, [title]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            alert("Please fill all the fields");
            return;
        }
        try {
            const res = await axios.post('https://www.api.blueaceindia.com/api/v1/create-product-inquiry', {
                productId: product._id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
            });
            alert("Enquiry submitted successfully!");
            setFormData({
                productId: '',
                name: '',
                email: '',
                phone: '',
                message: '',
            });
        } catch (error) {
            console.log("Internal server error", error);
            alert("Failed to submit enquiry.");
        }
    };

    useEffect(()=> {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    },[])

    return (
        <>
            <div className='container mb-5'>
                <div className='row mt-5'>
                    <div className='col-lg-9 col-md-9 mb-3'>
                        <div className='hero-image mb-3'>
                            {product ? (
                                <img src={product.largeImage?.url} className='rounded w-100' alt='Product Image' />
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                        <div className='product-content'>
                            <div className='product-title'>
                                <h1 className='fw-bold'>{product?.title}</h1>
                            </div>
                            <div className='content-body mt-3' dangerouslySetInnerHTML={{ __html: product?.longdesc || 'No description available.' }}></div>
                            {/* <div className='product-price mt-3'>
                                <h3>Price: ₹{product?.price}</h3>
                            </div>
                            <div className='product-smalldesc mt-3'>
                                <p>{product?.smalldesc}</p>
                            </div> */}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='col-lg-3 col-md-3'>
                        <div className='product-sidebar sticky-top'>
                            {/* Enquiry Form */}
                            <div className='sidebar-form'>
                                <h3 className='text-white text-center'>Product Enquiry</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className='row'>
                                        <div className='mb-3 col-lg-12'>
                                            <input type='text' name='name' className='form-control' placeholder='Full Name' value={formData.name} onChange={handleChange} required />
                                        </div>
                                        <div className='mb-3 col-lg-12'>
                                            <input type='email' name='email' className='form-control' placeholder='Email' value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className='mb-3 col-lg-12'>
                                            <input type='tel' name='phone' className='form-control' placeholder='Phone' value={formData.phone} onChange={handleChange} required />
                                        </div>
                                        <div className='mb-3 col-lg-12'>
                                            <textarea className='form-control' name='message' placeholder='Message' value={formData.message} onChange={handleChange} required />
                                        </div>
                                        <div className='mb-3 col-lg-12 text-center'>
                                            <button type='submit' className='btn btn-primary rounded'>
                                                Send Enquiry
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SingleProduct;