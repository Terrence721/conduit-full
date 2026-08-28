import avatar from "../../assets/smiley-cyrus.jpeg";

interface AvatarProps {
  alt?: string;
  className?: string;
  src?: string | null;
}

function Avatar({ alt, className, src }: AvatarProps) {
  return (
    <img
      alt={alt || "placeholder"}
      className={className || ""}
      src={src || avatar}
    />
  );
}

export default Avatar;
