import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FormGroups from '../../components/Forms/FormGroups';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditTestQuestion = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        question: '',
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch existing question
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`https://www.api.blueaceindia.com/api/v1/get-single-question/${id}`);
                const questionData = data.data;

                setFormData({
                    question: questionData.question,
                    options: questionData.options || [],
                });
            } catch (error) {
                setError('Failed to load test question data');
                console.error('Error fetching question:', error);
            }
        };

        fetchData();
    }, [id]);

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
            await axios.put(`https://www.api.blueaceindia.com/api/v1/update-test-question/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Test Question updated successfully!');
        } catch (error) {
            console.error('Error updating test question:', error);
            setError(error.response?.data?.message || 'Failed to update test question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Breadcrumb
                heading="Edit Test Question"
                subHeading="Test Questions"
                LastHeading="Edit"
                backLink="/test/all-test-question"
            />

            {error && <div className="alert alert-danger">{error}</div>}

            <FormGroups onSubmit={handleSubmit} Elements={
                <div className="row">
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

                    <div className="col-md-10 mx-auto mt-4">
                        <button
                            className={`btn w-100 py-3 btn-primary ${loading ? 'disabled' : ''}`}
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? 'Please Wait...' : 'Update'}
                        </button>
                    </div>
                </div>
            } />
        </div>
    );
};

export default EditTestQuestion;
