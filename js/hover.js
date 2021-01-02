/**
 * Turn hover effects on desktop into click effects on mobile for the
 * /projects.html page
 */

// list of elements that replace hover with click
const elts = document.querySelectorAll(".card");

// currently hovering element
let hovering = undefined;

// function to toggle 'hover' class
const toggleHover = (event) => {
    // touch events must disable mouse events to prevent double firing
    if (event.type === "touchstart") {
        elts.forEach((elt) => {
            elt.removeEventListener("mouseenter", toggleHover);
            elt.removeEventListener("mouseleave", toggleHover);
        });
    }
    // get clicked element
    let elt = event.target;
    // don't toggle hover if clicking a link
    if (elt.tagName === "A") {
        return;
    }
    // search for matching .card element
    let found = false;
    elts.forEach((_elt) => {
        if (elt === _elt) {
            found = true;
        }
    });
    // if not found, use the parent
    if (!found) {
        elt = elt.parentElement;
        event.stopPropagation(); // stop hidden links from working
    }
    // toggle hover on .card element
    elt.classList.toggle("hover");

    // enable links after animation finishes
    setTimeout(() => {
        elt.classList.toggle("active");
    }, 500);

    // remove hover from previously hovered element
    if (hovering === undefined) {
        hovering = elt;
    } else if (hovering === elt) {
        hovering = undefined;
    } else {
        hovering.classList.toggle("hover");
        hovering.classList.toggle("active");
        hovering = elt;
    }
};

// add event listener to every hoverable element
["mouseenter", "mouseleave", "touchstart"].forEach((event) => {
    elts.forEach((elt) => {
        elt.addEventListener(event, toggleHover, false);
    });
});
