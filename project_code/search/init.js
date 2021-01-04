import { BOX_SIZE, Type, State } from "./constants.js";
import { boxMap } from "./index.js";

let numRows;
let numCols;
/**
 * Initialize the search grid
 */
const initGrid = () => {
    // get grid and ensure it's empty
    const grid = document.getElementById("search-grid");
    grid.innerHTML = "";
    boxMap.grid = [];
    let box;
    let gridRow;
    // calculate number of boxes to add
    numCols = Math.floor(grid.clientWidth / BOX_SIZE);
    numRows = Math.floor(grid.clientHeight / BOX_SIZE);

    // create boxes and place them in the grid
    for (let row = 0; row < numRows; row++) {
        gridRow = [];
        for (let col = 0; col < numCols; col++) {
            box = document.createElement("div");
            box.id = `${row},${col}`;
            box.dataset.row = row;
            box.dataset.col = col;
            box.style.gridRow = `${row + 1}/${row + 2}`;
            box.style.gridColumn = `${col + 1}/${col + 2}`;
            box.classList.add("box", Type.EMPTY, State.UNVISITED);
            grid.appendChild(box);
            gridRow.push(box);
        }
        boxMap.grid.push(gridRow);
    }

    // initialize start and end boxes
    const middleRow = Math.floor(numRows / 2);
    const columnFourthSize = Math.floor(numCols / 4);
    const startElt = boxMap.grid[middleRow][columnFourthSize];
    const endElt = boxMap.grid[middleRow][columnFourthSize * 3];
    startElt.classList.remove(Type.EMPTY);
    startElt.classList.add(Type.START);
    endElt.classList.remove(Type.EMPTY);
    endElt.classList.add(Type.END);

    // save in boxMap
    boxMap.start = startElt;
    boxMap.end = endElt;
};

// reset grid when window changes size
window.onresize = initGrid;

/**
 * Change the starting box
 * @param {HTMLElement} elt New starting box
 */
const changeStart = (elt) => {
    boxMap.start = elt;
};
/**
 * Change the ending box
 * @param {HTMLElement} elt New ending box
 */
const changeEnd = (elt) => {
    boxMap.end = elt;
};

export { initGrid, boxMap, changeStart, changeEnd, numRows, numCols };
