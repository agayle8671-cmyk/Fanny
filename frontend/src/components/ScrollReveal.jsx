import { useEffect, useRef, useState } from "react";

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  direction = "up",
  threshold = 0.05,
  once = true,
}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsIntersecting(false);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const getTransform = () => {
    if (!isIntersecting) {
      switch (direction) {
        case "up":
          return "translateY(24px)";
        case "down":
          return "translateY(-24px)";
        case "left":
          return "translateX(24px)";
        case "right":
          return "translateX(-24px)";
        case "zoom":
          return "scale(0.96)";
        case "fade":
        default:
          return "none";
      }
    }
    return "none";
  };

  const style = {
    opacity: isIntersecting ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};
