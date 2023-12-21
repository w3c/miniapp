// This script checks if the document is displayed inside an iframe or
// similar and if so:
//
//   * adds target=_parent to links (unless they already have a
//     target attribute), so the links replace the parent instead of
//     opening inside the iframe, and
//
//   * adds class=framed to the body element, so that the style sheet
//     can apply suitable styles, if needed.
//
// This is useful, e.g., in HTML slides that use the Shower script
// (and probably other scripts, too) to allow the slides to be
// displayed inside iframe elements in another document. Add the
// script to the slides with:
//
//     <script src="../path/to/iframe-fixup.js"></script>
//
// and then include a slide in an iframe with, e.g.:
//
//     <iframe src="../path/to/slides.html?full#cover">
//       <a href="../path/to/slides.html?full#cover">cover slide</a>
//     </iframe>
//
// The "?full" at the end of the URL tells Shower, b6+ and similar
// slide frameworks to display a single slide; and the "#cover" tells
// them to display the slide that has id=cover.
//
// This script is not necessary with the b6+ slide framework, which
// already includes equivalent code. (But it is not harmful either.)
//
// Created: 19 December 2020
// Author: Bert Bos <bert@w3.org>


(function() {
  "use strict";


  // checkIfFramed -- apply some fixes if we are inside an iframe
  function checkIfFramed()
  {
    var anchors, i;

    // Check that we're not the top document and not yet marked.
    if (window.parent != window &&
	!document.body.classList.contains('framed')) {

      // Add target=_parent to all hyperlinks that do not have a target.
      anchors = document.getElementsByTagName('a');
      for (i = 0; i < anchors.length; i++)
	if (!anchors[i].hasAttribute('target'))
	  anchors[i].setAttribute('target', '_parent');

      // Add a class to allow the style to do things.
      document.body.classList.add('framed');
    }
  }


  // Do it if the document has been loaded, otherwise as soon as it has been.
  if (document.readyState !== 'loading') checkIfFramed();
  else document.addEventListener('DOMContentLoaded', checkIfFramed);

})();
