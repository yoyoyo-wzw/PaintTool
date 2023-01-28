<template>
  <canvas ref="paintCanvas" :style="{left: canvasOffset.left + 'px', top: canvasOffset.top + 'px'}"></canvas>
</template>

<script lang='ts'>
export default {
  name: 'PaintCanvas'
}
</script>

<script setup lang='ts'>
  import { ref, reactive, watch, onMounted } from 'vue'
  import { ratioToPx, pxToRatio, RatioArrType } from '@/utils/common'
  import { TOOLTYPE } from '@/utils/enum'

  const props = defineProps<{
    width: number,
    height: number,
    type: string,
    data: string[][],
    serial?: number,
    isPaintCanvas?: boolean
  }>()

  onMounted(() => {
    if (!props.isPaintCanvas) {
      initCanvas()
      startPaint()
    }
  })

  // 封装ratioToPx
  const handleRatioToPx = (origin: RatioArrType) => {
    return ratioToPx(origin, [props.width, props.height])
  }
  // 封装pxToRatio
  const handlePxToRatio = (e: MouseEvent) => {
    return pxToRatio([e.offsetX, e.offsetY], [props.width, props.height])
  }

  // 初始化canvas
  const paintCanvas = ref()
  const ctx = ref()
  const canvasOffset = reactive({
    left: 0,
    top: 0
  })
  const initCanvas = () => {
    ctx.value = paintCanvas.value.getContext('2d')
    if (props.isPaintCanvas) {
      paintCanvas.value.width = props.width
      paintCanvas.value.height = props.height
      return
    }

    // canvas元素大小计算
    let minRatioX = 1, minRatioY = 1, maxRatioX = 0, maxRatioY = 0
    props.data.forEach(([ratioX, ratioY]) => {
      minRatioX = Math.min(minRatioX, +ratioX)
      minRatioY = Math.min(minRatioY, +ratioY)
      maxRatioX = Math.max(maxRatioX, +ratioX)
      maxRatioY = Math.max(maxRatioY, +ratioY)
    })

    // 圆圈：鼠标滑动的距离只代表半径，整圆需要额外处理
    if (props.type === TOOLTYPE.YUANQUAN) {
      const [startX, startY] = handleRatioToPx(props.data[0])
      const [endX, endY] = handleRatioToPx(props.data[1])
      const radiusPx = Math.pow(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2), 0.5)
      const [radiusRatioX, radiusRatioY] = handlePxToRatio({offsetX: radiusPx, offsetY: radiusPx} as MouseEvent)
      
      const [originX, originY] = props.data[0]
      minRatioX = +originX - +radiusRatioX
      minRatioY = +originY - +radiusRatioY
      maxRatioX = +originX + +radiusRatioX
      maxRatioY = +originY + +radiusRatioY
    }
    
    // 小数点计算不精准，加点额外偏差防止出问题
    const patchNum = 0.01
    minRatioX -= patchNum
    minRatioY -= patchNum
    maxRatioX += patchNum
    maxRatioY += patchNum

    let [width, height] = handleRatioToPx([(maxRatioX - minRatioX).toString(), (maxRatioY - minRatioY).toString()])
    // canvas最小宽高尺寸
    const minSize = 30
    paintCanvas.value.width = Math.max(width, minSize)
    paintCanvas.value.height = Math.max(height, minSize)

    const [left, top] = handleRatioToPx([minRatioX.toString(), minRatioY.toString()])
    canvasOffset.left = left - (minSize - width > 0 ? (minSize - width) / 2 : 0)
    canvasOffset.top  = top - (minSize - height > 0 ? (minSize - height) / 2 : 0)
    
  }
  watch([() => props.width, () => props.height], () => {
    initCanvas()
  })

  // 开始绘画
  const startPaint = () => {
    if (props.data.length === 0) {
      clearCanvas()
      return
    }
    handlePaint()
  }
  watch(() => props.data, () => {
    startPaint()
  }, { deep: true })
  
  // 清除画布
  const clearCanvas = () => {
    ctx.value.clearRect(0, 0, props.width, props.height)
  }
  // 处理绘画
  const handlePaint = () => {
    clearCanvas()
    ctx.value.beginPath()
    ctx.value.lineWidth = 1
    ctx.value.strokeStyle = "blue"

    const { left: canvasLeft, top: canvasTop } = canvasOffset
    const [startX, startY] = handleRatioToPx(props.data[0])

    switch(props.type) {
      case TOOLTYPE.HUABI:
        handleHuabi({canvasLeft, canvasTop, startX, startY});
        break;
      case TOOLTYPE.JUXING:
        handleJUXING({canvasLeft, canvasTop, startX, startY})
        break;
      case TOOLTYPE.YUANQUAN:
        handleYUANQUAN({canvasLeft, canvasTop, startX, startY})
        break;
      case TOOLTYPE.JIANTOU:
        handleJIANTOU({canvasLeft, canvasTop, startX, startY})
        break;
      case TOOLTYPE.XUHAO:
        handleXUHAO({canvasLeft, canvasTop, startX, startY})
        break;
    }
    ctx.value.stroke()
  }

  interface HandlePaintParams {
    canvasLeft: number,
    canvasTop: number,
    startX: number,
    startY: number,
  }
  
  // 画笔
  const handleHuabi = ({canvasLeft, canvasTop, startX, startY}: HandlePaintParams) => {
    // console.log('画笔')
    ctx.value.moveTo(startX - canvasLeft, startY - canvasTop)
    let data = props.data.slice(1)
    data.forEach(item => {
      const [curX, curY] = handleRatioToPx(item)
      ctx.value.lineTo(curX - canvasLeft, curY - canvasTop)
    })

  }
  // 矩形
  const handleJUXING = ({canvasLeft, canvasTop, startX, startY}: HandlePaintParams) => {
    // console.log('矩形')
    if (props.data.length < 2) return
    const [x, y] = [startX - canvasLeft, startY - canvasTop]
    const [endX, endY] = handleRatioToPx(props.data[1])

    const [wdith, height] = [endX - startX, endY - startY]
    ctx.value.strokeRect(x, y, wdith, height);
  }
  // 圆圈
  const handleYUANQUAN = ({canvasLeft, canvasTop, startX, startY}: HandlePaintParams) => {
    // console.log('圆圈')
    if (props.data.length < 2) return
    const [x, y] = [startX - canvasLeft, startY - canvasTop]
    const [endX, endY] = handleRatioToPx(props.data[1])

    const radius  = Math.pow(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2), 0.5)
    ctx.value.arc(x, y, radius, 0, Math.PI * 2, true)
  }
  // 箭头
  const handleJIANTOU = ({canvasLeft, canvasTop, startX: x1, startY: y1}: HandlePaintParams) => {
    // console.log('箭头')
    if (props.data.length < 2) return
    const len = 20, deg = 30
    const [x2, y2] = handleRatioToPx(props.data[1])
    const a = Math.atan2((y2 - y1), (x2 - x1));
    const x3 = x2 - len * Math.cos(a + deg * Math.PI/180);
    const y3 = y2 - len * Math.sin(a + deg * Math.PI/180);
    const x4 = x2 - len * Math.cos(a - deg * Math.PI/180);
    const y4 = y2 - len * Math.sin(a - deg * Math.PI/180);
    ctx.value.moveTo(x1 - canvasLeft, y1 - canvasTop)
    ctx.value.lineTo(x2 - canvasLeft, y2 - canvasTop)
    ctx.value.moveTo(x3 - canvasLeft, y3 - canvasTop)
    ctx.value.lineTo(x2 - canvasLeft, y2 - canvasTop)
    ctx.value.lineTo(x4 - canvasLeft, y4 - canvasTop)
    ctx.value.lineWidth = 2
  }
  // 序号
  const handleXUHAO = ({canvasLeft, canvasTop, startX, startY}: HandlePaintParams) => {
    // 半径、字体大小
    const radius = 14, fontSize = 16
    const [x, y] = [startX - canvasLeft, startY - canvasTop]

    ctx.value.arc(x, y, radius, 0, Math.PI * 2, true)

    ctx.value.font = `${fontSize}px sans-serif`
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(props.serial, x, y + 2);
  }
  
  
</script>

<style lang='less' scoped>
</style>