import React, { useState, useEffect } from 'react';
import CardRenderer from './CardRenderer.js';
import defaultPack from '../Cards/cards.json'

import { getCurrentPlayerHand } from './ServerCommunications.js';

// Utility function to calculate the point on an oval for a given x (assuming y = sqrt(1 - (x/a)^2) * b)
function calculateOvalPoint(x, rx, ry) {
  const y = ry * Math.sqrt(1 - Math.pow(x / rx, 2)); // Calculate y using ellipse equation
  const angleDeg = Math.atan2(y, x) * (-180 / Math.PI); // Calculate angle from center
  return { x, y, angleDeg };
}

function RenderHand({changeCurrentScreen}) {
  const [currentHand, setCurrentHand] = useState(new Array(7).fill(null));
  
  useEffect(() => {
    async function fetchHand() {
      const hand = await getCurrentPlayerHand();
      setCurrentHand(hand);
    }
    fetchHand();
  }, []); // Fetch the hand when the component mounts
  
  const minRadius = 200;  // Minimum value for radiusWidth
  const maxRadius = 350;  // Maximum value for radiusWidth
  const cardAmount = currentHand.filter(card => card !== null).length;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [radiusWidth, setRadiusWidth] = useState(Math.min(Math.max(cardAmount * windowWidth/12, minRadius), maxRadius)); // Store window height
  const [dampingFactor, setDampingFactor] = useState (200/ (Math.min(Math.max(cardAmount * windowWidth/12, minRadius), maxRadius)));
  const [points, setPoints] = useState([]); // State to store the points and angles for the oval path

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const windowInnerWidth = window.innerWidth;
      setRadiusWidth(Math.min(Math.max(cardAmount * windowInnerWidth/12, minRadius), maxRadius));
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
  }, [cardAmount, windowWidth]); // Recalculate when cardAmount, windowWidth, or windowHeight changes

  return (
    <div
      className='Hand'
      style={{
        position: 'fixed',
        bottom: '0px'
      }}>
      {/* Render CardRenderer components at each calculated position */}
      {points.map((point, index) => {
        const cardsIndex = currentHand[index];
        if(cardsIndex === null) { return null; }
        const card = defaultPack.whiteCards[cardsIndex];
        return (
        <div
          className='HandCard'
          key={`handCard-${index}-${point.angleDeg}`}
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
        <CardRenderer Colour="white" Text={card.type === "text"? card.value:null} HoverEffect={true} ImagePath = {card.type === "image"? card.value:null} />
        </div>
      )})}
    </div>
  );
};

export default RenderHand;