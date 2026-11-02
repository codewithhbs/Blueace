import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import Toggle from '../../components/Forms/toggle';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const fetchProducts = async () => {
        setLoading(true); // Set loading state before fetching
        try {
            const response = await axios.get('https://www.api.blueaceindia.com/api/v1/get-all-products');
            if (response.data.success) {
                const datasave = response.data.data;
                const r = datasave.reverse();
                setProducts(r);
                console.log(response.data.data);
            } else {
                // toast.error('Failed to fetch products');
                console.log("Failed to fetch products")
            }
        } catch (error) {
            // toast.error('An error occurred while fetching products.');
            console.error('Fetch error:', error); // Logging error for debugging
        } finally {
            setLoading(false); // Stop loading regardless of success or error
        }
    };
    // Fetch products using Axios
    useEffect(() => {
        fetchProducts();
    }, []);


    // Handle deleting a product
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://www.api.blueaceindia.com/api/v1/delete-product/${id}`);
            if (response.data.success) {
                toast.success('Product deleted successfully!');
                await fetchProducts(); // Fetch products again after deletion
            } else {
                toast.error('Failed to delete Product');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the Product.');
        }
    };

    const handleToggle = async (id, currentActiveStatus) => {
        try {
            console.log('currentActiveStatus', currentActiveStatus)
            const newActiveStatus = !currentActiveStatus; // Toggle the status
            console.log('newActiveStatus', newActiveStatus)
            const response = await axios.put(`https://www.api.blueaceindia.com/api/v1/update-product-active-status/${id}`, {
                active: newActiveStatus
            });

            if (response.data.success) {
                toast.success('Product active status updated successfully!');
                await fetchProducts();
            } else {
                toast.error('Failed to update product active status.');
            }
        } catch (error) {
            toast.error('An error occurred while updating the active status.');
            console.error('Toggle error:', error);
        }
    };


    // Calculate the indices of the products to display
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Define headers for the Table component
    const headers = ['S.No', 'Title', 'Price', 'Small Image', 'Large Image', 'Small Desc', 'Long Desc', 'Active', 'Meta Title', 'Meta Description', 'Created At', 'Action'];

    return (
        <div className='page-body'>
            <Breadcrumb heading={'Products'} subHeading={'Products'} LastHeading={'All Products'} backLink={'/product/all-product'} />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Table
                    headers={headers}
                    elements={currentProducts.map((product, index) => (
                        <tr key={product._id}>
                            <td>{index + 1}</td>
                            <td className='fw-bolder'>{product.title || "Not-Available"}</td>
                            <td className='fw-bolder'>{product.price || "Not-Available"}</td>
                            <td className='text-danger fw-bolder'><img src={product?.smallImage?.url} width={50} alt="" /></td>
                            <td className='text-danger fw-bolder'><img src={product?.largeImage?.url} width={50} alt="" /></td>
                            <td className='fw-bolder'>{product.smalldesc ? product.smalldesc.substring(0, 14) + '....' : "Not-Available"}</td>
                            <td className='fw-bolder'>{product.longdesc ? product.longdesc.substring(0, 14) + '....' : "Not-Available"}</td>
                            <td>
                                <Toggle
                                    isActive={product.active}
                                    onToggle={() => handleToggle(product._id, product.active)} // Pass product id and current active status
                                />
                            </td>
                            <td className='fw-bolder'>{product.metaTitle ? product.metaTitle.substring(0, 14) + '....' : "Not-Available"}</td>
                            <td className='fw-bolder'>{product.metaDescription ? product.metaDescription.substring(0, 14) + '....' : "Not-Available"}</td>
                            <td>{new Date(product.createdAt).toLocaleString() || "Not-Available"}</td>
                            <td className='fw-bolder'>
                                <div className="product-action">
                                    <Link to={`/product/edit-product/${product._id}`}>
                                        <i class="ri-pencil-fill"></i>
                                    </Link>
                                    <i onClick={() => handleDelete(product._id)} style={{ cursor: 'pointer' }} class="ri-delete-bin-fill"></i>
                                </div>
                            </td>
                        </tr>
                    ))}
                    productLength={products.length}
                    productsPerPage={productsPerPage}
                    currentPage={currentPage}
                    paginate={setCurrentPage}
                    href="/product/add-product"
                    text="Add Product"
                    errorMsg=""
                    handleOpen={() => { }}
                />
            )}
        </div>
    )
}

export default AllProduct