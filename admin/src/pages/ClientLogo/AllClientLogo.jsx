import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllClientLogo = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logosPerPage = 10;

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:7987/api/v1/get-all-client-logo');
      if (response.data.success) {
        const data = response.data.data.reverse();
        setLogos(data);
      } else {
        toast.error('Failed to fetch client logos.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching client logos.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:7987/api/v1/delete-client-logo/${id}`);
      if (response.data.success) {
        toast.success('Logo deleted successfully!');
        await handleFetchData();
      } else {
        toast.error('Failed to delete logo.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the logo.');
    }
  };

  const indexOfLastLogo = currentPage * logosPerPage;
  const indexOfFirstLogo = indexOfLastLogo - logosPerPage;
  const currentLogos = logos.slice(indexOfFirstLogo, indexOfLastLogo);

  const headers = ['S.No', 'Client Logo', 'Action'];

  return (
    <div className="page-body">
      <Breadcrumb
        heading={'Client Logo'}
        subHeading={'Home Layout'}
        LastHeading={'All Client Logo'}
        backLink={'/home-layout/all-client-logo'}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table
          headers={headers}
          elements={currentLogos.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>
                <img src={item?.logo?.url} width={60} height={60} alt="Client Logo" />
              </td>
              <td className="fw-bolder">
                <div className="product-action">
                  <Link to={`/home-layout/edit-client-logo/${item._id}`}>
                    <i className="ri-pencil-fill"></i>
                  </Link>
                  <i
                    onClick={() => handleDelete(item._id)}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                    className="ri-delete-bin-fill"
                  ></i>
                </div>
              </td>
            </tr>
          ))}
          productLength={logos.length}
          productsPerPage={logosPerPage}
          currentPage={currentPage}
          paginate={setCurrentPage}
          href="/home-layout/add-client-logo"
          text="Add Logo"
          errorMsg=""
          handleOpen={() => {}}
        />
      )}
    </div>
  );
};

export default AllClientLogo;
