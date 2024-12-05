import './CardRenderer.css';

function CardRenderer({ Colour, Text, Scale, HoverEffect=true, ImagePath}) {
    return (
        <div 
            className={`Playing-card${+ HoverEffect? `` : `.No-hover`}`}
            style={{ backgroundColor: Colour, transform: `scale(${Scale})` }}
        >
            {ImagePath && <img src={"/CardImages/"+ImagePath} alt="Card Image" className="Image"></img>}
            {!ImagePath && <span className="Text">{Text}</span>}
        </div>
    );
}

export default CardRenderer;