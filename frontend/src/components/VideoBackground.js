import React from 'react';

const VideoBackground = () => {
  return (
    // This container is fixed to the background and sits behind everything else (-z-10)
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline // Important for playback on iOS devices
        className="w-full h-full object-cover"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* This is an optional overlay to darken the video, making text easier to read */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40"></div>
    </div>
  );
};

export default VideoBackground;