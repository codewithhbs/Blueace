import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditTestVideo = () => {
    // const { id } = useParams();
    const [id,setId] = useState('')
    const [formData, setFormData] = useState({ videoFile: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoPreview, setVideoPreview] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const { data } = await axios.get(`http://localhost:7987/api/v1/get-test-video`);
                const res = data.data;
                if (res && res.video && res.video.url) {
                    setVideoPreview(res.video.url);
                    setId(res._id)
                }
            } catch (err) {
                setError('Failed to load video');
                console.error(err);
            }
        };
        fetchVideo();
    }, [id]);

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, videoFile: file }));
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData();
        if (formData.videoFile) {
            form.append('video', formData.videoFile);
        } else {
            setError('Please select a video file');
            setLoading(false);
            return;
        }

        try {
            await axios.put(`http://localhost:7987/api/v1/update-test-video/${id}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Video updated successfully!');
        } catch (err) {
            console.error('Update failed:', err);
            setError('Failed to update video.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Breadcrumb heading="Test Video" subHeading="All Videos" LastHeading="Edit Video" backLink="/home-layout/all-banner" />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className='row'>

                    <div className="col-md-12 mt-4">
                        <div className="mb-3 mt-4">
                            {videoPreview && (
                                <div className="mb-3">
                                    <h5>Current Video Preview:</h5>
                                    <video width="300" height="200" controls>
                                        <source src={videoPreview} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                            <label className="form-label fw-bold mb-2">Upload New Video</label>
                            <div className="dropzone card" onClick={() => document.getElementById('videoInput').click()} style={{ cursor: 'pointer' }}>
                                <div className="dz-message needsclick text-center p-4">
                                    <i className="fa-solid fa-cloud-arrow-up mb-3"></i>
                                    <h6>Drop video here or click to upload.</h6>
                                    <span className="note needsclick">(Supported format: MP4)</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="videoInput"
                                name="video"
                                accept="video/mp4"
                                style={{ display: 'none' }}
                                onChange={handleVideoUpload}
                            />
                        </div>
                    </div>

                    <div className='col-md-10 mx-auto mt-4'>
                        <button className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`} disabled={loading} type='submit'>
                            {loading ? 'Please Wait...' : 'Update'}
                        </button>
                    </div>
                </div>
            } />
        </div>
    );
};

export default EditTestVideo;
