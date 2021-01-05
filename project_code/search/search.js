import { boxMap, state, changeState, pulse } from "./index.js";
import {
    TICK_DELAY,
    ITER_PER_TICK,
    State,
    Type,
    SearchState,
    SearchType,
} from "./constants.js";
import { numRows, numCols } from "./init.js";

/**
 * Class to carry out search algorithms
 */
export default class Search {
    constructor() {
        this.queue = []; // queue/stack for BFS/DFS
        this.openSet = new Set(); // open set for A*
        this.closedSet = new Set(); // closed set for A*
        this.gScores = {}; // gScore map for A*
        this.fScores = {}; // fScore map for A*
        this.prev = {}; // previous map for paths
        this.type = null; // type of search being performed
        this.iters = 0; // iterations left for current tick
    }

    /**
     * Return the four orthogonally connected boxes to the given box
     * @param {HTMLElement} box Box to get neighbors for
     */
    getNeighbors(box) {
        const neighbors = [];
        const row = parseInt(box.dataset.row);
        const col = parseInt(box.dataset.col);
        let r, c;
        for (const [deltaR, deltaC] of [
            [0, -1],
            [0, 1],
            [1, 0],
            [-1, 0],
        ]) {
            r = row + deltaR;
            c = col + deltaC;
            if (r < 0 || r >= numRows || c < 0 || c >= numCols) continue;
            neighbors.push(boxMap.grid[r][c]);
        }
        return neighbors;
    }

    /**
     * Reset data structures and prepare for new search of given type
     * @param {string} type Type of search to initialize
     */
    newSearch(type) {
        this.type = type;
        this.prev = {};
        if (type === SearchType.BFS || type === SearchType.DFS) {
            this.queue = [boxMap.start];
        } else if (type === SearchType.A_STAR) {
            // reset scores for each box
            boxMap.grid.forEach((gridRow) => {
                gridRow.forEach((box) => {
                    this.gScores[box.id] = Infinity;
                    this.fScores[box.id] = Infinity;
                });
            });

            // set scores for starting box
            this.gScores[boxMap.start.id] = 0;
            this.fScores[boxMap.start.id] = this.h(boxMap.start);
            this.openSet = new Set([boxMap.start]);
            this.closedSet.clear();
        }
    }

    /**
     * Perform an animation of given search algorithm
     * @param {string} type Type of search to animate
     */
    animateSearch(type) {
        this.newSearch(type);
        this.searchIter();
    }

    /**
     * Perform a full search without animations and display result
     * @param {string} type Type of search to perform
     */
    performSearch(type) {
        this.newSearch(type);
        this.searchFull();
    }

    /**
     * Perform delayed iterations of a given search algorithm
     */
    searchIter() {
        if (this.type === SearchType.BFS) this.bfsIter(true);
        else if (this.type === SearchType.DFS) this.dfsIter(true);
        else if (this.type === SearchType.A_STAR) this.aStarIter(true);

        if (state === SearchState.SEARCHING)
            setTimeout(() => {
                this.iters = ITER_PER_TICK;
                this.searchIter(this.type);
            }, TICK_DELAY);
    }

    /**
     * Fully execute a given search algorithm
     */
    searchFull() {
        while (state === SearchState.SEARCHING) {
            if (this.type === SearchType.BFS) this.bfsIter(false);
            else if (this.type === SearchType.DFS) this.dfsIter(false);
            else if (this.type === SearchType.A_STAR) this.aStarIter(false);
        }
    }

    /**
     * Perform an iteration of BFS
     * @param {boolean} anim Whether or not this iteration is animated
     */
    bfsIter(anim) {
        // detect if end is unreachable
        if (this.queue.length === 0) {
            changeState(this.type);
            return;
        }
        this.iters -= 1;
        const box = this.queue.shift();

        if (
            box.classList.contains(State.UNVISITED) &&
            !box.classList.contains(Type.WALL)
        ) {
            if (box.classList.contains(Type.END)) {
                changeState(SearchState.HIGHLIGHTING);
                this.highlightPath(box, anim);
                return;
            }

            box.classList.remove(State.UNVISITED);
            box.classList.add(State.VISITED);
            if (anim) pulse(box);

            // enqueue all four neighbors
            this.getNeighbors(box).forEach((neighbor) => {
                if (
                    !neighbor.classList.contains(State.UNVISITED) ||
                    neighbor.classList.contains(Type.WALL)
                )
                    return;
                this.queue.push(neighbor);
                this.prev[neighbor.id] = box;
            });
        }

        if (anim && this.iters > 0) this.bfsIter(true);
    }

    /**
     * Perform an iteration of DFS
     * @param {boolean} anim Whether or not this iteration is animated
     */
    dfsIter(anim) {
        // detect if end is unreachable
        if (this.queue.length === 0) {
            changeState(this.type);
            return;
        }
        this.iters -= 1;
        const box = this.queue.pop();
        if (
            box.classList.contains(State.UNVISITED) &&
            !box.classList.contains(Type.WALL)
        ) {
            if (box.classList.contains(Type.END)) {
                changeState(SearchState.HIGHLIGHTING);
                this.highlightPath(box, anim);
                return;
            }
            box.classList.remove(State.UNVISITED);
            box.classList.add(State.VISITED);
            if (anim) pulse(box);

            // enqueue all four neighbors
            this.getNeighbors(box).forEach((neighbor) => {
                if (
                    !neighbor.classList.contains(State.UNVISITED) ||
                    neighbor.classList.contains(Type.WALL)
                )
                    return;
                this.queue.push(neighbor);
                this.prev[neighbor.id] = box;
            });
        }
        if (anim && this.iters > 0) this.dfsIter(true);
    }

    /**
     * Perform an iteration of A*
     * @param {boolean} anim Whether or not this iteration is animated
     */
    aStarIter(anim) {
        // detect if end is unreachable
        if (this.openSet.size === 0) {
            changeState(this.type);
            return;
        }
        this.iters -= 1;
        const box = [...this.openSet].reduce((val, candidate) => {
            if (
                val === null ||
                this.fScores[candidate.id] < this.fScores[val.id]
            ) {
                return candidate;
            }
            return val;
        }, null);

        if (box.classList.contains(Type.END)) {
            changeState(SearchState.HIGHLIGHTING);
            this.highlightPath(box, anim);
            return;
        }
        box.classList.remove(State.UNVISITED);
        box.classList.add(State.VISITED);
        if (anim) pulse(box);
        this.openSet.delete(box);
        this.closedSet.add(box);

        this.getNeighbors(box).forEach((neighbor) => {
            if (neighbor.classList.contains(Type.WALL)) return;
            if (this.closedSet.has(neighbor)) return;
            const tentativeScore = this.gScores[box.id] + 1;
            if (tentativeScore < this.gScores[neighbor.id]) {
                this.prev[neighbor.id] = box;
                this.gScores[neighbor.id] = tentativeScore;
                this.fScores[neighbor.id] = tentativeScore + this.h(neighbor);
                this.openSet.add(neighbor);
            }
        });
        if (anim && this.iters > 0) this.aStarIter(true);
    }

    /**
     * Highlight the path from the start to the given box
     * @param {HTMLElement} box Final box in path
     * @param {boolean} anim Whether or not the highlighting is animated
     */
    highlightPath(box, anim) {
        // extract the path
        const path = [];
        while (box !== undefined) {
            path.push(box);
            box = this.prev[box.id];
        }
        if (anim) {
            const delay = Math.ceil(2000 / path.length);
            // highlight each square one at a time
            let toType = this.type;
            (function highlight(i) {
                setTimeout(() => {
                    i -= 1;
                    path[i].classList.remove(State.VISITED);
                    path[i].classList.add(State.PATH);
                    pulse(path[i]);

                    if (i && state === SearchState.HIGHLIGHTING) highlight(i);
                    else if (state === SearchState.HIGHLIGHTING)
                        changeState(toType);
                }, delay);
            })(path.length);
        } else {
            // highlight all squares
            path.forEach((box) => {
                box.classList.remove(State.VISITED);
                box.classList.add(State.PATH);
            });
            // update state
            if (state === SearchState.HIGHLIGHTING) changeState(this.type);
        }
    }

    /**
     * Perform Manhattan distance heuristic on the given box
     * @param {HTMLElement} box Box to perform heuristic on
     */
    h(box) {
        return (
            Math.abs(
                parseInt(box.dataset.row) - parseInt(boxMap.end.dataset.row)
            ) +
            Math.abs(
                parseInt(box.dataset.col) - parseInt(boxMap.end.dataset.col)
            )
        );
    }
}
