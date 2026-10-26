import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Play, Pause, Volume2, VolumeX, Maximize, Clock, CheckCircle } from 'lucide-react'

const VideoShow = () => {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isVideoStarted, setIsVideoStarted] = useState(false)
  const [isVideoCompleted, setIsVideoCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completingVideo, setCompletingVideo] = useState(false)
  // console.log("video",video)
  const videoRef = useRef(null)

  const handleFetchVideo = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('https://www.api.blueaceindia.com/api/v1/get-test-video')
      const allVideo = data.data.video
      setVideo(allVideo)
    } catch (error) {
      console.log("Internal server error", error)
      toast.error('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleFetchVideo()
  }, [])

  const handleVideoDone = async () => {
    try {
      setCompletingVideo(true)
      const response = await axios.put(`https://www.api.blueaceindia.com/api/v1/update-test-field-vendor/${id}`, {
        videoWatched: true
      })
      if (response.data.success) {
        toast.success('Video completed successfully!')
        setTimeout(() => {
          window.location.href = `/test-question/${id}`
        }, 1500)
      }
    } catch (error) {
      console.log("Internal server error", error)
      toast.error('Failed to mark video as completed')
      setCompletingVideo(false)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
        if (!isVideoStarted) {
          setIsVideoStarted(true)
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleVideoEnded = () => {
    setIsVideoCompleted(true)
    setIsPlaying(false)
    handleVideoDone()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  // Prevent context menu and keyboard shortcuts
  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  const handleKeyDown = (e) => {
    // Prevent common shortcuts like F11, F5, etc.
    if (e.key === 'F11' || e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Prevent page unload/refresh once video is started
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isVideoStarted && !isVideoCompleted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    if (isVideoStarted && !isVideoCompleted) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isVideoStarted, isVideoCompleted])

  if (loading) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white fs-5">Loading video...</p>
          </div>
        </div>
      </>
    )
  }

  if (!video) {
    return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
          <div className="text-center">
            <p className="text-danger fs-5">Video not found</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" /> */}
      
      <div className="min-vh-100 bg-black d-flex flex-column">
        {/* Header */}
        <div className="bg-dark px-4 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="text-white h4 mb-0">Training Video</h1>
            <div className="d-flex align-items-center gap-3">
              {isVideoStarted && !isVideoCompleted && (
                <div className="d-flex align-items-center gap-2 text-warning small">
                  <Clock size={16} />
                  <span>Video in progress</span>
                </div>
              )}
              {isVideoCompleted && (
                <div className="d-flex align-items-center gap-2 text-success small">
                  <CheckCircle size={16} />
                  <span>Video completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-fill d-flex align-items-center justify-content-center p-4">
          <div className="w-100" style={{ maxWidth: '800px' }}>
            <div className="position-relative bg-black rounded shadow-lg overflow-hidden">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-100"
                style={{ maxHeight: '70vh' }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onContextMenu={handleContextMenu}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                src={video.url || "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"}
              />

              {/* Custom Controls */}
              <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)'
              }}>
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between text-light small mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                      disabled={isVideoCompleted}
                      style={{ width: '50px', height: '50px' }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    {/* Volume Controls */}
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="btn btn-link text-white p-0"
                        style={{ textDecoration: 'none' }}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="form-range"
                        style={{ width: '80px' }}
                      />
                    </div>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={handleFullscreen}
                    className="btn btn-link text-white p-0"
                    style={{ textDecoration: 'none' }}
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Information */}
            <div className="mt-4 bg-dark rounded p-4">
              <h2 className="text-white h5 mb-2">
                {video.title || "Training Video"}
              </h2>
              <p className="text-muted small mb-3">
                {video.description || "Please watch this video completely to proceed to the test."}
              </p>
              
              {/* Warning Message */}
              {isVideoStarted && !isVideoCompleted && (
                <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
                  <div>
                    ⚠️ Please watch the complete video. You cannot skip or close this video once started.
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {completingVideo && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <CheckCircle size={16} className="me-2" />
                  <div>Video completed! Redirecting to test questions...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .min-vh-100 {
          min-height: 100vh;
        }
        
        .flex-fill {
          flex: 1;
        }
        
        .form-range::-webkit-slider-thumb {
          background: #0d6efd;
        }
        
        .form-range::-moz-range-thumb {
          background: #0d6efd;
          border: none;
        }
        
        .btn:disabled {
          opacity: 0.5;
        }
        
        .progress {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .alert {
          border: none;
        }
        
        .alert-warning {
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        
        .alert-success {
          background-color: rgba(25, 135, 84, 0.1);
          color: #198754;
        }
      `}</style>
    </>
  )
}

export default VideoShow