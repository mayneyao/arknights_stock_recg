/* global cv */
/* global Tesseract */

import React, { useState } from 'react';
// import './App.css';
import Utils from './utils'
import { TesseractWorker, OEM } from 'tesseract.js';
import MaterialCanvasCard from './components/MaterialCanvasCard'
import materialData from './data/material'

const worker = new TesseractWorker();

let md = materialData.data

md = md.filter(m => ["M-3-9", "M-3-8", "M-4-6"].includes(m.id))

function App() {
  let [files, setFiles] = useState([])
  let [number, setNumber] = useState(0)
  let [data, setData] = useState({})
  let utils = new Utils('errorMessage');
  // utils.loadImageToCanvas('opencvtest1.png', 'imageCanvasInput');
  // utils.loadImageToCanvas('test03.png', 'templateCanvasInput');
  // utils.addFileInputHandler('fileInput', 'canvasInput');
  // let m01 = new Image()
  // m01.src = test03
  // let rimg = new Image()
  // rimg.src = opencvtest1

  const getNumber = (res) => {
    const { symbols } = res
    return parseInt(symbols.filter(s => s.confidence > 70).map(s => s.text).join(''))
  }

  const recgNumber = (m, recgCanvas, myImageData) => {
    // var Tesseract = window.Tesseract
    // const worker = new Tesseract.TesseractWorker();
    let ctx = recgCanvas.getContext('2d');

    recgCanvas.width = myImageData.width;
    recgCanvas.height = myImageData.height;
    ctx.putImageData(myImageData, 0, 0);

    var image = new Image();
    image.src = recgCanvas.toDataURL();

    image.onload = () => {
      // console.log(image)
      worker.recognize(image, 'eng', {
        'tessedit_ocr_engine_mode': OEM.TESSERACT_ONLY,
        'tessedit_char_whitelist': '0123456789',
      })
        .progress(progress => {
          // console.log('progress', progress);
        }).then(result => {
          // console.log('result', result);
          let iHave = getNumber(result)
          if (!isNaN(iHave)) {
            m.have = iHave
            console.log(m.name, iHave)
          }
          // setData({
          //   ...data,

          // })
        });
    }
  }

  const loadImage = () => {
    utils.loadImageToCanvas(files[0], 'imageCanvasInput');
    // utils.loadImageToCanvas(test03, 'templateCanvasInput');
  }

  const handleAction = () => {
    // console.log(files[0])
    let src = cv.imread('imageCanvasInput');

    // console.log(src)
    // console.log(materialData)
    md.map(m => {
      // 识别材料
      console.log(`${m.name}-加入识别队列`)
      let templ = cv.imread(m.id);
      // cv.imshow('ys2', templ);
      // let templ = cv.imread(m01);
      // console.log(templ, templ1)
      // console.log(templ)
      let dst = new cv.Mat();
      let mask = new cv.Mat();

      cv.matchTemplate(src, templ, dst, cv.TM_CCORR_NORMED, mask);
      // TM_CCOEFF_NORMED 0
      // TM_CCOEFF 0
      // TM_CCORR_NORMED 1
      // TM_CCORR 0
      // TM_SQDIFF_NORMED 0
      // TM_SQDIFF 0

      let result = cv.minMaxLoc(dst, mask);
      let maxPoint = result.maxLoc;


      let color = new cv.Scalar(255, 0, 0, 255);
      let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
      if (maxPoint.x === 0 || point.x === src.cols || maxPoint.y === 0 || point.y === src.rows) return

      // console.log(maxPoint, point)
      let numberP0 = new cv.Point(maxPoint.x + templ.cols * 0.2, point.y);
      let numberP1 = new cv.Point(point.x + templ.cols * 0.1, point.y + templ.rows * 0.42);

      // 先灰度处理，方便识别数字
      let graySrc = new cv.Mat();
      cv.cvtColor(src, graySrc, cv.COLOR_RGBA2GRAY, 0);

      // 材料识别区域
      cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
      // console.log(maxPoint, point)
      // 材料数量区域

      cv.rectangle(src, numberP0, numberP1, color, 2, cv.LINE_8, 0);
      cv.imshow('canvasOutput', src);

      cv.imshow('imageCanvasInput', graySrc);

      let recgCanvas = document.getElementById("recg")

      let cvs = document.getElementById("imageCanvasInput")
      let ctx0 = cvs.getContext('2d');
      let myImageData = ctx0.getImageData(maxPoint.x + templ.cols * 0.3, point.y, templ.cols * 0.8, templ.rows * 0.45);
      recgNumber(m, recgCanvas, myImageData)
      // src.delete(); dst.delete(); mask.delete();
    })
  }
  return (
    <div>
      {
        md.map(m => <MaterialCanvasCard id={m.id}></MaterialCanvasCard>)
      }
      {
        Object.entries(data).map(d => {
          let [k, v] = d
          return <div> {v.name} : {v.have}</div>
        })
      }
      <div>
        {/* <img src={test03} /> */}
        {/* {
        files.map((file) => <img src={file} style={{ width: '100%' }} />)
      } */}
        <button onClick={handleAction}>识别</button>
        <button onClick={loadImage}>加载图片</button>
        <input type="file" id="fileInput" name="file"
          accept="image/*" onChange={(e) => {
            // console.log(e.target.files)
            e.target.files && setFiles(Array.from(e.target.files).map(f => URL.createObjectURL(f)))
          }} />

        <canvas id="recg"></canvas>

        <canvas id="imageCanvasInput"></canvas>
        <canvas id="canvasOutput"></canvas>
      </div>
    </div>

  );
}

export default App;
