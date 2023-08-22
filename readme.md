# Introduction

These sample projects are designed to assist artists with creating content for the media wall at Phoenix Cinema and Arts Centre, Leicester, UK. They are split into two sections, Unity and JavaScript. You can find the documentation for the Unity sample here: https://github.com/PhoenixDigiArt/media-wall-unity-bodytracking

The JavaScript section consists of a basic sample project for inspiration and a basic template with just the required code for initialising a scene and some example functionality. For this example, the Three.js library is used for 3D graphics. However, there are many other libraries that can be used, as well as using pure HTML and JS if desired. The samples use the webcam to allow for visitor interaction but this is not necessary.

Sample project: https://github.com/PhoenixDigiArt/media-wall-webapp-sample

Template project: https://github.com/PhoenixDigiArt/media-wall-webapp-template

# Start up guide

To begin, download either the sample or template project from the provided GitHub repositories and open them in your code editor of choice. These instructions will work with either the template or the sample. If you are new to coding, Visual Studio Code is a popular option with good support and a wide range of functionality from the user-made extensions. To install the necessary libraries and dependencies to run the project, you will need NPM (Node Package Manager). You will find installation instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm. 

Once you have the project open and NPM installed, navigate to the project folder in your command line (or in VS Code, click Terminal>New Terminal) and run the command: `npm install`. This will install all the packages and dependencies required for the code to run. Once all the files are installed, run the command: `npm run dev` . This will run a local server hosting your code to easily iterate and test your code. Simply save any changes and the local server will automatically refresh and update with the new changes.

# Template overview

The template project contains the essential code for creating a Three.js scene and accessing the webcam. It consists of an empty scene with several types of geometry, each showing the texture taken from the webcam. There are also a number of basic functions for creating primitive objects in three.js, such as a cube, sphere, and plane.

The template uses `lil-gui` as a debug UI for testing, allowing the developer to change parameters and trigger events during runtime. This should be disabled for deployment on to the media wall however.

To understand more about the basic components and requirements for setting up a Three.js scene, check the extensive [documentation](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) site. Also check out the showcase section on the [Three.js forums](https://discourse.threejs.org/c/showcase/7/l/top).

## Webcam initialisation

A video object is first declared in `index.html` at line 10. This HTML object is then accessed in the `initWebcam()` function.

The function `initWebcam()` will create a Three.js webcam texture and material using it. `initWebcam()` calls `getWebcam()` , a separate function for retrieving the webcam from the device which takes a Boolean parameter to determine if this is a test build or a deployment build. Use `true` when developing on your local machine and `false` when deploying to the media wall. This is needed due to the way that the media wall and it’s webcam are configured, the webcam is the second video device, not first. A tick box has been added to the GUI to toggle the camera during runtime.

Once the webcam is initialised in `getWebcam()` , the video feed can be used in a number of ways, such as applying it to a Three.js [VideoTexture](https://threejs.org/docs/?q=video#api/en/textures/VideoTexture). 

## Template functions

The template includes a number of simple functions for creating basic geometry and objects in Three.js. This includes functions for creating boxes, spheres, planes and loading assets. 

## 3D model loading

This sample contains a example of loading and displaying a 3D model in Three.js. All assets to be loaded (textures, models, audio) should all be placed in the `/static` folder. The preferred 3D model type for Three.js is .glTF/.glb, other model types are available but this type is best optimised for use on the web. Free tools such as Blender can be used to convert 3D model types.

To load the model, we use the GLTFLoader component which must be loaded into the script separately. the `loadModels()` function can be added to in order to load 3D assets. Models will contain groups within which the individual meshes are stored. To access the meshes and change properties such as material, you must iterate through the children of the loaded glTF object, as shown in the example teapot model.

## Extra Three.js modules

Three.js is rich with extra modules that add functionality to your webapp. The template uses `OrbitControls` for camera control and `GLTFLoader` to load assets but there are many more available. Here is a list of some useful modules:

- 3D text: https://threejs.org/docs/index.html?q=text#examples/en/geometries/TextGeometry
- Post processing: https://threejs.org/docs/index.html?q=post#manual/en/introduction/How-to-use-post-processing
- Cinematic camera: https://threejs.org/examples/?q=cinema
- Decal geomertry: https://threejs.org/docs/index.html?q=deca#examples/en/geometries/DecalGeometry
- Convex mesh breaker (with physics): https://threejs.org/examples/?q=break#physics_ammo_break

Browse the [Three.js examples and documentation](https://threejs.org/) for endless inspiration and to learn new features and implementations.

# Sample overview

The sample project consists of a Three.js scene that take a webcam feed and applies it to an array of physics-enabled cubes in a large box. The camera rotates and the cubes are periodically knocked over and reset. 

This sample uses CANNON.js as it’s physics engine. You begin by creating a CANNON physics world then when creating any Three.js object with physics you also create a corresponding CANNON body. The Three.js mesh and the CANNON body are added to a list of objects to update, then each frame all the mesh’s positions are updated to those of the physics bodies. To run this project you must install CANNON with the command `npm install cannon-es` .

# Deployment

This project is configured to use [Vercel](https://vercel.com/dashboard) as a hosting platform. Vercel is a free, well-featured solution for hosting a webpage but a number of alternatives are available, such as [Netlify](https://www.netlify.com/?attr=homepage-modal) or [Github Pages](https://pages.github.com/).

To use Vercel, you must first create an account. Once you have an account, run the npm command `npm install vercel`. Once Vercel is installed, run  `npm run build` . There will be a number of steps to complete for the first build then subsequent builds will be completed with just the above npm command. 

To begin, select `continue with email` . Enter the email you signed up with then follow the confirmation link in the email you received. When prompted with `Set up and deploy?` , ensure it shows the project folder then enter `Y` . When prompted to choose a scope to deploy to, there should be only one option. Select it to continue. When asked to `Link to an existing project?` enter `N` . Enter a project name or choose the default one and continue. When asked `In which directory is your project located?` keep `./` and continue. When prompted with a number of settings to change, enter `N` . Your project should begin deploying and after some time, will provide a live web link. You can then log into the Vercel website dashboard to view your page and additional information.

Detailed instructions on this process can be found on the great Three.js Journey course by Bruno Simon here: https://threejs-journey.com/lessons/go-live#deploy-for-the-first-time. This lesson is fortunately free but the rest are well worth paying for if you're interesting in going deeper into Three.js.

To test the project on the media wall, it will have to be added to the local CMS. Contact Irina or Adam with a live web link and we can add it to the CMS and test it out.

# Additional support

When working with JavaScript, there are endless possibilities and endless amounts of libraries and tools at your disposal. These projects are just a starting point, covering only a fraction of what is possible. While Three.js is a popular and well supported solution for 3D graphics in the browser, you may want to use 2D graphics, machine learning, ect. If you want to work beyond the templates but require some extra help, don't hesitate to contact any member of the arts team at Phoenix or Offsite. You can also contact Adam, the developer of the JavaScript templates [here](mailto:adam@adam-stephenson.co.uk).

# External links

Three.js: https://threejs.org/

CANNON.js: https://schteppe.github.io/cannon.js/

Vercel: https://vercel.com/dashboard

Lil-gui: https://lil-gui.georgealways.com/

Open call: https://www.phoenix.org.uk/events/open-call-the-wall-digital-revelations/
