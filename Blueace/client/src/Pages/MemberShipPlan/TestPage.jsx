import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"

const TestPage = () => {
  const { id } = useParams()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [testScore, setTestScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [testStarted, setTestStarted] = useState(false)
  const [isFail, setIsFail] = useState(false)
  const [vendorDetail, setVendorDetail] = useState({})

  // Retry system states
  const [retryData, setRetryData] = useState({
    attemptCount: 0,
    lastAttemptTime: null,
    isBlocked: false,
    canRetry: true,
  })
  const [cooldownTime, setCooldownTime] = useState(0)

  // Initialize retry data from localStorage
  useEffect(() => {
    const savedRetryData = localStorage.getItem(`testRetry_${id}`)
    if (savedRetryData) {
      const parsed = JSON.parse(savedRetryData)
      const now = Date.now()
      const timeDiff = now - (parsed.lastAttemptTime || 0)
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds

      if (parsed.isBlocked && timeDiff >= thirtyMinutes) {
        // 30 minutes have passed, clear the block
        const clearedData = {
          attemptCount: 0,
          lastAttemptTime: null,
          isBlocked: false,
          canRetry: true,
        }
        localStorage.removeItem(`testRetry_${id}`)
        setRetryData(clearedData)
      } else {
        setRetryData(parsed)
        if (parsed.isBlocked && timeDiff < thirtyMinutes) {
          setCooldownTime(Math.ceil((thirtyMinutes - timeDiff) / 1000))
        }
      }
    }
  }, [id])

  useEffect(() => {
    const FetchVendorDetail = async () => {
      try {
        const { data } = await axios.get(`https://www.api.blueaceindia.com/api/v1/single-vendor/${id}`)
        setVendorDetail(data.data)
      } catch (error) {
        console.log("Internal server error", error)
      }
    }
    FetchVendorDetail();
  }, [id])

  // console.log("vendorDetail",vendorDetail)

  // Cooldown timer
  useEffect(() => {
    let timer
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            // Cooldown finished, clear retry data
            localStorage.removeItem(`testRetry_${id}`)
            setRetryData({
              attemptCount: 0,
              lastAttemptTime: null,
              isBlocked: false,
              canRetry: true,
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldownTime, id])

  const updateRetryData = (newData) => {
    const updatedData = { ...retryData, ...newData }
    setRetryData(updatedData)
    localStorage.setItem(`testRetry_${id}`, JSON.stringify(updatedData))
  }

  const handleFetchQuestion = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get("https://www.api.blueaceindia.com/api/v1/all-test-question")
      setQuestions(data.data)
      setTestStarted(true)
    } catch (error) {
      console.log("Internal server error", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = useCallback(() => {
    let score = 0
    questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question._id]
      if (selectedOptionId) {
        const selectedOption = question.options.find((opt) => opt._id === selectedOptionId)
        if (selectedOption && selectedOption.isCorrect) {
          score++
        }
      }
    })
    return score
  }, [questions, selectedAnswers])

  const handleSubmitTest = useCallback(async () => {
    setSubmitting(true)
    const finalScore = calculateScore()
    setTestScore(finalScore)

    // Update attempt count
    const newAttemptCount = retryData.attemptCount + 1

    try {
      const response = await axios.put(`https://www.api.blueaceindia.com/api/v1/update-test-field-vendor/${id}`, {
        testDone: true,
        testScore: finalScore,
      })

      console.log("response", response.data.message)

      if (response.data.message === "You are not eligible to start work") {
        // Test failed
        setIsFail(true)

        if (newAttemptCount >= 2) {
          // Block after 2 attempts
          updateRetryData({
            attemptCount: newAttemptCount,
            lastAttemptTime: Date.now(),
            isBlocked: true,
            canRetry: false,
          })
          setCooldownTime(30 * 60) // 30 minutes in seconds
        } else {
          // Still have attempts left
          updateRetryData({
            attemptCount: newAttemptCount,
            lastAttemptTime: Date.now(),
            isBlocked: false,
            canRetry: true,
          })
        }
      } else if (response.data.success) {
        // Test passed, clear retry data
        localStorage.removeItem(`testRetry_${id}`)
        setRetryData({
          attemptCount: 0,
          lastAttemptTime: null,
          isBlocked: false,
          canRetry: true,
        })
      }

      setShowResult(true)
    } catch (error) {
      console.log("Internal server error", error)
    } finally {
      setSubmitting(false)
    }
  }, [calculateScore, id, retryData.attemptCount])

  const handleRetryTest = () => {
    // Reset test state
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResult(false)
    setTestScore(0)
    setTimeLeft(1800)
    setTestStarted(false)
    setIsFail(false)

    // Fetch questions again
    handleFetchQuestion()
  }

  const formatCooldownTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (retryData.canRetry && !retryData.isBlocked) {
      handleFetchQuestion()
    }
  }, [retryData.canRetry, retryData.isBlocked])

  // Timer effect
  useEffect(() => {
    let timer
    if (testStarted && timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [testStarted, timeLeft, showResult, handleSubmitTest])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const getScorePercentage = () => {
    return questions.length > 0 ? ((testScore / questions.length) * 100).toFixed(1) : 0
  }

  const getScoreColor = () => {
    const percentage = getScorePercentage()
    if (percentage >= 80) return "success"
    if (percentage >= 60) return "warning"
    return "danger"
  }

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length
  }

  // Show blocked state with cooldown
  if (retryData.isBlocked && cooldownTime > 0) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card shadow-lg">
                  <div className="card-header bg-warning text-dark text-center">
                    <h3 className="mb-0">Test Temporarily Blocked</h3>
                  </div>
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <i className="fas fa-clock display-1 text-warning mb-3"></i>
                      <h4>You've used all your attempts</h4>
                      <p className="text-muted">You can try again after the cooldown period</p>
                    </div>
                    <div className="alert alert-warning">
                      <h5>Time remaining: {formatCooldownTime(cooldownTime)}</h5>
                      <small>The test will be available again after this time</small>
                    </div>
                    <div className="mt-4">
                      <p>
                        <strong>Attempts used:</strong> {retryData.attemptCount}/2
                      </p>
                      <p className="text-muted">After the cooldown, you'll get fresh attempts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-muted">Loading Test Questions...</h4>
          </div>
        </div>
      </>
    )
  }

  if (questions.length === 0) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">No Questions Available</h4>
              <p>There are no test questions available at the moment.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (showResult) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-light py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-lg">
                  <div className="card-header bg-primary text-white text-center">
                    <h3 className="mb-0">Test Results</h3>
                  </div>
                  <div className="card-body p-5">
                    <div className="text-center mb-4">
                      <div className={`display-1 text-${getScoreColor()} mb-3`}>{getScorePercentage()}%</div>
                      <h4 className="text-muted mb-4">Your Score</h4>
                    </div>

                    {/* Attempt Information */}
                    <div className="alert alert-info mb-4">
                      <div className="row text-center">
                        <div className="col-6">
                          <strong>Attempt:</strong> {retryData.attemptCount}/2
                        </div>
                        <div className="col-6">
                          <strong>Remaining:</strong> {2 - retryData.attemptCount}
                        </div>
                      </div>
                    </div>

                    <div className="row text-center mb-4">
                      <div className="col-4">
                        <div className="border-end">
                          <div className="h2 text-success">{testScore}</div>
                          <small className="text-muted">Correct</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <div className="h2 text-danger">{questions.length - testScore}</div>
                          <small className="text-muted">Wrong</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="h2 text-primary">{questions.length}</div>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                    <div className="progress mb-4" style={{ height: "20px" }}>
                      <div
                        className={`progress-bar bg-${getScoreColor()}`}
                        role="progressbar"
                        style={{ width: `${getScorePercentage()}%` }}
                      >
                        {getScorePercentage()}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`alert alert-${getScoreColor()}`} role="alert">
                        <h5 className="alert-heading">
                          {getScorePercentage() >= 80
                            ? "Excellent!"
                            : getScorePercentage() >= 60
                              ? "Good Job!"
                              : "Keep Learning!"}
                        </h5>
                        <p className="mb-0">
                          You answered {testScore} out of {questions.length} questions correctly.
                        </p>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      {isFail ? (
                        <div>
                          {retryData.canRetry && !retryData.isBlocked ? (
                            <div className="d-flex gap-2 justify-content-center">
                              <button className="btn btn-warning btn-lg" onClick={handleRetryTest}>
                                Retry Test ({2 - retryData.attemptCount} attempts left)
                              </button>
                              <button className="btn btn-secondary btn-lg" onClick={() => (window.location.href = `/`)}>
                                Home
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-primary btn-lg" onClick={() => (window.location.href = `/`)}>
                              Home
                            </button>
                          )}
                        </div>
                      ) : (

                        vendorDetail?.memberShipPlan ? (
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={() => (window.location.href = `/`)}
                          >
                            Home
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={() => (window.location.href = `/membership-plan/${id}`)}
                          >
                            Next
                          </button>
                        )


                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      <div className="min-vh-100 bg-light">
        {/* Header */}
        <nav className="navbar navbar-dark bg-primary shadow-sm">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">
              Test Assessment
              {retryData.attemptCount > 0 && (
                <span className="badge bg-warning text-dark ms-2">Attempt {retryData.attemptCount + 1}/2</span>
              )}
            </span>
            <div className="d-flex align-items-center gap-4">
              <div className="text-white">
                <span className="fw-bold">
                  {getAnsweredCount()}/{questions.length}
                </span>
                <small className="ms-1">Answered</small>
              </div>
            </div>
          </div>
        </nav>

        {/* Progress Bar */}
        <div className="container-fluid p-0">
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-lg">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-primary">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h5>
                    <div className="badge bg-primary fs-6">{questions.length - currentQuestionIndex - 1} remaining</div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <h4 className="text-dark mb-3">{currentQuestion.question}</h4>
                  </div>
                  <div className="mb-4">
                    {currentQuestion.options.map((option, index) => (
                      <div key={option._id} className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            id={`option-${option._id}`}
                            checked={selectedAnswers[currentQuestion._id] === option._id}
                            onChange={() => handleAnswerSelect(currentQuestion._id, option._id)}
                          />
                          <label
                            className="form-check-label w-100 p-3 border rounded cursor-pointer"
                            htmlFor={`option-${option._id}`}
                            style={{
                              backgroundColor:
                                selectedAnswers[currentQuestion._id] === option._id ? "#e3f2fd" : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <span className="badge bg-secondary me-3">{String.fromCharCode(65 + index)}</span>
                              <span>{option.text}</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer bg-white border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <span className="me-2">←</span>
                      Previous
                    </button>
                    <div className="d-flex gap-2">
                      {currentQuestionIndex === questions.length - 1 ? (
                        <button className="btn btn-success btn-lg" onClick={handleSubmitTest} disabled={submitting}>
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting...
                            </>
                          ) : (
                            "Submit Test"
                          )}
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={handleNextQuestion}>
                          Next
                          <span className="ms-2">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="card mt-4">
                <div className="card-header">
                  <h6 className="mb-0">Question Navigator</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    {questions.map((question, index) => (
                      <div key={`nav-${question._id}-${index}`} className="col-auto mb-2">
                        <button
                          className={`btn btn-sm ${index === currentQuestionIndex
                              ? "btn-primary"
                              : selectedAnswers[question._id]
                                ? "btn-success"
                                : "btn-outline-secondary"
                            }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                          style={{ width: "48px", whiteSpace: "nowrap" }}
                        >
                          {index + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      <span className="badge bg-primary me-2"></span>Current
                      <span className="badge bg-success me-2 ms-3"></span>Answered
                      <span className="badge bg-outline-secondary ms-3"></span>Not Answered
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .min-vh-100 {
          min-height: 100vh;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .form-check-label:hover {
          background-color: #f8f9fa;
        }
        .progress-bar {
          transition: width 0.3s ease;
        }
        .btn:disabled {
          opacity: 0.6;
        }
        .card {
          border: none;
        }
        .shadow-lg {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
        }
      `}</style>
    </>
  )
}

export default TestPage
