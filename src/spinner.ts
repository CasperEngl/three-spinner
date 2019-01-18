import * as THREE from 'three';
import { TweenMax, RoughEase, Power0 } from 'gsap';

export type EverySecond = {
	even: THREE.Mesh[];
	odd: THREE.Mesh[];
};

export function getMeshRotation(cylinder: THREE.Mesh): THREE.Euler {
	return cylinder.rotation;
}

export function everySecondMesh(array: THREE.Mesh[]): EverySecond {
	const even: THREE.Mesh[] = [];
	const odd: THREE.Mesh[] = [];

	array.forEach((value, index) => {
		if (index % 2) {
			even.push(value);

			return;
		}

		odd.push(value);
	});

	return {
		even,
		odd,
	};
}

export type Spinner = {
	rings: string[][];
	container: Element;
};

export function makeSpinner({ rings, container }: Spinner) {
	const rough = new RoughEase({
		strength: 1,
		points: 7,
		template: Power0.easeInOut,
		taper: 'both',
		randomize: false,
  });
  
	const fullCircle = 2 * Math.PI;
	const timing = 20;

	// camera setup
	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 350;
	camera.position.y = 0;

	// scene setup
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// light setup
	const pointLight = new THREE.PointLight(0xffffff, 0);
	pointLight.position.set(-200, 50, 100);
	pointLight.castShadow = true;
	scene.add(pointLight);

	TweenMax.to(pointLight, 1, {
		intensity: 2,
		delay: 1,
	});

	// 3D models wrapper container
	let cylinderContainer = new THREE.Object3D();

	// 3D model geometry
	const geometry = new THREE.CylinderBufferGeometry(150, 150, 50, 32, 1, true);

	const cylinders = rings.map((ring, index) => {
		let materialCylinder = new THREE.MeshStandardMaterial({
			color: '#fff',
			transparent: true,
			side: THREE.DoubleSide,
			alphaTest: 0.5,
		});

		let tex = document.createElement('canvas');
		let context = tex.getContext('2d');

		tex.width = 4096;
		tex.height = 256;

		if (context) {
			context.font = 'Bold 300px Gill Sans';
			context.fillStyle = 'white';

			context.fillText(ring.join(''), 0, 240, 4096);
		}

		const texture = new THREE.Texture(tex);

		texture.needsUpdate = true;
		materialCylinder.alphaMap = texture;
		materialCylinder.alphaMap.magFilter = THREE.NearestFilter;
		materialCylinder.alphaMap.wrapT = THREE.RepeatWrapping;
		materialCylinder.alphaMap.repeat.y = 1;

		const cylinder = new THREE.Mesh(geometry, materialCylinder);
		cylinderContainer.add(cylinder);
		cylinder.position.y = index * 50;

		return cylinder;
	});

	// positioning main object wrapper
	cylinderContainer.position.z = -300;
	cylinderContainer.position.x = 0;
	cylinderContainer.rotation.x = -Math.PI / 4;
	cylinderContainer.rotation.z = Math.PI / 6;

	// adding main object wrapper to scene
	scene.add(cylinderContainer);

	const cSplit = everySecondMesh(cylinders);

	const oddCylinders: THREE.Mesh[] = cSplit.odd;
	const evenCylinders: THREE.Mesh[] = cSplit.even;

	// animations (positive)
	const tweenPositive = TweenMax.fromTo(
		[...oddCylinders.map((cylinder: THREE.Mesh) => getMeshRotation(cylinder))],
		timing,
		{
			y: 0,
		},
		{
			y: -fullCircle,
			repeat: -1,
			yoyo: true,
			ease: rough,
		}
	);

	// animations (negative)
	const tweenNegative = TweenMax.fromTo(
		[...evenCylinders.map((cylinder: THREE.Mesh) => getMeshRotation(cylinder))],
		timing,
		{
			y: 0,
		},
		{
			y: fullCircle,
			repeat: -1,
			yoyo: true,
			ease: rough,
		}
	);

	// WebGL renderer
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// add canvas to dom
	if (container) {
		container.appendChild(renderer.domElement);
	}

	//
	window.addEventListener('resize', onWindowResize, false);

	/**
	 * Internal functions
	 */
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function render() {
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	/**
	 * End internal functions
	 */

	render();
}

const rings = [
	['LUNARWEB', 'LUNARWEB', 'LUNARWEB'],
	['LUNARWEB', 'LUNARWEB'],
	['LUNARWEB', 'LUNARWEB', 'LUNARWEB'],
	['LUNARWEB', 'LUNARWEB'],
];

const container = document.querySelector('#container');

if (container) {
	makeSpinner({
		rings,
		container,
	});
}
