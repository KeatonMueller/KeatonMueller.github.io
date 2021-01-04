import { initGrid } from "./init.js";
import { Style, SearchState, SearchType } from "./constants.js";
import Search from "./search.js";
import "./actions.js";

/**
 * Map keeping track of all of the boxes.
 *  start => the HTMLElement of the starting box
 *  end => the HTMLElement of the ending box
 *  grid => 2d array of HTMLElements for each box
 */
export const boxMap = {
    start: null,
    end: null,
    grid: [],
};

// initialize css grid
initGrid();

/**
 * State of the search grid. May be equal to any of the SearchState
 * or SearchType values. A SearchType value indicates that type of search
 * has been fully completed
 */
export let state = SearchState.NO_SEARCH;

/**
 * Change state to given state
 * @param {string} newState New state
 */
export const changeState = (newState) => {
    state = newState;
};

// search object to perform searches with
const search = new Search();

/**
 * Start a new animation for the given search algorithm
 * @param {string} type Type of search algorithm to animate
 */
export const animateSearch = (type) => {
    changeState(SearchState.SEARCHING);
    search.animateSearch(type);
};

/**
 * Fully perform the given search algorithm without animation
 * @param {string} type Type of search algorithm to perform
 */
export const performSearch = (type) => {
    changeState(SearchState.SEARCHING);
    search.performSearch(type);
};

/**
 * Add pulse style to given box, then remove it once the effect is finished
 * @param {HTMLElement} box Box to pulse
 */
export const pulse = (box) => {
    box.classList.add(Style.PULSE);
    setTimeout(() => {
        box.classList.remove(Style.PULSE);
    }, 300);
};
