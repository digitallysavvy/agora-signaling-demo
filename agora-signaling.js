import { RTMClient } from "agora-rtm-sdk"

// add on/off event handlers 
// - aligns with Agora RTC SDK event handlers
RTMClient.on = (eventName, callback) => {
  RTMClient.addEventListener(eventName, callback)
}

RTMClient.off = (eventName, callback) => {
  RTMClient.removeEventListener(eventName, callback)
}

// Config set up
const appId = import.meta.env.VITE_AGORA_APP_ID
const userId = '1416'
const token = ''
// Extended RTM Settings
const rtmConfig = {
  token: '',
  encryptionMode: '',
  cypherKey: '',
  salt: '',
  useStringUserId: false,
  presencetimeout: 300, // defualt
  logUpload: true,
  logLevel: '',
  cloudProxy: false,
}
