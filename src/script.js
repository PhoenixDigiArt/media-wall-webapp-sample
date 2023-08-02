import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let canvas, renderer, scene, camera, controls
let sizes, aspectRatio, mouse, clock, oldElapsedTime
let planeGeometry, sphereGeo, torusKnotGeo, planeVideoMesh, sphereVideoMesh, torusKnotVideoMesh
let debugGui
let ambientLight
let video, videoTex, videoMaterial

let lerpActive = false
let lerpParam, lerpStart, lerpTarget, lerpStartTime

let tParamsNum, tRadius, tTube, tTubeSegments, tRadialSegments, tP, tQ
let tParams

// Array to store parameters used in the debug UI
const parameters = {
    orbitControls: true,
    autoRotate: false,
    torusRadius: 1,
    torusTube: 0.3,
    torusTubeSegments: 64,
    torusRadialSegments: 8,
    torusP: 2,
    torusQ: 3
}

init()

function init(){
    // Master function to initialise variables and call other initialisation functions

    mouse = new THREE.Vector2()

    //// Screen
    sizes = { width: window.innerWidth, height: window.innerHeight}
    aspectRatio = sizes.width / sizes.height

    //// Update
    clock = new THREE.Clock()
    oldElapsedTime = 0

    //// Torus parameters
    tParamsNum = 6

    tParams = []
    tParams.push(new THREE.Vector2(0.01, 10))
    tParams.push(new THREE.Vector2(0.01, 10))
    tParams.push(new THREE.Vector2(0.01, 128))
    tParams.push(new THREE.Vector2(0.01, 64))
    tParams.push(new THREE.Vector2(0.01, 10))
    tParams.push(new THREE.Vector2(0.01, 10))
    console.log(tParams)

    //// Initialisers
    initScene()
    initGui()
    initWebcam()

    startTorusLoop()
}

function initScene(){
    // Initialises all the key components of a three.js scene

    //// Rendering
    canvas = document.querySelector('canvas.webgl')
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    //// Scene, camera, controls lighting
    scene = new THREE.Scene()
    
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(0, 0, 10)
    scene.add(camera)
    camera.far = 10000

    controls = new OrbitControls(camera, canvas)    // orbit controls for viewing the scene during development
    controls.enableDamping = true

    ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
}

function initGui(){
    // Initialises an instance of datGUI, a gui to be used during development. Hide this on the final product
    debugGui = new dat.GUI()

    debugGui.add(parameters, 'orbitControls').onChange( function(){ controls.enabled = parameters.orbitControls } )
    debugGui.add(parameters, 'autoRotate').onChange( function(){ controls.autoRotate = parameters.autoRotate } )
    debugGui.add(parameters, 'torusRadius').min(0.01).max(10).onChange( updateTorusGeo ).listen()
    debugGui.add(parameters, 'torusTube').min(0.01).max(10).onChange( updateTorusGeo ).listen()
    debugGui.add(parameters, 'torusTubeSegments').min(0.01).max(128).onChange( updateTorusGeo ).listen()
    debugGui.add(parameters, 'torusRadialSegments').min(0.01).max(64).onChange( updateTorusGeo ).listen()
    debugGui.add(parameters, 'torusP').min(0.01).max(10).onChange( updateTorusGeo ).listen()
    debugGui.add(parameters, 'torusQ').min(0.01).max(10).onChange( updateTorusGeo ).listen()
}

function initWebcam(){
    // Initialises all components needed to access the webcam

    video = document.getElementById("video")

    //// Setting up three.js components for rendering the webcam feed in the scene
      // This example renders a single video material on to multiple geometries
    videoTex = new THREE.VideoTexture(video)
    videoTex.colorSpace = THREE.SRGBColorSpace
    videoMaterial = new THREE.MeshStandardMaterial({ map: videoTex, transparent: true, opacity: 1 })

    planeGeometry = new THREE.PlaneGeometry( 16, 9 );
    planeGeometry.scale( 0.5, 0.5, 0.5 );

    sphereGeo = new THREE.SphereGeometry(1, 32, 32)
    sphereGeo.scale(2, 2, 2)

    torusKnotGeo = new THREE.TorusKnotGeometry(1, 0.3, 64, 8, 2, 3)
    torusKnotGeo.scale(2, 2, 2)

    planeVideoMesh = new THREE.Mesh( planeGeometry, videoMaterial )
    scene.add(planeVideoMesh)
    planeVideoMesh.position.set(7, 0, 0)

    sphereVideoMesh = new THREE.Mesh(sphereGeo, videoMaterial)
    //scene.add(sphereVideoMesh)
    sphereVideoMesh.rotateOnAxis(new THREE.Vector3(0,1,0), -90)

    torusKnotVideoMesh = new THREE.Mesh(torusKnotGeo, videoMaterial)
    scene.add(torusKnotVideoMesh)
    torusKnotVideoMesh.rotateOnAxis(new THREE.Vector3(0,1,0), 180)

    //// Ensures the current device has an accessible webcam, sets parameters, and starts webcam
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };

        navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {
            video.srcObject = stream
            //video.Play()
        }).catch( function (error){
            console.error("Unable to access webcam. " + error)
        })
    }
    else{
        console.error("Mediadevices interface is not available on this device")
    }
}

function updateTorusGeo(){
    //console.log("updating torus geo")

    torusKnotGeo.dispose()
    torusKnotGeo = new THREE.TorusKnotGeometry(
        parameters.torusRadius,
        parameters.torusTube,
        parameters.torusTubeSegments,
        parameters.torusRadialSegments,
        parameters.torusP,
        parameters.torusQ
    )

    //torusKnotGeo.computeBoundingSphere()

    torusKnotVideoMesh.geometry = torusKnotGeo

}

function startTorusLoop(){
    var randParam = THREE.MathUtils.randInt(0, tParamsNum - 1)
    //randParam = 0
    var min = tParams[randParam].x
    var max = tParams[randParam].y

    var lerpTarget = THREE.MathUtils.randFloat(min, max)

    startLerp(randParam, lerpTarget)

    console.log("Torus loop started. RandParam: " + randParam + "  min: " + min + "  max: " + max + "  target: " + lerpTarget)
}

function startLerp(param, target){
    switch(param){
        case 0: // radius
            lerpStart = parameters.torusRadius
            break;
        case 1: // tube 
            lerpStart = parameters.torusTube
            break;
        case 2: // tube segments
            lerpStart = parameters.torusTubeSegments
            break;
        case 3: // radial segments
            lerpStart = parameters.torusRadialSegments
            break;
        case 4: // p
            lerpStart = parameters.torusP
            break;
        case 5: // q
            lerpStart = parameters.torusQ
            break;
    }

    lerpStartTime = clock.getElapsedTime()
    lerpParam = param

    lerpTarget = target
    lerpActive = true

}

// Update /////
tick()

function tick(){
    // Update function, called every frame

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    if(parameters.autoRotate) controls.update()

    if(lerpActive){
        switch(lerpParam){
            case 0: // radius
                parameters.torusRadius = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime)
                if(parameters.torusRadius > tParams[lerpParam].y){
                    parameters.torusRadius = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusRadius < -tParams[lerpParam].y){
                    parameters.torusRadius = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
            case 1: // tube 
                parameters.torusTube = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime / 4)
                if(parameters.torusTube > tParams[lerpParam].y){
                    parameters.torusTube = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusTube < -tParams[lerpParam].y){
                    parameters.torusTube = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
            case 2: // tube segments
                parameters.torusTubeSegments = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime / 4)
                if(parameters.torusTubeSegments > tParams[lerpParam].y){
                    parameters.torusTubeSegments = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusTubeSegments < -tParams[lerpParam].y){
                    parameters.torusTubeSegments = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
            case 3: // radial segments
                parameters.torusRadialSegments = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime / 4)
                if(parameters.torusRadialSegments > tParams[lerpParam].y){
                    parameters.torusRadialSegments = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusRadialSegments < -tParams[lerpParam].y){
                    parameters.torusRadialSegments = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
            case 4: // p
                parameters.torusP = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime / 4)
                if(parameters.torusP > tParams[lerpParam].y){
                    parameters.torusP = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusP < -tParams[lerpParam].y){
                    parameters.torusP = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
            case 5: // q
                parameters.torusQ = THREE.MathUtils.lerp(lerpStart, lerpTarget, elapsedTime - lerpStartTime / 4)
                if(parameters.torusQ > tParams[lerpParam].y){
                    parameters.torusQ = tParams[lerpParam].y
                    startTorusLoop()
                }
                else if(parameters.torusQ < -tParams[lerpParam].y){
                    parameters.torusQ = -tParams[lerpParam].y
                    startTorusLoop()
                }
                break;
        }
        updateTorusGeo()
    }

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

// Utility functions //

function rand(min, max){
    // Returns a random number inbetween min and max, with min and max inclusive in the result
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function clamp(num, min, max){ 
    // Clamps a value (num) between a min and a max
    return Math.min(Math.max(num, min), max) 
}

function calculateScreenEdgePositon(){
    // Create a vector for each corner of the screen
    var topLeft = new THREE.Vector3(-1, 1, 0);
    var topRight = new THREE.Vector3(1, 1, 0);
    var bottomLeft = new THREE.Vector3(-1, -1, 0);
    var bottomRight = new THREE.Vector3(1, -1, 0);

    // Create a raycaster object
    var raycaster = new THREE.Raycaster();

    // Use the raycaster to get the world position of each screen corner
    raycaster.setFromCamera(topLeft, camera);
    var worldTopLeft = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, -1)), worldTopLeft);
    raycaster.setFromCamera(topRight, camera);
    var worldTopRight = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, -1)), worldTopRight);
    raycaster.setFromCamera(bottomLeft, camera);
    var worldBottomLeft = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, -1)), worldBottomLeft);
    raycaster.setFromCamera(bottomRight, camera);
    var worldBottomRight = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, -1)), worldBottomRight);

    // Get the screen edges by taking the minimum and maximum values of the x and y coordinates
    minX = Math.min(worldTopLeft.x, worldTopRight.x, worldBottomLeft.x, worldBottomRight.x);
    maxX = Math.max(worldTopLeft.x, worldTopRight.x, worldBottomLeft.x, worldBottomRight.x);
    minY = Math.min(worldTopLeft.y, worldTopRight.y, worldBottomLeft.y, worldBottomRight.y);
    maxY = Math.max(worldTopLeft.y, worldTopRight.y, worldBottomLeft.y, worldBottomRight.y);

    // Log the screen edges
    //console.log("Min X:", minX, "  Max X:", maxX, "  Min Y:", minY, "  Max Y:", maxY);
}

// Event listeners - Called when certain input events are received.
window.addEventListener('keydown', function(event) {
    console.log(event.key.charCodeAt(0))
})

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', (event) => {
    console.log("Click")
})

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //calculateScreenEdgePositon()
})