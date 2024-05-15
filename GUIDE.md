# Agora Real-Time Signaling
In this guide we'll walk through how to build a simple signaling web app, using the Agora Signaling Web SDK, demostrating how to implement messaging channel features.

Given today’s fragmented JS landscape, this tutorial is HTML, CSS, and vanilla JS. In this guide we will be using Vite for the dev environment.

## Pre Requisites 
- [Node.JS](https://nodejs.org)
- A developer account with [Agora.io](https://console.agora.io)
- A basic understanding of HTML/CSS/JS
- A code editor, I like to use [VSCode](https://code.visualstudio.com)

## Setup Dev Environment

We are going to use Vite to handle the dev environment. Open the terminal, navigate to your dev folder, and use NPM to create our project.

```bash
npm create vite@latest
```

Follow the Vite instructions: give your project a name `real-time-signaling-demo`, select `Vanilla` as the framework, and select `javascript` as the variant and hit enter. 

Once the project is set up, open the project folder in your code editor.

### Install the Agora Signaling SDK
With the new project setup, open the project folder in the terminal and use `npm` to install the Agora Signaling Web SDK.
```bash
npm i agora-rtm-sdk
```

## How It Works
This web-app will demonstrate the presence and messaging features of the Agora signaling SDK. When users load the page they will click a button to "Join", this will initilize the Agora RTM SDK and join the Agora RTM Channel. Once in the channel divs will be used to represent each user, as users join the channel new divs will be added to the container. Users in the channel will be able to interact with each other by clicking on individual divs or tapping the space bar to trigger animations that everyone else in the channel can see.

### Core Structure (HTML) 
Let’s start by laying out our basic html structure. Open the [`index.html`](index.html) file and replace it with the code below.

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Real-Time Signaling using Agora</title>
  </head>
  <body>
    <div id="app">
      <div id="container"></div>
    </div>
    <script type="module" src="/ui.js"></script>
    <script type="module" src="/agora-signaling.js"></script>
  </body>
</html>
```

The structure is minimalistic, the body contains two main elements, the default `<app />`  and a `<container />` that we will use to add/remove `<div />`'s as users join and leave the channel. Then we load two javascript files, [`ui.js`](ui.js) that will contain all the functions for manipulating the UI, and [`agora-signaling.js`](agora-signaling.js) which focuses on the implimentation of the Agora Signaling SDK.

### Adding in CSS
Now that we have our html set up, we need to add our styles. Open the [`style.css`](style.css) file and add this CSS below the existing CSS.

```CSS

body { 
  margin: 0;
}

#container {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
  grid-auto-rows: minmax(10px, 1fr);
  gap: 0px;
  overflow: hidden;
}

.user {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5vw;
  box-sizing: border-box;

}

/* Animations */
.wiggle-animation {
  animation: wiggle 2s linear;
  animation-iteration-count: 3;
}

@keyframes wiggle {
  0%, 7%    { transform: rotateZ(0); }
  15%       { transform: rotateZ(-15deg); }
  20%       { transform: rotateZ(10deg); }
  25%       { transform: rotateZ(-10deg); }
  30%       { transform: rotateZ(6deg); }
  35%       { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }  
}

.morph-animation {
  animation: morph 1s linear;
  animation-iteration-count: 2;
}

@keyframes morph {
  0% {
    border-radius: 0;
    transform: rotate(0deg);
    transform: scale(1, 1);
    z-index: 1;
  }
  50% {
    border-radius: 10%;
    opacity: 50%;
    transform: scale(1.25, 1.25);
    z-index: 5;
  }
  100% {
    border-radius: 0;
    transform: scale(1, 1);
    z-index: 1;
  }
}

.fade {
  opacity: 25%;
  border: 2px #747bff dotted;
}

```

The new CSS styles set the `#container` to 100% of the `view-width` and `view-height` and defines a class `.user` for all user `<div />`'s to share. The new styles also contain a two classes for adding scaling and rotation animations to `<div/>` elements, and a class to fade a div to 25% opacity. 

## UI.js
Now that we have the HTML/DOM structure laid out, and have defined our styles we are ready to add in the JS. Create a new file [`ui.js`](ui.js) and the code below.

```javascript
import './style.css'

const contianer = document.getElementById('container')

// create and add a new div element with id
export const addDiv = (id) => {
  // return early if div exists 
  if (document.getElementById(id)) return
  
  // create div
  const div = document.createElement('div')
  div.className = 'user'
  div.id = id
  div.textContent = `0x${id}` // replace with Id

  // create random background color
  const hue = Math.random() * 360
  const saturation =  Math.random() * 100
  const lightness = (Math.random() * 60) + 20
  div.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  // calculate complimentary color and lightness for the text
  const complimentHue = (hue + 180) * 360
  const complimentLightness = lightness < 50 ? 80 : 20
  div.style.color = `hsl(${complimentHue}, ${saturation}%, ${complimentLightness}%)` 

  contianer.appendChild(div)
  adjustGrid()
}

// remove div element with id
export const removeDiv = async (id) => {
  const div = document.getElementById(id)
  if (div) {
    div.remove()
    adjustGrid()
  }
}

// clear container content
export const emptyContainer = async () => {
  contianer.replaceChildren([])
  adjustGrid()
}

// adjust the container grid layout
const adjustGrid = () => {
  const divs = contianer.querySelectorAll('.user')
  const numDivs = divs.length > 0 ? divs.length : 1
  let cols = Math.ceil(Math.sqrt(numDivs))
  let rows = Math.ceil(numDivs/cols)

  contianer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
  contianer.style.gridTemplateRows = `repeat(${rows}, 1fr)`
}

// add a wiggle animation class - remove after 6s
export const addWiggleAnimation = (div) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('wiggle-animation')){
    div.classList.add('wiggle-animation')
    // remove the animation after 6s
    setTimeout(() => {
      div.classList.remove('wiggle-animation')
    }, 6000)
  }
}

// add a morph animation class - remove after 2s
export const addMorphAnimation = (div) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('morph-animation')){
    div.classList.add('morph-animation')
    // remove the animation after 2s
    setTimeout(() => {
      div.classList.remove('morph-animation')
    }, 2000)
  }
}

// add a fade class - remove after given duration
export const addFade = (div, duration) => {
  // only add the class if the div doesn't already have it
  if (!div.classList.contains('fade')){
    div.classList.add('fade')
    // remove the animation after given duration
    setTimeout(() => {
      div.classList.remove('fade')
    }, duration)
  }
}

// add join <button/> element
export const addJoinButton = async () => {
  const button = document.createElement('button')
  button.id = 'join-channel'
  button.textContent = 'Join'
  container.appendChild(button)

  return button
}

// remove join <button/> element
export const removeJoinButton = () => {
  const button = document.getElementById('join-channel')
  if (button) {
    button.remove()
  }
}
```

The [`ui.js`](ui.js) imports the `style.css`, defines functions for dynamically adding/removing `<div/>` elements and managing the container's grid layout, along with functions for adding the animation and fade classes. 

## Agora Signaling

The [Agora Signaling SDK](hhttps://www.agora.io/en/products/signaling/) simplifies the development process for building scalable real-time signaling applications. Agora Signaling SDK is pretty straight forward in how it works: you initialize the SDK by creating a `client`, use that client to `subscribe` to a `channel`. Once in a `channel` use the `client` to publish messages into the channel, for all other users in the channel to receive. 

To implement the Agora Signaling SDK, create a new file [`agora-signaling.js`](agora-signaling.js) and import the `AgoraRTM` object from `agora-rtm-sdk`. Then we'll import each of the `exports` from [`ui.js`](ui.js). 

First, set up a constant for your Agora App ID and load that value from the environment file. Next, define the configuration for your `client` using `rtmConfig`. Leave the `token` empty since we make a call to our token server to get a fresh token once the page loads. 

Speaking of once the page loads, the majority our logic will happen onces the page loads, so we'll add an event listener for `DOMContentLoaded`, and designate the callback function as `async` so we can `await` promises and ui updates as needed. 

One of the first things we do is generate the a unique Id for users. The Agora Signaling SDK usage is based on active unique user id's per month, so we want to make sure each user has a persistent unique id and aovid creating a new id everytime the use loads the page. For more details on this see [`GeneratingUniqueIDs.md`](GeneratingUniqueIDs.md). 

Once we have a unique ID, we can fetch a token for that uid, update the `rtmConfig` and initialize the Agora Signaling SDK by creating a new `client`. Before we login or subscribe to any channel's we'll add the appropriate event listeners to the `client`. These listners will get called based on events from all the channels joined. Each event will provide details such as the channel type, channel name, publsher, and other relavent details based on the event type. 

> For more information about the event details see the [Event Listeners section of Agora Signaling API documentation](https://docs.agora.io/en/signaling/reference/api?platform=web#event-listeners).

After we've added the listerns we can use the `client` to connect to the Agora network using `login()`, once the client is logged in, we can add the 'Join' `<button />` element so users can subscribe to the channel. 

Once users join a channel, we'll remove the 'Join' `<button />` element and let the `presence` event callback we set earlier handle filling the container with the `<div/>` elments representing the users in the channel.

We'll add some event listeners for clicking on divs and tapping the space bar. When the local user triggers either of those events we'll create a message and publish it to the channel using the `client`. When the other users in the channel receive the `message` event, we'll parse the `message` payload and update the ui to either wiggle a div or scale it using the functions from [`ui.js`](ui.js).

We'll also include a listener for the `Escape` key, so users can `unsubscribe` from the channel. This will also clear the container and display the 'Join' `<button />`.

```javascript
import AgoraRTM from "agora-rtm-sdk"
import { 
  addDiv, 
  removeDiv,
  addWiggleAnimation, 
  addMorphAnimation, 
  addFade, 
  addJoinButton, 
  removeJoinButton, 
  emptyContainer } from "./ui"

// Config set up
const appId = import.meta.env.VITE_AGORA_APP_ID

// Extended RTM Settings
const rtmConfig = {
  token: '',
  encryptionMode: '',
  cypherKey: '',
  salt: '',
  useStringUserId: true,
  presencetimeout: 300, // defualt
  logUpload: true,
  logLevel: '',
  cloudProxy: false,
}

// Wait for page to load, then join Agora RTM
document.addEventListener('DOMContentLoaded', async () => {
  // Generate a unique ID
  const userId = await generateUniqueId()  
  // get a token
  rtmConfig.token = await getToken(userId)
  // create client
  const client = new AgoraRTM.RTM(appId, userId, rtmConfig)

  // add event listeners 
  // - NOTE: only add 1 set of listeners total. 
  //   these will trigger based on events from all channels joined.
  addAgoraSignalingEventListeners(client)

  // Login to Agora
  try {
    const loginTimestamp = await client.login()
    console.log(`Signaling login success @ ${JSON.stringify(loginTimestamp)}`)
  } catch (error) {
    console.log(`Signaling Error: ${error}`)
  }

  // Set the name for the channel to subscribe to
  const channelName = 'test'

  // Add the join button and listener
  addJoin(client, channelName)

  // add click event listenter
  document.body.addEventListener('click', event => {
    // get a reference to the div that was clicked
    const div = event.target
    // fade the div locally, & send a message using RTM
    addFade(div, 6000)
    // create a string message that can be parsed by receiever
    const message = JSON.stringify({
      userEvent: 'click',
      target: div.id
    })
    // Send the message into the chanel
    client.publish(channelName, message)
  })

  document.body.addEventListener('keydown', event => {
    // space bar event
    if (event.code == 'Space') {
      // fade the div locally, & send a message using RTM
      addFade(event.target, 2000) // target is the window - fades all divs
      // create a string message to send
      const message = JSON.stringify({
        userEvent: 'Space',
      })
      // Send the message into the chanel
      client.publish(channelName, message)
    }

    // Leave the channel on esc
    if (event.code == 'Escape') {
      leave(client, channelName)
    }
  })
})

// add the <button /> and subscribe logic
const addJoin = async (client,channelName) => {
  const joinBtn = await addJoinButton()
  joinBtn.addEventListener('click', async (event) => {
    // prevent the click from "bubbling up"
    event.stopPropagation() 

    try {
      // set which types of messages you want to subscribe to
      const subscribeOptions = {
        withMessage: true,
        withPresence: true,
        withMetadata: false,
        withLock: false,
      }
      await client.subscribe(channelName, subscribeOptions)
      // once user joins the 'presence' event will be triggered
      removeJoinButton() // remove the join button
    } catch (error) {
      console.warn(error)
    }
  })
}

// handle leaving the channel and cleaning up the ui
const leave = async (client,channelName) => {
  client.unsubscribe(channelName)   // unsubcribe from the channel
  await emptyContainer()            // clear the container div contents
  addJoin(client,channelName)       // add the join button 
}

// Add Event Listeners
const addAgoraSignalingEventListeners = (client) => {
  // message events
  client.addEventListener('message', eventArgs => {
    console.log(`message event:`)
    console.log(eventArgs)
    handleMessageEvent(eventArgs)
  })
  // status events
  client.addEventListener('status', eventArgs => {
    console.log(`status event:`)
    console.log(eventArgs)    
  })
  // presence events
  client.addEventListener('presence', eventArgs => {
    console.log(`presence event:`)
    console.log(eventArgs) 
    handlePresenceEvent(eventArgs)   
  })
  // storage events
  client.addEventListener('storage', eventArgs => {
    console.log(`storage event:`)
    console.log(eventArgs)    
  })
  // topic events
  client.addEventListener('topic', eventArgs => {
    console.log(`topic event:`)
    console.log(eventArgs)    
  })
  // lock events
  client.addEventListener('lock', eventArgs => {
    console.log(`lock event:`)
    console.log(eventArgs)    
  })
  // token expire event
  client.addEventListener('TokenPriviledgeWillExpire', eventArgs => {
    console.log(`Token Priviledge Will Expire event:`)
    console.log(eventArgs)    
    renewToken(client, channelName) // fetch and renew token
  })
}

const handlePresenceEvent = (eventArgs) => {
  const {eventType, publisher, stateChanged, snapshot: userList} = eventArgs
  // First time local user joins - SNAPSHOT event with empty publisher
  if (eventType == 'SNAPSHOT' && publisher == '') {
    // Add div for each user in the list.
    // - NOTE: this list includes the local user
    for (const userIndex in userList) {
      const user = userList[userIndex]
      addDiv(user.userId)
    }
  } else if (eventType == 'REMOTE_JOIN') {
    addDiv(publisher)
  } else if (eventType === 'REMOTE_LEAVE') {
    removeDiv(publisher)
  }
}

// parse the message event and apply animation
const handleMessageEvent = (eventArgs) => {
  const {messageType, publisher, message: messagePayload, publishTime} = eventArgs
  if (messageType === 'STRING') {
    const msg = JSON.parse(messagePayload)
    const userEvent = msg.userEvent
    if (userEvent === 'click') {
      const div = document.getElementById(msg.target)
      addWiggleAnimation(div)
    }      
    else if (userEvent === 'Space') {
      const div = document.getElementById(publisher)
      addMorphAnimation(div)
    }
  }

}

// Generate unique ID
const generateUniqueId = async () => {
  const detailData = JSON.stringify(getDeviceInfo()) + getCanvasDetail()
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(detailData))
  const haseBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer)))
  return haseBase64.replace(/\+/g,'_').replace(/\//g,'-').replace(/=+$/,'') // remove special characters
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

// Fetch a token from the token server
const getToken = async (uid, expiration = 3600) => {
  // Token-Server using: AgoraIO-Community/agora-token-service
  const tokenServerURL = import.meta.env.VITE_AGORA_TOKEN_SERVER_URL + 'getToken'
  const tokenRequest = {
    "tokenType": "rtm",
    "uid": uid,
    // "channel": channelName, // optional: passing channel gives streamchannel. wildcard "*" is an option.
    "expire": expiration // optional: expiration time in seconds (default: 3600)
  }

  try {
    const tokenFetchResposne = await fetch(tokenServerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(tokenRequest)
    })
    const data = await tokenFetchResposne.json()
    return data.token

  } catch (error) {
    console.log(`fetch error: ${error}`)
  }
}

// fetch a new token and update the client
const renewToken = async (client, channelName) => {
  const newToken = await getToken(userId, channelName)
  client.renewToken(newToken, { channelName: channelName})
}

```