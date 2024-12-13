//Game Instance and Player data classes
import defaultPack from '../Cards/DefaultCardPack.json' with { type: 'json' };

//Player class which stores data relating to the player including cards, UUID and player username
class Player{
    #playerUUID; getPlayerUUID(){ return this.#playerUUID; }
    #playerName; getPlayerName() { return this.#playerName;}
    #hand = new Array(7).fill(null); getHand(){ return this.#hand; }
    connected = true;

    constructor(playerUUID, playerName){ 
        this.#playerUUID = playerUUID; 
        this.#playerName = playerName; 
    }

    addCard(cardJsonIndex){
        const nullIndex = this.#hand.indexOf(null);
        if(nullIndex !== -1) { this.#hand[nullIndex] = cardJsonIndex; }
        else { console.error("Cannot add new card as the list is already full") }
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
    #active = false; isGameActive(){ return this.#active; }
    #players = new Map();
    #whiteDeck = null
    #blackDeck = null
    pack = defaultPack;

    constructor(instanceCode){
        this.instanceCode = instanceCode
    }

    doesPlayerExistInGame(UUID){
        if(this.#players.has(UUID)){ console.log(`Player ${UUID} currently exists in this game`); return true; }
        return false;
    }

    addPlayer(UUID){
        if(this.doesPlayerExistInGame(UUID)) { return; }
        this.#players.set(UUID, new Player(UUID));
    }

    removePlayer(UUID) {
        if(!this.doesPlayerExistInGame(UUID)) { return;}
        this.#players.delete(UUID);

        return this.#players.size;
    }

    getPlayerHand(UUID){
        if(!this.doesPlayerExistInGame(UUID)) { return; }
        return this.#players.get(UUID).getHand();
    }

    startGame(pack = defaultPack){
        this.#players.forEach((player) => { player.emptyHand(); });

        this.pack = pack;
        this.initialiseDecks();
        this.dealCards(7);
        this.#active = true;
    }

    endGame(){
        this.#active = false;
        this.#players.forEach((player) => {
            player.emptyHand();
        });
    }

    initialiseDecks(){
        this.#whiteDeck = Array.from({ length:this.pack.whiteCards.length}, (_, i) => i)
        this.#blackDeck = Array.from({ length:this.pack.blackCards.length}, (_, i) => i)
        this.shuffleDeck(this.#whiteDeck);
        this.shuffleDeck(this.#blackDeck);
    }

    //Shuffle using the Fisher-Yates algorithm
    shuffleDeck(deck){
        if(deck === null) { console.log("You must initialise the deck before shuffling it"); return;}

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
        }
    }

    dealCards(numberOfCards) {
        for (let i = 0; i < numberOfCards; i++) {
            this.#players.forEach((player) => {
                const hand = player.getHand();
                if (!hand.includes(null)) { return; }
                if (this.#whiteDeck.length <= 0) { /*NEW DECK LOADING*/ }
                player.addCard(this.#whiteDeck.pop());
            });
        }
    }

    playerDrawCard(UUIDorPlayer, deck){
        if(!(UUIDorPlayer instanceof Player)) { 
            if(!this.doesPlayerExistInGame(UUID)) { return; }
            UUIDorPlayer = this.#players.get(UUID); 
        }
        const hand = player.getHand();
        if (!hand.includes(null)) { return; }
        if (deck.length <= 0) { /*NEW DECK LOADING*/ }
        player.addCard(deck.pop());
    }

    setPlayerConnection(UUID, state){
        if(state != true || state != false) { console.log(`Player Connection cannot be "${state}"`); return;}
        this.#players[UUID]
    }

    //Checks how many connected players there are
    howManyConnectedPlayers(){
        let connectedPlayers = 0;
        this.#players.array.forEach((player) => {
            if(player.connected) { connectedPlayers++; }
        });
        return connectedPlayers;
    }
}