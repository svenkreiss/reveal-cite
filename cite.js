/* global Reveal, katex */

/**
 * A plugin that renders citations inside reveal.js slides.
 *
 * Some template parts are taken from the math plugin.
 *
 * @author Sven Kreiss
 */
window.RevealCite = window.RevealCite || (function() {
	'use strict';

	var options = Reveal.getConfig().cite || {};
	if (options.ignoredElements) {
		options.ignoredElements = options.ignoredElements.map(x => x.toUpperCase);
	} else {
		options.ignoredElements = ['PRE', 'CODE'];
	}
	if (options.enableGlobally === undefined) {
		options.enableGlobally = true;
	}

	var defaults = {
		citeClass: 'citation',
		ignoredClass: 'cite-ignored'
	};

	function replaceCite(markup) {
		var regexBracket = /([^\\])\[@@([a-zA-Z0-9\-]+)\]/g;       // [@@...]

        function replacer(_, lookbehind, group, offset) {
            let replacement = window.publications[group];
            if (replacement === undefined) {
                replacement = `<span class="${defaults.citeClass}">[${group}]</span>`;
                console.warn(`"${group}" not found in publications.`);
            } else {
				let author = replacement.persons.author[0].last;
				if (replacement.persons.author.length > 1) author += ' et al';
				let year = replacement.fields.year;
				let tooltip = `${replacement.fields.title}, ${replacement.persons.author.map(a => a.last).join(', ')}, ${year}`;

				if (replacement.fields.url !== undefined) {
					replacement = `<a href="${replacement.fields.url}" class="${defaults.citeClass}" title="${tooltip}">[<em>${author}</em>, ${year}]</a>`;
				} else {
					replacement = `<span class="${defaults.citeClass}" title="${tooltip}">[<em>${author}</em>, ${year}]</span>`;
				}
			}
            return lookbehind + replacement;
        }

        return markup.replace(regexBracket, replacer);
	};

	function replaceCitations() {
		var query = options.enableGlobally === true ? '.reveal section' : '.reveal section[data-cite]';
		var slideElements = document.querySelectorAll(query);

		function isIgnored(element) {
			var e = element;
			var isIgnoredElement = options.ignoredElements.indexOf(e.nodeName) !== -1;
			var isIgnoredClass = e.classList.contains(defaults.ignoredClass);

			// Also look for the ignored class on the parent (non-recursive)
			var parent = e.parentNode;
			if (parent) {
				isIgnoredClass = isIgnoredClass || parent.classList.contains(defaults.ignoredClass);
			}

			// Ignore script elements, unless they are templates (e.g. Markdown)
			var isTemplate = e.getAttribute('type') === 'text/template';
			var isScript = e.nodeName === 'SCRIPT' && !isTemplate;

			return isIgnoredElement || isIgnoredClass || isScript;
		}

		function each(arrayLike, f) {
			for (var i = 0; i < arrayLike.length; i++) {
				var element = arrayLike[i];
				if (!isIgnored(element)) f(element, i);
			}
		}

		// Render [@@...]
		each(slideElements, function (e) {
            e.innerHTML = replaceCite(e.innerHTML);
		});
	}

    replaceCitations();
    Reveal.layout();    // Update the slide layout

    // Trigger `cite-rendered` event
    var event = document.createEvent('HTMLEvents', 1, 2);
    event.initEvent('cite-rendered', true, true);
    document.querySelector('.reveal').dispatchEvent(event);
})();
