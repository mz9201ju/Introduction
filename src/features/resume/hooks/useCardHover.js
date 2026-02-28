import { useState, useCallback } from 'react';

/**
 * Provides hover/focus state for a ProjectCard.
 * Returns event handlers and the current isHovered boolean.
 * Keyboard users trigger the same animation via focus/blur.
 */
export function useCardHover() {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    const handleFocus = useCallback(() => setIsHovered(true), []);
    const handleBlur = useCallback(() => setIsHovered(false), []);

    return { isHovered, handleMouseEnter, handleMouseLeave, handleFocus, handleBlur };
}
