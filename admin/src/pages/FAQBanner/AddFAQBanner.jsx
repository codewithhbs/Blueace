import React, { useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import toast from 'react-hot-toast';

function AddFAQBanner() {
    const [formData, setFormData] = useState({
        bannerImage: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreviews, setImagePreviews] = useState(null)

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({
                ...prevData,
                bannerImage: file
            }));
            setImagePreviews(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = new FormData();
        if (formData.bannerImage) {
            payload.append('bannerImage', formData.bannerImage);
        } else {
            setError('Please select an image');
            setLoading(false);
            return;
        }

        try {
            await axios.post('https://www.api.blueaceindia.com/api/v1/create-faq-banner', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            toast.success('Banner uploaded successfully!')
        } catch (error) {
            console.error('Error creating banner image:', error);
            setError('Failed to banner image.');
        } finally {
            setLoading(false);
        }
    }
  return (
    <div>
            <Breadcrumb heading={'Home Layout'} subHeading={'All FAQ Banner'} LastHeading={'Create FAQ Banner'} backLink={'/home-layout/all-faq-banner'} />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className='row'>

                    <div className="col-md-12 mt-4">
                        <div className="mb-3 mt-4">
                            {imagePreviews && (
                                <div className="mb-3">
                                    <h5>FAQ Banner Preview:</h5>
                                    <img src={imagePreviews} alt="Icon Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                </div>
                            )}
                            <label className="form-label f-w-600 mb-2">Upload FAQ Banner Image</label>
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
                                name="bannerImage"
                                multiple
                                className="form-control"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className='col-md-10 mx-auto mt-4'>
                        <button className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`} disabled={loading} type='submit'>
                            {loading ? 'Please Wait...' : 'Submit'}
                        </button>
                    </div>
                </div>
            } />
        </div>
  )
}

export default AddFAQBanner
