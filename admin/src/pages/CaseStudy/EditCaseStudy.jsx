// Updated EditCaseStudy component to match the provided schema and controller
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import Input from '../../components/Forms/Input';

function EditCaseStudy() {
  const { id } = useParams();
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    smallDes: '',
    longDes: '',
    category: 'Other',
    clientName: '',
    location: '',
    completionDate: '',
    // technologiesUsed: '',
    videoUrl: '',
    isPublished: false,
    smallImage: null,
    largeImage: null
  });
  const [previews, setPreviews] = useState({ small: '', large: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:7987/api/v1/get-single-case-study/${id}`);
        const cs = data.data;
        setFormData({
          title: cs.title,
          smallDes: cs.smallDes,
          longDes: cs.longDes,
          category: cs.category,
          clientName: cs.clientName,
          location: cs.location,
          completionDate: cs.completionDate?.split('T')[0] || '',
          // technologiesUsed: cs.technologiesUsed.join(', '),
          videoUrl: cs.videoUrl || '',
          isPublished: cs.isPublished,
          smallImage: null,
          largeImage: null
        });
        setPreviews({
          small: cs.smallImage?.url || '',
          large: cs.largeImage?.url || ''
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load case study');
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type === 'smallImage' ? 'small' : 'large']: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
       if (key === 'completionDate' && val) {
        payload.append(key, new Date(val).toISOString());
      } else if (val !== null) {
        payload.append(key, val);
      }
    });

    try {
      await axios.put(`http://localhost:7987/api/v1/update-case-study/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Case study updated successfully');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to update case study');
    } finally {
      setLoading(false);
    }
  };

  const editorConfig = useMemo(() => ({ readonly: false, height: 400 }), []);

  return (
    <div>
      <Breadcrumb heading="Case Study" subHeading="All Case Studies" LastHeading="Edit Case Study" backLink="/case-studies" />
      {error && <div className="alert alert-danger">{error}</div>}

      <FormGroups onSubmit={handleSubmit} Elements={
        <div className="row">
          <div className="col-md-6">
            <label>Title</label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <label>Category</label>
            <select className="form-control" name="category" value={formData.category} onChange={handleChange}>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Landscape">Landscape</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-6">
            <label>Client Name</label>
            <Input name="clientName" value={formData.clientName} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label>Location</label>
            <Input name="location" value={formData.location} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label>Completion Date</label>
            <Input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} />
          </div>

          {/* <div className="col-md-6">
            <label>Technologies Used (comma separated)</label>
            <Input name="technologiesUsed" value={formData.technologiesUsed} onChange={handleChange} />
          </div> */}

          <div className="col-md-6">
            <label>Video URL</label>
            <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} />
          </div>

          <div className="col-md-6 mt-4">
            <label>Published?</label>
            <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
          </div>

          <div className="col-md-12 mt-4">
            <label>Short Description</label>
            <textarea className="form-control" name="smallDes" rows="3" value={formData.smallDes} onChange={handleChange}></textarea>
          </div>

          <div className="col-md-12 mt-4">
            <label>Long Description</label>
            <JoditEditor ref={editorRef} value={formData.longDes} config={editorConfig} onBlur={newContent => setFormData(prev => ({ ...prev, longDes: newContent }))} />
          </div>

          <div className="col-md-6 mt-4">
            <label>Small Image</label>
            {previews.small && <img src={previews.small} alt="Preview" style={{ width: '100px', height: '100px' }} />}
            <input type="file" onChange={(e) => handleImageUpload(e, 'smallImage')} accept="image/*" />
          </div>

          <div className="col-md-6 mt-4">
            <label>Large Image</label>
            {previews.large && <img src={previews.large} alt="Preview" style={{ width: '100px', height: '100px' }} />}
            <input type="file" onChange={(e) => handleImageUpload(e, 'largeImage')} accept="image/*" />
          </div>

          <div className="col-md-12 mt-4">
            <button className="btn btn-primary w-100 py-3" disabled={loading} type="submit">
              {loading ? 'Updating...' : 'Update Case Study'}
            </button>
          </div>
        </div>
      } />
    </div>
  );
}

export default EditCaseStudy;