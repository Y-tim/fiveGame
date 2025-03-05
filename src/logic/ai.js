import { DIFFICULTY, PLAYER, BOARD_SIZE } from '../utils/constants'

export class AI {
    constructor(difficulty) {
        this.difficulty = difficulty
        this.maxDepth = this.getSearchDepth()
    }

    getSearchDepth() {
        switch (this.difficulty) {
            case DIFFICULTY.EASY:
                return 1
            case DIFFICULTY.MEDIUM:
                return 2
            case DIFFICULTY.HARD:
                return 3  // 将困难模式的搜索深度从4降到3，以提高响应速度
            default:
                return 1
        }
    }

    getMove(board) {
        // 如果是空棋盘，直接下在中心位置
        if (this.isEmptyBoard(board)) {
            return [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)]
        }

        const moves = this.getSmartMoves(board)
        let bestScore = -Infinity
        let bestMove = null

        // Alpha-Beta剪枝
        const alpha = -Infinity
        const beta = Infinity

        for (const [x, y] of moves) {
            const newBoard = board.clone()
            newBoard.placePiece(x, y, PLAYER.WHITE)
            
            const score = this.minimax(newBoard, this.maxDepth - 1, false, alpha, beta)
            
            if (score > bestScore) {
                bestScore = score
                bestMove = [x, y]
            }
        }

        return bestMove
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        // 终止条件：达到最大深度或游戏结束
        if (depth === 0) {
            return this.evaluateBoard(board)
        }

        const moves = this.getSmartMoves(board)
        
        if (isMaximizing) {
            let maxScore = -Infinity
            for (const [x, y] of moves) {
                const newBoard = board.clone()
                newBoard.placePiece(x, y, PLAYER.WHITE)
                
                const score = this.minimax(newBoard, depth - 1, false, alpha, beta)
                maxScore = Math.max(maxScore, score)
                alpha = Math.max(alpha, score)
                
                if (beta <= alpha) break
            }
            return maxScore
        } else {
            let minScore = Infinity
            for (const [x, y] of moves) {
                const newBoard = board.clone()
                newBoard.placePiece(x, y, PLAYER.BLACK)
                
                const score = this.minimax(newBoard, depth - 1, true, alpha, beta)
                minScore = Math.min(minScore, score)
                beta = Math.min(beta, score)
                
                if (beta <= alpha) break
            }
            return minScore
        }
    }

    getSmartMoves(board) {
        const moves = []
        const visited = new Set()

        // 遍历棋盘找出所有已下的棋子
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (board.getPiece(x, y) !== null) {
                    // 搜索周围两格范围内的空位
                    for (let dx = -2; dx <= 2; dx++) {
                        for (let dy = -2; dy <= 2; dy++) {
                            const nx = x + dx
                            const ny = y + dy
                            const key = `${nx},${ny}`
                            
                            if (!visited.has(key) && board.isValidMove(nx, ny)) {
                                visited.add(key)
                                moves.push([nx, ny])
                            }
                        }
                    }
                }
            }
        }

        // 如果没有找到任何可下的位置（极少发生），返回所有空位
        return moves.length > 0 ? moves : board.getAvailableMoves()
    }

    //todo 困难模式难度增加
    evaluatePosition(board, x, y, player) {
        // 在困难模式下增加进攻性
        const isHardMode = this.difficulty === DIFFICULTY.HARD
        const baseScore = this.getBaseScore(board, x, y, player)
        
        if (isHardMode) {
            // 在困难模式下，优先选择进攻位置
            const attackBonus = this.getAttackScore(board, x, y, player)
            return baseScore * 1.5 + attackBonus  // 提高评分权重
        }
        
        return baseScore
    }

    getAttackScore(board, x, y, player) {
        let score = 0
        // 检查是否能形成活三或活四
        if (this.checkLiveFour(board, x, y, player)) {
            score += 2000
        }
        if (this.checkLiveThree(board, x, y, player)) {
            score += 1000
        }
        return score
    }

    evaluateBoard(board) {
        let score = 0
        
        // 评估所有可能的位置
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const piece = board.getPiece(x, y)
                if (piece === PLAYER.WHITE) {
                    score += board.evaluatePosition(x, y, PLAYER.WHITE)
                } else if (piece === PLAYER.BLACK) {
                    score -= board.evaluatePosition(x, y, PLAYER.BLACK)
                }
            }
        }

        return score
    }

    isEmptyBoard(board) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (board.getPiece(x, y) !== null) {
                    return false
                }
            }
        }
        return true
    }
}