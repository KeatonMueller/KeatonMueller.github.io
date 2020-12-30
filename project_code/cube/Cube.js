import Cubie from "./Cubie.js";
class Cube {
    constructor(scene, meshArray, facesMap) {
        this.cubies = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    this.cubies.push(new Cubie(x, y, z));
                }
            }
        }
        this.cubies.forEach((cubie) => {
            scene.add(cubie.mesh);
            meshArray.push(cubie.mesh);
            cubie.faces.forEach((face) => {
                scene.add(face.mesh);
                meshArray.push(face.mesh);
                facesMap.set(face.mesh.uuid, face);
            });
        });
    }

    forEach(fn) {
        this.cubies.forEach((cubie) => {
            fn(cubie);
        });
    }

    moveL(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveR(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveF(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveB(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveU(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveD(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveM(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveE(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveS(dir) {
        return () => {
            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
}

export default Cube;
