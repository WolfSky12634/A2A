class Player{
    #playerUUID; getPlayerUUID(){ return this.#playerUUID; }
    hand = new Array(7).fill(null);
    constructor(playerUUID){ 
        this.playerUUID = playerUUID; 
    }

    addCard(cardJsonIndex){
        const nullIndex = this.hand.indexOf(null);
        if(nullIndex !== -1){
            this.hand[nullIndex] = cardJsonIndex;
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


}

export class GameInstance{
    #instanceCode; getInstanceCode(){ return this.#instanceCode; }
    players = [];

    constructor(instanceCode){
        this.instanceCode = instanceCode
    }

    addPlayer(UUID){
        this.players.push(Player(UUID));
    }

    removePlayer(UUID) {
        const index = this.players.findIndex(player => player.getPlayerUUID() === UUID);
        if (index !== -1) {
            this.players.splice(index, 1);
        } else {
            console.error(`Cannot find player with UUID "${UUID}".`);
        }
    }
}