import React, { useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import toast from 'react-hot-toast';

const AddClientLogo = () => {
  const [formData, setFormData] = useState({
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.logo) {
      setError('Please select a logo image.');
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('logo', formData.logo);

    try {
      const res = await axios.post('http://localhost:7987/api/v1/create-client-logo', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Client logo uploaded successfully!');
        setFormData({ logo: null });
        setImagePreview(null);
      } else {
        toast.error('Failed to upload client logo.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Something went wrong while uploading the logo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        heading="Home Layout"
        subHeading="All Client Logo"
        LastHeading="Create Client Logo"
        backLink="/home-layout/all-client-logo"
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <FormGroups onSubmit={handleSubmit} Elements={
        <div className='row'>
          <div className="col-md-12 mt-4">
            <div className="mb-3 mt-4">
              {imagePreview && (
                <div className="mb-3">
                  <h5>Client Logo Preview:</h5>
                  <img
                    src={imagePreview}
                    alt="Logo Preview"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <label className="form-label f-w-600 mb-2">Upload Client Logo</label>
              <div className="dropzone card" onClick={() => document.getElementById('fileInput').click()} style={{ cursor: 'pointer' }}>
                <div className="dz-message needsclick text-center p-4">
                  <i className="fa-solid fa-cloud-arrow-up mb-3"></i>
                  <h6>Drop files here or click to upload.</h6>
                  <span className="note needsclick">(Supported formats: JPG, PNG)</span>
                </div>
              </div>
              <input
                type="file"
                id="fileInput"
                name="logo"
                className="form-control"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                accept="image/*"
              />
            </div>
          </div>

          <div className='col-md-10 mx-auto mt-4'>
            <button
              className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`}
              disabled={loading}
              type="submit"
            >
              {loading ? 'Please Wait...' : 'Submit'}
            </button>
          </div>
        </div>
      } />
    </div>
  );
};

export default AddClientLogo;
