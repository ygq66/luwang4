import Css from './index.module.scss'
import React from 'react'
import {useState} from "react";
import fileService from "../../service/fileService";
import Ainput from "../../component/ainput/ainput";

export default function ImgConvertor() {
  const [imgPath, setImgPath] = useState('C:\\Users\\PC2021\\Downloads\\localhost3\\_DataURI')


  return <div>
    文件路径:<Ainput value={imgPath} setValue={setImgPath}/>
    <button onClick={() => {
      let res = fileService.listFiles(imgPath)

      if (!fileService.existsSync(imgPath + '\\img')) {
        fileService.mkdirSync(imgPath + '\\img')
      }

      console.log('所有文件', res)
      for (const re of res) {
        let data = fileService.readFileSync(`${imgPath}\\${re}`)
        console.log('获取文件', data)

        // 保存文件
        const path = imgPath + '\\img\\' + re.replace('.txt', '') + '.png';
        const base64 = data.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
        const dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
        fileService.writeFileSync(path, dataBuffer)
      }
      React.$message.success('保存成功')
    }}>读取
    </button>
    <div>
      <div></div>
    </div>
  </div>
}