(function () {
    var createEl = function (tagName, attrs) {
        var anchor = document.createElement(tagName);
        Object.keys(attrs).forEach(function (key) {
            anchor[key] = attrs[key];
        });
        return anchor;
    };

    var createAnchorFromHeading = function (headingEl) {
        return createEl(
            "a",
            {
                className: "ref",
                href: "#" + headingEl.id,
                textContent: "#",
                title: headingEl.textContent
            }
        );
    };

    window.addEventListener("load", function () {
        Array.prototype.forEach.call(document.querySelectorAll("#main h1[id], #main h2[id], #main h3[id], #main h4[id], #main h5[id]"), function (el) {
            var a = createAnchorFromHeading(el);
            el.classList.add("has-ref");
            el.addEventListener("click", function () {
                a.click();
            });
            el.insertBefore(a, el.firstChild);
        });
    });
})();
