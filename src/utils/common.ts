
export type PxArrType = number[]
export type RatioArrType = string[]
/**
 * @description: 
 * @param {PxArrType} origin
 * @param {PxArrType} target
 * @return {*}
 */
export function pxToRatio(origin: PxArrType, target: PxArrType) {
  return [(origin[0] / target[0]).toFixed(3), (origin[1] / target[1]).toFixed(3)]
}
/**
 * @description: 
 * @param {RatioArrType} origin
 * @param {PxArrType} target
 * @return {*}
 */
export function ratioToPx(origin: RatioArrType, target: PxArrType) {
  return [+((Number(origin[0]) * target[0]).toFixed(3)), +((Number(origin[1]) * target[1]).toFixed(3))]
}
