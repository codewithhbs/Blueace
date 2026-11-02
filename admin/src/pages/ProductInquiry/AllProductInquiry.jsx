import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllProductInquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const inquiriesPerPage = 10;

  const fetchInquiries = async () => {
    setLoading(true); // Set loading state before fetching
    try {
      const response = await axios.get('https://www.api.blueaceindia.com/api/v1/get-all-product-inquiry');
      if (response.data.success) {
        const datasave = response.data.data;
        const r = datasave.reverse();
        setInquiries(r);
        console.log(response.data.data);
      } else {
        toast.error('Failed to fetch product inquiries');
      }
    } catch (error) {
      toast.error('An error occurred while fetching product inquiries.');
      console.error('Fetch error:', error); // Logging error for debugging
    } finally {
      setLoading(false); // Stop loading regardless of success or error
    }
  };
  // Fetch inquiries using Axios
  useEffect(() => {
    fetchInquiries();
  }, []);


  // Handle deleting an inquiry
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`https://www.api.blueaceindia.com/api/v1/delete-product-inquiry/${id}`);
      if (response.data.success) {
        toast.success('Inquiry deleted successfully!');
        await fetchInquiries(); // Fetch inquiries again after deletion
      } else {
        toast.error('Failed to delete inquiry');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the inquiry.');
    }
  };


  // Calculate the indices of the inquiries to display
  const indexOfLastInquiry = currentPage * inquiriesPerPage;
  const indexOfFirstInquiry = indexOfLastInquiry - inquiriesPerPage;
  const currentInquiries = inquiries.slice(indexOfFirstInquiry, indexOfLastInquiry);

  // Define headers for the Table component
  const headers = ['S.No', 'Product', 'Name', 'Email', 'Phone', 'Message', 'Created At', 'Action'];

  return (
    <div className='page-body'>
      <Breadcrumb heading={'Product Inquiries'} subHeading={'Inquiries'} LastHeading={'All Product Inquiries'} backLink={'/product-inquiry/all-product-inquiry'} />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table
          headers={headers}
          elements={currentInquiries.map((inquiry, index) => (
            <tr key={inquiry._id}>
              <td>{(currentPage - 1) * inquiriesPerPage + index + 1}</td>
              <td className='fw-bolder'>{inquiry.productId?.title || "Not-Available"}</td>
              <td className='fw-bolder'>{inquiry.name || "Not-Available"}</td>
              <td className='fw-bolder'>{inquiry.email || "Not-Available"}</td>
              <td className='fw-bolder'>{inquiry.phone || "Not-Available"}</td>
              <td className='fw-bolder'>{inquiry.message ? inquiry.message.substring(0, 14) + '....' : "Not-Available"}</td>
              <td>{new Date(inquiry.createdAt).toLocaleString() || "Not-Available"}</td>
              <td className='fw-bolder'>
                <div className="product-action">
                  <i onClick={() => { setSelectedInquiry(inquiry); setShowModal(true); }} className="ri-eye-fill" style={{ cursor: 'pointer', marginRight: '10px' }}></i>
                  <i onClick={() => handleDelete(inquiry._id)} style={{ cursor: 'pointer' }} className="ri-delete-bin-fill"></i>
                </div>
              </td>
            </tr>
          ))}
          productLength={inquiries.length}
          productsPerPage={inquiriesPerPage}
          currentPage={currentPage}
          paginate={setCurrentPage}
          href=""
          text=""
          errorMsg=""
          handleOpen={() => { }}
        />
      )}

      {selectedInquiry && (
        <div className="modal fade show" style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Inquiry Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <h4>Inquirer Information</h4>
                <p><strong>Name:</strong> {selectedInquiry.name || 'Not Available'}</p>
                <p><strong>Email:</strong> {selectedInquiry.email || 'Not Available'}</p>
                <p><strong>Phone:</strong> {selectedInquiry.phone || 'Not Available'}</p>
                <p><strong>Message:</strong> {selectedInquiry.message || 'Not Available'}</p>
                {/* <p><strong>Created At:</strong> {new Date(selectedInquiry.createdAt).toLocaleString() || 'Not Available'}</p> */}
                {/* <p><strong>Updated At:</strong> {new Date(selectedInquiry.updatedAt).toLocaleString() || 'Not Available'}</p> */}

                <h4 className="mt-4">Product Details</h4>
                <p><strong>Title:</strong> {selectedInquiry.productId?.title || 'Not Available'}</p>
                <p><strong>Small Description:</strong> {selectedInquiry.productId?.smalldesc || 'Not Available'}</p>
                {/* <div><strong>Long Description:</strong> <div dangerouslySetInnerHTML={{ __html: selectedInquiry.productId?.longdesc || 'Not Available' }} /></div> */}
                <p><strong>Price:</strong> ₹{selectedInquiry.productId?.price || 'Not Available'}</p>
                {/* <p><strong>Meta Title:</strong> {selectedInquiry.productId?.metaTitle || 'Not Available'}</p>
                <p><strong>Meta Description:</strong> {selectedInquiry.productId?.metaDescription || 'Not Available'}</p> */}
                {/* <p><strong>Active:</strong> {selectedInquiry.productId?.active ? 'Yes' : 'No'}</p> */}
                {/* <p><strong>Product Created At:</strong> {new Date(selectedInquiry.productId?.createdAt).toLocaleString() || 'Not Available'}</p>
                <p><strong>Product Updated At:</strong> {new Date(selectedInquiry.productId?.updatedAt).toLocaleString() || 'Not Available'}</p> */}

                {/* <h5 className="mt-3">Small Image</h5>
                {selectedInquiry.productId?.smallImage?.url ? (
                  <img src={selectedInquiry.productId.smallImage.url} alt="Small Image" className="img-fluid" />
                ) : (
                  <p>Not Available</p>
                )}

                <h5 className="mt-3">Large Image</h5>
                {selectedInquiry.productId?.largeImage?.url ? (
                  <img src={selectedInquiry.productId.largeImage.url} alt="Large Image" className="img-fluid" />
                ) : (
                  <p>Not Available</p>
                )} */}
              </div>
            </div>
          </div>
          {/* <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div> */}
        </div>
      )}
    </div>
  )
}

export default AllProductInquiry;