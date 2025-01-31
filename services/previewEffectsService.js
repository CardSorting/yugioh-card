export default class PreviewEffectsService {
  constructor(wrapperElement) {
    this.perspective = wrapperElement?.clientWidth || 1000
    this.rotateX = 0
    this.rotateY = 0
    this.scale = 1
    this.THRESHOLD = 5
  }

  getTransformStyle() {
    return {
      transform: `perspective(${this.perspective}px) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale})`
    }
  }

  handleMouseMove(event) {
    const { clientX, clientY, currentTarget } = event
    const { clientWidth, clientHeight, offsetLeft, offsetTop } = currentTarget

    const horizontal = (clientX - offsetLeft) / clientWidth
    const vertical = (clientY - offsetTop) / clientHeight

    this.perspective = clientWidth
    this.rotateX = (vertical * this.THRESHOLD - this.THRESHOLD / 2).toFixed(2)
    this.rotateY = (this.THRESHOLD / 2 - horizontal * this.THRESHOLD).toFixed(2)
    this.scale = 1
  }

  handleMouseLeave(event) {
    this.perspective = event.currentTarget.clientWidth
    this.rotateX = 0
    this.rotateY = 0
    this.scale = 1
  }
}
