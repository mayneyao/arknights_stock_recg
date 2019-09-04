import React, { useEffect } from 'react'
import m from '../data/material'

export default function Card(props) {
    const { id } = props
    const t = m.data.find(m => m.id === id)
    const M1 = require(`../assets/materials/${id}.png`)
    const T1 = require(`../assets/cards/${t.tier}.png`)
    const draw = () => {
        let w = 145
        let h = 95
        let imgCard = new Image()
        let canvas = document.getElementById(id)
        let ctx = canvas.getContext('2d')
        imgCard.src = T1
        imgCard.onload = () => {
            canvas.width = imgCard.width
            canvas.height = imgCard.height
            ctx.drawImage(imgCard, 0, 0)
            let imgM = new Image()
            imgM.src = M1
            imgM.onload = () => {
                // canvas.width = imgM.width
                // canvas.height = imgM.height
                ctx.drawImage(imgM, (imgCard.width - imgM.width) / 2, (imgCard.height - imgM.height) / 2)

                // 裁剪出识别部分的图案
                let recgImageData = ctx.getImageData((canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
                // resize
                canvas.width = recgImageData.width * 0.71
                canvas.height = recgImageData.height * 0.71
                ctx.putImageData(recgImageData, 0, 0, 0, 0, recgImageData.width * 0.71, recgImageData.height * 0.71)
            }
        }
    }

    useEffect(() => {
        draw()
        console.log(1)
    }, [])
    return (
        <div>
            <canvas id={id} style={{ display: 'none' }}></canvas>
            {/* <canvas id={id} ></canvas> */}
        </div>
    )
}