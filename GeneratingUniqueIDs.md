# Generating Unique Ids.
This example uses a simple browser-based 'fingerprinting' algorithm to generate a unique ID. 

The goal is to reduce the end user's effort to engage with the demo web app, and minimize the usage impact. The aim was to remove the onus of manualy setting a `uid` without knowing if the id is unique, while avoiding creating a new unique id evertime the page loads.

> DISCLAIMER: This type of identifier makes the device uniquely identifiable and is menat be used for demostration purposes only. 

The code below is used to 'fingerprint' the user's browser, based on the user's broswer details and the output from a `<canvas />` element. The `<canvas />` element's output is unique to each broswer because of the difference in browsers handle rendering. 

This id is consistant across broswer tabs, and private broswser sessions when using the same browser application. A new id is generated for each broswer application regardles of using the same device. So a user can simulate multiple users by using multiple browser applications (Safari, Chrome, Firefox, Brave).

```javascript
// Generate unique ID
const generateUniqueId = async () => {
  // get device info and canvas output
  const detailData = JSON.stringify(getDeviceInfo()) + getCanvasDetail()
  // hash detail data using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(detailData))
  // convert to base64
  const haseBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer)))
  // remove special characters
  return haseBase64.replace(/\+/g,'_').replace(/\//g,'-').replace(/=+$/,'') 
}

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}X${screen.height}`,
    timzone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hasTouchScreen: navigator.maxTouchPoints > 0
  }
}

const getCanvasDetail = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'
  ctx.font = "14px 'Arel'"
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('Agora', 2, 15)
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7'
  ctx.fillText('Agora', 4, 17)
  return canvas.toDataURL()
}
```