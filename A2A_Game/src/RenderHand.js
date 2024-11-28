import React, { useState, useEffect } from 'react';
import CardRenderer from './CardRenderer.js';
import App from './App.js';

// Utility function to calculate the point on an oval for a given x (assuming y = sqrt(1 - (x/a)^2) * b)
function calculateOvalPoint(x, rx, ry) {
  const y = ry * Math.sqrt(1 - Math.pow(x / rx, 2)); // Calculate y using ellipse equation
  const angleDeg = Math.atan2(y, x) * (-180 / Math.PI); // Calculate angle from center
  return { x, y, angleDeg };
}

const DisplayHand = () => {
  const minRadius = 200;  // Minimum value for radiusWidth
  const maxRadius = 350;  // Maximum value for radiusWidth

  const [cardAmount, setCardAmount] = useState(7); // Number of cards
  const [radiusWidth, setRadiusWidth] = useState(Math.min(Math.max(cardAmount * window.innerWidth/12, minRadius), maxRadius)); // Store window height
  const [radiusHeight, setRadiusHeight] = useState(window.innerHeight/3); // Store window height
  const [dampingFactor, setDampingFactor] = useState (200/ (Math.min(Math.max(cardAmount * window.innerWidth/12, minRadius), maxRadius)));

  const [points, setPoints] = useState([]); // State to store the points and angles for the oval path

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const windowInnerWidth = window.innerWidth;
      setRadiusWidth(Math.min(Math.max(cardAmount * windowInnerWidth/12, minRadius), maxRadius));
      setRadiusHeight(window.innerHeight / 3);
      setDampingFactor(200/ (Math.min(Math.max(cardAmount * windowInnerWidth/12, minRadius), maxRadius)))
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('deviceorientation', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleResize);
    };
  }, []);

  // Recalculate the points on the oval path whenever the window size or cardAmount changes
  useEffect(() => {
    const newPoints = [];

    for (let i = 1; i <= cardAmount; i++) {
      const x = (-radiusWidth / 2) + (((radiusWidth/2) - (-radiusWidth / 2))/(cardAmount+1)) * i; // Symmetrical positions from -radiusWidth/2 to +radiusWidth/2
      const point = calculateOvalPoint(x, radiusWidth, 250);
      newPoints.push(point);
    }

    // Update points state
    setPoints(newPoints);
  }, [cardAmount]); // Recalculate when cardAmount, windowWidth, or windowHeight changes

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0px'
      }}>
      {/* Render CardRenderer components at each calculated position */}
      {points.map((point, index) => (
        <div
          key={`card-${index}-${point.angleDeg}`}
          style={{
            position: 'fixed',
            display: 'flex',/* Enables Flexbox */
            justifyContent: 'space-between', /* Optional: Controls spacing between items */
            left: `${window.innerWidth / 2 + point.x - 120 / 2}px`,
            bottom: `${point.y-points[0].y+20}px`, // Align vertically using bottom offset
            transform: `rotate(${(point.angleDeg + 90) * dampingFactor}deg)`, // Apply rotation
            //transformOrigin: 'bottom center', // Pivot rotation from the top edge
          }}
        >
          <CardRenderer Colour="white" Text={`Card ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default DisplayHand;