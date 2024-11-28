import './CardRenderer.css';

function CardRenderer({ Colour, Text, Scale }) {
    return (
        <div 
            className="Playing-card" 
            style={{ backgroundColor: Colour, transform: `scale(${Scale})` }}
        >
            <span className="Text">{Text}</span>
        </div>
    );
}

export default CardRenderer;