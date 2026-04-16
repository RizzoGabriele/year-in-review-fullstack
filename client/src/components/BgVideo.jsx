import "./BgVideo.css";

export default function BackgroundVideo({ src }) {
  return (
    <div className="bgvideo">
      <video
        className="bgvideo__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
