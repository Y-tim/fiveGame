import { BOARD_SIZE, PLAYER } from '../utils/constants'

export class Board {
    constructor() {
        this.reset()
    }

    reset() {
        // 初始化空棋盘
        this.grid = Array(BOARD_SIZE).fill(null)
            .map(() => Array(BOARD_SIZE).fill(null))
    }

    getPiece(x, y) {
        return this.grid[x][y]
    }

    placePiece(x, y, player) {
        if (this.isValidMove(x, y)) {
            this.grid[x][y] = player
            return true
        }
        return false
    }

    isValidMove(x, y) {
        return x >= 0 && x < BOARD_SIZE && 
               y >= 0 && y < BOARD_SIZE && 
               this.grid[x][y] === null
    }

    checkWin(x, y, player) {
        const directions = [
            [[1, 0], [-1, 0]],  // 水平
            [[0, 1], [0, -1]],  // 垂直
            [[1, 1], [-1, -1]], // 主对角线
            [[1, -1], [-1, 1]]  // 副对角线
        ]

        return directions.some(dirPair => {
            let count = 1
            dirPair.forEach(([dx, dy]) => {
                let nx = x + dx
                let ny = y + dy
                while (
                    nx >= 0 && nx < BOARD_SIZE &&
                    ny >= 0 && ny < BOARD_SIZE &&
                    this.grid[nx][ny] === player
                ) {
                    count++
                    nx += dx
                    ny += dy
                }
            })
            return count >= 5
        })
    }

    getAvailableMoves() {
        const moves = []
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (this.grid[x][y] === null) {
                    moves.push([x, y])
                }
            }
        }
        return moves
    }

    clone() {
        const newBoard = new Board()
        newBoard.grid = this.grid.map(row => [...row])
        return newBoard
    }

    // 评估当前位置的分数（用于AI）
    evaluatePosition(x, y, player) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 主对角线
            [1, -1]   // 副对角线
        ]

        let score = 0
        directions.forEach(([dx, dy]) => {
            score += this.evaluateDirection(x, y, dx, dy, player)
            score += this.evaluateDirection(x, y, -dx, -dy, player)
        })

        return score
    }

    evaluateDirection(x, y, dx, dy, player) {
        let count = 0
        let blocked = 0
        let nx = x + dx
        let ny = y + dy

        while (
            nx >= 0 && nx < BOARD_SIZE &&
            ny >= 0 && ny < BOARD_SIZE &&
            count < 4
        ) {
            if (this.grid[nx][ny] === player) {
                count++
            } else if (this.grid[nx][ny] !== null) {
                blocked++
                break
            } else {
                break
            }
            nx += dx
            ny += dy
        }

        // 根据连子数和是否被封堵返回分数
        if (count >= 4) return 10000
        if (count === 3 && blocked === 0) return 1000
        if (count === 2 && blocked === 0) return 100
        if (count === 1 && blocked === 0) return 10
        return blocked === 0 ? 1 : 0
    }
}