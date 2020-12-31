import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "../../js/three/OrbitControls.js";

import Cube from "./Cube.js";

const ANIMATION_SPEED = 0.2;
const axes = new Map([
    ["x", new THREE.Vector3(1, 0, 0)],
    ["y", new THREE.Vector3(0, 1, 0)],
    ["z", new THREE.Vector3(0, 0, 1)],
    ["-x", new THREE.Vector3(-1, 0, 0)],
    ["-y", new THREE.Vector3(0, -1, 0)],
    ["-z", new THREE.Vector3(0, 0, -1)],
]);

// get height of header
const getHeaderSize = () => {
    if (window.innerWidth <= 560) {
        return window.innerHeight * 0.14;
    }
    return window.innerHeight * 0.1;
};

// get height of window
const getHeight = () => {
    if (window.innerWidth <= 560) {
        return window.innerHeight * 0.86;
    }
    return window.innerHeight * 0.9;
};

const moveBuffer = [];
let animating = false;

const domElement = document.getElementById("three");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / getHeight(),
    0.1,
    1000
);
camera.position.x = 3;
camera.position.y = 4;
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, getHeight());
domElement.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const meshArray = [];
const facesMap = new Map();
const mouse = new THREE.Vector2();
const delta = new THREE.Vector2();

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 15;
controls.enablePan = false;
controls.update();

const cube = new Cube(scene, meshArray, facesMap);

// "next frame" function
const update = () => {
    if (!animating && moveBuffer.length > 0) {
        moveBuffer.pop()();
        animating = true;
    }
    cube.forEach((cubie) => {
        if (cubie.animating) {
            if (cubie.angle >= Math.PI * 0.5) {
                cubie.angle = 0;
                cubie.animating = false;
                cubie.turn(cubie.animateAxis, cubie.animateDir);
                cubie.lockPosition();
                animating = false;
            } else {
                cubie.rotate(
                    cubie.animateAxis,
                    cubie.animateDir * ANIMATION_SPEED
                );
                cubie.angle += ANIMATION_SPEED;
            }
        }
    });
};

// animation function
const animate = () => {
    requestAnimationFrame(animate);

    update();
    renderer.render(scene, camera);
};
animate();

window.scrollTo(0, 0);

// bind key presses to cube rotations
const keyEvents = {
    b: cube.moveB(1),
    d: cube.moveD(1),
    e: cube.moveE(1),
    f: cube.moveF(1),
    l: cube.moveL(1),
    m: cube.moveM(1),
    r: cube.moveR(1),
    s: cube.moveS(1),
    u: cube.moveU(1),
    B: cube.moveB(-1),
    D: cube.moveD(-1),
    E: cube.moveE(-1),
    F: cube.moveF(-1),
    L: cube.moveL(-1),
    M: cube.moveM(-1),
    R: cube.moveR(-1),
    S: cube.moveS(-1),
    U: cube.moveU(-1),
};
const onKeyPress = (event) => {
    if (keyEvents[event.key] !== undefined) {
        moveBuffer.push(keyEvents[event.key]);
    }
};
document.addEventListener("keypress", onKeyPress, false);

// resize canvas on window resize
const onWindowResize = () => {
    camera.aspect = window.innerWidth / getHeight();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, getHeight());
};
window.addEventListener("resize", onWindowResize, false);

// route touch events to mouse events
const onTouchStart = (event) => {
    event.offsetX = event.touches[0].clientX;
    event.offsetY = event.touches[0].clientY - getHeaderSize();
    onDocumentMouseDown(event);
};
document.addEventListener("touchstart", onTouchStart, false);

const onTouchEnd = (event) => {
    onDocumentMouseUp(event);
};
document.addEventListener("touchend", onTouchEnd, false);

const onTouchMove = (event) => {
    event.offsetX = event.touches[0].clientX;
    event.offsetY = event.touches[0].clientY - getHeaderSize();
    onDocumentMouseMove(event);
};
document.addEventListener("touchmove", onTouchMove, false);

// mouse events
let selectedObject;
const onDocumentMouseDown = (event) => {
    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.offsetY / getHeight()) * 2 + 1;

    raycaster.setFromCamera(mouse.clone(), camera);

    var intersects = raycaster.intersectObjects(meshArray, true);
    if (intersects.length > 0 && facesMap.has(intersects[0].object.uuid)) {
        controls.enabled = false;
        selectedObject = intersects[0];
    }
};
document.addEventListener("pointerdown", onDocumentMouseDown, false);

let chosenAxis = null;
let chosenDir = 0;
const onDocumentMouseUp = (event) => {
    controls.enabled = true;
    chosenAxis = null;
    chosenDir = 0;
};
document.addEventListener("pointerup", onDocumentMouseUp, false);

const onDocumentMouseMove = (event) => {
    if (!controls.enabled && chosenAxis == null) {
        delta.x = (event.offsetX / window.innerWidth) * 2 - 1 - mouse.x;
        delta.y = -(event.offsetY / getHeight()) * 2 + 1 - mouse.y;
        if (delta.length() > 0.015) {
            if (Math.abs(delta.x) > Math.abs(delta.y)) {
                // console.log('going left/right')
                chosenAxis = "x";
                chosenDir = delta.x > 0 ? 1 : -1;
            } else {
                // console.log('going up/down')
                chosenAxis = "y";
                chosenDir = delta.y > 0 ? 1 : -1;
            }
            var closestDistance = Infinity;
            var closestAxis = null;
            var cameraVector = new THREE.Vector3(
                camera.position.x,
                camera.position.y,
                camera.position.z
            );
            var distance;
            for (var [axis, axisVector] of axes) {
                distance = axisVector.distanceTo(cameraVector);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestAxis = axis;
                }
            }
            // console.log('closest axis:', closestAxis)
            var selectedFace = facesMap.get(selectedObject.object.uuid);
            var sign = -1;
            switch (closestAxis) {
                case "z":
                    sign = 1;
                // purposefully no `break` here
                // eslint-disable-next-line
                case "-z":
                    switch (chosenAxis) {
                        case "x":
                            if (
                                Math.abs(selectedFace.fixedFacingVector.y) === 1
                            ) {
                                switch (selectedFace.fixedPositionVector.z) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveB(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveS(
                                                chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveF(
                                                chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedFace.fixedPositionVector.y) {
                                    case -1:
                                        moveBuffer.push(cube.moveD(chosenDir));
                                        break;
                                    case 0:
                                        moveBuffer.push(cube.moveE(chosenDir));
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveU(-1 * chosenDir)
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        case "y":
                            if (
                                Math.abs(selectedFace.fixedFacingVector.x) === 1
                            ) {
                                switch (selectedFace.fixedPositionVector.z) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveB(
                                                chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.x
                                            )
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveS(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.x
                                            )
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveF(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.x
                                            )
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedFace.fixedPositionVector.x) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveL(-1 * chosenDir * sign)
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveM(-1 * chosenDir * sign)
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveR(chosenDir * sign)
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case "x":
                    sign = 1;
                // purposefully no `break` here
                // eslint-disable-next-line
                case "-x":
                    switch (chosenAxis) {
                        case "x":
                            if (
                                Math.abs(selectedFace.fixedFacingVector.y) === 1
                            ) {
                                switch (selectedFace.fixedPositionVector.x) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveL(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveM(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveR(
                                                chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.y *
                                                    sign
                                            )
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedFace.fixedPositionVector.y) {
                                    case -1:
                                        moveBuffer.push(cube.moveD(chosenDir));
                                        break;
                                    case 0:
                                        moveBuffer.push(cube.moveE(chosenDir));
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveU(-1 * chosenDir)
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        case "y":
                            if (
                                Math.abs(selectedFace.fixedFacingVector.z) === 1
                            ) {
                                switch (selectedFace.fixedPositionVector.x) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveL(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.z
                                            )
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveM(
                                                -1 *
                                                    chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.z
                                            )
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveR(
                                                chosenDir *
                                                    selectedFace
                                                        .fixedFacingVector.z
                                            )
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedFace.fixedPositionVector.z) {
                                    case -1:
                                        moveBuffer.push(
                                            cube.moveB(chosenDir * sign)
                                        );
                                        break;
                                    case 0:
                                        moveBuffer.push(
                                            cube.moveS(-1 * chosenDir * sign)
                                        );
                                        break;
                                    case 1:
                                        moveBuffer.push(
                                            cube.moveF(-1 * chosenDir * sign)
                                        );
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case "y":
                    sign = 1;
                // purposefully no `break` here
                // eslint-disable-next-line
                case "-y":
                    // need to determine which axis is 'up' relative to the camera
                    var closestTopDistance = Infinity;
                    var closestTopAxis = null;
                    var topSign = null;
                    var rotation = (camera.rotation.z / Math.PI) * 10;
                    // console.log(rotation)
                    for (var n of [-10, -5, 0, 5, 10]) {
                        var diff = Math.abs(n - rotation);
                        if (diff < closestTopDistance) {
                            closestTopDistance = diff;
                            switch (n) {
                                case 0:
                                    closestTopAxis = "z";
                                    topSign = sign > 0 ? -1 : 1;
                                    break;
                                case -10:
                                case 10:
                                    closestTopAxis = "z";
                                    topSign = sign > 0 ? 1 : -1;
                                    break;
                                case -5:
                                    closestTopAxis = "x";
                                    topSign = 1;
                                    break;
                                case 5:
                                    closestTopAxis = "x";
                                    topSign = -1;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    // console.log(topSign)
                    // console.log(closestTopAxis)
                    switch (chosenAxis) {
                        case "x":
                            switch (closestTopAxis) {
                                case "z":
                                    if (
                                        Math.abs(
                                            selectedFace.fixedFacingVector.y
                                        ) === 1
                                    ) {
                                        switch (
                                            selectedFace.fixedPositionVector.z
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveB(
                                                        chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveS(
                                                        -1 *
                                                            chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveF(
                                                        -1 *
                                                            chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    } else {
                                        switch (
                                            selectedFace.fixedPositionVector.y
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveD(chosenDir)
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveE(chosenDir)
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveU(-1 * chosenDir)
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    break;
                                case "x":
                                    if (
                                        Math.abs(
                                            selectedFace.fixedFacingVector.y
                                        ) === 1
                                    ) {
                                        switch (
                                            selectedFace.fixedPositionVector.x
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveL(
                                                        chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveM(
                                                        chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveR(
                                                        -1 *
                                                            chosenDir *
                                                            topSign *
                                                            sign *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .y
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    } else {
                                        switch (
                                            selectedFace.fixedPositionVector.y
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveD(chosenDir)
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveE(chosenDir)
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveU(-1 * chosenDir)
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case "y":
                            switch (closestTopAxis) {
                                case "z":
                                    if (
                                        Math.abs(
                                            selectedFace.fixedFacingVector.x
                                        ) === 1
                                    ) {
                                        switch (
                                            selectedFace.fixedPositionVector.z
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveB(
                                                        chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .x
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveS(
                                                        -1 *
                                                            chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .x
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveF(
                                                        -1 *
                                                            chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .x
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    } else {
                                        switch (
                                            selectedFace.fixedPositionVector.x
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveL(
                                                        chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveM(
                                                        chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveR(
                                                        -1 *
                                                            chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    break;
                                case "x":
                                    if (
                                        Math.abs(
                                            selectedFace.fixedFacingVector.z
                                        ) === 1
                                    ) {
                                        switch (
                                            selectedFace.fixedPositionVector.x
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveL(
                                                        -1 *
                                                            chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .z
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveM(
                                                        -1 *
                                                            chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .z
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveR(
                                                        chosenDir *
                                                            selectedFace
                                                                .fixedFacingVector
                                                                .z
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    } else {
                                        switch (
                                            selectedFace.fixedPositionVector.z
                                        ) {
                                            case -1:
                                                moveBuffer.push(
                                                    cube.moveB(
                                                        -1 *
                                                            chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            case 0:
                                                moveBuffer.push(
                                                    cube.moveS(
                                                        chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            case 1:
                                                moveBuffer.push(
                                                    cube.moveF(
                                                        chosenDir *
                                                            topSign *
                                                            sign
                                                    )
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    }
};
document.addEventListener("pointermove", onDocumentMouseMove, false);
