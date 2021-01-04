/**
 * Types of boxes
 */
const Type = {
    NONE: "none",
    EMPTY: "empty",
    WALL: "wall",
    START: "start",
    END: "end",
};

/**
 * States boxes may be in the course of search algorithms
 */
const State = {
    UNVISITED: "unvisited",
    VISITED: "visited",
    PATH: "path",
};

/**
 * Class names to apply to HTMLElements for certain styles
 */
const Style = {
    PULSE: "pulse",
};

/**
 * States the grid may be in
 */
const SearchState = {
    NO_SEARCH: "no-search",
    SEARCHING: "searching",
    HIGHLIGHTING: "highlighting",
};

/**
 * Types of search algorithms
 */
const SearchType = {
    DFS: "dfs",
    BFS: "bfs",
    A_STAR: "a*",
};

const actualBoxSize = 16; // minimum pixel width/height of each box
const gap = 2; // gap between grid areas
const BOX_SIZE = actualBoxSize + gap; // size each box takes up on the screen

// delay between search ticks (in milliseconds)
const TICK_DELAY = 25;

// number of search iterations to do per tick
const ITER_PER_TICK = 150;

export {
    Type,
    State,
    Style,
    SearchState,
    SearchType,
    BOX_SIZE,
    TICK_DELAY,
    ITER_PER_TICK,
};
