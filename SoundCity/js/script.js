// SoundCity
// a ThreeJS & WebAudioApi Experiment
// Made by Thomas Van Glabeke - @Tomvanglabeke
// thomasvanglabeke.com/soundcity


window.AudioContext = window.AudioContext ||
window.webkitAudioContext ||
window.mozAudioContext ||
window.msAudioContext ||
window.oAudioContext

const WIDTH = window.innerWidth, HEIGHT = window.innerHeight
const NBR_OBJ = 1024 / 1.5
var cubes = [], minHeight = []
var scene, camera, camControls, clock, renderer
var sphere = {}, plane = {}, lights = {}
var night = false

// Initialization of audio and analyser
if (AudioContext) {
	var audioCtx = new AudioContext()
	var audioBuffer
	var audioSource
	var analyser = audioCtx.createAnalyser()
	var frequencyData = new Uint8Array(analyser.frequencyBinCount)    
    var audio = new Audio()
    audio.controls = false
    audio.src = "http://thomasvanglabeke.com/projets/enterthetechno/foamo_withoutyou.mp3"
    document.body.appendChild(audio)
// Once the song is playable, the loader disappears and the init function start
    audio.addEventListener('canplay', function () {
		document.querySelector('#loader').remove()
		document.querySelector('#UIContainer').style.visibility = 'visible' 
		audioSource = audioCtx.createMediaElementSource(audio)
		audioSource.connect(analyser)
		analyser.connect(audioCtx.destination)
		audio.play()
		init()
        })
}

function init() {
// SCENE with Fog - CAMERA -
    scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2( 0xDD709B,0.007)
    camera = new THREE.PerspectiveCamera(45,WIDTH / HEIGHT, 0.1, 1000)
    clock = new THREE.Clock()
    renderer = new THREE.WebGLRenderer({alpha : true, antialias : true})
	renderer.setClearColor(0x000000, 0)
    renderer.setSize(WIDTH, HEIGHT)
    renderer.shadowMap.enabled = true

// GROUND
    plane.geo = new THREE.PlaneGeometry(5000,5000,1,1)
    plane.mat = new THREE.MeshPhongMaterial({color:0x01122d})
	plane.mat.shininess = 50
  	plane = new THREE.Mesh(plane.geo, plane.mat)
  	plane.position.x = 0 
  	plane.position.y = 0 
  	plane.position.z = -5 
  	plane.rotation.x = -0.5 * Math.PI
	scene.add(plane)

// MOON 
  	sphere.geo = new THREE.SphereBufferGeometry(5, 32, 32)
	sphere.mat = new THREE.MeshPhongMaterial({color: 0x000000, wireframe: false,transparent: true, opacity: 0.8})
	sphere = new THREE.Mesh(sphere.geo, sphere.mat)
	sphere.position.x = 100
	sphere.position.y = 40
	sphere.position.z = 130
	scene.add(sphere)
   
// BUILDINGS
    for (var i =0 ; i < NBR_OBJ ; i++) {
		cubes[i] = {}
		minHeight[i] = randomIntFromInterval(20,50)
		cubes[i].geo = new THREE.BoxGeometry(3,minHeight[i],3)
		cubes[i].mat = new THREE.MeshLambertMaterial({color : 0xD3D6E8})
		cubes[i] = new THREE.Mesh(cubes[i].geo, cubes[i].mat)
		cubes[i].position.x = randomIntFromInterval(-75,75)
		cubes[i].position.y = -5
		cubes[i].position.z = randomIntFromInterval(-75,75)
		cubes[i].castShadow = true
		scene.add(cubes[i])
    }
    
// LIGHTS 
    lights.spotLight = new THREE.SpotLight( 0xffffff,0.8)
    lights.spotLight.position.set(100,140,130)
    lights.spotLight.castShadow = true
    lights.spotLightReverse = new THREE.SpotLight( 0x534da7,0.2)
    lights.spotLightReverse.position.set(-100,140,-130)
    lights.spotLightReverse.castShadow = true
    scene.add(lights.spotLight)
    scene.add(lights.spotLightReverse)

// CAMERA POSITION
    camera.position.x = -30
    camera.position.y = 30
    camera.position.z = 30
    camera.lookAt(scene.position)

// FirstPersonControls camera is an extra little lib for ThreeJS
    camControls = new THREE.FirstPersonControls(camera)
    camControls.lookSpeed = 0.02
    camControls.movementSpeed = 3
    camControls.noFly = true
    camControls.lookVertical = true
    camControls.constrainVertical = false
	camControls.maxPolarAngle = Math.PI/2
    
    document.body.appendChild(renderer.domElement)
    renderer.render(scene, camera)
    
// EventListener to display Day/Night mode and Random mode 
	window.addEventListener('keydown', function(e) {
	switch ( e.keyCode ) {
		case 78 :
            if (!night) {
                displayMode({
                    a :'#111439',
                    b : 0x111439,
                    c : 0x6dc6e4})
                night = true
            }
            else {
                displayMode({
                    a :'#DD709B',
                    b : 0xDD709B,
                    c : 0xD3D6E8})
                night = false 
            }
		break
		case 32 : 
			var colorRandom = Math.floor(Math.random()*16777215).toString(16)
			if (colorRandom.length < 6 ){
				colorRandom = colorRandom + "0" 
				if (colorRandom.length < 6){
					colorRandom = colorRandom + "0" 
				}
			}
			displayMode({
                a : '#'+colorRandom,
                b : '#'+colorRandom,
                c : Math.random() * 0xffffff})	 
        break
    }
})             
    
	window.addEventListener('resize', onWindowResize, false)

    // Start the Render function
	render()
}

function render() {
// Update the camera with the Three.Clock
	var delta = clock.getDelta()
    camControls.update(delta)
	if (camera.position.y < 3) {
		camera.position.y = 3
	}

// Get the frequency data
	analyser.getByteFrequencyData(frequencyData)

// Make each building react to the music with a scale
	for (var i = 0; i < NBR_OBJ; i++) {
        var meshObj = scene.children[i]
        if (meshObj instanceof THREE.Mesh && meshObj.geometry.type == 'BoxGeometry') {
			var percentIdx = i / NBR_OBJ
			var frequencyIdx = Math.floor(1024 * percentIdx)
			meshObj.scale.y = 1 + (frequencyData[frequencyIdx] / frequencyData.length)
	    }
    }
	
// Same thing for the Moon
    sphere.scale.y =  1 + (frequencyData[0] / 255)
    sphere.scale.x =  1 + (frequencyData[0] / 255)
    sphere.scale.z =  1 + (frequencyData[0] / 255)

    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

// Set the random colors
function displayMode(color) {
	document.querySelector('body').style.backgroundColor = color.a
	scene.fog = new THREE.FogExp2(color.b,0.007)
	for (var i = 0; i < NBR_OBJ; i++) {
        var meshObj = scene.children[i]
        if (meshObj instanceof THREE.Mesh && meshObj.geometry.type == 'BoxGeometry') {
			meshObj.material.color.setHex(color.c)
        }
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize( window.innerWidth, window.innerHeight )
}

function randomIntFromInterval(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min)
}