import { defineStore } from 'pinia'

export const useGameStore = defineStore('gameStore', {
  state: () => ({
    selectedGame: null,
    fallbackIndexes: Array.from({ length: 20 }, (_, i) => i + 1)
  }),

  getters: {
    commentImage(state) {
      const map = {
        "Wii Sports": "images/1.png",
        "Super Mario Bros.": "images/2.png",
        "Mario Kart Wii": "images/3.png",
        "Wii Sports Resort": "images/4.png",
        "Pokemon Red/Pokemon Blue": "images/5.png",
        "Tetris": "images/6.png",
        "New Super Mario Bros.": "images/7.png",
        "Wii Play": "images/8.png",
        "New Super Mario Bros. Wii": "images/9.png",
        "Duck Hunt": "images/10.png",
        "Nintendogs": "images/11.png",
        "Mario Kart DS": "images/12.png",
        "Pokemon Gold/Pokemon Silver": "images/13.png",
        "Wii Fit": "images/14.png",
        "Kinect Adventures!": "images/15.png",
        "Wii Fit Plus": "images/16.png",
        "Grand Theft Auto: San Andreas": "images/17.png",
        "Grand Theft Auto V": "images/18.png",
        "Super Mario World": "images/19.png",
        "Brain Age: Train Your Brain in Minutes a Day": "images/20.png"
      }
      return map[state.selectedGame] || getRandomFallback(false)
    },

    wordcloudImage(state) {
      const map = {
        "Wii Sports": "images/image1.png",
        "Super Mario Bros.": "images/image2.png",
        "Mario Kart Wii": "images/image3.png",
        "Wii Sports Resort": "images/image4.png",
        "Pokemon Red/Pokemon Blue": "images/image5.png",
        "Tetris": "images/image6.png",
        "New Super Mario Bros.": "images/image7.png",
        "Wii Play": "images/image8.png",
        "New Super Mario Bros. Wii": "images/image9.png",
        "Duck Hunt": "images/image10.png",
        "Nintendogs": "images/image11.png",
        "Mario Kart DS": "images/image12.png",
        "Pokemon Gold/Pokemon Silver": "images/image13.png",
        "Wii Fit": "images/image14.png",
        "Kinect Adventures!": "images/image15.png",
        "Wii Fit Plus": "images/image16.png",
        "Grand Theft Auto: San Andreas": "images/17.png",
        "Grand Theft Auto V": "images/18.png",
        "Super Mario World": "images/19.png",
        "Brain Age: Train Your Brain in Minutes a Day": "images/20.png"
      }
      return map[state.selectedGame] || getRandomFallback(true)
    }
  },

  actions: {
    setSelectedGame(gameName) {
      console.log('[🕹️ 更新选中游戏]', gameName)
      this.selectedGame = gameName
    }
  }
})

function getRandomFallback(isWordcloud) {
  const index = Math.floor(Math.random() * 20) + 1
  return isWordcloud ? `images/image${index}.png` : `images/${index}.png`
}
