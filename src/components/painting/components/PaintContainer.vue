<template>
  <!--  bg-paintBgImg -->
  <div 
    ref="paintContainer"
    class="flex-grow relative overflow-hidden"
    :class="{'cursor-crosshair': toolType !== TOOLTYPE.CURSOR}"
    @mousedown="handleMousedown"
  >
    <div
      class="absolute w-full h-full bg-slate-300"
      ref="dragBox"
      :style="{
        left: dragData.left + 'px',
        top: dragData.top + 'px'
      }"
    ><!-- 用于拖拽后记录偏移位置 --></div>
    <PaintCanvas
      class="relative z-50"
      v-bind="{...containerSize, ...curPaintData, isPaintCanvas: true, dragData}" 
    />
    <PaintCanvas
      class="absolute top-0 left-0"
      v-for="(item, index) in canvasDataList"
      :key="index"
      v-bind="{...containerSize, ...item, dragData}"
    ></PaintCanvas>
  </div>
</template>

<script lang='ts'>
export default {
  name: 'PaintContainer'
}
</script>

<script setup lang='ts'>
  import { ref, reactive, onMounted, computed } from 'vue';
  import bus from '@/utils/eventbus'
  import PaintCanvas from './PaintCanvas.vue';
  import { TOOLTYPE, DEFAULTTOOL } from '@/utils/enum'
  import { pxToRatio, PxArrType } from '@/utils/common'

  onMounted(() => {
    getPaintContainerSize()
    // window.addEventListener('resize', getPaintContainerSize)
  })

  // 容器相关
  const paintContainer = ref()
  const dragBox = ref()
  const containerSize = reactive({
    width: 0,
    height: 0
  })
  const getPaintContainerSize = () => {
    const { clientWidth, clientHeight } = paintContainer.value
    containerSize.width = clientWidth
    containerSize.height = clientHeight
  }
  
  // 工具类型
  const toolType = ref(DEFAULTTOOL)
  bus.$on('toolType:update', (type) => {
    if (type === TOOLTYPE.CLEAR) {
      canvasDataList.value = []
      return
    }
    toolType.value = type
  })

  // 封装pxToRatio
  const handlePxToRatio = (origin: PxArrType) => {
    return pxToRatio(origin, [containerSize.width, containerSize.height])
  }

  // 绘图数据
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
  const dragData = reactive({
    lenX: 0,  // 开始位置与边界的距离
    lenY: 0,
    top: 0, // 偏移距离
    left: 0
  })
  const handleMousedown = (e: MouseEvent) => {
    paintContainer.value.addEventListener('mousemove', handleMousemove)
    const lenX = e.clientX - paintContainer.value.offsetLeft
    const lenY = e.clientY - paintContainer.value.offsetTop

    // 拖拽移动
    if(toolType.value === TOOLTYPE.CURSOR) {
      dragData.lenX = lenX - dragBox.value.offsetLeft
      dragData.lenY = lenY - dragBox.value.offsetTop
      return
    }
    
    // 绘画移动
    isPainting.value = true
    const ratioArr = handlePxToRatio([
      lenX - dragData.left,
      lenY - dragData.top
    ])
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
    const lenX = e.clientX - paintContainer.value.offsetLeft
    const lenY = e.clientY - paintContainer.value.offsetTop

    // 拖拽移动
    if(toolType.value === TOOLTYPE.CURSOR) {
      dragData.left = lenX - dragData.lenX
      dragData.top = lenY - dragData.lenY
      return
    }

    // 绘画移动
    const ratioArr = handlePxToRatio([
      lenX - dragData.left,
      lenY - dragData.top
    ])
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
    paintContainer.value.removeEventListener('mousemove', handleMousemove)

    if (!isPainting.value) return
    isPainting.value = false

    if (curPaintData.data.length >= 2 || curPaintData.type === TOOLTYPE.XUHAO) {
      canvasDataList.value.push({...curPaintData})
    }
    curPaintData.data = []

    // console.log('canvasDataList', canvasDataList.value)
  }
  document.addEventListener('mouseup', handleMouseup)

</script>

<style lang='less' scoped>
</style>
