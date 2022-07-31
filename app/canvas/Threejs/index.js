import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class {
    constructor() {

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.fov = 75
        this.cameraZ = 1400
        this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, 0.1, 10000)
        this.camera.position.z = this.cameraZ
        this.camera.lookAt(0, 0, 0)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.threejsCanvas.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true



        this.setUpScene()
        this.addLights()
    }

    setUpScene() {
        

        const catLoader = new GLTFLoader()

        // Instantiate a loader
        const dracoLoader = new DRACOLoader();

        // Specify path to a folder containing WASM/JS decoding libraries.
        dracoLoader.setDecoderPath('/draco/');

        catLoader.setDRACOLoader(dracoLoader)

        catLoader.load('/models/cat.glb', (gltf) => {
            this.scene.add(gltf.scene)
        })

        const outerEnvironmentMap = new THREE.CubeTextureLoader().load([
            'textures/Yokohama/posx.jpg',
            'textures/Yokohama/negx.jpg',
            'textures/Yokohama/posy.jpg',
            'textures/Yokohama/negy.jpg',
            'textures/Yokohama/posz.jpg',
            'textures/Yokohama/negz.jpg',
        ])
        
        outerEnvironmentMap.encoding = THREE.sRGBEncoding
        
        this.scene.background = outerEnvironmentMap
        this.scene.environment = outerEnvironmentMap

        const middleEnvironment = new THREE.TextureLoader().load('textures/earthmap1k.jpg');

        this.geometry = new THREE.SphereGeometry(640, 64, 32)
        
        this.material = new THREE.MeshBasicMaterial({ 
            map: middleEnvironment,
            side: THREE.DoubleSide
        })

        this.sphere = new THREE.Mesh(this.geometry, this.material)

        this.scene.add(this.sphere)

        
        const innerEnvironment = new THREE.TextureLoader().load('textures/Harbor.jpg');

        this.geometry1 = new THREE.SphereGeometry(40, 32, 16)
        
        this.material1 = new THREE.MeshBasicMaterial({ 
            map: innerEnvironment, 
            side: THREE.BackSide
        })

        this.sphere1 = new THREE.Mesh(this.geometry1, this.material1)

        this.scene.add(this.sphere1)

        
    }

    addLights() {
        this.light = new THREE.AmbientLight(0xFFFFFF, 1)
        this.light.position.set(10, 10, 0)

        this.scene.add(this.light)
    }

    onMouseDown() {

    }

    onMouseUp() {

    }

    onMouseMove() {
    }

    update() {
        this.renderer.render(this.scene, this.camera)
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}