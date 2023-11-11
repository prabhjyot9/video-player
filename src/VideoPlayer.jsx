import React, { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions.js";
import "./VideoPlayer.css"; // Assuming you've already created the CSS file

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wavesurfer = WaveSurfer.create({
      container: canvas,
      waveColor: "violet",
      progressColor: "purple",
      plugins: [Regions.create()],
    });

    video.addEventListener("loadedmetadata", () => {
      setDuration(video.duration);
      setHeight(video.videoHeight);
      setWidth(video.videoWidth);
    });

    video.addEventListener("play", () => {
      setIsPlaying(true);
    });

    video.addEventListener("pause", () => {
      setIsPlaying(false);
    });

    video.addEventListener("seeked", () => {
      wavesurfer.seekTo(video.currentTime / video.duration);
    });

    video.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    waveSurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const video = videoRef.current;

    if (file.type.startsWith("video/")) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const audioBuffer = await readFileAsArrayBuffer(file);
        await audioContext.decodeAudioData(audioBuffer);

        const videoURL = URL.createObjectURL(file);
        video.src = videoURL;

        waveSurferRef.current.load(videoURL);
      } catch (error) {
        console.error("Error decoding audio data:", error);
        alert("The selected video does not contain audio.");
      }
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePlayPause = () => {
    const video = videoRef.current;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="main-cont">
      <div className="video-player-container">
        <h1 className="video-heading">React Video Player</h1>
        <input type="file" onChange={handleFileChange} />
        <div className="video-container">
          <video
            ref={videoRef}
            preload="none"
            width="100%"
            height="auto"
            controls
          />
          <button className="play-pause-button" onClick={handlePlayPause}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
        <div ref={canvasRef} className="waveform-container" />
      </div>
      <div className="metadata-outer-container">
        <div className="metadata-container">
          <div className="metadata-inner-container">
            <p className="duration-text">
              Duration: {duration.toFixed(2)} seconds
            <p>
            {height && width && ` | Height: ${height} pixels`}
            </p>
            <p>
            {height && width && ` | Width: ${width} pixels`}
            </p>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
