import React, { useCallback, useEffect, useRef, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import Input from '../../components/Forms/Input';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import { useMemo } from 'react';

const AddProduct = () => {
   const [formData, setFormData] = useState({
        smallImage: null,
        title: '',
        smalldesc: '',
        longdesc: '',
        largeImage: null,
        price: '',
        metaTitle: '',
        metaDescription: '',
    });
    const editor = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [smallImagePreview, setSmallImagePreview] = useState(null);
    const [largeImagePreview, setLargeImagePreview] = useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle small image upload
    const handleSmallImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({
                ...prevData,
                smallImage: file
            }));
            setSmallImagePreview(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    // Handle large image upload
    const handleLargeImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({
                ...prevData,
                largeImage: file
            }));
            setLargeImagePreview(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('smalldesc', formData.smalldesc);
        payload.append('longdesc', formData.longdesc);
        payload.append('price', formData.price);
        payload.append('metaTitle', formData.metaTitle);
        payload.append('metaDescription', formData.metaDescription);

        if (formData.smallImage) {
            payload.append('smallImage', formData.smallImage);
        } else {
            setError('Small image is required.');
            setLoading(false);
            return;
        }

        if (formData.largeImage) {
            payload.append('largeImage', formData.largeImage);
        }

        try {
            const res = await axios.post('https://www.api.blueaceindia.com/api/v1/create-product', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Product Created Successfully!');
        } catch (error) {
            console.error('Error creating product:', error);
            setError('Failed to create product.');
        } finally {
            setLoading(false);
        }
    };

    const editorConfig = useMemo(
		() => ({
			readonly: false,
            height: 400,
		}),
		[]
	);

    const handleEditorChange = useCallback((newContent, field) => {
        setFormData(prevFormData => ({ ...prevFormData, [field]: newContent }));
    }, []);

    return (
        <div>
            <Breadcrumb heading={'Products'} subHeading={'All Products'} LastHeading={'Create Product'} backLink={'/product/all-product'} />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className='row'>
                    {/* Title Input */}
                    <div className="col-md-6">
                        <label htmlFor="title" className='form-label mt-3'>Title</label>
                        <Input
                            type='text'
                            placeholder='Enter Title'
                            name='title'
                            value={formData.title}
                            onChange={handleChange}
                            required={true}
                        />
                    </div>

                    {/* Price Input */}
                    {/* <div className="col-md-6">
                        <label htmlFor="price" className='form-label mt-3'>Price</label>
                        <Input
                            type='number'
                            placeholder='Enter Price'
                            name='price'
                            value={formData.price}
                            onChange={handleChange}
                            required={true}
                        />
                    </div> */}

                    {/* Small Desc Textarea */}
                    <div className="col-md-12 mt-3">
                        <label htmlFor="smalldesc" className='form-label'>Small Description</label>
                        <textarea
                            className="form-control"
                            rows="5"
                            cols="5"
                            placeholder="Enter Small Description"
                            name='smalldesc'
                            value={formData.smalldesc}
                            onChange={handleChange}
                            required={true}
                            id='smalldesc'
                        ></textarea>
                    </div>

                    {/* Long Desc Editor */}
                    <div className="col-md-12 mb-4 mt-4">
                        <label htmlFor="longdesc" className="form-label">Long Description</label>
                        <JoditEditor
                            ref={editor}
                            value={formData.longdesc}
                            config={editorConfig}
                            onBlur={(newContent) => handleEditorChange(newContent, 'longdesc')}
                        />
                    </div>

                    {/* Small Image Upload */}
                    <div className="col-md-12 mt-4">
                        <div className="mb-3">
                            {smallImagePreview && (
                                <div className="mb-3">
                                    <h5>Small Image Preview:</h5>
                                    <img src={smallImagePreview} alt="Small Image Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                </div>
                            )}
                            <label className="form-label f-w-600 mb-2">Upload Small Image (Single Image)</label>
                            <div className="dropzone card" onClick={() => document.getElementById('smallImageInput').click()} style={{ cursor: 'pointer' }}>
                                <div className="dz-message needsclick text-center p-4">
                                    <i className="fa-solid fa-cloud-arrow-up mb-3"></i>
                                    <h6>Drop files here or click to upload.</h6>
                                    <span className="note needsclick">(Supported formats: JPG, PNG)</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="smallImageInput"
                                className="form-control"
                                style={{ display: 'none' }}
                                onChange={handleSmallImageUpload}
                                name="smallImage"
                                accept="image/*"
                            />

                        </div>
                    </div>

                    {/* Large Image Upload */}
                    <div className="col-md-12 mt-4">
                        <div className="mb-3 mt-4">
                            {largeImagePreview && (
                                <div className="mb-3">
                                    <h5>Large Image Preview:</h5>
                                    <img src={largeImagePreview} alt="Large Image Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                </div>
                            )}
                            <label className="form-label f-w-600 mb-2">Upload Large Image (Single Image)</label>
                            <div className="dropzone card" onClick={() => document.getElementById('largeImageInput').click()} style={{ cursor: 'pointer' }}>
                                <div className="dz-message needsclick text-center p-4">
                                    <i className="fa-solid fa-cloud-arrow-up mb-3"></i>
                                    <h6>Drop files here or click to upload.</h6>
                                    <span className="note needsclick">(Supported formats: JPG, PNG)</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="largeImageInput"
                                name="largeImage"
                                className="form-control"
                                style={{ display: 'none' }}
                                onChange={handleLargeImageUpload}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="col-md-12 mt-3">
                        <label htmlFor="metaTitle" className='form-label'>Meta Title</label>
                        <textarea
                            className="form-control"
                            rows="5"
                            cols="5"
                            placeholder="Enter Meta Title"
                            name='metaTitle'
                            value={formData.metaTitle}
                            onChange={handleChange}
                            id='metaTitle'
                        ></textarea>
                    </div>
                    <div className="col-md-12 mt-3">
                        <label htmlFor="metaDescription" className='form-label'>Meta Description</label>
                        <textarea
                            className="form-control"
                            rows="5"
                            cols="5"
                            placeholder="Enter Meta Description"
                            name='metaDescription'
                            value={formData.metaDescription}
                            onChange={handleChange}
                            id='metaDescription'
                        ></textarea>
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
    );
}

export default AddProduct