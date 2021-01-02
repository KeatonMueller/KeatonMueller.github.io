/**
 * Turn hover effects on desktop into click effects on mobile for the
 * /projects.html page
 */

// element to replace hover with click
const elt = document.querySelector(".buttons");
// another visible element that might get clicked
const span = document.querySelector(".buttons span");
// the buttons that must be deactivated when hidden
const btns = document.querySelectorAll(".buttons button");

// function to toggle 'hover' class
const toggleHover = (event) => {
    // touch events must disable mouse events to prevent double firing
    if (event.type === "touchstart") {
        elt.removeEventListener("mouseenter", toggleHover);
        elt.removeEventListener("mouseleave", toggleHover);
    }

    // don't toggle if clicked something else
    if (event.target !== elt && event.target !== span) return;
    // toggle hover on .buttons element
    elt.classList.toggle("hover");
    // toggle active on all of the buttons after a delay
    setTimeout(() => {
        btns.forEach((btn) => {
            btn.classList.toggle("active");
        });
    }, 250);
};

// add event listeners to the hoverable element
["mouseenter", "mouseleave", "touchstart"].forEach((event) => {
    elt.addEventListener(event, toggleHover, false);
});
