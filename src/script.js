import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

let canvas, renderer, scene, camera, controls
let world, defaultMaterial, defaultContactMaterial, cannonDebugger, block
let sizes, aspectRatio, mouse, clock, oldElapsedTime
let normalMaterial, transparentMaterial, videoMaterial
let planeGeometry, planeVideoMesh
let debugGui
let ambientLight
let video, videoWholeTex
let blockFired

let objectsToUpdate = []
let videoCubes = []

let moveBlock = false


// Array to store parameters used in the debug UI
const parameters = {
    orbitControls: true,
    autoRotate: true,
    xPixels: 16,
    yPixels: 9,
    resetBoxes: () => {
        resetBoxes()
    },
    moveBlock: fireBlock
}

init()

createStaticBox(new THREE.Vector3(0, -5, 0), new THREE.Vector3(100, 0.1, 20), normalMaterial) // floor
createStaticBox(new THREE.Vector3(0, 10, 0), new THREE.Vector3(100, 0.1, 20), normalMaterial) // ceiling
createStaticBox(new THREE.Vector3(15, 0, 0), new THREE.Vector3(0.1, 20, 20), normalMaterial)  // right wall
createStaticBox(new THREE.Vector3(-15, 0, 0), new THREE.Vector3(0.1, 20, 20), normalMaterial)  // left wall
createStaticBox(new THREE.Vector3(0, 0, -10), new THREE.Vector3(100, 20, 0.1), normalMaterial)  // back wall
createStaticBox(new THREE.Vector3(0, 0, 10), new THREE.Vector3(100, 20, 0.1), transparentMaterial)  // front wall

block = createKinematicBox(new THREE.Vector3(0, -2, -10), new THREE.Vector3(8, 5, 10), transparentMaterial)

for(var x = 0 ; x < parameters.xPixels ; x++){
    for(var y = 0; y < parameters.yPixels; y++){
        videoCubes.push(createDynamicBox(new THREE.Vector3(x - parameters.xPixels / 2, y - parameters.yPixels / 2, 0), new THREE.Vector3(1, 1, 1), videoMaterial, x, y))
    }
}


function init(){
    // Master function to initialise variables and call other initialisation functions
    mouse = new THREE.Vector2()
    blockFired = false

    //// Screen
    sizes = { width: window.innerWidth, height: window.innerHeight }
    aspectRatio = sizes.width / sizes.height

    normalMaterial = new THREE.MeshNormalMaterial()
    transparentMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 })

    //// Update
    clock = new THREE.Clock()
    oldElapsedTime = 0

    //// Initialisers
    initScene()
    initGui()
    initWebcam()
    initPhysics()
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
    camera.position.set(0, 0, 8)
    scene.add(camera)
    camera.far = 10000

    controls = new OrbitControls(camera, canvas)    // orbit controls for viewing the scene during development
    controls.enableDamping = true
    controls.autoRotate = parameters.autoRotate
    controls.autoRotateSpeed = 3

    ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
}

function initGui(){
    // Initialises an instance of datGUI, a gui to be used during development. Hide this on the final product
    debugGui = new dat.GUI()

    debugGui.add(parameters, 'orbitControls').onChange( function(){ controls.enabled = parameters.orbitControls } )
    debugGui.add(parameters, 'autoRotate').onChange( function(){ controls.autoRotate = parameters.autoRotate } )
    //debugGui.add(parameters, 'xPixels').min(1).max(32).step(1)
    //debugGui.add(parameters, 'yPixels').min(1).max(18).step(1)
    debugGui.add(parameters, 'resetBoxes')
    debugGui.add(parameters, 'moveBlock')

    //debugGui.hide()
}

function initPhysics(){
    world = new CANNON.World()
    world.broadphase = new CANNON.SAPBroadphase(world)
    //world.allowSleep = true

    world.gravity = new CANNON.Vec3(0, -0.5, 0)

    defaultMaterial = new CANNON.Material('default')
    defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0.1,
            restitution: 0.7
        }
    )
    world.defaultContactMaterial = defaultContactMaterial

    cannonDebugger = new CannonDebugger(scene, world)
}

function initWebcam(){
    // Initialises all components needed to access the webcam

    video = document.getElementById("video")

    //// Setting up three.js components for rendering the webcam feed in the scene
      // This example renders a single video material on to multiple geometries

    videoWholeTex = new THREE.VideoTexture(video)

    videoWholeTex.colorSpace = THREE.SRGBColorSpace
    videoMaterial = new THREE.MeshStandardMaterial({ map: videoWholeTex, side: THREE.DoubleSide })

    planeGeometry = new THREE.PlaneGeometry( parameters.xPixels, parameters.yPixels );
    planeGeometry.scale( 1.9, 1.9, 1 );

    planeVideoMesh = new THREE.Mesh( planeGeometry, videoMaterial )
    scene.add(planeVideoMesh)
    planeVideoMesh.position.set(0, 2.5, 10)

    //// Ensures the current device has an accessible webcam, sets parameters, and starts webcam

    var testWebcam = true

    if(testWebcam){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            const constraints = { video: true };
    
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
    else{
        const constraints = { video: {width:1920,height:1080} }

        navigator.mediaDevices.enumerateDevices(constraints).then( result => {
    
            result = result.filter( item => item.kind === 'videoinput' )
            const constraints = {video: {deviceId:result[1].deviceId} }
    
            navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {
    
                video.srcObject = stream
                // alert('received stream')
    
                video.onloadedmetadata = function (e) {
                    video.setAttribute('autoplay', 'true')
                    video.setAttribute('playsinline', 'true')
                    video.play()
                }
    
            }).catch( function (error){
                console.error("Unable to access webcam. " + error)
            })
    
        })
    }

}

function createStaticBox(position, size = {x:1, y:1, z:1}, material = normalMaterial){
    const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z)
    const boxMesh = new THREE.Mesh(boxGeo, material)

    boxMesh.position.copy(position)
    boxMesh.name = "static_box"
    scene.add(boxMesh)

    const shape = new CANNON.Box( new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2) )
    const body = new CANNON.Body({
        mass: 0,
        shape: shape
    })
    body.position.copy(position)
    world.addBody(body)

}

function createDynamicBox(position, size = {x:1, y:1, z:1}, material = normalMaterial, x = 0, y = 0){

    const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z)

    var repeat = new THREE.Vector2( 1 / parameters.xPixels, 1 / parameters.yPixels )
    var uvAttribute = boxGeo.attributes.uv

    for(var i = 0; i < uvAttribute.count; i+= 4){
        
        var newX = x * repeat.x
        var newY = y * repeat.y
        
        uvAttribute.setXY(i, newX, newY + repeat.y)
        uvAttribute.setXY(i + 1, newX + repeat.x, newY + repeat.y)
        uvAttribute.setXY(i + 2, newX, newY)
        uvAttribute.setXY(i + 3, newX + repeat.x, newY)

        uvAttribute.needsUpdate = true
    }

    const boxMesh = new THREE.Mesh(boxGeo, material)

    boxMesh.position.copy(position)
    scene.add(boxMesh)

    const shape = new CANNON.Box( new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2) )
    const body = new CANNON.Body({
        mass: 1,
        shape: shape
    })
    body.position.copy(position)
    world.addBody(body)

    objectsToUpdate.push({ mesh: boxMesh, body: body })
    body.userData = { startPos: position }

    return body
}

function createKinematicBox(position, size = {x:1, y:1, z:1}, material = normalMaterial){
    const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z)
    const boxMesh = new THREE.Mesh(boxGeo, material)

    boxMesh.position.copy(position)
    scene.add(boxMesh)

    const shape = new CANNON.Box( new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2) )
    const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        type: CANNON.Body.KINEMATIC
    })
    body.position.copy(position)
    world.addBody(body)

    objectsToUpdate.push({ mesh: boxMesh, body: body })
    body.userData = { startPos: position }

    return body
}

function resetBoxes(){
    console.log("resetting boxes")
    videoCubes.forEach(element => {
        element.position.copy(element.userData.startPos)    // initial position
        element.quaternion.set(0,0,0,1)     //identity quaternion
        element.velocity.set(0,0,0)         // reset velocity
    })
}

function fireBlock(){
    console.log("firing block")
    block.position.set(block.position.x, block.position.y, -10)
    moveBlock = true
}

// Update /////
tick()

function tick(){
    // Update function, called every frame

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    if(parameters.autoRotate){
        controls.update()
        var roundedZPos = Math.round(camera.position.z)
        console.log(roundedZPos)

        if(roundedZPos == -8 && !blockFired){
            fireBlock()
            blockFired = true
        }

        if(roundedZPos == 0 && blockFired){
            blockFired = false
            resetBoxes()
            resetBoxes()
        }
    } 

    world.step(1 / 60, deltaTime, 3)

    objectsToUpdate.forEach(element => {
        element.mesh.position.copy(element.body.position)
        element.mesh.quaternion.copy(element.body.quaternion)
    })

    if(moveBlock){
        block.position.set(block.position.x, block.position.y, block.position.z + 10 * deltaTime)
        if(block.position.z > 20){
            console.log("Block finished")
            moveBlock = false
        }
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