import AgoraRTM from "agora-rtm-sdk"

// Config set up
const appId = import.meta.env.VITE_AGORA_APP_ID
const userId = '1416'
const channelName = 'test'

// Extended RTM Settings
const rtmConfig = {
  token: '007eJxSYHgXJOnu9yf3euEKPlUtxlfr7v4PWHxGbEXU87jt2ZYn7FoVGCwMDS0Nkk2NLM0NU0wMDEySzI1MTJJSklMsjVON0oxNDk20SxPgY2AQqTFmYWRgYmBkYGQA8VkYSlKLSwABAAD//+b4HUk=',
  encryptionMode: '',
  cypherKey: '',
  salt: '',
  useStringUserId: false,
  presencetimeout: 300, // defualt
  logUpload: true,
  logLevel: '',
  cloudProxy: false,
}



document.addEventListener('DOMContentLoaded', async () => {

  console.log(`appId: ${appId}, userId: ${userId}, channelName: ${channelName}`)
  // create client
  
  const client = new AgoraRTM.RTM(appId, userId, rtmConfig)
  // addAgoraSignalingEventListeners(client)

  // login to Agora
  try {
    const loginTimestamp = await client.login()
    console.log(`Signaling login success @ ${loginTimestamp}`)
  } catch (error) {
    console.log(`Signaling Error: ${error}`)
  }
  

})



const addAgoraSignalingEventListeners = (client) => {
  // add on/off event handlers - aligns with Agora RTC SDK event handlers
  client.on = (eventName, callback) => {
    client.addEventListener(eventName, callback)
  }

  client.off = (eventName, callback) => {
    client.removeEventListener(eventName, callback)
  }

  // Add Event Listeners
  client.on('message', (event) => {

  })

  client.on('status', (event) => {
    
  })

  client.on('presence', (event) => {
    
  })

  client.on('storage', (event) => {
    
  })

  client.on('topic', (event) => {
    
  })

  client.on('lock', (event) => {
    
  })

  client.on('TokenPriviledgeWillExpire', (event) => {
    
  })
}

