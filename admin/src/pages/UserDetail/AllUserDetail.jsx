import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import toast from 'react-hot-toast';
import Toggle from '../../components/Forms/toggle';
import { Link } from 'react-router-dom';

function AllUserDetail() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // States for filter inputs
    const [filterEmail, setFilterEmail] = useState("");
    const [filterPhoneNumber, setFilterPhoneNumber] = useState("");
    const [filterAddress, setFilterAddress] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilter, setShowFilter] = useState(false);

    const fetchUserDetail = async () => {
        setLoading(true);
        try {
            const res = await axios.get('https://www.api.blueaceindia.com/api/v1/AllUser');
            const datasave = res.data.data;
            const filterdata = datasave.filter((item) => item.UserType === "Normal");
            console.log("filterdata", filterdata.length);
            const r = filterdata.reverse();
            setUsers(r);
        } catch (error) {
            toast.error('An error occurred while fetching User data.');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetail();
    }, []);

    // Reset currentPage to 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterEmail, filterPhoneNumber, filterAddress, startDate, endDate]);

    const indexOfLastVoucher = currentPage * productsPerPage;
    const indexOfFirstVoucher = indexOfLastVoucher - productsPerPage;

    // Filter users based on Email, Phone Number, Address, and Date Range
    const filteredUsers = users.filter((user) => {
        const emailMatch = filterEmail
            ? user.Email && user.Email.toLowerCase().includes(filterEmail.toLowerCase())
            : true;
        const phoneNumberMatch = filterPhoneNumber
            ? user.ContactNumber && user.ContactNumber.includes(filterPhoneNumber)
            : true;
        const addressMatch = filterAddress
            ? user.address && user.address.toLowerCase().includes(filterAddress.toLowerCase())
            : true;

        // Handle date filtering with validation for invalid dates
        let userDate = null;
        let dateMatch = true;
        if (user.createdAt) {
            userDate = new Date(user.createdAt);
            if (!isNaN(userDate.getTime())) {
                const startDateMatch = startDate ? userDate >= new Date(startDate) : true;
                const endDateMatch = endDate ? userDate <= new Date(endDate) : true;
                dateMatch = startDateMatch && endDateMatch;
            }
        }

        return emailMatch && phoneNumberMatch && addressMatch && dateMatch;
    });

    // Ensure currentPage doesn't exceed the total number of pages
    const totalPages = Math.ceil(filteredUsers.length / productsPerPage);
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredUsers.length, currentPage, totalPages]);

    const currentServices = filteredUsers.slice(indexOfFirstVoucher, indexOfLastVoucher);

    // Handle updating the UserType
    const handleUserTypeChange = async (userId, newUserType) => {
        try {
            await axios.put(`https://www.api.blueaceindia.com/api/v1/update-user-type/${userId}`, { UserType: newUserType });
            toast.success('User type updated successfully!');
            fetchUserDetail();
        } catch (error) {
            toast.error('Failed to update user type.');
            console.error('Update error:', error);
        }
    };

    const handleToggle = async (id, currentDeactiveStatus) => {
        try {
            const newDeactiveStatus = !currentDeactiveStatus;
            const response = await axios.put(`https://www.api.blueaceindia.com/api/v1/update-user-deactive-status/${id}`, {
                isDeactive: newDeactiveStatus
            });
            if (response.data.success) {
                toast.success('User status updated successfully.');
                await fetchUserDetail();
            } else {
                toast.error('Failed to update User status.');
            }
        } catch (error) {
            toast.error("An error occurred while updating the deactive status");
            console.error("Toggle error:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://www.api.blueaceindia.com/api/v1/delete-user/${id}`);
            if (response.data.success) {
                toast.success('User deleted successfully!');
                await fetchUserDetail();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the user.');
        }
    };

    const headers = ['S.No', 'Name', 'Phone Number', 'Email', 'Address', 'User Type', 'Deactive', 'Edit', 'Created At', 'Action'];

    return (
        <div className='page-body'>
            <Breadcrumb heading={'Users'} subHeading={'Users'} LastHeading={'All Users'} backLink={'/users/all-users'} />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* Filter UI */}
                    <div className="filter-section mb-4">
                        <button className="btn btn-primary" onClick={() => setShowFilter(!showFilter)}>
                            {showFilter ? "Hide Filter" : "Show Filter"}
                        </button>
                        {showFilter && (
                            <div className="mt-2 row">
                                <div className="col-md-3">
                                    <label htmlFor="emailFilter" className="form-label">Search by Email</label>
                                    <input
                                        id="emailFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by Email"
                                        value={filterEmail}
                                        onChange={(e) => setFilterEmail(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="phoneFilter" className="form-label">Search by Phone Number</label>
                                    <input
                                        id="phoneFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by Phone Number"
                                        value={filterPhoneNumber}
                                        onChange={(e) => setFilterPhoneNumber(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="addressFilter" className="form-label">Search by Address</label>
                                    <input
                                        id="addressFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by Address"
                                        value={filterAddress}
                                        onChange={(e) => setFilterAddress(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="startDate" className="form-label">Start Date</label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        className="form-control mb-2"
                                        value={startDate || ""}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="endDate" className="form-label">End Date</label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        className="form-control mb-2"
                                        value={endDate || ""}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Display filtered count for clarity */}
                    <div className="mb-3">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>

                    <Table
                        headers={headers}
                        elements={currentServices.map((category, index) => (
                            <tr key={category._id}>
                                <td>{index + 1}</td>
                                <td className="fw-bolder">{category.FullName || 'Not-Available'}</td>
                                <td className="fw-bolder">{category.ContactNumber || "Not-Available"}</td>
                                <td className="fw-bolder">{category.Email || "Not-Available"}</td>
                                <td className="fw-bolder">{category.address ? `${category.HouseNo}, ${category.address}, ${category.PinCode}` : "Not-Available"}</td>
                                <td>
                                    <select
                                        value={category.UserType || 'Normal'}
                                        onChange={(e) => handleUserTypeChange(category._id, e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="Normal">Normal</option>
                                        <option value="Corporate">Corporate</option>
                                    </select>
                                </td>
                                <td>
                                    <Toggle
                                        isActive={category.isDeactive}
                                        onToggle={() => handleToggle(category._id, category.isDeactive)}
                                    />
                                </td>
                                <td>
                                    <Link to={`/users/edit-user/${category._id}`} className="btn btn-danger">Edit</Link>
                                </td>
                                <td>{category.createdAt ? new Date(category.createdAt).toLocaleString() : "Not-Available"}</td>
                                <td className="fw-bolder">
                                    <div className="product-action">
                                        <svg onClick={() => handleDelete(category._id)} style={{ cursor: 'pointer' }}>
                                            <use href="/assets/svg/icon-sprite.svg#trash1" />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        productLength={filteredUsers.length}
                        productsPerPage={productsPerPage}
                        currentPage={currentPage}
                        paginate={setCurrentPage}
                        href="/users/add-user"
                        text="Add User"
                        errorMsg=""
                        handleOpen={() => {}}
                    />
                </>
            )}
        </div>
    );
}

export default AllUserDetail;