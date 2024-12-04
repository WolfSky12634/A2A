import './CardRenderer.css';

function CardRenderer({ Colour, Text, Scale, HoverEffect=true}) {
    return (
        <div 
            className={`Playing-card${+ HoverEffect? `` : `.No-hover`}`}
            style={{ backgroundColor: Colour, transform: `scale(${Scale})` }}
        >
            <span className="Text">{Text}</span>
        </div>
    );
}

export default CardRenderer;