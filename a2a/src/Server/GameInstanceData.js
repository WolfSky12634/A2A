import cards from '../Cards/cards.json' with { type: 'json' };

//const cards = [];

class Player{
    #playerUUID; getPlayerUUID(){ return this.#playerUUID; }
    #hand = new Array(7).fill(null); getHand(){ return this.#hand; }

    constructor(playerUUID){ 
        this.playerUUID = playerUUID; 
    }

    addCard(cardJsonIndex){
        const nullIndex = this.#hand.indexOf(null);
        if(nullIndex !== -1){
            this.#hand[nullIndex] = cardJsonIndex;
        }
        else{
            console.error("Cannot add new card as the list is already full")
        }
    }

    removeCard(cardJsonIndex) {
        const index = this.hand.indexOf(cardJsonIndex);
        if (index !== -1) {
            this.hand.splice(index, 1);
            while (this.hand.length < 7) {
                this.hand.push(null);
            }
        } else {
            console.error(`Cannot find card with index value "${cardJsonIndex}".`);
        }
    }

    emptyHand() { this.#hand = new Array(7).fill(null); }
}

export class GameInstance{
    #instanceCode; getInstanceCode(){ return this.#instanceCode; }
    #players = new Map();
    #deck = null
    deckType = 'default';

    constructor(instanceCode){
        this.instanceCode = instanceCode
    }

    #doesPlayerExistInGame(UUID){
        if(this.#players.has(UUID)){ console.log(`Player ${UUID} currently exists in this game`); return true; }
        return false;
    }

    addPlayer(UUID){
        if(this.#doesPlayerExistInGame(UUID)) { return; }
        this.#players.set(UUID, new Player(UUID));
        
    }

    removePlayer(UUID) {
        if(!this.#doesPlayerExistInGame(UUID)) { return;}
        this.#players.delete(UUID);
    }

    getPlayerHand(UUID){
        if(!this.#doesPlayerExistInGame(UUID)) { return; }
        return this.#players.get(UUID).getHand();
    }

    startGame(deck = 'default'){
        this.#players.forEach((player) => { player.emptyHand(); });

        this.deckType = deck;
        this.initialiseDeck(cards);
        this.dealCards(2);
    }

    initialiseDeck(deck){
        this.#deck = Array.from({ length:deck.length}, (_, i) => i)
        this.shuffleDeck();
    }

    //Shuffle using the Fisher-Yates algorithm
    shuffleDeck(){
        if(this.#deck === null) { console.log("You must initialise the deck before shuffling it"); return;}

        for (let i = this.#deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.#deck[i], this.#deck[j]] = [this.#deck[j], this.#deck[i]]; // Swap elements
        }
    }

    dealCards(numberOfCards) {
        for (let i = 0; i < numberOfCards; i++) {
            this.#players.forEach((player) => {
                const hand = player.getHand();
                if (!hand.includes(null)) { return; }
                if (this.#deck.length <= 0) { /*NEW DECK LOADING*/ }
                player.addCard(this.#deck.pop());
                console.log(this.#deck);
            });
        }
    }

    playerDrawCard(UUID){
        if(!this.#doesPlayerExistInGame(UUID)) { return; }
    }
}