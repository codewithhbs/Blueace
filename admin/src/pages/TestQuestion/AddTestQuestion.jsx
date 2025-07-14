import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddTestQuestion = () => {
    const [formData, setFormData] = useState({
        question: '',
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleQuestionChange = (e) => {
        setFormData({ ...formData, question: e.target.value });
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index][field] = field === 'isCorrect' ? value.target.checked : value.target.value;
        setFormData({ ...formData, options: updatedOptions });
    };

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { text: '', isCorrect: false }],
        });
    };

    const removeOption = (index) => {
        if (formData.options.length <= 2) return;
        const updatedOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:7987/api/v1/create-test-question', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Test Question Created Successfully');
            setFormData({
                question: '',
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            });
        } catch (error) {
            console.error('Error creating test question:', error);
            setError(error.response?.data?.message || 'Failed to create test question.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Breadcrumb
                heading="Create Test Question"
                subHeading="Test Questions"
                LastHeading="Add Question"
                backLink="/test/all-test-question"
            />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className='row'>
                    <div className="col-md-12">
                        <label htmlFor="question" className="form-label">Question</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Enter your question"
                            value={formData.question}
                            onChange={handleQuestionChange}
                            required
                        ></textarea>
                    </div>

                    <div className="col-md-12 mt-4">
                        <label className="form-label">Options</label>
                        {formData.options.map((option, index) => (
                            <div key={index} className="mb-3 border p-3 rounded position-relative">
                                <div className="form-group mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={`Option ${index + 1}`}
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'text', e)}
                                        required
                                    />
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`correct-${index}`}
                                        checked={option.isCorrect}
                                        onChange={(e) => handleOptionChange(index, 'isCorrect', e)}
                                    />
                                    <label className="form-check-label" htmlFor={`correct-${index}`}>
                                        Mark as Correct
                                    </label>
                                </div>
                                {formData.options.length > 2 && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute"
                                        style={{ top: 10, right: 10 }}
                                        onClick={() => removeOption(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary mt-2" onClick={addOption}>
                            Add Option
                        </button>
                    </div>

                    <div className='col-md-10 mx-auto mt-4'>
                        <button
                            className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`}
                            disabled={loading}
                            type='submit'
                        >
                            {loading ? 'Please Wait...' : 'Submit'}
                        </button>
                    </div>
                </div>
            } />
        </div>
    );
};

export default AddTestQuestion;
