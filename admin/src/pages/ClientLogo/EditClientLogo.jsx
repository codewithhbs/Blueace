import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditClientLogo = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await axios.get(`https://www.api.blueaceindia.com/api/v1/get-single-client-logo/${id}`);
        const clientLogo = data.data;
        setImagePreview(clientLogo?.logo?.url || null);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError('Failed to fetch client logo.');
      }
    };
    fetchLogo();
  }, [id]);

  const handleLogoChange = (e) => {
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
      setError('Please select a logo image to upload.');
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('logo', formData.logo);

    try {
      const res = await axios.put(`https://www.api.blueaceindia.com/api/v1/update-client-logo/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success('Client logo updated successfully!');
        setFormData({ logo: null });
      } else {
        toast.error(res.data.message || 'Failed to update client logo.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred while updating the logo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        heading="Home Layout"
        subHeading="All Client Logo"
        LastHeading="Edit Client Logo"
        backLink="/home-layout/all-client-logo"
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <FormGroups
        onSubmit={handleSubmit}
        Elements={
          <div className="row">
            <div className="col-md-12 mt-4">
              <div className="mb-3">
                {imagePreview && (
                  <div className="mb-3">
                    <h5>Client Logo Preview:</h5>
                    <img
                      src={imagePreview}
                      alt="Client Logo Preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <label className="form-label f-w-600 mb-2">Upload New Client Logo</label>
                <div
                  className="dropzone card"
                  onClick={() => document.getElementById('fileInput').click()}
                  style={{ cursor: 'pointer' }}
                >
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
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="col-md-10 mx-auto mt-4">
              <button
                type="submit"
                className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`}
                disabled={loading}
              >
                {loading ? 'Please Wait...' : 'Update'}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default EditClientLogo;
