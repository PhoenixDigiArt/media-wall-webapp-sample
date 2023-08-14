## Introduction

These sample projects are designed to assist artists with creating content for the media wall at Phoenix Cinema and Arts Centre, Leicester, UK. They are split into two sections, Unity and JavaScript. You can find the documentation for the Unity sample here: [INSERT LINK]. 

The JavaScript section consists of a basic sample project for inspiration and a bare-bones template with just the required code for initialising a scene. For this example, the Three.js library is used for 3D graphics. However, there are many other libraries that can be used, as well as using pure HTML and JS if desired. The samples use the webcam to allow for visitor interaction but this is not necessary.

Sample project: https://github.com/adamstephensun/media-wall-webcam-sample

Template project: https://github.com/adamstephensun/media-wall-webcam-template

## Start up guide

To begin, download either the sample or template project from the provided GitHub repositories and open them in your code editor of choice. If you are not familiar with IDE’s, Visual Studio Code is a popular option with good support and a wide range of functionality from the user-made extensions. To install the necessary libraries and dependencies to run the project, you will need NPM (Node Package Manager). You will find installation instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm. 

Once you have the project open and NPM installed, navigate to the base folder in your command line and run the command: `npm install`. Once all the files are installed, run the command: `npm run dev`. This will run a local server hosting your code to easily iterate and test your code. Simply save any changes and the local server will automatically refresh and update with the new changes.

## Template overview

The template project contains the essential code for creating a Three.js scene and accessing the webcam. It consists of an empty scene with several types of geometry, each showing the texture taken from the webcam. There are also a number of basic functions for creating primitive objects in three.js, such as a cube, sphere, and plane.

The template uses `lil-gui` as a debug UI for testing, allowing the developer to change parameters and trigger events during runtime. This should be disabled for deployment on to the media wall however.

### Webcam initialisation

The function `initWebcam()` will create a Three.js webcam texture and material using it. `initWebcam()` calls `getWebcam()` , a separate function for retrieving the webcam from the device which takes a Boolean parameter to determine if this is a test build or a deployment build. Use `true` when developing on your local machine and `false` when deploying to the media wall. This is needed due to the way that the media wall and it’s webcam are configured, the webcam is the second video device, not first.

Once the webcam is initialised in `getWebcam()` , the video feed can be used in a number of ways, such as applying it to a Three.js [VideoTexture](https://threejs.org/docs/?q=video#api/en/textures/VideoTexture). 

## Sample overview

The sample project consists of a Three.js scene that take a webcam feed and applies it to an array of physics-enabled cubes in a large box. The camera rotates and the cubes are periodically knocked over and reset. 

This sample uses CANNON.js as it’s physics engine. You begin by creating a CANNON physics world then when creating any Three.js object with physics you also create a corresponding CANNON body. The Three.js mesh and the CANNON body are added to a list of objects to update, then each frame all the mesh’s positions are updated to those of the physics bodies. 

## Deployment

This project is configured to use [Vercel](https://vercel.com/dashboard) as a hosting platform. Vercel is a free, well-featured solution for hosting a webpage but a number of alternatives are available, such as [Netlify](https://www.netlify.com/?attr=homepage-modal) or [Github Pages](https://pages.github.com/).

To use Vercel, you must first create an account. Once you have an account, run the npm command `npm run build` . There will be a number of steps to complete for the first build then subsequent builds will be completed with just the above npm command. 

To begin, select `continue with email` . Enter the email you signed up with then follow the comfirmation link in the email you received. When prompted with `Set up and deploy?` , ensure it shows the project folder then enter `Y` . When prompted to choose a scope to deploy to, there should be only one option. Select it to continue. When asked to `Link to an existing project?` enter `N` . Enter a project name or choose the default one and continue. When asked `In which directory is your project located?` keep `./` and continue. When prompted with a number of settings to change, enter `N` . Your project should begin deploying and after some time, will provide a live web link. You can then log into the Vercel website dashboard to view your page and additional information.

To test the project on the media wall, it will have to be added to the local CMS. Contact Irina or Adam with a live web link and we can add it to the CMS and test it out.

## External links

Three.js: https://threejs.org/

CANNON.js: https://schteppe.github.io/cannon.js/

Vercel: https://vercel.com/dashboard

Lil-gui: https://lil-gui.georgealways.com/
