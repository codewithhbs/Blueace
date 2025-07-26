import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import Input from '../../components/Forms/Input';
import axios from 'axios';
import toast from 'react-hot-toast';
import JoditEditor from 'jodit-react';

function AddCaseStudy() {
    const [formData, setFormData] = useState({
        title: '',
        smallDes: '',
        longDes: '',
        category: 'Other',
        clientName: '',
        location: '',
        completionDate: '',
        technologiesUsed: '',
        videoUrl: '',
        isPublished: false,
        smallImage: null,
        largeImage: null,
    });

    const [smallImagePreview, setSmallImagePreview] = useState(null);
    const [largeImagePreview, setLargeImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const editor = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSmallImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, smallImage: file }));
            setSmallImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLargeImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, largeImage: file }));
            setLargeImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEditorChange = useCallback((newContent) => {
        setFormData((prev) => ({ ...prev, longDes: newContent }));
    }, []);

    const editorConfig = useMemo(() => ({
        readonly: false,
        height: 300
    }), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'technologiesUsed') {
                payload.append(key, JSON.stringify(value.split(',').map(v => v.trim())));
            } else {
                payload.append(key, value);
            }
        });

        if (!formData.smallImage || !formData.largeImage) {
            setError('Both small and large images are required.');
            setLoading(false);
            return;
        }

        payload.append('smallImage', formData.smallImage);
        payload.append('largeImage', formData.largeImage);

        try {
            const res = await axios.post('http://localhost:7987/api/v1/create-case-study', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success('Case Study created successfully!');
                setFormData({
                    title: '',
                    smallDes: '',
                    longDes: '',
                    category: 'Other',
                    clientName: '',
                    location: '',
                    completionDate: '',
                    technologiesUsed: '',
                    videoUrl: '',
                    isPublished: false,
                    smallImage: null,
                    largeImage: null,
                });
                setSmallImagePreview(null);
                setLargeImagePreview(null);
            } else {
                setError('Failed to create case study.');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong while creating the case study.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Breadcrumb
                heading="Home Layout"
                subHeading="Add Case Study"
                LastHeading="Create Case Study"
                backLink="/home-layout/all-case-study"
            />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className="row">
                    <div className="col-md-6">
                        <label>Title</label>
                        <Input name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label>Small Description</label>
                        <Input name="smallDes" value={formData.smallDes} onChange={handleChange} required />
                    </div>

                    <div className="col-md-12 mt-3">
                        <label>Detailed Description</label>
                        <JoditEditor
                            ref={editor}
                            value={formData.longDes}
                            config={editorConfig}
                            onBlur={handleEditorChange}
                        />
                    </div>

                    <div className="col-md-4 mt-3">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Landscape">Landscape</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="col-md-4 mt-3">
                        <label>Client Name</label>
                        <Input name="clientName" value={formData.clientName} onChange={handleChange} />
                    </div>

                    <div className="col-md-4 mt-3">
                        <label>Location</label>
                        <Input name="location" value={formData.location} onChange={handleChange} />
                    </div>

                    <div className="col-md-4 mt-3">
                        <label>Completion Date</label>
                        <Input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} />
                    </div>

                    <div className="col-md-8 mt-3">
                        <label>Technologies Used (comma-separated)</label>
                        <Input name="technologiesUsed" value={formData.technologiesUsed} onChange={handleChange} />
                    </div>

                    <div className="col-md-6 mt-3">
                        <label>Upload Small Image</label>
                        <input type="file" className="form-control" onChange={handleSmallImageUpload} accept="image/*" />
                        {smallImagePreview && <img src={smallImagePreview} alt="Small Preview" width="100" className="mt-2" />}
                    </div>

                    <div className="col-md-6 mt-3">
                        <label>Upload Large Image</label>
                        <input type="file" className="form-control" onChange={handleLargeImageUpload} accept="image/*" />
                        {largeImagePreview && <img src={largeImagePreview} alt="Large Preview" width="100" className="mt-2" />}
                    </div>

                    {/* <div className="col-md-6 mt-3">
                        <label>Video URL</label>
                        <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} />
                    </div> */}

                    <div className="col-md-6 mt-3">
                        <label>
                            <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
                            <span className="ms-2">Publish Immediately</span>
                        </label>
                    </div>

                    <div className="col-md-12 mt-4">
                        <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                            {loading ? 'Please wait...' : 'Submit Case Study'}
                        </button>
                    </div>
                </div>
            } />
        </div>
    );
}

export default AddCaseStudy;
