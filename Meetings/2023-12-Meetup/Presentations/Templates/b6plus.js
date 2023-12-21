/* b6plus.js $Revision: 1.67 $
 *
 * Script to simulate projection mode on browsers that don't support
 * media=projection or 'overflow-block: paged' (or ‘overflow-block:
 * optional-paged’, from the 2014 Media Queries draft) but do support
 * Javascript.
 *
 * Documentation and latest version:
 *
 *   https://www.w3.org/Talks/Tools/b6plus/
 *
 * Brief usage instructions:
 *
 * Add the script to a page with
 *
 *   <script src="b6plus.js" type="text/javascript"></script>
 *
 * The script assumes each slide starts with an H1 or an element with
 * class "slide", which is a direct child of the BODY. All elements
 * until the next H1 or class "slide" are part of the slide, except
 * for those with a class of "comment", which are hidden in slide
 * mode.
 *
 * Elements with a class of "progress", "slidenum" or "numslides" are
 * treated specially. They can be used to display progress in the
 * slide show, as follows. Elements with a class of "numslides" will
 * have their content replaced by the total number of slides in
 * decimal. Elements with a class of "slidenum" will have their
 * content replaced by the number of the currently displayed slide in
 * decimal. The first slide is numbered 1. Elements with a class of
 * "progress" will get a 'width' property whose value is a percentage
 * between 0% and 100%, corresponding to the progress in the slide
 * show: if there are M slide in total and the currently displayed
 * slide is number N, the 'width' property will be N/M * 100%.
 *
 * There can be as many of these elements as desired. If they are
 * defined as children of the BODY, they will be visible all the time.
 * Otherwise their visibility depends on their parent.
 *
 * Usage:
 *
 * - Press A to toggle normal and slide mode. The script starts in
 *   normal mode.
 *
 * - Press Page-Down to go to the next slide. Press Page-Up, up arrow
 *   or left arrow to back-up one page.
 *
 * - Press Space, right arrow, down arrow or mouse button 1 to advance
 *   (incremental display or next slide)
 *
 * On touch screens, a tap with three fingers toggles slide mode, a
 * wipe right goes back one slide, and wipe left advances.
 *
 * To do: don't do anything if media = projection
 *
 * To do: option to allow clicking in the left third of a slide to go
 * back?
 *
 * To do: Accessibility of the second window.
 *
 * To do: Show an icon in the corner when sync mode is on?
 *
 * To do: Allow a language for localized messages and clocks that is
 * different from the slides' language?
 *
 * To do: More or other syntaxes for commands in syncSlide()? "all" or
 * "index" for "0"; "<", "previous" for "-"; ">", "next" for "+";
 * "last" for "$"...
 *
 * Derived from code by Dave Raggett.
 *
 * Author: Bert Bos <bert@w3.org>
 * Created: May 23, 2005 (b5)
 * Modified: Jan 2012 (b5 -> b6)
 * Modified: Oct 2016 (added jump to ID; fixes bugs with Home/End key handling)
 * Modified: Apr 2018 (added touch events)
 * Modified: May 2018 (support 'overflow-block' from Media Queries 4)
 * Modified: Mar 2019 (support fixed aspect ratio, progress elements, b6 -> b6+)
 * Modified: Aug 2020 (add class=visited to past elts in incremental display)
 * Modified: Oct 2020 (start in slide mode if URL contains "?full")
 * Modified: Apr 2021 (disable navigation if URL contains ‘?static’)
 * Modified: May 2021 (rescale if window size changes while in slide mode)
 * Modified: Jun 2021 (only one incremental item active, as in Shower since 3.1)
 * Modified: Sep 2021 (a11y: added role=application and a live region)
 * Modified: Dec 2021 (added noclick option; set slide number in URL if no ID)
 * Modified: Dec 2021 (Added popup help tied to the "?" key)
 * Modified: Apr 2022 (Added support for a second window, tied to the "2" key)
 * Modified: Apr 2022 (forwarding of events in the second window to the first)
 * Modified: Aug 2022 (help popup appears in the 2nd window if requested there)
 * Modified: Nov 2022 (support server-sent events to sync slides)
 * Modified: Nov 2022 (added clocks; localized to German, French and Dutch)
 * Modified: Dec 2022 (protect against loading b6plus.js twice)
 *
 * Copyright 2005-2022 W3C (MIT, ERCIM, Keio, Beihang)
 * See http://www.w3.org/Consortium/Legal/copyright-software
 */

(function() {

"use strict";

/* Localized strings */
const translations = {
  "min": {			// Abbreviation for "minutes"
    de: "Min",
    fr: "min",
    nl: "min"},
  "current time": {
    de: "aktuelle Uhrzeit",
    fr: "heure actuelle",
    nl: "huidige tijd"},
  "used": {
    de: "verbraucht",
    fr: "utilisé",
    nl: "gebruikt"},
  "remaining": {		// As in "remaining time"
    de: "Restzeit",
    fr: "restant",
    nl: "resterend"},
  "pause": {			// Label on a button to pause the clock
    de: "Pause",
    fr: "pause",
    nl: "pauze"},
  "resume": {			// Label in a button to pause the clock
    de: "fortsetzen",
    fr: "reprendre",
    nl: "hervatten"},
  "+1 min": {			// Label on a button to add 1 minute
    de: "+1 Min",
    fr: "+1 min",
    nl: "+1 min"},
  "-1 min": {			// Label on a button to shorten time by 1 minute
    de: "-1 Min",
    fr: "-1 min",
    nl: "-1 min"},
  "restart": {			// Label on a button to reset the clock
    de: "Neustart",
    fr: "réinitialiser",
    nl: "herstart"},
  "No navigation possible while sync mode is on.": {
    de: "Bei aktiviertem Sync-Modus ist keine Navigation möglich.",
    fr: "Aucune navigation possible lorsque le mode synchro est activé.",
    nl: "Geen navigatie mogelijk terwijl de synchronisatiemodus is ingeschakeld."},
  "Press S to toggle sync mode off.": {
    de: "Drücken Sie S, um den Sync-Modus auszuschalten.",
    fr: "Appuyez sur S pour désactiver le mode synchro.",
    nl: "Druk op S om de synchronisatiemodus uit te schakelen."},
  "Synchronization error.": {
    de: "Synchronisierungsfehler",
    fr: "Erreur de synchronisation.",
    nl :"Synchronisatiefout."},
  "You can try to turn synchronization back on with the S key.": {
    de: "Sie können versuchen, die Synchronisation mit der Taste S wieder einzuschalten.",
    fr: "Vous pouvez essayer de réactiver la synchronisation avec la touche S.",
    nl: "U kunt proberen de synchronisatie weer in te schakelen met de S-toets."},
  "An error occurred while trying to switch into full-screen mode: ": {
    de: "Beim Wechsel in den Vollbildmodus ist ein Fehler aufgetreten:",
    fr: "Une erreur s'est produite en essayant de passer en mode plein écran :",
    nl: "Er is een fout opgetreden bij het overschakelen naar volledig scherm:"},
  "Full-screen mode is not possible": {
    de: "Der Vollbildmodus ist nicht möglich",
    fr: "Le mode plein écran est impossible",
    nl: "Volledig scherm is niet mogelijk"},
  "Syncing turned off.\nPress S to turn syncing back on.": {
    de: "Synchronisierung ausgeschaltet.\nDrücken Sie S, um die Synchronisierung wieder einzuschalten.",
    fr: "Synchronisation désactivée\nAppuyez sur S pour réactiver la synchronisation,",
    nl: "Synchroniseren uitgeschakeld\nDruk op S om het synchroniseren weer in te schakelen"},
  "Syncing turned on\nPress S to turn syncing off": {
    de: "Synchronisierung eingeschaltet\nDrücken Sie S, um die Synchronisierung auszuschalten",
    fr: "Synchronisation activée\nAppuyez sur S pour désactiver la synchronisation",
    nl: "Synchronisatie ingeschakeld\nDruk op S om synchronisatie uit te schakelen"},
  "Mouse &amp; keyboard commands": {
    de: "Maus- und Tastaturbefehle",
    fr: "Commandes de la souris et du clavier",
    nl: "Muis- en toetsenbordopdrachten"},
  "<kbd>A</kbd>, double click, 3-finger touch": {
    de: "<kbd>A</kbd>, Doppelklick, 3-Finger-Touch",
    fr: "<kbd>A</kbd>, double clic, toucher à 3 doigts",
    nl: "<kbd>A</kbd>, dubbelklik, 3-vinger touch"},
  "enter slide mode": {
    de: "Dia-Modus einschalten",
    fr: "passer en mode diapo",
    nl: "ga naar de diamodus"},
  "<kbd>A</kbd>, <kbd>Esc</kbd>, 3-finger touch": {
    de: "<kbd>A</kbd>, <kbd>Esc</kbd>, 3-Finger-Touch",
    fr: "<kbd>A</kbd>, <kbd>Esc</kbd>, toucher à 3 doigts",
    nl: "<kbd>A</kbd>, <kbd>Esc</kbd>, 3-vinger touch"},
  "leave slide mode": {
    de: "Dia-Modus ausschalten",
    fr: "quiter le mode diapo",
    nl: "verlaat de diamodus"},
  "<kbd>space</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, swipe left": {
    de: "<kbd>Leertaste</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, links wischen",
    fr: "<kbd>espace</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, glisser vers la gauche",
    nl: "<kbd>spatie</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, veeg naar links",
  },
  "<kbd>space</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, click": {
    de: "<kbd>Leertaste</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, click",
    fr: "<kbd>espace</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, clic",
    nl: "<kbd>spatie</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, klik"},
  "next slide or incremental element": {
    de: "nächstes Dia oder inkrementelles Element",
    fr: "diapo suivante ou élément incrémentiel",
    nl: "volgende dia of incrementeel element"},
  "<kbd>PgDn</kbd>": {},
  "<kbd>PgDn</kbd>, swipe left": {
    de: "<kbd>PgDn</kbd>, links wischen",
    fr: "<kbd>PgDn</kbd>, glisser vers la gauche",
    nl: "<kbd>PgDn</kbd>, veeg naar links"},
  "next slide": {
    de: "nächstes Dia",
    fr: "diapo suivante",
    nl: "volgende dia"},
  "<kbd>PgUp</kbd>, <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, swipe right": {
    de: "<kbd>PgUp</kbd>, <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, rechts wischen",
    fr: "<kbd>PgUp</kbd>, <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, glisser vers la droite",
    nl: "<kbd>PgUp</kbd>, <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, veeg naar rechts"},
  "previous slide": {
    de: "vorheriges Dia",
    fr: "diapo précédente",
    nl: "vorige dia"},
  "<kbd>End</kbd>": {},
  "last slide": {
    de: "letztes Dia",
    fr: "dernière diapo",
    nl: "laatste dia"},
  "<kbd>Home</kbd>": {},
  "first slide": {
    de: "erstes Dia",
    fr: "première diapo",
    nl: "eerste dia"},
  "<kbd>F1</kbd>, <kbd>F</kbd>": {},
  "toggle fullscreen mode": {
    de: "Vollbildmodus umschalten",
    fr: "basculer le mode plein écran",
    nl: "volledig scherm aan/uit",
  },
  "<kbd>2</kbd>": {},
  "open second window": {
    de: "zweites Fenster öffnen",
    fr: "ouvrir la seconde fenêtre",
    nl: "tweede venster openen"},
  "<kbd>?</kbd>": {},
  "this help": {
    de: "diese Hilfe",
    fr: "cette aide",
    nl: "deze hulp"},
  "<kbd>S</kbd>": {},
  "toggle sync mode on/off": {
    de: "Sync-Modus ein-/ausschalten",
    fr: "activer/désactiver le mode synchro",
    nl: "sync-modus aan/uit"},
  "(More information in the <a target=_parent href='https://www.w3.org/Talks/Tools/b6plus/'>b6+ manual</a>)": {
    de: "(Weitere Informationen im <a target=_parent href='https://www.w3.org/Talks/Tools/b6plus/'>b6+ Handbuch</a>)",
    fr: "(Plus d'informations dans <a target=_parent href='https://www.w3.org/Talks/Tools/b6plus/'>le manuel de b6+</a>)",
    nl: "(Meer informatie in <a target=_parent href='https://www.w3.org/Talks/Tools/b6plus/'>de b6+ handleiding</a>)"},
  "Click or press Enter": {
    de: "klicken oder Enter drücken",
    fr: "cliquez ou appuyez sur Entrée",
    nl: "klik of druk op enter"},
};

/* Global variables */
var curslide = null;
var slidemode = false;		// In slide show mode or normal mode?
var switchInProgress = false;	// True if waiting for finishToggleMode()
var incrementals = null;	// Array of incrementally displayed items
var gesture = {};		// Info about touch/pointer gesture
var numslides = 0;		// Number of slides
var stylesToLoad = 0;		// # of load events to wait for
var limit = 0;			// A time limit used by toggleMode()
var nextid = 0;			// For generating unique IDs
var interactive = true;		// Allow navigating to a different slide?
var progressElts = [];		// Elements with class=progress
var slidenumElts = [];		// Elements with class=slidenum
var liveregion = null;		// Element [role=region][aria-live=assertive]
var savedContent = "";		// Initial content of the liveregion
var noclick = false;		// If true, mouse clicks do not advance slides
var hideMouseTime = null;	// If set, hide idle mouse pointer after N ms
var helptext = null;		// List of keyboard and mouse commands
var hideMouseID = null;		// ID of timer to hide the mouse pointer
var singleClickTimer = null;	// Timeout to distinguish single & double click
var secondwindow = null;	// Second window for speaker notes
var firstwindow = null;		// The window that opened this one
var syncMode = false;		// Sync mode
var syncURL = null;		// URL of sync server
var eventsource = null;		// Sync server object
var startTime = 0;		// Start time, used by displayed clocks
var pauseStartTime = 0;		// 0 = clocks not paused, > 0 = start of pause
var realHoursElts = null;	// Elements with wallclock time: hours
var realMinutesElts = null;	// Elements with wallclock time: minutes
var realSecondsElts = null;	// Elements with wallclock time: seconds
var usedHoursElts = null;	// Elements with used time: hours
var usedMinutesElts = null;	// Elements with used time: minutes
var usedSecondsElts = null;	// Elements with used time: seconds
var leftHoursElts = null;	// Elements with remaining time: hours
var leftMinutesElts = null;	// Elements with remaining time: minutes
var leftSecondsElts = null;	// Elements with remaining time: seconds
var clockTimer = 0;		// Interval timer for clocks
var duration = 30 * 60 * 1000;	// Default duration of a presentation 30 min
var warnTime = 5 * 60 * 1000;	// Warn 5 minutes before end of duration
var language = null;		// Language for localization


/* _ -- return translation for text, or text, if none is available */
function _(text)
{
  return translations[text] && translations[text][language] ?
    translations[text][language] : text;
}


/* generateID -- generate a unique ID */
function generateID()
{
  var id;

  do {id = "x" + nextid++;} while (document.getElementById(id));
  return id;
}


/* cloneNodeWithoutID -- deep clone a node, but not any ID attributes */
function cloneNodeWithoutID(elt)
{
  var clone, h;

  clone = elt.cloneNode(false);
  if (elt.nodeType === 1 /*Node.ELEMENT_NODE*/) {
    clone.removeAttribute("id");			// If any
    for (h = elt.firstChild; h; h = h.nextSibling)
      clone.appendChild(cloneNodeWithoutID(h));		// Recursive
  }
  return clone;
}


/* ticker -- update clock elements */
function ticker(force)
{
  var now, s0, m0, h0, s1, m1, h1, s2, m2, h2, used, left;

  // This function is usually called as interval time handler, but is
  // also called when the clocks need to be updated, e.g., after a change
  // in duration or pause/resume.

  now = new Date();

  s0 = now.getSeconds();
  m0 = now.getMinutes();
  h0 = now.getHours();

  for (const e of realHoursElts)
    e.textContent = h0.toString().padStart(2, "0");
  for (const e of realMinutesElts)
    e.textContent = m0.toString().padStart(2, "0");
  for (const e of realSecondsElts)
    e.textContent = s0.toString().padStart(2, "0");

  if (pauseStartTime === 0 || force) { // Clocks aren't paused or update forced

    used = now.getTime() - startTime;
    s1 = Math.trunc(used / 1000);
    if (usedHoursElts.length != 0) { // Used hours are displayed
      h1 = Math.trunc(s1 / 60 / 60); s1 -= h1 * 60 * 60;
      m1 = Math.trunc(s1 / 60); s1 -= m1 * 60;
    } else if (usedMinutesElts.length != 0) { // No hours, but minutes are shown
      m1 = Math.trunc(s1 / 60); s1 -= m1 * 60;
    }
    for (const e of usedHoursElts)
      e.textContent = h1.toString().padStart(2, "0");
    for (const e of usedMinutesElts)
      e.textContent = m1.toString().padStart(2, "0");
    for (const e of usedSecondsElts)
      e.textContent = s1.toString().padStart(2, "0");

    left = Math.max(0, duration - used);
    s2 = Math.trunc(left / 1000);
    if (leftHoursElts.length != 0) { // Remaining hours are displayed
      h2 = Math.trunc(s2 / 60 / 60); s2 -= 60 * 60 * h2;
      m2 = Math.trunc(s2 / 60); s2 -= 60 * m2;
    } else if (leftMinutesElts.length) { // No hours, but minutes are shown
      m2 = Math.trunc(s2 / 60); s2 -= 60 * m2;
    }
    for (const e of leftHoursElts)
      e.textContent = h2.toString().padStart(2, "0");
    for (const e of leftMinutesElts)
      e.textContent = m2.toString().padStart(2, "0");
    for (const e of leftSecondsElts)
      e.textContent = s2.toString().padStart(2, "0");

    // Set a precise factor 0.0..1.0 in a CSS variable on BODY.
    // Set an integer percentage 00..100 in a data attribute on BODY.
    // If time left is <= warnTime, set class=time-warning on BODY.
    document.body.style.setProperty("--time-factor", 1 - left/duration);
    document.body.setAttribute("data-time-factor",
      Math.trunc(100 * (1 - left/duration)).toString().padStart(2, "0"));
    if (left <= warnTime) document.body.classList.add("time-warning");
    else document.body.classList.remove("time-warning");
  }
}


/* addMinute -- add 1 minute to the duration */
function addMinute(ev)
{
  duration += 60000;

  if (firstwindow)
    firstwindow.postMessage({event: "duration", v: duration});
  else if (secondwindow)
    secondwindow.postMessage({event: "duration", v: duration});

  ticker(true);			// Update the clocks

  ev.stopPropagation();
  ev.preventDefault();
}


/* subtractMinute -- subtract 1 minute from the duration */
function subtractMinute(ev)
{
  duration = Math.max(0, duration - 60000);

  if (firstwindow)
    firstwindow.postMessage({event: "duration", v: duration});
  else if (secondwindow)
    secondwindow.postMessage({event: "duration", v: duration});

  ticker(true);			// Update the clocks

  ev.stopPropagation();
  ev.preventDefault();
}


/* pauseTime -- pause or resume the clocks */
function pauseTime(ev)
{
  if (pauseStartTime) {		// We're resuming, add paused time to startTime
    startTime += Date.now() - pauseStartTime;
    pauseStartTime = 0;
    document.body.classList.remove("paused");
  } else {			// We're pausing, remember start time of pause
    pauseStartTime = Date.now();
    document.body.classList.add("paused");
  }

  ticker(true);			// Update the clocks

  if (firstwindow) {
    firstwindow.postMessage({event: "startTime", v: startTime});
    firstwindow.postMessage({event: "pauseStartTime", v: pauseStartTime});
  } else if (secondwindow) {
    secondwindow.postMessage({event: "startTime", v: startTime});
    secondwindow.postMessage({event: "pauseStartTime", v: pauseStartTime});
  }

  ev.stopPropagation();
  ev.preventDefault();
}


/* resetTime -- restart the clock */
function resetTime(ev)
{
  startTime = Date.now();

  if (firstwindow)
    firstwindow.postMessage({event: "startTime", v: startTime});
  else if (secondwindow)
    secondwindow.postMessage({event: "startTime", v: startTime});

  ticker(true);			// Update the clocks

  ev.stopPropagation();
  ev.preventDefault();
}


/* ignoreEvent -- cancel an event */
function ignoreEvent(ev)
{
  ev.stopPropagation();
  ev.preventDefault();
}


/* initClocks -- find and initialize clock elements */
function initClocks()
{
  var t;

  // Get the duration and warn time of the presentation from body.class.
  for (const c of document.body.classList) {
    if ((t = c.match(/^duration=([0-9.]+)$/))) duration = 1000 * 60 * t[1];
    if ((t = c.match(/^warn=([0-9.]+)$/))) warnTime = 1000 * 60 * t[1];
  }

  // If there are elements with class=fullclock or class=clock
  // and that don't have child elements already, fill them with
  // appropriate elements to make a clock.
  for (const c of document.getElementsByClassName("fullclock"))
    if (!c.firstElementChild)
      c.insertAdjacentHTML("beforeend", '<i>' + _('current time') + '</i>' +
	  '<time><b class=hours-real></b>:<b class=minutes-real></b></time>' +
	  '<span><span></span></span>' +
	  '<i>' + _('used') + '</i>' +
	  '<time><b class=minutes-used></b>&#x202F;' + _('min') + '</time>' +
	  '<i>' + _('remaining') + '</i>' +
	  '<time><b class=minutes-remaining>00</b>&#x202F;' + _('min') +
	  '</time>' +
	  '<button class=timepause>' + _('pause') + '</button>' +
	  '<button class=timedec>' + _('−1 min') + '</button>' +
	  '<button class=timeinc>' + _('+1 min') + '</button>' +
	  '<button class=timereset>' + _('restart') + '</button>');
  for (const c of document.getElementsByClassName("clock"))
    if (!c.firstElementChild)
      c.insertAdjacentHTML("beforeend",
	'<time title="Remaining time. To change, add class \'duration=n\' ' +
	  'to body"><b class=minutes-remaining>00</b>&#x202F;min</time>' +
	  '<span><span></span></span>' +
	  '<button class=timepause><span title="' + _('resume') +
	  '">⏵︎</span><span title="' + _('pause') + '">⏸</span></button>' +
	  '<button class=timedec title="' + _('−1 min') + '">−1</button>' +
	  '<button class=timeinc title="'  + _('+1 min') + '">+1</button>' +
	  '<button class=timereset title="' + _('restart') + '">↺</button>');

  // Find all elements that will contain time.
  realHoursElts = document.getElementsByClassName("hours-real");
  realMinutesElts = document.getElementsByClassName("minutes-real");
  realSecondsElts = document.getElementsByClassName("seconds-real");
  usedHoursElts = document.getElementsByClassName("hours-used");
  usedMinutesElts = document.getElementsByClassName("minutes-used");
  usedSecondsElts = document.getElementsByClassName("seconds-used");
  leftHoursElts = document.getElementsByClassName("hours-remaining");
  leftMinutesElts = document.getElementsByClassName("minutes-remaining");
  leftSecondsElts = document.getElementsByClassName("seconds-remaining");

  // Find all elements that adjust the clock and install event handlers.
  for (const e of document.getElementsByClassName("timeinc")) {
    e.addEventListener("click", addMinute, true);
    e.addEventListener("dblclick", ignoreEvent, true);
  }
  for (const e of document.getElementsByClassName("timedec")) {
    e.addEventListener("click", subtractMinute, true);
    e.addEventListener("dblclick", ignoreEvent, true);
  }
  for (const e of document.getElementsByClassName("timepause")) {
    e.addEventListener("click", pauseTime, true);
    e.addEventListener("dblclick", ignoreEvent, true);
  }
  for (const e of document.getElementsByClassName("timereset")) {
    e.addEventListener("click", resetTime, true);
    e.addEventListener("dblclick", ignoreEvent, true);
  }

  // Install a timer to update the clock elements, if needed.
  if (realSecondsElts.length || usedSecondsElts.length ||
      leftSecondsElts.length)
    clockTimer = setInterval(ticker, 1000, false); // Clock tick every second
  else if (realHoursElts.length || realMinutesElts.length ||
      usedHoursElts.length || usedMinutesElts.length || leftHoursElts.length ||
      leftMinutesElts.length)
    clockTimer = setInterval(ticker, 60000, false); // Clock tick every minute

  // Remember start time of presentation.
  if (clockTimer) {
    startTime = Date.now();
    ticker(true);	  // Update any clocks, do not wait for ticker
  }
}


/* initIncrementals -- find and hide incremental elements in current slide */
function initIncrementals()
{
  var e = curslide;

  /* Collect all unvisited incremental elements into array incrementals. */
  incrementals = [];
  incrementals.cur = -1;
  do {
    /* Go to the next node, in document source order. */
    if (e.firstChild) {
      e = e.firstChild;
    } else {
      while (e && !e.nextSibling) e = e.parentNode;
      if (e) e = e.nextSibling;
    }
    if (!e) break;			/* End of document */
    if (e.nodeType != 1) continue;	/* Not an element */
    if (isStartOfSlide(e)) break;	/* Reached the next slide */
    if (e.classList.contains("incremental") || e.classList.contains("overlay"))
      for (const c of e.children) {
	if (!c.classList.contains("visited")) incrementals.push(c);
	if (c.classList.contains("active")) incrementals.cur = 0;
      }
    if (e.classList.contains("next")) {	/* It is an incremental element */
      if (!e.classList.contains("visited")) incrementals.push(e);
      if (e.classList.contains("active")) incrementals.cur = 0;
    }
  } while (1);
}


/* isStartOfSlide -- check if element has class=slide, page-break or is an H1 */
function isStartOfSlide(elt)
{
  if (elt.nodeType != 1) return false;		// Not an element
  if (elt.classList.contains("slide")) return true;
  if (window.getComputedStyle(elt).getPropertyValue('page-break-before') ==
      'always') return true;
  if (elt.nodeName != "H1") return false;

  /* The element is an H1. It starts a slide unless it is inside class=slide */
  while (true) {
    elt = elt.parentNode;
    if (!elt || elt.nodeType != 1) return true;
    if (elt.classList.contains("slide")) return false;
  }
}


/* updateProgress -- update the progress bars and slide numbers, if any */
function updateProgress()
{
  var p = curslide.b6slidenum / numslides;

  /* Set the width of the progress bars */
  for (const e of progressElts) e.style.width = 100 * p + "%";

  /* Set the content of .slidenum elements to the current slide number */
  for (const e of slidenumElts) e.textContent = curslide.b6slidenum;

  /* Set a custom variable on BODY for use by style rules */
  document.body.style.setProperty("--progress", p);
}


/* initProgress -- find .progress and .slidenum elements, count slides */
function initProgress()
{
  var s;

  /* Find all elements that are progress bars, unhide them. */
  progressElts = document.getElementsByClassName("progress");
  for (const e of progressElts)
    if (typeof e.b6savedstyle === "string") e.style.cssText = e.b6savedstyle;

  /* Find all that should contain the current slide number, unhide them. */
  slidenumElts = document.getElementsByClassName("slidenum");
  for (const e of slidenumElts)
    if (typeof e.b6savedstyle === "string") e.style.cssText = e.b6savedstyle;

  /* Find all that should contain the # of slides, fill and unhide them. */
  for (const e of document.getElementsByClassName("numslides")) {
    if (typeof e.b6savedstyle == "string") e.style.cssText = e.b6savedstyle;
    e.textContent = numslides;	// Set content to number of slides
  }

  /* Set the # of slides in a CSS counter on the BODY. */
  s = window.getComputedStyle(document.body).getPropertyValue("counter-reset");
  if (s === "none") s = ""; else s += " ";
  document.body.style.setProperty('counter-reset',s + 'numslides ' + numslides);
}


/* numberSlides -- count slides and number them */
function numberSlides()
{
  numslides = 0;
  for (const h of document.body.children)
    if (isStartOfSlide(h)) h.b6slidenum = ++numslides; // Save number in element
}


/* hideMouse -- make the mouse pointer invisible (only in slide mode) */
function hideMouse()
{
  if (slidemode) document.body.style.cursor = 'none';
  hideMouseID = 0;		// 0 = timer has fired, cursor is hidden
}


/* hideMouseReset -- event handler for mousemove to reset the hideMouse timer */
function hideMouseReset()
{
  if (hideMouseID === 0) { // Timer has fired and hid the cursor. Unhide it.
    document.body.style.cursor = null;
    hideMouseID = null;		     // null = cursor is visible
  } else if (hideMouseID !== null) { // Timer hasn't fired yet. Remove it.
    clearTimeout(hideMouseID);
    hideMouseID = null;		     // null = cursor is visible
  }

  /* If still in slide mode, set a new timer; otherwise remove ourselves. */
  if (slidemode) hideMouseID = setTimeout(hideMouse, hideMouseTime);
  else document.removeEventListener('mousemove', hideMouseReset);
}


/* initHideMouse -- set a timeout to hide the mouse pointer when it is idle */
function initHideMouse()
{
  if (hideMouseTime === null) return;

  /* Add handler to restart the timer when the mouse moves. */
  document.addEventListener('mousemove', hideMouseReset);

  /* Remove old timer, unhide cursor if hidden, start new timer. */
  hideMouseReset();
}


/* displaySlide -- make the current slide visible */
function displaySlide()
{
  var h, url;

  /* curslide has class=slide, page-break-before=always or is an H1 */
  curslide.style.cssText = curslide.b6savedstyle;
  curslide.classList.add("active");		// Compatibility with Shower
  liveregion.innerHTML = "";			// Make it empty

  if (!curslide.classList.contains('slide')) {
    liveregion.appendChild(cloneNodeWithoutID(curslide));
    /* Unhide all elements until the next slide. And copy the slide to
       the live region so that it is spoken */
    for (h = curslide.nextSibling; h && !isStartOfSlide(h); h = h.nextSibling)
      if (h !== liveregion) {
	if (h.nodeType === 1) h.style.cssText = h.b6savedstyle;
	liveregion.appendChild(cloneNodeWithoutID(h));
      }

  } else {					// class=slide
    /* Copy the contents of the slide to the live region so that it is spoken */
    for (h = curslide.firstChild; h; h = h.nextSibling)
      liveregion.appendChild(cloneNodeWithoutID(h));
  }

  updateProgress();
  initIncrementals();

  /* If there is a second window, try to scroll it to the same slide. */
  if (curslide.id && secondwindow) {
    url = new URL(secondwindow.location);
    url.hash = curslide.id;
    secondwindow.open(url, "b6+ preview window");
  }

  /* If the fragment ID is not the ID of the current slide, remove it. */
  if (curslide.id && location.hash && curslide.id != location.hash.substring(1))
    location.hash = "";

}


/* hideSlide -- make the current slide invisible */
function hideSlide()
{
  var h;

  if (!curslide) return;

  /* curslide has class=slide, page-break-before=always or is an H1 */
  curslide.classList.remove("active"); // Compatibility with Shower
  curslide.classList.add("visited");   // Compatibility with Shower
  curslide.style.visibility = "hidden";
  curslide.style.position = "absolute";
  curslide.style.top = "0";
  for (h = curslide.nextSibling; h && !isStartOfSlide(h); h = h.nextSibling)
    if (h.nodeType === 1 /*Node.ELEMENT_NODE*/ && h !== liveregion) {
      h.style.visibility = "hidden";
      h.style.position = "absolute";
      h.style.top = "0";
    }
}


/* makeCurrent -- hide the previous slide, if any, and display elt */
function makeCurrent(elt)
{
  /* assert(elt) */
  if (curslide != elt) {
    hideSlide();
    curslide = elt;
    displaySlide();
  }
}


/* fullscreen -- toggle fullscreen mode */
function fullscreen()
{
  if (document.fullscreenElement)
    document.exitFullscreen();
  else if (document.webkitFullscreenElement)
    document.webkitExitFullscreen();
  else if (document.fullscreenEnabled)
    document.documentElement.requestFullscreen({navigationUI: "hide"})
	    .catch(err => {
	      alert(_("An error occurred while trying to switch into full-screen mode: ") + err.message + ' ' + err.name);});
  else if (document.documentElement.webkitRequestFullscreen)
    document.documentElement.webkitRequestFullscreen();
  else
    window.alert(_("Full-screen mode is not possible"));
}


/* createHelpText -- fill the helptext element with help text */
function createHelpText()
{
  var iframe, button;

  /* Put the help text in an IFRAME so it is not affected by the slide style */
  iframe = document.createElement('iframe');
  button = document.createElement('button');
  iframe.src = 'data:text/html,' + encodeURIComponent(
    "<!DOCTYPE html>" +
      "<html lang=en>" +
      "<meta charset=utf-8>" +
      "<style>" +
      " body {background: #000; color: #FFF; font-size: 4vmin}" +
      " table {font-size: 1em; border-collapse: collapse; margin: 1em auto}" +
      " td {border: thin solid; padding: 0.3em 0.4em;" +
      "  vertical-align: baseline}" +
      " caption {font-weight: bold}" +
      " kbd {background: #CCC; color: #000; padding: 0.1em 0.2em;" +
      "  border-radius: 0.2em}" +
      " p {text-align: center}" +
      " a {color: inherit; text-decoration: underline}" +
      "</style>" +
      "<table>" +
      "<caption>" + _("Mouse &amp; keyboard commands") + "</caption>" +
      (syncMode ? "" :
	  "<tr><td>" + _("<kbd>A</kbd>, double click, 3-finger touch") +
	  "<td>" + _("enter slide mode") +
	  "<tr><td>" + _("<kbd>A</kbd>, <kbd>Esc</kbd>, 3-finger touch") +
	  "<td>" + _("leave slide mode") +
	  "<tr><td>" +
	  (noclick ?
	      _("<kbd>space</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, swipe left") :
	      _("<kbd>space</kbd>, <kbd>&rarr;</kbd>, <kbd>&darr;</kbd>, click")) +
	  "<td>" + _("next slide or incremental element") +
	  "<tr><td>" +
	  (noclick ? _("<kbd>PgDn</kbd>") : _("<kbd>PgDn</kbd>, swipe left")) +
	  "<td>" + _("next slide") +
	  "<tr><td>" +
	  _("<kbd>PgUp</kbd>, <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, swipe right") +
	  "<td>" + _("previous slide") +
	  "<tr><td>" + _("<kbd>End</kbd>") +
	  "<td>" + _("last slide") +
	  "<tr><td>" + _("<kbd>Home</kbd>") +
	  "<td>" + _("first slide") +
	  "<tr><td>" + _("<kbd>F1</kbd>, <kbd>F</kbd>") +
	  "<td>" + _("toggle fullscreen mode") +
	  "<tr><td>" + _("<kbd>2</kbd>") + "<td>" +
	  _("open second window") +
	  "<tr><td>" + _("<kbd>?</kbd>") +
	  "<td>" + _("this help")) +
      (!syncURL ? "" :
	  "<tr><td>" + _("<kbd>S</kbd>") +
	  "<td>" + _("toggle sync mode on/off")) +
      "</table>" +
      "<p>" + _("(More information in the <a target=_parent " +
	  "href='https://www.w3.org/Talks/Tools/b6plus/'>b6+ manual</a>)"));
  button.innerHTML = _("Click or press Enter");
  iframe.style.cssText = 'margin: 0; border: none; padding: 0; ' +
    'width: 100%; height: 80%; height: calc(100% - 3em)';
  button.addEventListener('click',
    ev => {document.body.removeChild(helptext); ev.stopPropagation()})
  button.addEventListener('keyDown',
    ev => {document.body.removeChild(helptext); ev.stopPropagation()})
  helptext = document.createElement('div');
  helptext.appendChild(iframe);
  helptext.appendChild(button);
  helptext.style.cssText = 'position: fixed; width: 100%; height: 100%; ' +
    'top: 0; left: 0; z-index: 2; background: #000; color: #FFF; ' +
    'text-align: center; visibility: visible';
}


/* help -- show information about available interactive commands */
function help()
{
  if (!helptext) createHelpText();
  document.body.appendChild(helptext);
  helptext.lastChild.focus();	// The button
}


/* openSecondWindow -- open a 2nd window with the same slides */
function openSecondWindow()
{
  var url;

  // Open a second window if there isn't one yet. The
  // "?b6window=random" avoids that this document replaces the
  // original slides in the browser cache.
  if (secondwindow == null || secondwindow.closed) {
    url = new URL(location);
    url.searchParams.delete("full");
    url.searchParams.delete("static");
    url.searchParams.delete("sync");
    url.searchParams.set("b6window", Math.random());
    secondwindow = open(url, "b6+ preview window");
  }
  secondwindow.focus();

  // The second window will send us an "init" message when it is
  // ready. At that point we'll send it some information about our
  // clocks. See message() below.
}


/* warnSyncMode -- alert the user that sync mode is on */
function warnSyncMode()
{
  alert(_("No navigation possible while sync mode is on.") + "\n\n" +
      _("Press S to toggle sync mode off."));
}


/* warningBanner -- briefly show a banner with a warning */
function warningBanner(...content)
{
  var banner;

  banner = document.createElement("div");
  banner.style = "position: fixed; left: 0; right: 0; width: 100%; z-index: 2;\
    text-align: center; font-size: 2vh; font-weight: bold; white-space: pre;\
    font-family: sans-serif; margin: 0; padding: 0.5em; border-style: none;\
    background: hsla(0,0%,0%,0.6); color: hsl(0,0%,100%);\
    text-shadow: 1px 1px 1px #000, 1px 1px 1px #000; opacity: 1.0;\
    transition: opacity 3.0s";
  if (slidemode) {banner.style.top = "auto"; banner.style.bottom = "0";}
  else {banner.style.top = "0"; banner.style.bottom = "auto";}
  banner.append(...content);
  document.body.append(banner);

  // First let the style transition fade the dialog, then remove it.
  setTimeout(function () {banner.style.opacity = "0.0"}, 3000);
  setTimeout(function () {banner.remove()}, 6000);
}


/* errorSyncMode -- show an error message when synchronization fails */
function errorSyncMode(ev)
{
  syncMode = false;
  warningBanner(_("Synchronization error."), "\n",
    _("You can try to turn synchronization back on with the S key."));
}


/* tryToggleSync -- toggle sync mode on or off, if possible */
function tryToggleSync()
{
  if (!syncURL) return;		// No sync server defined

  if (syncMode) {
    eventsource.close();
    syncMode = false;
    warningBanner(_("Syncing turned off.\nPress S to turn syncing back on."));
  } else {
    eventsource = new EventSource(syncURL);
    // Listen both for "message" events (the default type) and "page" events
    eventsource.addEventListener("message", syncSlide);
    eventsource.addEventListener("page", syncSlide);
    eventsource.addEventListener("error", errorSyncMode);
    eventsource.addEventListener("open", function (ev) {syncMode = true});
    syncMode = true;
    warningBanner(_("Syncing turned on\nPress S to turn syncing off"));
  }
}


/* keyDown -- handle key presses on the body element */
function keyDown(event)
{
  // We only handle the key if it is not directed at a focused element.
  if (event.target.tagName !== "BODY") return;

  // We don't handle keys when a modifier key is pressed.
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  switch (event.key) {
  case "PageDown":
    if (slidemode && !syncMode) nextSlide()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return // We're on the first window in index mode
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "Left":			// Some older browsers
  case "ArrowLeft":		// fall through
  case "Up":			// Some older browsers
  case "ArrowUp":
  case "PageUp":
    if (slidemode && !syncMode) previousSlide()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "Spacebar":		// Some older browsers
  case " ":			// fall through
  case "Right":			// Some older browsers
  case "ArrowRight":		// fall through
  case "Down":			// Some older browsers
  case "ArrowDown":
    if (slidemode && !syncMode) nextSlideOrElt()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "Home":
    if (slidemode && !syncMode) firstSlide()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "End":
    if (slidemode && !syncMode) lastSlide()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "a":
    if (syncMode) {warnSyncMode(); return;}
    if (!firstwindow) toggleMode() // "a" key handled even when not in slidemode
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "f":			// fall through
  case "F1":
    if (slidemode) fullscreen()
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "Esc":			// Some older browsers
  case "Escape":
    if (slidemode && !syncMode) toggleMode()
    else if (slidemode) {warnSyncMode(); return;}
    else if (!firstwindow) return
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  case "2":
    if (syncMode) {warnSyncMode(); return;}
    else if (!firstwindow) openSecondWindow();
    break;
  case "?":
    if (slidemode) help()	// On first window in slidemode. Pop up the help
    else if (!firstwindow) return
    else help()			// On second window. Pop up the help locally.
    break;
  case 's':
    if (!firstwindow && syncURL) tryToggleSync();
    else if (!firstwindow) return;
    else firstwindow.postMessage({event: "keydown", v: event.key}, "*");
    break;
  default:
    return;			// Other keys have their normal meaning.
  }

  event.preventDefault();
}


/* load -- handle the load event */
function load(e)
{
  if (stylesToLoad) stylesToLoad--;
  e.target.removeEventListener(e.type, load);
}


/* toggleMedia -- swap styles for projection and screen */
function toggleMedia()
{
  var i, h, s, links, styles;

  var re1 = /\(\s*overflow-block\s*:\s*((optional-)?paged)\s*\)/gi;
  var sub1 = "(min-width: 0) /* $1 */";
  var re2 = /\(min-width: 0\) \/\* ((optional-)?paged) \*\//gi;
  var sub2 = "(overflow-block: $1)";
  var re3 = /\bprojection\b/gi;
  var sub3 = "screen";
  var re4 = /\bscreen\b/gi;
  var sub4 = "projection";

  /* Swap projection and screen in MEDIA attributes of LINK elements */
  links = document.getElementsByTagName("link");
  for (i = 0; i < links.length; i++)
    if (links[i].rel === "stylesheet" && links[i].media) {
      if (re1.test(links[i].media)) s = links[i].media.replace(re1, sub1);
      else s = links[i].media.replace(re2, sub2);
      if (re3.test(s)) s = s.replace(re3, sub3);
      else s = s.replace(re4, sub4);
      if (s != links[i].media) {
	stylesToLoad++;
	links[i].addEventListener('load', load, false);
	links[i].media = s;
      }
    }

  /* Swap projection and screen in MEDIA attributes of STYLE elements */
  styles = document.getElementsByTagName("style");
  for (i = 0; i < styles.length; i++)
    if (styles[i].media) {
      if (re1.test(styles[i].media)) s = styles[i].media.replace(re1, sub1);
      else s = styles[i].media.replace(re2, sub2);
      if (re3.test(s)) s = s.replace(re3, sub3);
      else s = s.replace(re4, sub4);
      if (s != styles[i].media) {
	stylesToLoad++;
	styles[i].addEventListener('load', load, false);
	styles[i].media = s;
      }
    }

  /* Swap projection and screen in the MEDIA pseudo-attribute of the style PI */
  for (h = document.firstChild; h; h = h.nextSibling)
    if (h.nodeType === 7 && h.target === "xml-stylesheet") {
      if (re1.test(h.data)) s = h.data.replace(re1, sub1);
      else s = h.data.replace(re2, sub2);
      if (re3.test(s)) s = s.replace(re3, sub3);
      else s = s.replace(re4, sub4);
      if (s != h.data) {
	stylesToLoad++;
	h.addEventListener('load', load, false);	// TODO: possible?
	h.data = s;
      }
    }
}


/* scaleBody -- if the BODY has a fixed size, scale it to fit the window */
function scaleBody()
{
  var w, h, scale;

  if (document.body.offsetWidth && document.body.offsetHeight) {
    w = document.body.offsetWidth;
    h = document.body.offsetHeight;
    scale = Math.min(window.innerWidth/w, window.innerHeight/h);
    document.body.style.transform = "scale(" + scale + ")";
    document.body.style.position = "relative";
    document.body.style.marginLeft = (window.innerWidth - w)/2 + "px";
    document.body.style.marginTop = (window.innerHeight - h)/2 + "px";
    document.body.style.top = "0";
    document.body.style.left = "0";
    /* --shower-full-scale is for style sheets written for Shower 3.1: */
    document.body.style.setProperty('--shower-full-scale', '' + scale);
  }
}


/* finishToggleMode -- finish switching to slide mode */
function finishToggleMode()
{
  if (stylesToLoad != 0 && Date.now() < limit) {

    setTimeout(finishToggleMode, 100);	// Wait some more

  } else if (stylesToLoad == 0 && Date.now() < limit) {

    limit = 0;
    setTimeout(finishToggleMode, 100);	// Wait 100ms for styles to apply

  } else {

    stylesToLoad = 0;
    scaleBody(); // If the BODY has a fixed size, scale it to fit the window
    initProgress();		// Find and initialize progress bar, etc.
    initHideMouse();		// If requested, hide an idle mouse pointer

    /* curslide can be set if we reenter slide mode or if doubleClick set it. */
    if (curslide) displaySlide();
    else if (location.hash) targetSlide(location.hash.substring(1));
    else firstSlide();

    switchInProgress = false;	// Done with the mode switch
  }
}


/* toggleMode -- toggle between slide show and normal display */
function toggleMode()
{
  /* Do nothing if we are still in the process of switching to slide mode */
  if (switchInProgress) return;

  if (! slidemode) {
    switchInProgress = true;
    slidemode = true;
    document.body.classList.add("full");		// Set .full on BODY
    document.body.setAttribute("role", "application");	// Hint to screenreaders

    /* Find or create an element to announce the slides in speech */
    if ((liveregion =
	 document.querySelector("[role=region][aria-live=assertive]"))) {
      savedContent = liveregion.innerHTML;	// Remember its content, if any
    } else {
      liveregion = document.createElement("div");
      liveregion.setAttribute("role", "region");
      liveregion.setAttribute("aria-live", "assertive");
      document.body.appendChild(liveregion);
      savedContent = "Stopped.";		// Default to an English message
    }

    /* Make all children of BODY invisible. */
    for (const h of document.body.children) {
      h.b6savedstyle = h.style.cssText;			// Remember properties
      h.style.visibility = "hidden";
      h.style.position = "absolute";
      h.style.top = "0";
      h.style.left = "0";
    }

    /* Except that the liveregion is visible, but cropped. */
    liveregion.style.visibility = "visible";
    liveregion.style.clip = "rect(0 0 0 0)";

    /* Swap style sheets for projection and screen. */
    document.body.b6savedstyle = document.body.style.cssText; // Remember properties
    toggleMedia();				// Swap style sheets
    numberSlides();				// Count and number the slides

    /* Wait 100ms before calling a function to do the rest of the
       initialization of slide mode. That function will wait for the
       style sheets to load, but no longer than until limit, i.e., 3
       seconds */
    limit = Date.now() + 3000;
    setTimeout(finishToggleMode, 100);

  } else {

    /* savedContent is what a screen reader should say on leaving slide mode */
    liveregion.innerHTML = savedContent;

    /* Unhide all children again */
    for (const h of document.body.children) h.style.cssText = h.b6savedstyle;

    toggleMedia(); 				// Swap style sheets
    document.body.style.cssText = document.body.b6savedstyle; // Restore style
    document.body.classList.remove("full");	// Remove .full from BODY
    document.body.removeAttribute("role");	// Remove "application"

    slidemode = false;

    /* Put current slide in the URL, so the index view can highlight it. */
    if (curslide) location.replace("#" + (curslide.id || curslide.b6slidenum));
  }
}


/* nextSlideOrElt -- next incremental element or next slide if none */
function nextSlideOrElt()
{
  if (curslide == null) return;

  /* Mark the current incremental element, if any, as visited. */
  if (incrementals.cur >= 0) {
    incrementals[incrementals.cur].classList.add("visited");
    incrementals[incrementals.cur].classList.remove("active");
  }

  if (incrementals.cur + 1 < incrementals.length) {
    /* There is a next incremental element. Make it active. */
    incrementals.cur++;
    incrementals[incrementals.cur].classList.add("active");

    /* Make screen readers announce the newly displayed element */
    liveregion.innerHTML = "";		// Make it empty
    liveregion.appendChild(cloneNodeWithoutID(incrementals[incrementals.cur]));

  } else {
    /* There is no next incremental element. So go to next slide. */
    nextSlide();
  }
}


/* nextSlide -- display the next slide, if any */
function nextSlide()
{
  var h;

  if (curslide == null) return;

  /* curslide has class=slide, page-break-before=always or is an H1 */
  h = curslide.nextSibling;
  while (h && !isStartOfSlide(h)) h = h.nextSibling;

  if (h != null) makeCurrent(h);
}


/* previousSlide -- display the next slide, if any */
function previousSlide()
{
  var h;

  if (curslide == null) return;

  /* curslide has class=slide, page-break-before=always or is an H1 */
  h = curslide.previousSibling;
  while (h && !isStartOfSlide(h)) h = h.previousSibling;

  if (h != null) makeCurrent(h);
}


/* firstSlide -- display the first slide */
function firstSlide()
{
  var h;

  h = document.body.firstChild;
  while (h && !isStartOfSlide(h)) h = h.nextSibling;

  if (h != null) makeCurrent(h);
}


/* lastSlide -- display the last slide */
function lastSlide()
{
  var h;

  h = document.body.lastChild;
  while (h && !isStartOfSlide(h)) h = h.previousSibling;

  if (h != null) makeCurrent(h);
}


/* targetSlide -- display slide containing ID=target, or the target'th slide */
function targetSlide(target)
{
  var h, n;

  if ((h = document.getElementById(target)))
    /* Find enclosing .slide or preceding H1 */
    while (h && !isStartOfSlide(h)) h = h.previousSibling || h.parentNode;
  else if ((n = parseInt(target)) > 0)
    /* Find the start of the n'th slide. */
    for (h = document.body.firstChild; h; h = h.nextSibling)
      if (h.b6slidenum && h.b6slidenum == n) break;

  /* If found, and it is not already displayed, display it */
  if (h != null) makeCurrent(h);
}


/* mouseButtonClick -- handle mouse click event */
function mouseButtonClick(e)
{
  var target = e.target;

  if (e.button != 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.detail != 1) return; // It's the 2nd of a double click

  if (firstwindow) {		// We are the secondwindow of some firstwindow
    e.preventDefault();
    firstwindow.postMessage({event: "click"}, "*");
    e.stopPropagation();
    return;
  }

  if (!slidemode || syncMode) return;

  // work around Safari bug
  if (target.nodeType == 3)
    target = target.parentNode;

  // check if target is not something that probably wants clicks
  // e.g. embed, object, input, textarea, select, option
  while (target) {
    if (target.nodeName === "A" || target.nodeName === "EMBED" ||
	target.nodeName === "OBJECT" || target.nodeName === "INPUT" ||
	target.nodeName === "TEXTAREA" || target.nodeName === "SELECT" ||
	target.nodeName === "SUMMARY" || target.nodeName === "OPTION") return;
    target = target.parentNode;
  }

  // Set a timeout to handle the click after 200 ms. If a double click
  // occurs in that period, it will remove the timeout and the click
  // will thus not do anything. The 200 ms is a compromise. The actual
  // time within which a double click occurs depends on the browser
  // and the OS. 200 ms is for fast clickers, but 400 ms would cause a
  // noticeable delay before the slide advances. Note that adding
  // class=noclick on the body disables handling of single clicks
  // completely.
  singleClickTimer = setTimeout(() => {nextSlideOrElt()}, 200);

  e.stopPropagation();
}


/* gestureStart -- handle start of a touch event */
function gestureStart(e)
{
  if (!gesture.on) {
    gesture.on = true;
    gesture.x2 = gesture.x1 = e.touches[0].clientX;
    gesture.y2 = gesture.y1 = e.touches[0].clientY;
    gesture.opacity = document.body.style.opacity;
  }
  gesture.touches = e.touches.length;
}


/* gestureMove -- handle move event */
function gestureMove(e)
{
  if (gesture.on && slidemode && !syncMode) {
    gesture.x2 = e.touches[0].clientX;
    gesture.y2 = e.touches[0].clientY;

    /* Give some visual feedback: */
    var dx = Math.abs(gesture.x2 - gesture.x1);
    var dy = Math.abs(gesture.y2 - gesture.y1);
    if (gesture.touches != 1)
      document.body.style.opacity = gesture.opacity;
    else if (dx > dy)
      document.body.style.opacity = 1 - dx / window.innerWidth;
    else
      document.body.style.opacity = 1 - (6 * dx - 5 * dy) / window.innerWidth;
  }
}


/* gestureEnd -- handle end of a touch event */
function gestureEnd(e)
{
  if (gesture.on) {
    gesture.on = false;

    /* Undo visual feedback */
    if (slidemode && !syncMode)
      document.body.style.opacity = gesture.opacity;

    var dx = gesture.x2 - gesture.x1;
    var dy = gesture.y2 - gesture.y1;
    if (gesture.touches > 2) toggleMode();
    else if (gesture.touches > 1) return; // 2-finger gesture
    else if (!slidemode || syncMode) return; // Not in slide mode
    else if (Math.abs(dx) < window.innerWidth/3) return; // Swipe too short
    else if (Math.abs(dx) < Math.abs(dy)) return; // Swipe too vertical
    else if (dx > 0) previousSlide();
    else if (noclick) nextSlideOrElt(); // If no click, swipe replaces it
    else nextSlide();
    e.preventDefault();
    e.stopPropagation();
  }
}


/* gestureCancel -- handle cancellation of a touch event */
function gestureCancel(e)
{
  if (gesture.on) {
    gesture.on = false;
    /* Undo visual feedback */
    if (slidemode) document.body.style.opacity = gesture.opacity;
  }
}


/* doubleClick -- handle a double click on the body */
function doubleClick(event)
{
  var h;

  if (event.button != 0 || event.altKey || event.ctrlKey ||
      event.metaKey || event.shiftKey) return;

  if (firstwindow) {		// We are the secondwindow of some firstwindow
    firstwindow.postMessage({event: "dblclick"}, "*");
    return;
  }

  if (!slidemode && !syncMode) {
    /* If we are entering slide mode and the double click was on or
     * inside a slide, start with that slide. */
    h = event.target;
    while (h && !isStartOfSlide(h)) h = h.previousSibling || h.parentNode;
    curslide = h;  /* May be null */

    /* The double click may have selected some text, so unselect everything. */
    document.getSelection().removeAllRanges();

    toggleMode();
    event.preventDefault();
    event.stopPropagation();

  } else if (!noclick)  {
    /* In slide mode, with the mouseButtonClick() handler installed to
     * advance the slides on a single click, a double click cancels
     * the effect of the single click: It removes the action that
     * mouseButtonClick() had put on the queue. */
    clearTimeout(singleClickTimer);
    singleClickTimer = null;
  }
}


/* hashchange -- handle fragment id event, make target slide the current one */
function hashchange(e)
{
  if (slidemode && location.hash) targetSlide(location.hash.substring(1));
}


/* message -- handle a postMessage */
function message(e)
{
  var newEvent;

  if (e.source == secondwindow) { // Message from 2nd window to 1st window

    switch (e.data.event) {
    case "init":		// Second window has started
      secondwindow.postMessage({event: "startTime", v: startTime});
      secondwindow.postMessage({event: "duration", v: duration});
      secondwindow.postMessage({event: "pauseStartTime", v: pauseStartTime});
      break;
    case "click":
      newEvent = new MouseEvent("click", {detail: 1, bubbles: true});
      document.body.dispatchEvent(newEvent);
      break;
    case "dblclick":
      newEvent = new MouseEvent("dblclick", {bubbles: true});
      document.body.dispatchEvent(newEvent);
      break;
    case "keydown":
      newEvent = new KeyboardEvent("keydown", {key: e.data.v, bubbles: true});
      document.body.dispatchEvent(newEvent);
      break;
    case "startTime":			// Other window informs us of a new start time
      startTime = e.data.v;
      ticker(true);			// Update the clocks
      break;
    case "duration":			// Other window informs us of a new duration
      duration = e.data.v;
      ticker(true);			// Update the clocks
      break;
    case "pauseStartTime":		// Other window got a pause/resume event
      pauseStartTime = e.data.v;
      if (pauseStartTime) document.body.classList.add("paused");
      else ocument.body.classList.remove("paused");
      ticker(true);			// Update the clocks
      break;
    }

  } else if (e.source == firstwindow) { // Message from 1st window to 2nd

    switch (e.data.event) {
    case "startTime":			// Other window informs us of a new start time
      startTime = e.data.v;
      ticker(true);			// Update the clocks
      break;
    case "duration":			// Other window informs us of a new duration
      duration = e.data.v;
      ticker(true);			// Update the clocks
      break;
    case "pauseStartTime":		// Other window got a pause/resume event
      pauseStartTime = e.data.v;
      if (pauseStartTime) document.body.classList.add("paused");
      else document.body.classList.remove("paused");
      ticker(true);			// Update the clocks
      break;
    }

  }
}


/* windowResize -- handle a resize of the window */
function windowResize(ev)
{
  if (slidemode) scaleBody();	// Recalculate the transform property
}


/* syncSlide -- handle a server-sent event with a slide number or slide ID */
function syncSlide(event)
{
  if (syncMode) {
    // Just after entering slidemode, finishToggleMode() won't have
    // run yet and curslide will not be set, which means next and
    // previous will do nothing. But that is OK.
    switch (event.data) {
    case "+": if (!slidemode) toggleMode(); nextSlideOrElt(); break;
    case "++": if (!slidemode) toggleMode(); nextSlide(); break;
    case "-": if (!slidemode) toggleMode(); previousSlide(); break;
    case "^": if (!slidemode) toggleMode(); firstSlide(); break;
    case "$": if (!slidemode) toggleMode();lastSlide(); break;
    case "0": if (slidemode) toggleMode(); break;
    default: if (!slidemode) toggleMode(); targetSlide(event.data); // ID or #
    }
  }
}


/* checkURL -- process query parameters ("full", "static" and "sync") */
function checkURL()
{
  const params = new URLSearchParams(location.search);
  if (params.get("full") != null) toggleMode();
  if (params.get("static") != null) interactive = false;
  if ((syncURL = params.get("sync"))) tryToggleSync();
}


/* checkIfFramed -- if we're inside an iframe, add target=_parent to links */
function checkIfFramed()
{
  var anchors, i;

  if (window.parent != window) { // Only if we're not the top document
    anchors = document.getElementsByTagName('a');
    for (i = 0; i < anchors.length; i++)
      if (!anchors[i].hasAttribute('target'))
	anchors[i].setAttribute('target', '_parent');
    document.body.classList.add('framed'); // Allow the style to do things
  }
}


/* checkOptions -- look for b6plus options in the class attribute on body */
function checkOptions()
{
  var c, t;

  for (c of document.body.classList)
    if (c === 'noclick')
      noclick = true;
    else if ((t = c.match(/^hidemouse(=([0-9.]+))?$/)))
      hideMouseTime = 1000 * (t[2] ?? 5); // Default is 5s if no time given
}


/* initLanguage -- determine the language to localize to */
function initLanguage()
{
  var i;

  // Get language from the HTML element, default to en-us
  language = (document.documentElement.getAttribute("lang") ?? "en-us")
    .toLowerCase();

  // Remove subtags until we have a match among the translations of "min"
  while (!translations["min"][language] && (i = language.lastIndexOf("-")) >= 0)
    language = language.slice(0, i);
}


/* checkIfSecondWindow -- if this is a second windo, configure it */
function checkIfSecondWindow()
{
  var styleElt;

  if (window.opener && window.opener != window) {

    // If this is a second window, remember the corresponding first
    // one, so we can use postMessage() on it. We need to store it in
    // a variable, because after the next open("#foo"), window.opener
    // will be reset to window.
    firstwindow = window.opener;

    // Add some style to indicate this is a special window. For now,
    // just set the mouse cursor to indicate that clicks do not work
    // on this window.
    styleElt = document.createElement('style');
    document.head.prepend(styleElt);
    styleElt.sheet.insertRule('* {cursor: not-allowed}', 0);

    // Modify the title.
    document.title = "b6+ preview window – " + document.title;

    // Set a class "secondwindow", so a style sheet can do other
    // things to this document.
    document.body.classList.add("secondwindow"); // Allow style changes

    // Accessibility hint.
    document.body.setAttribute("role", "application");

    // Add a message handler for messages from the first window.
    window.addEventListener("message", message);

    // Inform the first window that we are ready.
    firstwindow.postMessage({event: "init"});
 }
}


/* initialize -- add event handlers, initialize state */
function initialize()
{
  initLanguage();		// Determine the language for localized text
  checkIfFramed();		// Add target attributes if needed
  checkURL();			// Parse query parameters (full, static)
  checkOptions();		// Look for options in body.classList
  initClocks();			// Find and initialize clock elements

  if (interactive) {		// Only add event listeners if not static
    if (!noclick) document.addEventListener('click', mouseButtonClick, false);
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('dblclick', doubleClick, false);
    window.addEventListener('hashchange', hashchange, false);
    document.addEventListener('touchstart', gestureStart, false);
    document.addEventListener('touchmove', gestureMove, false);
    document.addEventListener('touchend', gestureEnd, false);
    document.addEventListener('touchcancel', gestureCancel, false);
    window.addEventListener("message", message, false);
  }
  window.addEventListener('resize', windowResize, true);
  checkIfSecondWindow();	// If this is a secondwindow, configure it
}


/* main */
if (!!document.b6IsLoaded) return; // Don't load b6plus twice
document.b6IsLoaded = true;

if (document.readyState !== 'loading') initialize();
else document.addEventListener('DOMContentLoaded', initialize);

})();
