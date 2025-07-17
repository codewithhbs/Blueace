import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function VendorRegistration() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const [haveGst, setHaveGst] = useState("No");
    const [previewPanImage, setPanImage] = useState(null);
    const [previewAdharImage, setAdharImage] = useState(null);
    const [previewGstImage, setGstImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        yearOfRegistration: '',
        address: '',
        panImage: null,
        adharImage: null,
        gstImage: null,
        Email: '',
        ownerName: '',
        ContactNumber: '',
        panNo: '',
        gstNo: '',
        adharNo: '',
        Password: '',
        HouseNo: '',
        PinCode: '',
        RangeWhereYouWantService: [{
            location: { type: 'Point', coordinates: [] }
        }]
    });
    const [location, setLocation] = useState({ latitude: '', longitude: '' });
    const [addressSuggestions, setAddressSuggestions] = useState([]); // Suggestions state

    const handleGstToggle = (e) => {
        const value = e.target.value;  // Get selected value
        console.log("value", value)
        setHaveGst(value);  // Update the state with 'yes' or 'no'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        // Password length validation
        if (name === 'Password') {
            if (value.length < 7) {
                setPasswordError('Password must be at least 7 characters long');
            } else {
                setPasswordError('');
            }
        }
        if (name === 'address' && value.length > 2) {
            fetchAddressSuggestions(value);
        }
    };

    // Fetch address suggestions
    const fetchAddressSuggestions = async (query) => {
        try {
            // console.log("query",query)
            const res = await axios.get(`http://localhost:7987/api/v1/autocomplete?input=${encodeURIComponent(query)}`);
            // console.log(res.data)
            setAddressSuggestions(res.data || []);
        } catch (err) {
            console.error('Error fetching address suggestions:', err);
        }
    };

    // Fetch latitude and longitude based on selected address
    const fetchGeocode = async (selectedAddress) => {
        try {
            const res = await axios.get(`http://localhost:7987/api/v1/geocode?address=${encodeURIComponent(selectedAddress)}`);
            // console.log("geo", res.data)
            const { latitude, longitude } = res.data;
            setLocation({ latitude, longitude });
            setFormData((prevData) => ({
                ...prevData,
                address: selectedAddress,
                RangeWhereYouWantService: [{
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                }]
            }));
            setAddressSuggestions([]);
        } catch (err) {
            console.error('Error fetching geocode:', err);
        }
    };

    const handlePanImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({ ...prevData, panImage: file }));
            setPanImage(URL.createObjectURL(file));
        }
    };

    const handleAdharImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({ ...prevData, adharImage: file }));
            setAdharImage(URL.createObjectURL(file));
        }
    };

    const handleGstImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({ ...prevData, gstImage: file }));
            setGstImage(URL.createObjectURL(file));
        }
    };

    const validateFields = () => {
        const { Password } = formData;

        // Password validation (length check)
        if (Password.length < 7) {
            toast.error("Password must be at least 7 characters long");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateFields()) return;

        setLoading(true);

        const payload = new FormData();
        payload.append('companyName', formData.companyName);
        payload.append('yearOfRegistration', formData.yearOfRegistration);
        payload.append('address', formData.address);
        payload.append('Email', formData.Email);
        payload.append('ownerName', formData.ownerName);
        payload.append('ContactNumber', formData.ContactNumber);
        payload.append('panNo', formData.panNo);
        payload.append('adharNo', formData.adharNo);
        payload.append('gstNo', formData.gstNo);
        payload.append('Password', formData.Password);
        payload.append('HouseNo', formData.HouseNo);
        payload.append('PinCode', formData.PinCode);
        payload.append('createdFrom', 'Website');

        if (formData.panImage) payload.append('panImage', formData.panImage);
        if (formData.adharImage) payload.append('adharImage', formData.adharImage);
        if (formData.gstImage) payload.append('gstImage', formData.gstImage);

        payload.append('RangeWhereYouWantService[0][location][type]', 'Point');
        payload.append('RangeWhereYouWantService[0][location][coordinates][0]', location.longitude);
        payload.append('RangeWhereYouWantService[0][location][coordinates][1]', location.latitude);

        try {
            const res = await axios.post('http://localhost:7987/api/v1/register-vendor', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vendor Registration Successful!');
            const userId = res.data.user._id;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = `/add-vendor-member/${userId}`;
        } catch (error) {
            console.log(error);

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                const message = data?.message || data?.error || 'An error occurred';

                // Handle specific message content (example)
                if (message.includes("Can't extract geo keys")) {
                    toast.error("Please provide a valid landmark before submitting.");
                }
                // Handle known status codes
                else if (status === 403) {
                    toast.error(message || 'Access forbidden.');
                }
                else if (status === 400) {
                    toast.error(message || 'Bad request.');
                }
                else {
                    toast.error(message);
                }
            } else if (error.request) {
                toast.error('No response received from the server.');
            } else {
                toast.error('Request setup error.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="gray">
                <div className="container">
                    <div className="row align-items-start justify-content-center">
                        <div className="col-xl-12 col-lg-8 col-md-12">
                            <div className="signup-screen-wrap">
                                <div className="text-center mb-4">
                                    <h2 className="m-0 fw-bold">Register As A Vendor</h2>
                                </div>
                                <div className="signup-screen-single light">
                                    <h4 className='bg-primary text-white p-2 mb-5'>General Details</h4>
                                    <form onSubmit={handleSubmit} className="submit-form">
                                        <div className="row">
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Name of Company*</label>
                                                <input type="text" value={formData.companyName} name='companyName' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Year of Registration*</label>
                                                <input type="date" value={formData.yearOfRegistration} name='yearOfRegistration' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Registered Email*</label>
                                                <input type="email" value={formData.Email} name='Email' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Name of Owner*</label>
                                                <input type="text" value={formData.ownerName} name='ownerName' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Contact Number of Owner*</label>
                                                <input type="text" value={formData.ContactNumber} name='ContactNumber' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>PAN Number*</label>
                                                <input type="text" value={formData.panNo} name='panNo' onChange={handleChange} className="form-control text-uppercase rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className='fw-medium'>Do you have a GST Number?</label>
                                                <select
                                                    name="hasGst"
                                                    value={haveGst}  // Bind it to the haveGst state
                                                    onChange={handleGstToggle}  // Call handleGstToggle when selection changes
                                                    className="form-control rounded"
                                                    required
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                            {
                                                haveGst === 'Yes' && (
                                                    <div className="form-group col-lg-6">
                                                        <label className=' fw-medium'>GST Number*</label>
                                                        <input type="text" value={formData.gstNo} name='gstNo' onChange={handleChange} className="form-control rounded" required />
                                                    </div>
                                                )
                                            }
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Aadhar Number*</label>
                                                <input type="text" value={formData.adharNo} name='adharNo' onChange={handleChange} className="form-control rounded" required />
                                            </div>

                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Complete Address*</label>
                                                <input type="text" value={formData.HouseNo} name='HouseNo' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="position-relative col-lg-6">
                                                <div className="form-group">
                                                    <label htmlFor="address" className='mb-1 fw-medium'>Landmark (e.g., Netaji Subhash Place)*</label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        placeholder="Start typing address..."
                                                        onChange={handleChange}
                                                        className="form-control rounded"
                                                    />

                                                    {addressSuggestions.length > 0 && (
                                                        <div
                                                            className="position-absolute top-100 start-0 mt-2 w-100 bg-white border border-secondary rounded shadow-lg overflow-auto"
                                                            style={{ maxHeight: "200px" }}
                                                        >
                                                            <ul className="list-unstyled mb-0">
                                                                {addressSuggestions.map((suggestion, index) => (
                                                                    <li
                                                                        key={index}
                                                                        style={{ fontSize: 16 }}
                                                                        className="p-1 hover:bg-light cursor-pointer"
                                                                        onClick={() => fetchGeocode(suggestion.description)}
                                                                    >
                                                                        {suggestion.description}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group col-lg-6">
                                                <label className=' fw-medium'>Pin code*</label>
                                                <input type="text" value={formData.PinCode} name='PinCode' onChange={handleChange} className="form-control rounded" required />
                                            </div>
                                            <div className="form-group col-lg-6">

                                                <label className=' fw-medium'>Password*</label>
                                                {passwordError && (
                                                    <p style={{ color: 'red', fontSize: '14px', marginBottom: '5px' }}>
                                                        {passwordError}
                                                    </p>
                                                )}
                                                <input type="password" value={formData.Password} name='Password' onChange={handleChange} className="form-control rounded" required />
                                            </div>



                                        </div>

                                        {/* <div className="row">

                                            
                                        </div> */}
                                        <div className='row'>
                                            <h4 className='bg-primary text-white p-2 mb-5'>Documents Upload</h4>
                                            <div className="form-group col-lg-4">
                                                <label className=' fw-medium'>PAN Card Upload</label>
                                                <input type="file" accept="image/*" onChange={handlePanImageUpload} className="form-control mt-2" required />
                                                {previewPanImage && <img src={previewPanImage} alt="Preview" style={{ width: '100px', height: '100px' }} />}
                                            </div>
                                            <div className="form-group col-lg-4">
                                                <label className=' fw-medium'>Aadhar Card Upload</label>
                                                <input type="file" accept="image/*" onChange={handleAdharImageUpload} className="form-control mt-2" required />
                                                {previewAdharImage && <img src={previewAdharImage} alt="Preview" style={{ width: '100px', height: '100px' }} />}
                                            </div>
                                            {
                                                haveGst === 'Yes' && (
                                                    <div className="form-group col-lg-4">
                                                        <label className=' fw-medium'>GST Registration Upload</label>
                                                        <input type="file" accept="image/*" onChange={handleGstImageUpload} className="form-control mt-2" required />
                                                        {previewGstImage && <img src={previewGstImage} alt="Preview" style={{ width: '100px', height: '100px' }} />}
                                                    </div>
                                                )
                                            }

                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-md full-width theme-bg text-light rounded ft-medium" disabled={loading}>{`${loading ? "Registering..." : "Register"}`}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default VendorRegistration;
