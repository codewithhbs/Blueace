import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FullName: '',
    companyName: '',
    Email: '',
    ContactNumber: '',
    Password: '',
    address: '',
    PinCode: '',
    HouseNo: '',
    NearByLandMark: '',
    RangeWhereYouWantService: [{
      location: {
        type: 'Point',
        coordinates: []
      }
    }]
  });

  const [location, setLocation] = useState({
    latitude: '28.7383',
    longitude: '77.0822'
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]); // Suggestions state
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

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
      console.log(res.data)
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
            coordinates: [longitude || '77.0822', latitude || '28.7383']
          }
        }]
      }));
      setAddressSuggestions([]);
    } catch (err) {
      console.error('Error fetching geocode:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // const { coordinates } = formData.RangeWhereYouWantService[0].location;

    if (!formData.FullName || !formData.Email || !formData.ContactNumber || !formData.Password) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.Password.length < 7) {
      setPasswordError('Password must be at least 7 characters long');
      setLoading(false);
      return;
    }

    const updatedFormData = {
      ...formData,
      RangeWhereYouWantService: [{
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        }
      }]
    };

    // Coordinates validation
    // if (
    //   !coordinates ||
    //   !Array.isArray(coordinates) ||
    //   coordinates.length !== 2 ||
    //   !coordinates[0] ||
    //   !coordinates[1]
    // ) {
    //   toast.error('Please select a valid landmark from the suggestions to fetch coordinates.');
    //   setLoading(false);
    //   return;
    // }

    try {
      const res = await axios.post('http://localhost:7987/api/v1/Create-User', updatedFormData);
      // localStorage.setItem('token', res.data.token);
      // localStorage.setItem('user', JSON.stringify(res.data.user));

      // console.log("res.data.success", res.data.data._id)

      if (res.data.success) {
        // toast.success('User registered successfully');
        setFormData({
          FullName: '',
          companyName: '',
          Email: '',
          ContactNumber: '',
          Password: '',
          address: '',
          PinCode: '',
          HouseNo: '',
          NearByLandMark: '',
          RangeWhereYouWantService: [{
            location: {
              type: 'Point',
              coordinates: []
            }
          }]
        });
        setLocation({ latitude: '', longitude: '' });
        navigate(`/verify-account/${res.data.data._id}`);
      }
    } catch (error) {
      if (error.response) {
        const { data, status } = error.response;
        const errorMessage = data?.error || data?.message || 'An error occurred';

        // Handle specific geo key error
        if (
          typeof errorMessage === 'string' &&
          errorMessage.includes("Can't extract geo keys")
        ) {
          toast.error("Please enter a valid location with coordinates before submitting.");
        }
        // General server errors
        else if (status >= 500) {
          toast.error("Server error occurred. Please try again later.");
        }
        // Other handled API errors
        else {
          toast.error(errorMessage);
        }

      } else if (error.request) {
        // No response received
        toast.error("No response from server. Check your internet connection.");
      } else {
        // Error setting up the request
        toast.error("Unexpected error occurred. Please try again.");
      }

      console.error("Axios Error Details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ======================= Registration Detail ======================== */}
      <section className="gray">
        <div className="container">
          <div className="row align-items-start justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-12">
              <div className="signup-screen-wrap">
                <div className="signup-screen-single light">
                  <div className="text-center mb-4">
                    <h4 className="m-0 ft-medium">Create An Account</h4>
                  </div>

                  <form className="submit-form" onSubmit={handleSubmit}>

                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="FullName" className='mb-1 fw-medium'>Full Name*</label>
                          <input
                            type="text"
                            className="form-control rounded"
                            placeholder="Enter Your Name"
                            name="FullName"
                            value={formData.FullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="Email" className='mb-1 fw-medium'>Email*</label>
                          <input
                            type="email"
                            className="form-control rounded"
                            placeholder="Enter Your Email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>


                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="ContactNumber" className='mb-1 fw-medium'>Phone No.*</label>
                          <input
                            type="text"
                            className="form-control rounded"
                            placeholder="Enter Your Phone Number"
                            name="ContactNumber"
                            value={formData.ContactNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="HouseNo" className='mb-1 fw-medium'>Complete Address*</label>
                          <input
                            type="text"
                            className="form-control rounded"
                            placeholder="Complete Address"
                            name="HouseNo"
                            value={formData.HouseNo}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>


                      {/* <div className="position-relative col-6">
                        <div className="form-group">
                          <label htmlFor="address" className='mb-1 fw-medium'>Landmark (e.g., Netaji Subhash Place)*</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            placeholder="Start typing address..."
                            onChange={handleInputChange}
                            className="form-control rounded"
                            required
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

                      </div> */}
                      {/* <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="NearByLandMark" className='mb-1 fw-medium'>Near By LandMark</label>
                          <input
                            type="text"
                            className="form-control rounded"
                            placeholder="Near By LandMark"
                            name="NearByLandMark"
                            value={formData.NearByLandMark}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div> */}


                      {/* <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="City" className='mb-1 fw-medium'>City</label>
                          <input
                            type="text"
                            className="form-control rounded"
                            placeholder="City"
                            name="City"
                            value={formData.City}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div> */}
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="PinCode" className='mb-1 fw-medium'>Pin Code*</label>
                          <input
                            type="Number"
                            className="form-control rounded"
                            placeholder="PinCode"
                            name="PinCode"
                            value={formData.PinCode}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>


                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="Password" className="mb-1 fw-medium">Password*</label>
                          {passwordError && (
                            <p style={{ color: 'red', fontSize: '14px', marginBottom: '5px' }}>
                              {passwordError}
                            </p>
                          )}
                          <input
                            type="password"
                            className="form-control rounded"
                            placeholder="Password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <button type="submit" className="btn btn-md full-width theme-bg text-light rounded ft-medium">{`${loading ? "Loading..." : "Sign Up"}`}</button>
                    </div>

                    <div className="form-group text-center mt-4 mb-0">
                      <p className="mb-0">Already have an account? <Link to={'/sign-in'} style={{ color: '#00225F' }} className="ft-medium">Sign In</Link></p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ======================= Registration End ======================== */}
    </>
  );
}

export default Registration;
