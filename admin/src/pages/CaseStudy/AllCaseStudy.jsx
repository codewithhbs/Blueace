import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import Toggle from '../../components/Forms/toggle';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function AllCaseStudy() {
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const caseStudiesPerPage = 10;

    const fetchCaseStudies = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:7987/api/v1/get-all-case-study');
            if (response.data.success) {
                const reversedData = response.data.data.reverse();
                setCaseStudies(reversedData);
            } else {
                toast.error('Failed to fetch case studies');
            }
        } catch (error) {
            toast.error('An error occurred while fetching case studies.');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaseStudies();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:7987/api/v1/delete-case-study/${id}`);
            if (response.data.success) {
                toast.success('Case study deleted successfully!');
                await fetchCaseStudies();
            } else {
                toast.error('Failed to delete case study');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the case study.');
        }
    };

    const handleTogglePublish = async (id, isPublished) => {
        try {
            const response = await axios.put(`http://localhost:7987/api/v1/update-case-study/${id}`, {
                isPublished: !isPublished,
            });
            if (response.data.success) {
                toast.success('Publish status updated');
                fetchCaseStudies();
            } else {
                toast.error('Failed to update publish status');
            }
        } catch (error) {
            toast.error('Error updating publish status');
        }
    };

    const indexOfLast = currentPage * caseStudiesPerPage;
    const indexOfFirst = indexOfLast - caseStudiesPerPage;
    const currentPageData = caseStudies.slice(indexOfFirst, indexOfLast);

    const headers = [
        'S.No',
        'Title',
        'Small Desc',
        // 'Large Desc',
        // 'Category',
        // 'Client',
        // 'Location',
        // 'Completion Date',
        'Small Image',
        'Large Image',
        // 'Technologies Used',
        // 'Video URL',
        'Published',
        'Created At',
        'Action',
    ];

    return (
        <div className='page-body'>
            <Breadcrumb
                heading={'All Case Studies'}
                subHeading={'Case Study Management'}
                LastHeading={'All Case Studies'}
                backLink={'/home-layout/all-case-study'}
            />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Table
                    headers={headers}
                    elements={currentPageData.map((item, index) => (
                        <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td className='fw-bold'>{item.title || "N/A"}</td>
                            <td>{item.smallDes?.substring(0, 20) + '...'}</td>
                            {/* <td>{item.longDes?.substring(0, 20) + '...'}</td> */}
                            {/* <td>{item.category}</td> */}
                            {/* <td>{item.clientName || "N/A"}</td> */}
                            {/* <td>{item.location || "N/A"}</td> */}
                            {/* <td>{item.completionDate ? new Date(item.completionDate).toLocaleDateString() : "N/A"}</td> */}
                            <td><img src={item?.smallImage?.url} width={50} alt="Small" /></td>
                            <td><img src={item?.largeImage?.url} width={50} alt="Large" /></td>
                            {/* <td>{item.technologiesUsed?.join(', ') || "N/A"}</td> */}
                            {/* <td>
                                {item.videoUrl ? (
                                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                                        View Video
                                    </a>
                                ) : "N/A"}
                            </td> */}
                            <td>
                                <Toggle
                                    isActive={item.isPublished}
                                    onToggle={() => handleTogglePublish(item._id, item.isPublished)}
                                />
                            </td>
                            <td>{new Date(item.createdAt).toLocaleString()}</td>
                            <td>
                                <div className="product-action">
                                    <Link to={`/home-layout/edit-case-study/${item._id}`}>
                                        <i className="ri-pencil-fill"></i>
                                    </Link>
                                    <i onClick={() => handleDelete(item._id)} style={{ cursor: 'pointer' }} className="ri-delete-bin-fill"></i>
                                </div>
                            </td>
                        </tr>
                    ))}
                    productLength={caseStudies.length}
                    productsPerPage={caseStudiesPerPage}
                    currentPage={currentPage}
                    paginate={setCurrentPage}
                    href="/home-layout/add-case-study"
                    text="Add Case Study"
                    errorMsg=""
                    handleOpen={() => {}}
                />
            )}
        </div>
    );
}

export default AllCaseStudy;
