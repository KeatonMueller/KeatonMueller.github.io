import { changeStart, changeEnd } from "./init.js";
import { Type, State, SearchState, SearchType } from "./constants.js";
import {
    boxMap,
    animateSearch,
    state,
    changeState,
    pulse,
    performSearch,
} from "./index.js";

// type of box currently dragging
let dragging = Type.NONE;
/**
 * Handle click events
 * @param {Event} e Click event
 */
const handleClick = (e) => {
    const elt = e.target;
    // do nothing if animating or a right click
    if (
        state === SearchState.SEARCHING ||
        state === SearchState.HIGHLIGHTING ||
        e.buttons !== 1
    )
        return;

    // if clicked between boxes, default to placing walls
    if (elt.id === "search-grid") {
        dragging = Type.WALL;
        return;
    }
    // do nothing if clicked non-box element
    if (!elt.classList.contains("box")) return;

    e.preventDefault();

    if (dragging === Type.NONE) {
        // if not currently dragging
        if (elt.classList.contains(Type.EMPTY)) {
            // click an empty space => place wall
            dragging = Type.WALL;
            elt.classList.remove(Type.EMPTY);
            elt.classList.add(Type.WALL);
            pulse(elt);
        } else if (elt.classList.contains(Type.WALL)) {
            // click a wall => remove wall
            dragging = Type.EMPTY;
            elt.classList.remove(Type.WALL);
            elt.classList.add(Type.EMPTY);
        } else {
            // click start or end => do nothing for now
            dragging = elt.classList.contains(Type.START)
                ? Type.START
                : Type.END;
        }
    }

    // if a search was already completed, recompute it
    if (state !== SearchState.NO_SEARCH) {
        // store state
        const toSearch = state;
        clearBoxes(false);
        changeState(SearchState.NO_SEARCH);
        performSearch(toSearch);
    }
};

/**
 * Handle move events
 * @param {Event} e Move event
 */
const handleMove = (e) => {
    const elt = e.target;
    // do nothing if animating, a right click, or non-box element clicked
    if (
        state === SearchState.SEARCHING ||
        state === SearchState.HIGHLIGHTING ||
        e.buttons !== 1 ||
        !elt.classList.contains("box")
    )
        return;
    e.preventDefault();

    if (dragging === Type.NONE) {
        // if not dragging anything, return
        return;
    } else if (dragging === Type.WALL) {
        // if dragging walls
        if (elt.classList.contains(Type.EMPTY)) {
            // dragged over empty square => place wall
            elt.classList.remove(Type.EMPTY);
            elt.classList.add(Type.WALL);
            pulse(elt);
        }
    } else if (dragging === Type.EMPTY) {
        // if clearing walls
        if (elt.classList.contains(Type.WALL)) {
            // dragged over a wall => remove wall
            elt.classList.remove(Type.WALL);
            elt.classList.add(Type.EMPTY);
        }
    } else {
        // if moving the start/end
        if (elt.classList.contains(Type.EMPTY)) {
            // dragged over empty square => move start/end
            elt.classList.remove(Type.EMPTY);
            elt.classList.add(dragging);
            if (dragging === Type.START) {
                // dragging the start
                boxMap.start.classList.remove(Type.START);
                boxMap.start.classList.add(Type.EMPTY);
                changeStart(elt);
            } else if (dragging === Type.END) {
                // dragging the end
                boxMap.end.classList.remove(Type.END);
                boxMap.end.classList.add(Type.EMPTY);
                changeEnd(elt);
            }
        }
    }

    // if a search was already completed, recompute it
    if (state !== SearchState.NO_SEARCH) {
        // store state
        const toSearch = state;
        clearBoxes(false);
        changeState(SearchState.NO_SEARCH);
        performSearch(toSearch);
    }
};

/**
 * Handle release events
 */
const handleRelease = () => {
    dragging = Type.NONE;
};

// add event listeners
document.addEventListener("pointerdown", handleClick, false);
document.addEventListener("pointermove", handleMove, false);
document.addEventListener("pointerup", handleRelease, false);

/**
 * Remove search state from given box. Optionally clear walls as well
 * @param {HTMLElement} elt Box to clear
 * @param {boolean} all Whether or not to clear walls
 */
const clearBox = (elt, all) => {
    if (all && elt.classList.contains(Type.WALL)) {
        elt.classList.remove(Type.WALL);
        elt.classList.add(Type.EMPTY);
    }
    elt.classList.remove(State.VISITED);
    elt.classList.remove(State.PATH);
    elt.classList.add(State.UNVISITED);
};

/**
 * Immediately remove search state from grid. Optionally clear walls
 * @param {boolean} all Whether or not to clear walls
 */
const clearBoxes = (all) => {
    boxMap.grid.forEach((gridRow) => {
        gridRow.forEach((box) => {
            clearBox(box, all);
        });
    });
};
/**
 * Remove search state from grid on slight delay to account for
 * any current animations. Optionally clear walls
 * @param {boolean} all Whether or not to clear walls
 */
const clearGrid = (all) => () => {
    {
        changeState(SearchState.NO_SEARCH);
        // slight delay to finish any current animations
        setTimeout(() => {
            clearBoxes(all);
        }, 100);
    }
};

/**
 * Initiate a new search animation
 * @param {string} newType Type of animation to start
 */
const newAnimation = (newType) => () => {
    clearGrid(false)();
    setTimeout(() => animateSearch(newType), 100);
};

// get buttons from DOM
const dfsBtn = document.getElementById(SearchType.DFS);
const bfsBtn = document.getElementById(SearchType.BFS);
const aStarBtn = document.getElementById(SearchType.A_STAR);
const clearSearchBtn = document.getElementById("clearSearch");
const clearAllBtn = document.getElementById("clearAll");

// connect onclick behavior
dfsBtn.onclick = newAnimation(SearchType.DFS);
bfsBtn.onclick = newAnimation(SearchType.BFS);
aStarBtn.onclick = newAnimation(SearchType.A_STAR);
clearSearchBtn.onclick = clearGrid(false);
clearAllBtn.onclick = clearGrid(true);
