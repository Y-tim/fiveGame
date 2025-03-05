import { MenuScene } from './src/scenes/menuScene'
import { gameManager } from './src/utils/gameManager'

// 初始化游戏
const canvas = wx.createCanvas()
const context = canvas.getContext('2d')

// 获取系统信息以适配不同屏幕
const systemInfo = wx.getSystemInfoSync()
canvas.width = systemInfo.windowWidth
canvas.height = systemInfo.windowHeight

// 游戏主循环
class Game {
    constructor() {
        this.scene = new MenuScene(canvas, context)
        gameManager.setGame(this)  // 替换 window.game = this
    }

    start() {
        const loop = () => {
            this.scene.update()
            this.scene.render()
            requestAnimationFrame(loop)
        }
        loop()
    }

    switchScene(newScene) {
        this.scene = newScene
    }
}

// 启动游戏
const game = new Game()
game.start()