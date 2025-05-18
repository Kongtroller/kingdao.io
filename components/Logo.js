const Logo = ({ className = "", alt = "Logo" }) => (
    <img
      src="/logo.png"
      className={className}
      alt={alt}
      width={48}  // Or whatever size you want
      height={48}
      style={{ display: "inline-block" }}
      loading="lazy"
      draggable={false}
    />
  );
  
  export default Logo;
  