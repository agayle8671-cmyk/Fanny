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
  const [state, setState] = useState("hidden"); // "hidden" | "animating" | "visible"

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Mark as animating — this activates will-change for the paint
          setState("animating");
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setState("hidden");
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

  // After animation completes, free the GPU layer by resetting will-change
  useEffect(() => {
    if (state !== "animating") return;
    const totalDuration = (duration + delay) * 1000 + 100; // +100ms buffer
    const timer = setTimeout(() => setState("visible"), totalDuration);
    return () => clearTimeout(timer);
  }, [state, duration, delay]);

  const isHidden = state === "hidden";

  const getTransform = () => {
    if (!isHidden) return "none";
    switch (direction) {
      case "up":    return "translateY(20px)";
      case "down":  return "translateY(-20px)";
      case "left":  return "translateX(20px)";
      case "right": return "translateX(-20px)";
      case "zoom":  return "scale(0.97)";
      case "fade":
      default:      return "none";
    }
  };

  const style = {
    opacity: isHidden ? 0 : 1,
    transform: getTransform(),
    transition: isHidden
      ? "none"
      : `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    // will-change only while compositing; reset to 'auto' once done to free GPU layers
    willChange: state === "animating" ? "opacity, transform" : "auto",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};
