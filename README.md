# agora-signaling-demo
An example of how to implement that Agora Signaling SDK for Web v 2.9.1 using vanilla javascript

A walk-through of the project setup and code: [GUIDE.md](GUIDE.md)

## Demo
![build deploy to pages workflow](https://github.com/digitallysavvy/agora-signaling-demo/actions/workflows/deploy-to-pages.yaml/badge.svg)

Test the build: [https://digitallysavvy.github.io/agora-signaling-demo/](https://digitallysavvy.github.io/agora-signaling-demo/)

## Setup
1. Clone the repo
2. Copy `.env-example` file and rename to `.env`
```bash
cp .env.example .env
```
3. Set the APP_ID, and TOKEN_SERVER env variables in the .env file

## Test in Dev mode
1. Follow steps in setup
2. Open the terminal and navigate to repo folder
3. Use this command to run dev mode with local webserver: 
```npm run dev```

## Build for production
1. Follow steps in setup
2. Open the terminal and navigate to repo folder
3. Use this command to run the build script: 
```npm run build```
4. Upload the contents of the new `dist` folder to your webserver
5. Make sure the server has your Agora API key set in the environment variables using the env variable `VITE_AGORA_APP_ID=`

## Deploy to GitHub Pages
This project is setup with a GitHub actions workflow to deploy the project to GitHub pages, if enabled in the project settings. 

To enable GitHub Pages build via GitHub Actions:
1. Clone or Fork the project (https://github.com/digitallysavvy/agora-signaling-demo/)
3. Click the project's Settings tab
4. Click the Pages tab in the left column menu
5. Under Build and deployment, select GitHub Actions as the Source
6. Click the Environments tab in the left column menu
7. Click github-pages from the Environments list
8. Click Add variable under the Environment variable section
9. Set the name `VITE_AGORA_APP_ID` and your Agora AppId as the value.
10. Repeat step 8 and add `VITE_AGORA_TOKEN_SERVER_URL` and the url to your [agora token service](https://github.com/AgoraIO-Community/agora-token-service) url.
10. (optional) If you used a different name for your github repo, update the `vit.config.js` file to update the url if you change the project name