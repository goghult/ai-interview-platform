import { useState, useEffect } from 'react';

export default function Typewriter({ text, animate = true, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);
  const [isTyping, setIsTyping] = useState(animate);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, animate, speed]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-primary-400 animate-pulse align-middle"></span>}
    </span>
  );
}
