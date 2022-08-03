var navMenu = document.getElementById("nav-menu");
var toggle = document.getElementById("toggle");

document.onclick = function (e) {
    if (e.target.id !== 'toggle' && e.target.id !== 'nav-menu') {

        toggle.classList.remove("active");
        navMenu.classList.remove("active");
        if (navMenu.classList.contains("active")) {
            document.body.classList.add("overflow-y");
        } else {
            document.body.classList.remove("overflow-y");
        }
    }
}

toggle.onclick = function () {
    navMenu.classList.toggle("active");
    toggle.classList.toggle("active");

    if (navMenu.classList.contains("active")) {
        document.body.classList.add("overflow-y");
    } else {
        document.body.classList.remove("overflow-y");
    }
}


$('#carousel').flipster({
    itemContainer: "ul",
    itemSelector: "li",
    start: 2,
    fadeIn: 400,
    loop: !1,
    autoplay: !1,
    pauseOnHover: !1,
    style: "coverflow",
    spacing: -.6,
    click: !0,
    keyboard: !0,
    scrollwheel: !1,
    touch: !0,
    nav: !1,
})
