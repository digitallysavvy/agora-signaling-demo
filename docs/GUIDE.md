# Agora Real-Time Signaling
In today's fast-paced digital landscape, real-time communication and interaction are crucial for creating engaging web applications. By leveraging Agora's powerful signaling capabilities, we'll explore how to build a real-time synchronized user interface using JavaScript and the Agora Signaling SDK.

![project preview](/docs/images/final-project-preview.gif "Finished Project Preview")

Whether you're building a chat application, collaborative tool, or interactive experience, this guide will provide the foundational knowledge to create a responsive and synchronized UI. Adding user interactions that are instantly reflected across all connected clients enhances user engagement.

## Pre Requisites 
- [Node.JS](https://nodejs.org)
- A developer account with [Agora.io](https://console.agora.io)
- A basic understanding of HTML/CSS/JS
- A code editor, I like to use [VSCode](https://code.visualstudio.com)

## Setup Dev Environment

We'll use Vite's vanilla js template to set up the development environment. Open the terminal, navigate to your development folder, and use NPM to create the project.

```bash
npm create vite@latest real-time-signaling-demo -- --template vanilla
```

### Install the Agora Signaling SDK
After Vite completes, follow the instructions to install the initial dependencies and then use npm to install the Agora Signaling Web SDK.

```bash
npm i agora-rtm-sdk
```

## How It Works
Users will load the page and `click` a button to "Join".  This will trigger the client to subscribe to an Agora RTM Channel. Once in the channel, we'll use `<div/>` elements to represent each user and event handlers to manage the UI updates.

![project flow](/docs/images/signaling-flow-diagram.png "Project Flow")

As users join the channel, new `<div/>` elements will be added to the container and as they exit their respective `<div/>` elements will be removed from the container. Users in the channel will  interact by clicking on individual `<div/>` elements or tapping the space bar. These actions will trigger synchronized animations across all other users in the channel.

### Core Structure (HTML) 
Let's start by laying out our basic html structure. Open the [`index.html`](index.html) file and replace it with the code below.

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <link rel="icon" type="image/svg+xml" href="/vite.svg"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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

The structure is minimalistic. The body contains two main elements: the default `<app/>` and a `<container/>` that we'll use to add/remove `<div/>` elements as users join and leave the channel. Then we load two JavaScript files, [`ui.js`](ui.js)which will contain all the functions for manipulating the UI, and [`agora-signaling.js`](agora-signaling.js) to focus on implementation of the Agora Signaling SDK..

### Adding in CSS
Now that we have our HTML set up, we need to add our styles. Open the [`style.css`](style.css) file and add this CSS after the existing CSS.

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

The new CSS styles do basic things like setting the `#container` to 100% of the `view-width` and `view-height` and defines a class `.user` for all user `<div/>` elements to share. The two classes to take note of are `.wiggle-animation` and `.morph-animation`. We're going to use these to apply scaling and rotation animations to `<div/>` elements. We'll also use the `.fade` class to reduce opacity to 25%.

## UI.js
Create a new file [`ui.js`](ui.js) to handle dynamically adding/removing `<div/>` elements and managing the container's grid layout. This will include functions for adding animation and fade classes. These functions will be the backbone of the experience's interactivity.

We'll start by importing the [style.css](/style.css) to make the UI look nice. Then we'll get a reference to the `#container`, we're going to use this `<div/>` quite often and we don't want to request it each time we want to update the UI.

```javascript
import './style.css'

const contianer = document.getElementById('container')
```

Next, we'll declare a set of functions that handle adding and removing `<div/>` elements as users join and leave the channel. When the local user leaves the channel, we'll use `emptyContainer()` to clear the container and show the join button.

To keep things interesting after we create the user's `<div/>`, randomly assign it a background color. We'll add the user's id into the div as text. To ensure the text is legible, calculate the background's complimentary color and use that as the text-color. Then, add the user `<div/>` to the container and update the grid layout; keep the grid elements evenly sized and the layout responsive.

```javascript
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
```

Even though we're using CSS to handle the animations, we need Javascript to add and remove the appropriate classes. When the user clicks or taps the space bar, we'll add the appropriate CSS class. We know the timing of each animation loop so we'll use `setTimeout` to remove the corresponding CSS classes after a couple of loops.

```javascript

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
```

Since we only need the join button when users aren't in the channel, we'll want to dynamically add/remove the join button.

```javascript
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

## Agora Signaling
Before implementing the [Agora Signaling SDK](hhttps://www.agora.io/en/products/signaling/), let's discuss how it works at a high level. It starts with initializing the SDK by creating a `client`, and using that `client` to `subscribe` to a `channel`. Once in a `channel` the `client` can communicate with other users in the `channel` using `messages`.

With this understanding, create a new file [`agora-signaling.js`](agora-signaling.js) and import the `AgoraRTM` object from `agora-rtm-sdk`. Then we'll import each of the `exports` from [`ui.js`](ui.js). 

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
```

First, set up a constant for your Agora App ID and load that value from the environment file. Next, define the configuration for your `client` using `rtmConfig`. Leave the `token` empty, we'll fetch a fresh token before we join the channel.

```javascript
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
```

The Agora Signaling SDK usage is based on active unique user IDs per month, so we want to make sure each user has a persistent unique ID and avoid creating a new ID every time the user loads the page. For more details on this, see [`GeneratingUniqueIDs.md`](GeneratingUniqueIDs.md).

Using this unique `userId`, fetch an RTM token for that UID. Update the `rtmConfig` with the new token and initialize the Agora Signaling SDK. 

```javascript
// Generate a unique ID
const userId = await generateUniqueId()  
// get a token
rtmConfig.token = await getToken(userId)
// Initialize Agora Signaling Client
const client = new AgoraRTM.RTM(appId, userId, rtmConfig)
```

Before we log in or subscribe to any channels, we'll add the appropriate event listeners to the `client`. These listeners will be called based on events from all the channels joined. Each event will provide details such as the channel type, channel name, publisher, and other relevant details based on the event type.

```javascript
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
```

> For more information about the event details, see the [Event Listeners section of the Agora Signaling API documentation](https://docs.agora.io/en/signaling/reference/api?platform=web#event-listeners).

After addeding the listeners, use the `client` to connect with the Agora network using `login()`. 

Once the client is logged in, we can add the "Join" `<button />` element for users to click and subscribe to the channel. After users join a channel, we'll remove the "Join" `<button />` element. From there the callbacks we set earlier will handle the UI updates.

```javascript
// Login to Agora
try {
  const loginTimestamp = await client.login()
  console.log(`Signaling login success @ ${JSON.stringify(loginTimestamp)}`)
} catch (error) {
  console.log(`Signaling Error: ${error}`)
}

// Add the join button and listener
const joinBtn = await addJoinButton()
joinBtn.addEventListener('click', async (event) => {
  event.stopPropagation() // prevent the click from "bubbling up"

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
```

The `presence` callback is the first one triggered. It handles filling the container with `<div/>` elements representing the users in the channel.

```javascript
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
```

The core interaction of this demo will be users tapping the space bar or clicking on `<div/>` elements. These actions trigger animations for the other users in the channel. To do this, add listeners  for `click` and `keydown` events. When the local user taps the space bar or clicks on a `<div/>`, we'll create a message and publish it to the channel using the `client`.

We'll also include a listener for the Escape key, so users can unsubscribe from the channel. This will also clear the container and display the 'Join' `<button/>`.

```javascript
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
```

When the other users in the channel receive the `message` event, we'll parse the `message` payload and update the UI to either wiggle or scale a `<div/>` using the functions from [`ui.js`](ui.js).

```javascript
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
```

## Putting it all together
The majority of our logic will happen once the page loads, so we'll add an event listener for `DOMContentLoaded` and add the core logic in the callback. We'll designate the callback function as `async` so we can `await` promises and UI updates as needed.

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

// add the <button/> and subscribe logic
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
## Testing 
Since we are using Vite, testing locally is really easy, open the terminal at the project folder and run the command:

```bash
npm run dev
```
With the server running, it's time to test our code. We need to simulate multiple users in the channel, so open two or three web browsers (Safari, Chrome, Firefox) and click the join button from each.

![project preview](/docs/images/final-project-preview.gif "Finished Project Preview")

If you want to test with multiple devices you'll need a way to run the project with a secure `https` connection. You have two options: set up a custom SSL certificate for your local device; or use a service like [ngrok](https://ngrok.com), which creates a tunnel out from your local machine and provides an `https` url. In my experience, this is one of the simplest ways to run a publicly accessible `https` secured webserver on your local machine. 

## Fin. 
And just like that we are done! his foundational setup can be extended to build more complex real-time applications, enhancing user engagement in live voice and video streaming, in-app notifications, and other apps with interactive user experiences.

If you would like to see the demo in action, check out the [demo of the code in action](https://digitallysavvy.github.io/agora-signaling-demo/) on GitHub Pages 

Thanks for following along, and happy coding!

### Other Resources
Dive Deeper and learn advanced Signaling concepts like setting topics, using synchronization locks and persisting messages with storage. Check out [Agora's Signaling SDK docs](https://docs.agora.io/en/signaling/overview/product-overview?platform=web).
