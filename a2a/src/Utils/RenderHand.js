//Renders a set of cards for the player's hand
import React, { useState, useEffect } from 'react';
import CardRenderer from './CardRenderer.js';
import defaultPack from '../Cards/DefaultCardPack.json'

import { getCurrentPlayerHand } from './ServerCommunications.js';

//Utility function to calculate the point on an oval for a given x (assuming y = sqrt(1 - (x/a)^2) * b)
function calculateOvalPoint(x, rx, ry) {
  const y = ry * Math.sqrt(1 - Math.pow(x / rx, 2)); //Calculate y using ellipse equation
  const angleDeg = Math.atan2(y, x) * (-180 / Math.PI); //Calculate angle from center
  return { x, y, angleDeg };
}

//Renders the cards in an oval shaped format
function RenderHand({changeCurrentScreen}) {
  const [currentHand, setCurrentHand] = useState(new Array(7).fill(null));
  
  //Gets the current player's cards when the component mounts
  useEffect(() => {
    async function fetchHand() {
      const hand = await getCurrentPlayerHand();
      setCurrentHand(hand);
    }
    fetchHand();
  }, []);
  
  const minRadius = 200;  //Minimum value for radiusWidth
  const maxRadius = 350;  //Maximum value for radiusWidth
  const cardAmount = currentHand.filter(card => card !== null).length; //Gets the number of valid cards in the current hand

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [radiusWidth, setRadiusWidth] = useState(Math.min(Math.max(cardAmount * windowWidth/12, minRadius), maxRadius)); //Store window width available to the cards
  const [dampingFactor, setDampingFactor] = useState (200/ (Math.min(Math.max(cardAmount * windowWidth/12, minRadius), maxRadius))); //Limits the rotation for the cards
  const [points, setPoints] = useState([]); //State to store the points and angles for the oval path

  //Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const windowInnerWidth = window.innerWidth;
      setRadiusWidth(Math.min(Math.max(cardAmount * windowInnerWidth/12, minRadius), maxRadius));
      setDampingFactor(200/ (Math.min(Math.max(cardAmount * windowInnerWidth/12, minRadius), maxRadius)))
    };

    //Add resize event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('deviceorientation', handleResize);

    //Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleResize);
    };
  }, []);

  // ecalculate the points on the oval path whenever the window size or cardAmount changes
  useEffect(() => {
    const newPoints = [];

    for (let i = 1; i <= cardAmount; i++) {
      const x = (-radiusWidth / 2) + (((radiusWidth/2) - (-radiusWidth / 2))/(cardAmount+1)) * i; // Symmetrical positions from -radiusWidth/2 to +radiusWidth/2
      const point = calculateOvalPoint(x, radiusWidth, 250);
      newPoints.push(point);
    }

    setPoints(newPoints);
  }, [cardAmount, windowWidth]);

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
            display: 'flex',
            justifyContent: 'space-between',
            left: `${window.innerWidth / 2 + point.x - 120 / 2}px`,
            bottom: `${point.y-points[0].y+20}px`,
            transform: `rotate(${(point.angleDeg + 90) * dampingFactor}deg)`,
          }}
        >
        <CardRenderer Colour="white" Text={card.type === "text"? card.value:null} HoverEffect={true} ImagePath = {card.type === "image"? card.value:null} />
        </div>
      )})}
    </div>
  );
};

export default RenderHand;