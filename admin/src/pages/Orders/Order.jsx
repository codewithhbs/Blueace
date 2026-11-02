import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import toast from 'react-hot-toast';
import moment from 'moment';
import Swal from 'sweetalert2';

function Order() {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [paymentModel, setPaymentModel] = useState(false);
    const [paymentDetail, setPaymentDetail] = useState(null);
    const [registerAddress, setRegisterAddress] = useState("");
    const [filterPhoneNumber, setFilterPhoneNumber] = useState("");
    const [filterServiceName, setFilterServiceName] = useState("");
    const [filterOrderStatus, setFilterOrderStatus] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const productsPerPage = 10;

    const fetchAllOrders = async () => {
        try {
            const res = await axios.get('https://www.api.blueaceindia.com/api/v1/get-all-order');
            console.log("res.data.data", res.data.data);
            setAllOrders(res.data.data.reverse()); // Reverse to show latest orders first
            setLoading(false);
        } catch (error) {
            console.error("Internal server error in fetching all orders", error);
            toast.error('An error occurred while fetching orders.');
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Reset currentPage to 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [registerAddress, filterPhoneNumber, filterServiceName, filterOrderStatus, startDate, endDate]);

    // Filtering logic
    const filteredOrders = allOrders.filter((order) => {
        const addressMatch = registerAddress
            ? order.address && order.address.toLowerCase().includes(registerAddress.toLowerCase())
            : true;
        const phoneNumberMatch = filterPhoneNumber
            ? order.userId?.ContactNumber && order.userId.ContactNumber.includes(filterPhoneNumber)
            : true;
        const serviceNameMatch = filterServiceName
            ? order.serviceId?.subCategoryId?.name && order.serviceId.subCategoryId.name.toLowerCase().includes(filterServiceName.toLowerCase())
            : true;
        const orderStatusMatch = filterOrderStatus
            ? order.OrderStatus && order.OrderStatus.toLowerCase().includes(filterOrderStatus.toLowerCase())
            : true;

        let dateMatch = true;
        if (order.createdAt) {
            const orderDate = moment(order.createdAt);
            if (orderDate.isValid()) {
                const startDateMatch = startDate ? orderDate.isSameOrAfter(moment(startDate).startOf('day')) : true;
                const endDateMatch = endDate ? orderDate.isSameOrBefore(moment(endDate).endOf('day')) : true;
                dateMatch = startDateMatch && endDateMatch;
            }
        }

        return addressMatch && phoneNumberMatch && serviceNameMatch && orderStatusMatch && dateMatch;
    });

    // Pagination logic
    const indexOfLastOrder = currentPage * productsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - productsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Ensure currentPage doesn't exceed the total number of pages
    const totalPages = Math.ceil(filteredOrders.length / productsPerPage);
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredOrders.length, currentPage, totalPages]);

    // Handle order status change
    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`https://www.api.blueaceindia.com/api/v1/update-order-status/${orderId}`, { OrderStatus: newStatus });
            toast.success('Order status updated successfully');
            fetchAllOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            Swal.fire("Error", "Failed to update order status", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://www.api.blueaceindia.com/api/v1/delete-order/${id}`);
            if (response.data.success) {
                toast.success('Order deleted successfully!');
                await fetchAllOrders();
            } else {
                toast.error('Failed to delete order.');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the order.');
            console.error("Delete error:", error);
        }
    };

    const handleView = (vendor) => {
        setSelectedVendor(vendor);
        setModalVisible(true);
    };

    const handleViewPayment = (order) => {
        setPaymentDetail(order);
        setPaymentModel(true);
    };

    const handleRedirect = (vendorId) => {
        window.location.href = `/show-vendor/${vendorId}`;
    };

    const headers = [
        'S.No', 'Service Name', 'Service Type', 'User Name', 'User Type', 'Is AMC User', 'Service Address',
        'User Appointment Date', 'User Detail', 'Vendor Allotted Detail', 'Voice Note', 'Message',
        'Select Vendor', 'Select Employee', 'Service Day', 'Service Time', 'Vendor Member Allotted',
        'Order Status', 'Estimated Bill', 'Bill Status', 'Is Inverter AC', 'See Error Code',
        'Before Work Video', 'After Work Video', 'Payment Detail', 'Delete', 'Created At'
    ];

    return (
        <div className='page-body'>
            <Breadcrumb heading={'Orders'} subHeading={'Orders'} LastHeading={'All Orders'} backLink={'/Orders/all-order'} />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* Filter Section */}
                    <div className="filter-section mb-4">
                        <button className="btn btn-primary" onClick={() => setShowFilter(!showFilter)}>
                            {showFilter ? "Hide Filter" : "Show Filter"}
                        </button>
                        {showFilter && (
                            <div className="mt-2 row">
                                <div className="col-md-3">
                                    <label htmlFor="addressFilter" className='form-label'>Search by Address</label>
                                    <input
                                        id="addressFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by Order Address"
                                        value={registerAddress}
                                        onChange={(e) => setRegisterAddress(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="phoneFilter" className='form-label'>Search by Phone Number</label>
                                    <input
                                        id="phoneFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by User Phone Number"
                                        value={filterPhoneNumber}
                                        onChange={(e) => setFilterPhoneNumber(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="serviceNameFilter" className='form-label'>Search by Service Name</label>
                                    <input
                                        id="serviceNameFilter"
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Search by Service Name"
                                        value={filterServiceName}
                                        onChange={(e) => setFilterServiceName(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="orderStatusFilter" className='form-label'>Search by Order Status</label>
                                    <select
                                        id="orderStatusFilter"
                                        className="form-control mb-2"
                                        value={filterOrderStatus}
                                        onChange={(e) => setFilterOrderStatus(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Vendor Assigned">Vendor Assigned</option>
                                        <option value="Vendor Ready To Go">Vendor Ready To Go</option>
                                        <option value="Service Done">Service Done</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="startDateFilter" className='form-label'>Search by Starting Date</label>
                                    <input
                                        id="startDateFilter"
                                        type="date"
                                        className="form-control mb-2"
                                        value={startDate ? moment(startDate).format("YYYY-MM-DD") : ""}
                                        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="endDateFilter" className='form-label'>Search by Ending Date</label>
                                    <input
                                        id="endDateFilter"
                                        type="date"
                                        className="form-control mb-2"
                                        value={endDate ? moment(endDate).format("YYYY-MM-DD") : ""}
                                        onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Display filtered count */}
                    <div className="mb-3">
                        Showing {filteredOrders.length} of {allOrders.length} orders
                    </div>

                    <Table
                        headers={headers}
                        elements={currentOrders.map((order, index) => (
                            <tr key={order._id}>
                                <td>{index + 1}</td>
                                <td className='fw-bolder'>{order?.serviceId?.subCategoryId?.name || "Not-Available"}</td>
                                <td className='fw-bolder'>{order?.serviceType || "Not-Available"}</td>
                                <td className='fw-bolder'>{order?.userId?.FullName || "Not-Available"}</td>
                                <td className='fw-bolder'>{order?.userId?.UserType || "Not-Available"}</td>
                                <td className='fw-bolder'>{order?.userId?.isAMCUser ? 'Yes' : 'No'}</td>
                                <td className='fw-bolder'>{order?.address || "Not-Available"}</td>
                                <td className='fw-bolder'>
                                    {order?.workingDateUserWant
                                        ? new Date(order.workingDateUserWant).toLocaleDateString('en-GB')
                                        : 'Not-Available'}
                                </td>
                                <td className='fw-bolder'>
                                    <button
                                        className="btn btn-info btn-activity-view rounded-pill px-4 py-2 shadow-sm"
                                        type="button"
                                        onClick={() => handleView(order?.userId)}
                                    >
                                        View
                                    </button>
                                </td>
                                <td className='fw-bolder'>
                                    <button
                                        className="btn btn-info btn-activity-view rounded-pill px-4 py-2 shadow-sm"
                                        type="button"
                                        onClick={() => handleRedirect(order?.vendorAlloted?._id)}
                                        disabled={order?.VendorAllotedBoolean === false}
                                    >
                                        View
                                    </button>
                                </td>
                                <td className='fw-bolder'>
                                    {order.voiceNote ? (
                                        <audio style={{ width: '200px' }} controls>
                                            <source src={order.voiceNote.url} type="audio/webm" />
                                        </audio>
                                    ) : 'No voice note'}
                                </td>
                                <td className='fw-bolder'>{order?.message || "Not-Available"}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    {order?.userId?.UserType === 'Corporate' ? (
                                        order.VendorAllotedStatus === 'Accepted' || order.VendorAllotedStatus === 'Send Request' ? (
                                            <a href={`/Alloted/${order._id}?type=change-vendor`} className="btn btn-danger btn-activity-danger rounded-pill px-4 py-2 shadow-sm">
                                                Change Member
                                            </a>
                                        ) : (
                                            <a href={`/Alloted/${order._id}`} className="btn btn-primary btn-activity-primary rounded-pill px-4 py-2 shadow-sm">
                                                Send Your Member
                                            </a>
                                        )
                                    ) : (
                                        order.VendorAllotedStatus === 'Accepted' || order.VendorAllotedStatus === 'Send Request' ? (
                                            <a href={`/Alloted/${order._id}?type=change-vendor`} className="btn btn-danger btn-activity-danger rounded-pill px-4 py-2 shadow-sm">
                                                Change Vendor
                                            </a>
                                        ) : (
                                            <a href={`/Alloted/${order._id}`} className="btn btn-danger btn-activity-danger rounded-pill px-4 py-2 shadow-sm">
                                                Allot Vendor
                                            </a>
                                        )
                                    )}
                                </td>
                                <td className='fw-bolder' style={{ whiteSpace: "nowrap" }}>
                                    <a href={`/alloted-employee/${order._id}`} className="btn btn-danger btn-activity-danger rounded-pill px-4 py-2 shadow-sm">
                                        Send Member
                                    </a>
                                </td>
                                <td className='fw-bolder'>{order?.workingDay || 'Not Allotted'}</td>
                                <td className='fw-bolder'>{order?.workingTime || 'Not Allotted'}</td>
                                <td className='fw-bolder'>{order?.AllowtedVendorMember || 'Not Allotted'}</td>
                                <td className='fw-bolder'>
                                    <select
                                        name="orderStatus"
                                        value={order?.OrderStatus || ""}
                                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Vendor Assigned">Vendor Assigned</option>
                                        <option value="Vendor Ready To Go">Vendor Ready To Go</option>
                                        <option value="Service Done">Service Done</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className='fw-bolder'>
                                    <button
                                        onClick={() => {
                                            const estimatedBillStr = JSON.stringify(order.EstimatedBill);
                                            window.location.href = `/see-esitimated-bill?OrderId=${order._id}&vendor=${order?.vendorAlloted?._id}&Estimate=${encodeURIComponent(estimatedBillStr)}`;
                                        }}
                                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                                        className='btn btn-info btn-activity-view rounded-pill px-4 py-2 shadow-sm'
                                        disabled={!order.EstimatedBill}
                                    >
                                        {order?.EstimatedBill ? "See Budget" : "Bill Not Available"}
                                    </button>
                                </td>
                                <td className={`text-center ${order.EstimatedBill?.statusOfBill ? 'text-success' : 'text-danger'}`}>
                                    {order.EstimatedBill?.statusOfBill ? 'Accepted' : 'Bill Not Generated Yet'}
                                </td>
                                <td className="fw-bolder">
                                    {order?.isInvetorAc === true ? (
                                        <span className="bg-success text-white px-2 py-1 rounded">Yes</span>
                                    ) : order?.isInvetorAc === false ? (
                                        <span className="bg-danger text-white px-2 py-1 rounded">No</span>
                                    ) : (
                                        'Not Allotted'
                                    )}
                                </td>
                                <td className='fw-bolder'>
                                    {order?.isInvetorAc ? (
                                        <button
                                            onClick={() => {
                                                window.location.href = `/show-error-code/${order._id}`;
                                            }}
                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                                            className='btn btn-info btn-activity-view rounded-pill px-4 py-2 shadow-sm'
                                        >
                                            See Error Code
                                        </button>
                                    ) : (
                                        <p className='text-error'>No error code is available</p>
                                    )}
                                </td>
                                <td className='fw-bolder'>
                                    {order?.beforeWorkVideo?.url ? (
                                        <video
                                            width="200"
                                            height="120"
                                            controls
                                            style={{ borderRadius: '5px' }}
                                        >
                                            <source src={order?.beforeWorkVideo?.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <span>No video uploaded</span>
                                    )}
                                </td>
                                <td className='fw-bolder'>
                                    {order?.afterWorkVideo?.url ? (
                                        <video
                                            width="200"
                                            height="120"
                                            controls
                                            style={{ borderRadius: '5px' }}
                                        >
                                            <source src={order?.afterWorkVideo?.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <span>No video uploaded</span>
                                    )}
                                </td>
                                <td className='fw-bolder'>
                                    {!order?.userId?.isAMCUser ? (
                                        order?.PaymentStatus === 'paid' ? (
                                            <button
                                                className="btn btn-info btn-activity-view rounded-pill px-4 py-2 shadow-sm"
                                                type="button"
                                                onClick={() => handleViewPayment(order)}
                                            >
                                                View
                                            </button>
                                        ) : (
                                            <span>Service Not Done</span>
                                        )
                                    ) : (
                                        <span>AMC User</span>
                                    )}
                                </td>
                                <td className='fw-bolder'>
                                    <button
                                        onClick={() => handleDelete(order._id)}
                                        className="btn btn-danger btn-activity-danger rounded-pill px-4 py-2 shadow-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "Not-Available"}</td>
                            </tr>
                        ))}
                        productLength={filteredOrders.length}
                        productsPerPage={productsPerPage}
                        currentPage={currentPage}
                        paginate={setCurrentPage}
                        href=""
                        text=""
                        errorMsg=""
                        handleOpen={() => {}}
                        ExcelText="Export Vendor Order"
                        excelHref={'/download-vendor-order'}
                        EmployeeOrderText="Export Employee Order"
                        EmployeeOrderHref={'/download-employ-data'}
                        AMCOrderText="Export AMC User Order"
                        AMCOrderHref={'/download-amc-order'}
                        allOrderText="Create Order"
                        allOrderHref={'/Orders/create-order'}
                    />

                    {modalVisible && selectedVendor && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
                            <div className="modal-dialog modal-xl" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">User Details</h5>
                                        <button type="button" className="close" onClick={() => setModalVisible(false)} aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Field</th>
                                                    <th>Information</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '28%' }}>User Name</td>
                                                    <td>{selectedVendor.FullName || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Number</td>
                                                    <td>{selectedVendor.ContactNumber || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Email</td>
                                                    <td>{selectedVendor.Email || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>User Type</td>
                                                    <td>{selectedVendor.UserType || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Address</td>
                                                    <td>
                                                        {selectedVendor?.HouseNo && selectedVendor?.address && selectedVendor?.PinCode
                                                            ? `${selectedVendor.HouseNo}, ${selectedVendor.address}, ${selectedVendor.PinCode}`
                                                            : 'Not-Available'}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentModel && paymentDetail && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
                            <div className="modal-dialog modal-xl" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Bank Detail</h5>
                                        <button type="button" className="close" onClick={() => setPaymentModel(false)} aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Field</th>
                                                    <th>Information</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Transaction Id</td>
                                                    <td>{paymentDetail.transactionId || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Total Amount</td>
                                                    <td>Rs.{paymentDetail.totalAmount || "Not-Available"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '28%' }}>Vendor Commission Amount</td>
                                                    <td>Rs.{paymentDetail.vendorCommissionAmount || "Not-Available"}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setPaymentModel(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Order;