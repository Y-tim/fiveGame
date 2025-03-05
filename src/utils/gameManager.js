class GameManager {
    constructor() {
        this.game = null;
    }

    setGame(game) {
        this.game = game;
    }

    getGame() {
        return this.game;
    }
}

export const gameManager = new GameManager();