export default class CardDownloadService {
  downloadCard(canvas) {
    if (canvas.msToBlob) { // for IE
      const blob = canvas.msToBlob()
      window.navigator.msSaveBlob(blob, 'YuGiOh.png')
      return
    }
    
    const a = document.createElement('a')
    a.href = canvas.toDataURL("image/jpeg")
    a.download = 'YuGiOh.jpg'
    a.click()
  }
}
