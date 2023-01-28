<template>
  <!--  bg-paintBgImg -->
  <div 
    ref="paintContainer"
    class="flex-grow relative overflow-hidden"
    :class="{'cursor-crosshair': toolType !== TOOLTYPE.CURSOR}"
    @mousedown="handleMousedown"
  >
    <div class="absolute inset-0"><!-- 用于拖拽后记录偏移位置 --></div>
    <PaintCanvas
      class="relative z-50"
      v-bind="{...containerSize, ...curPaintData, isPaintCanvas: true}" 
    />
    <PaintCanvas
      class="absolute top-0 left-0"
      v-for="(item, index) in canvasDataList"
      :key="index"
      v-bind="{...containerSize, ...item}"
    ></PaintCanvas>
  </div>
</template>

<script lang='ts'>
export default {
  name: 'PaintContainer'
}
</script>

<script setup lang='ts'>
  import { ref, reactive, onMounted } from 'vue';
  import bus from '@/utils/eventbus'
  import PaintCanvas from './PaintCanvas.vue';
  import { TOOLTYPE, DEFAULTTOOL } from '@/utils/enum'
  import { pxToRatio } from '@/utils/common'

  // 容器相关
  const paintContainer = ref()
  const containerSize = reactive({
    width: 0,
    height: 0
  })
  const getPaintContainerSize = () => {
    const { clientWidth, clientHeight } = paintContainer.value
    containerSize.width = clientWidth
    containerSize.height = clientHeight
  }
  
  // 当前的工具类型
  const toolType = ref(DEFAULTTOOL)
  bus.$on('toolType:update', (type) => {
    if (type === TOOLTYPE.CLEAR) {
      canvasDataList.value = []
      return
    }
    toolType.value = type
  })

  // 封装pxToRatio
  const handlePxToRatio = (e: MouseEvent) => {
    return pxToRatio([e.offsetX, e.offsetY], [containerSize.width, containerSize.height])
  }

  // 全部绘图数据
  type CanvasData = {
    type: string,
    data: string[][]
    serial?: number
  }
  const canvasDataList = ref<CanvasData[]>([])

  // 鼠标按下：处理数据
  const isPainting = ref(false)
  const curPaintData = reactive<CanvasData>({
    type: '',
    data: [],
  })
  const handleMousedown = (e: MouseEvent) => {
    if(toolType.value === TOOLTYPE.CURSOR) return
    isPainting.value = true
    paintContainer.value.addEventListener('mousemove', handleMousemove)

    const ratioArr = handlePxToRatio(e)
    curPaintData.type = toolType.value
    curPaintData.data = [ratioArr]
    if (toolType.value === TOOLTYPE.XUHAO) {
      const serial = canvasDataList.value.reduce((pre, cur) => {
        return cur.type === TOOLTYPE.XUHAO ? pre + 1 : pre
      }, 1)
      curPaintData.serial = serial
    }
  }
  const handleMousemove = (e: MouseEvent) => {
    const ratioArr = handlePxToRatio(e)
    switch(toolType.value) {
      case TOOLTYPE.HUABI:
        curPaintData.data.push(ratioArr)
        break;
      case TOOLTYPE.JUXING:
      case TOOLTYPE.YUANQUAN:
      case TOOLTYPE.JIANTOU:
        curPaintData.data[1] = ratioArr
        break;
      case TOOLTYPE.XUHAO:
        curPaintData.data[0] = ratioArr
        break;
    }
  }
  const handleMouseup = () => {
    if (!isPainting.value) return
    isPainting.value = false
    paintContainer.value.removeEventListener('mousemove', handleMousemove)
    // 绘图数据
    if (curPaintData.data.length >= 2 || curPaintData.type === TOOLTYPE.XUHAO) {
      canvasDataList.value.push({...curPaintData})
    }
    curPaintData.data = []

    console.log('canvasDataList', canvasDataList.value)
  }
  document.addEventListener('mouseup', handleMouseup)

  onMounted(() => {
    getPaintContainerSize()
  })
</script>

<style lang='less' scoped>
</style>
