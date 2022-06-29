import { vec2 } from './Vec2.js'

const canvas = document.querySelector('#canvas')

const width = window.innerWidth
const height = window.innerHeight

canvas.width = width
canvas.height = height

// const ctx = canvas.getContext('webgl', {
// 	antialias: false,
// 	depth: false
//   });
const ctx = canvas.getContext('2d')
// ctx.fillStyle = "#99FFCC";
// ctx.fillRect(0, 0, width, height);

ctx.fillStyle = '#556B2F'

let stickers = []
let stickerSpam = false
let mousePoint = null

const gravity = vec2(0, Math.random())
console.log(gravity.y)

const baseStickerSrc =
  './source_images'

const pngs = [
    `${baseStickerSrc}/IMG_0901.PNG`,
    `${baseStickerSrc}/IMG_1146.PNG`,
    `${baseStickerSrc}/IMG_1155.PNG`,
    `${baseStickerSrc}/IMG_1398.PNG`,
    `${baseStickerSrc}/IMG_1403.PNG`,
    `${baseStickerSrc}/IMG_1407.PNG`,
]

let images = pngs.map(url => {
    return new Promise(resolve => {
        const img = new Image()
        img.src = url
        img.onload = () => {
            resolve(img)
        }
    })
})

const createSticker = (pos, velocity, acceleration) => {
    stickers.push({
        pos,
        velocity,
        acceleration,
        width: 106,
        height: 162,
        imageIndex: Math.floor(Math.random() * images.length),
    })
}

const random = (min, max) => {
    return Math.floor(min + Math.random() * (max + 1 - min))
}

canvas.addEventListener('mousedown', e => {
    const ifLeftClick = e.clientX < width / 2
    createSticker(
        vec2(e.clientX, e.clientY),
        vec2(ifLeftClick ? 5 : -5, random(0, 10) - 10),
        vec2((ifLeftClick ? Math.random() : -Math.random()) / 10, 0),
    )
})

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    stickerSpam = !stickerSpam;
})

canvas.addEventListener('mousemove', e => {
    mousePoint = {
        x: e.clientX,
        y: e.clientY,
    }
})

const friction = 0.99

const update = () => {
    if (mousePoint && stickerSpam) {
        createSticker(
            vec2(mousePoint.x, mousePoint.y),
            vec2(Math.random() > 0.5 ? 5 : -5, Math.random(0, 10) - 10),
            vec2((Math.random() > 0.5 ? -Math.random() : Math.random()) / 5, 0),
        )
    }

    const visiblestickers = []

    stickers.forEach(sticker => {
        if (sticker.pos.y >= height - sticker.height) {
            sticker.velocity.y *= -1
            sticker.pos.y = height - sticker.height
        }

        if (sticker.acceleration.length < 1) {
			// gravity = vec2(0, Math.random());
            sticker.acceleration.add(gravity);
        }

        sticker.velocity.add(sticker.acceleration).multiply(friction);

        sticker.pos.add(sticker.velocity);

        if (sticker.pos.x < width && sticker.pos.x > -sticker.width) {
            visiblestickers.push(sticker)
        }
    })

    stickers = visiblestickers
}

const render = () => {
    stickers.forEach(sticker => {
        ctx.drawImage(
            images[sticker.imageIndex],
            sticker.pos.x,
            sticker.pos.y,
            sticker.width,
            sticker.height,
        )
    })

    ctx.fillRect(0, 0, 100, 25);
    ctx.strokeText(`Taps: ${stickers.length}`, 20, 20);
}

const loop = () => {
    update();
    render();

    requestAnimationFrame(loop);
}

Promise.all(images).then(imgs => {
    images = imgs;
    requestAnimationFrame(loop);
})
