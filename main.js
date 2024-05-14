import './style.css'

const contianer = document.getElementById('container')
let divCount = 0

// document.body.addEventListener('keydown', event => {
//   console.log(`key: ${event.code}`)
//   if (event.code == 'Space')
//     addDiv(divCount)
// })

// document.body.addEventListener('click', event => {
//   const div = event.target
//   if (parseInt(div.id) % 2 == 0) {
//     addWiggleAnimation(div)
//   } else {
//     addMorphAnimation(div)
//   }
  
// })

export const addDiv = (id) => {
  console.log(`create div: ${id}`)
  const div = document.createElement('div')
  div.className = 'user'
  div.id = id
  div.textContent = `0x${id}${++divCount}` // replace with Id

  // create random background color
  const hue = Math.random() * 360
  const saturation =  Math.random() * 100
  const lightness = (Math.random() * 60) + 20
  div.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  // calculate complimentary colors for the text
  const complimentHue = (hue + 180) * 360
  const complimentLightness = lightness < 50 ? 80 : 20
  div.style.color = `hsl(${complimentHue}, ${saturation}%, ${complimentLightness}%)` 

  contianer.appendChild(div)
  adjustGrid()
}

const adjustGrid = () => {
  const divs = contianer.querySelectorAll('.user')
  const numDivs = divs.length
  let cols = Math.ceil(Math.sqrt(numDivs))
  let rows = Math.ceil(numDivs/cols)

  contianer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  contianer.style.gridTemplateRows = `repeat(${rows}, 1fr)`
}

export const addWiggleAnimation = (div) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('wiggle-animation')){
    div.classList.add('wiggle-animation')
    // remove the animation after 6s
    setTimeout(() => {
      div.classList.remove('wiggle-animation')
    }, 6000)
  }
}

export const addMorphAnimation = (div) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('morph-animation')){
    div.classList.add('morph-animation')
    // remove the animation after 2s
    setTimeout(() => {
      div.classList.remove('morph-animation')
    }, 2000)
  }
}

export const addFade = (div, duration) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('fade')){
    div.classList.add('fade')
    // remove the animation after given duration
    setTimeout(() => {
      div.classList.remove('fade')
    }, duration)
  }
}
