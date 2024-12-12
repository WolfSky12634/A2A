//Renders visual design elements to display on screen

import { useEffect, useState, useRef } from 'react';
import './VisualEffects.css';

//Creates a spinner visual effect
export function Spinners(){
    const pathRef = useRef(null);
    const [trailPoints, setTrailPoints] = useState([]);
    const [reverseTrailPoints, setReverseTrailPoints] = useState([]);

    useEffect(() => {
        const radius = 80; // Radius of the circle
        const centerX = 100; // X coordinate of circle's centre
        const centerY = 100; // Y coordinate of circle's centre
        let angle = 90; // Start at the top of the circle
    
        const interval = setInterval(() => {
            const radian = (angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(radian);
            const y = centerY + radius * Math.sin(radian);
    
            setTrailPoints((prevPoints) => {
                const updatedPoints = [...prevPoints, `${x},${y}`];
                return updatedPoints.length > 40 ? updatedPoints.slice(1) : updatedPoints;
            });
    
            angle = (angle + 2) % 360;
        }, 50);
    
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        const radius = 80; // Radius of the circle
        const centerX = 100; // X coordinate of circle's centre
        const centerY = 100; // Y coordinate of circle's centre
        let angle = 90; // Start at the top of the circle (reverse direction)
    
        const interval = setInterval(() => {
            const radian = (angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(radian);
            const y = centerY + radius * Math.sin(radian);
    
            setReverseTrailPoints((prevPoints) => {
                const updatedPoints = [...prevPoints, `${x},${y}`];
                return updatedPoints.length > 40 ? updatedPoints.slice(1) : updatedPoints;
            });
    
            angle = (angle - 2 + 360) % 360;
        }, 50);
    
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="menu">
            <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Render the forward-moving trail */}
                {trailPoints.map((point, index) => {
                    if (index === 0) return null; // Skip the first point, as it doesn't form a segment
                    const circleRadius = 5;
                    const start = trailPoints[index - 1];
                    const end = point;

                    const strokeWidth = (circleRadius * 4) / (Math.log(trailPoints.length - index + 1) + 1);
                    const opacity = 1 - (trailPoints.length - index) / trailPoints.length;
                    return (
                        <line
                            key={`forward-${index}`}
                            x1={start.split(',')[0]}
                            y1={start.split(',')[1]}
                            x2={end.split(',')[0]}
                            y2={end.split(',')[1]}
                            stroke="blue"
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                        />
                    );
                })}

                {/* Render the reverse-moving trail */}
                {reverseTrailPoints.map((point, index) => {
                    if (index === 0) return null; // Skip the first point, as it doesn't form a segment
                    const circleRadius = 5;
                    const start = reverseTrailPoints[index - 1];
                    const end = point;

                    const strokeWidth = (circleRadius * 4) / (Math.log(reverseTrailPoints.length - index + 1) + 1);
                    const opacity = 1 - (reverseTrailPoints.length - index) / reverseTrailPoints.length;
                    return (
                        <line
                            key={`reverse-${index}`}
                            x1={start.split(',')[0]}
                            y1={start.split(',')[1]}
                            x2={end.split(',')[0]}
                            y2={end.split(',')[1]}
                            stroke="green" // Change colour for visual distinction
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                        />
                    );
                })}

                {/* Moving dot for forward direction */}
                <circle
                    className="moving-dot"
                    cx={trailPoints[trailPoints.length - 1]?.split(',')[0] || 100}
                    cy={trailPoints[trailPoints.length - 1]?.split(',')[1] || 20}
                    r="5"
                    fill="none"
                    stroke="red"
                />

                {/* Moving dot for reverse direction */}
                <circle
                    className="moving-dot"
                    cx={reverseTrailPoints[reverseTrailPoints.length - 1]?.split(',')[0] || 100}
                    cy={reverseTrailPoints[reverseTrailPoints.length - 1]?.split(',')[1] || 20}
                    r="5"
                    fill="none"
                    stroke="orange" // Change colour for visual distinction
                />
            </svg>
        </div>
    );
}