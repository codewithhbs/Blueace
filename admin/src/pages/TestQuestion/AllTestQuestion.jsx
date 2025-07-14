import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllTestQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:7987/api/v1/all-test-question');
      if (res.data.success) {
        const reversed = res.data.data.reverse();
        setQuestions(reversed);
      } else {
        toast.error('Failed to fetch questions');
      }
    } catch (error) {
      toast.error('Error fetching questions');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:7987/api/v1/delete-test-question/${id}`);
      if (response.data.success) {
        toast.success('Question deleted successfully!');
        await fetchQuestions();
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the question.');
    }
  };

  const indexOfLast = currentPage * questionsPerPage;
  const indexOfFirst = indexOfLast - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirst, indexOfLast);

  const headers = ['S.No', 'Question', 'Options', 'Created At', 'Action'];

  return (
    <div className='page-body'>
      <Breadcrumb
        heading={'All MCQ Questions'}
        subHeading={'MCQ Management'}
        LastHeading={'All Test Questions'}
        backLink={'/test/all-test-question'}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table
          headers={headers}
          elements={currentQuestions.map((question, index) => (
            <tr key={question._id}>
              <td>{indexOfFirst + index + 1}</td>
              <td className='fw-bolder'>{question.question}</td>
              <td>
                <ul className="list-unstyled">
                  {question.options.map((opt, idx) => (
                    <li key={idx}>
                      {opt.isCorrect ? (
                        <strong style={{ color: 'green' }}>✔ {opt.text}</strong>
                      ) : (
                        <span>{opt.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{new Date(question.createdAt).toLocaleString()}</td>
              <td>
                <div className="product-action">
                  <Link to={`/test/edit-test-question/${question._id}`}>
                    <i className="ri-pencil-fill"></i>
                  </Link>
                  <i
                    onClick={() => handleDelete(question._id)}
                    style={{ cursor: 'pointer' }}
                    className="ri-delete-bin-fill ms-2"
                  ></i>
                </div>
              </td>
            </tr>
          ))}
          productLength={questions.length}
          productsPerPage={questionsPerPage}
          currentPage={currentPage}
          paginate={setCurrentPage}
          href="/test/add-test-question"
          text="Add Question"
          errorMsg=""
          handleOpen={() => { }}
        />
      )}
    </div>
  );
};

export default AllTestQuestion;
