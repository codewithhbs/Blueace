import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Forget() {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  const [loading, setLoading] = useState(false);

  const [getOtp, setgetOtp] = useState(false);
  const [formData, setFormData] = useState({
    ContactNumber: '',
    NewPassword: '',
    PasswordChangeOtp: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault()
    try {
      const response = await axios.post("https://www.api.blueaceindia.com/api/v1/Password-Change", formData)
      console.log(response.data);
      toast.success(response.data.message)
      setgetOtp(true);
    }
    catch (err) {
      console.log(err);
      console.log(err.response?.data.msg);
      toast.error(err.response?.data?.msg || "Internal Server error")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (otpevent) => {
    setLoading(true)
    otpevent.preventDefault()

    const Payload = new FormData()
    Payload.append('ContactNumber', formData.ContactNumber)
    Payload.append('NewPassword', formData.NewPassword)
    Payload.append('OTP', formData.PasswordChangeOtp)
    try {
      const response = await axios.post(`https://www.api.blueaceindia.com/api/v1/Verify-Otp`, formData)
      console.log(response.data.message);
      // setLoading(false);
      toast.success(response.data.message)

      window.location.href="/"
      // navigator('/login')

    } catch (error) {
      console.log(error)
      console.log(error.response.data.msg);
      toast.error(error.response.data.msg)

      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  const resendOTP = async (otpevent) => {
    setLoading(true)
    otpevent.preventDefault()
    try {
      const response = await axios.post(`https://www.api.blueaceindia.com/api/v1/resend-otp/`, formData)
      console.log(response.data);
      toast.success(response.data.message)
      // setLoading(false);

    } catch (error) {
      console.log(error)
      setLoading(false)
      toast.error(error.response.data.msg)

    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      {/* Log In Modal */}
      <div className="bg-dark">
        <div className="modal-dialog login-pop-form" role="document">
          <div className="modal-content py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F7' }} id="loginmodal">
            <div className="modal-body p-5 col-xl-6 col-lg-8 col-md-12" style={{ backgroundColor: 'white' }}>
              <div className="text-center mb-4">
                <h4 className="m-0 ft-medium">Forget Your Password</h4>
              </div>

              <form className="submit-form">
                <div className="form-group">
                  <label className="mb-1">Number</label>
                  <input
                    type="text"
                    className="form-control rounded bg-light"
                    placeholder="Contact Number*"
                    name='ContactNumber'
                    value={formData.ContactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="mb-1">New Password</label>
                  <input
                    type="password"
                    className="form-control rounded bg-light"
                    placeholder="New Password*"
                    name='NewPassword'
                    value={formData.NewPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                {
                  getOtp ? (
                    <>

                      <div className="form-group">
                        <label className="mb-1">Enter OTP</label>
                        <input
                          type="password"
                          className="form-control rounded bg-light"
                          placeholder="Enter OTP*"
                          name='PasswordChangeOtp'
                          value={formData.PasswordChangeOtp}
                          onChange={handleChange}
                          required
                        />
                        <p style={{ marginTop: '10px' }} className="text-warning h6">OTP is only valid for 5 minutes.</p>
                      </div>
                      <div className="form-group">
                        <Link onClick={resendOTP}><i class="fa-solid fa-arrow-rotate-left"></i> Resend OTP</Link>
                      </div>
                    </>
                  ) : (
                    ""
                  )
                }
                <div className="form-group">
                  {
                    getOtp ? (
                      <input onClick={handleOTPSubmit} type="submit" value={`${loading ? 'Loading...' : "Submit OTP"}`} className="btn btn-md full-width theme-bg text-light rounded ft-medium" />
                    ) : (
                      <input onClick={handleSubmit} type="submit" value={`${loading ? 'Loading...' : "Get OTP"}`} className="btn btn-md full-width theme-bg text-light rounded ft-medium" />
                    )
                  }
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* End Modal */}
    </>
  )
}

export default Forget
