/**
 * @typedef {Object} AccordionPanel
 * @property {string} title - The (mandatory) title of the panel
 * @property {string} [subtitle] - The (mandatory) title of the panel
 * @property {string} content - The (mandatory) HTML content of the panel
 */

/**
 * @typedef {Object} AccordionOptions
 * @property {string} container - The id of the HTML element that will host the accordion
 * @property {string} [mainTitle] - The (optional) header for the accordion
 * @property {AccordionPanel[]} panels - The list of panels to display inside the accordion
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} ok - Whether the validation was successful
 * @property {string[]} [errors] - The (optional) list of errors that explain why validation failed
 */

(function() {
	"use strict";

	const TRANSITION_DURATION_MS = 500;
	const TEMPLATES = {
		headerTemplate: '<div class="header">HEADER_TITLE</div>',
		panelTemplate: `
	<div class="panel DESCRIPTION_CLASS">
		<div class="header">
			<div class="text">
				<div class="title">PANEL_TITLE</div>
				DESCRIPTION_PLACEHOLDER
			</div>
			<div class="toggle">
				<i class="icon material-icons">expand_more</i>
			</div>
		</div>
		<div class="content">
			<div class="content-wrapper">PANEL_CONTENT</div>
		</div>
	</div>`,
		descriptionTemplate: '<div class="description ellipsify">PANEL_DESCRIPTION</div>'
	};

	/**
	 * The class for the accordion component, which is responsible to display and manage
	 * multiple expandable panels with content provided by the user of the class.
	 */
	class Accordion {
		/**
		 * The constructor, which takes a mandatory configuration object
		 * @param {AccordionOptions} options the configuration options for the accordion
		 */
		constructor(options) {
			/**
			 * @private @member The options provided
			 * @type {AccordionOptions}
			 */
			this._options = null;

			/**
			 * @private @member The host element of the Accordion
			 * @type {HTMLElement}
			 */
			this._host = null;

			/**
			 * @private @member The currently open panel in the Accordion
			 * @type {HTMLElement}
			 */
			this._openedPanel = null;

			this._setOptions(options);
			this._render();
			this._attachListeners();
		}

		/**
		 * @private Validate and set the options provided to the accordion's constructor
		 * @param {AccordionOptions} options The options to validate and set into the accordion instance
		 */
		_setOptions(options) {
			const validationResult = this._validate(options);
			if (!validationResult.ok) {
				const errors = validationResult.errors.reduce((memo, error) => (memo ? ` ${memo}\n - ${error}` : `- ${error}`), "");
				const message = `The provided accordion options are not valid. Fix the following errors:${errors}`;
				throw new Error(message);
			}
			this._options = options;
		}

		/**
		 * @private Validate an options object
		 * @param {AccordionOptions} options The options to validate
		 * @returns {ValidationResult}
		 */
		_validate(options) {
			if (isNil(options)) {
				return {
					ok: false,
					errors: ["Options must be provided."]
				};
			}
			const errors = [];
			const requiredParameters = ["container", "panels"];
			const missingParameters = requiredParameters.map(rp => (isNil(options[rp]) ? rp : null)).filter(mp => mp !== null);
			errors.push(...missingParameters.map(mp => `The provided options must contain property ${mp}`));

			// Do single pass validation: find out all possible issues at once instead of breaking out early
			// e.g.: if "container" is missing but "panels" was provided, check that it is a valid array of panels
			if (!isNil(options.panels)) {
				if (!Array.isArray(options.panels)) {
					errors.push(`The panels parameter must be an array of objects`);
				} else {
					const requiredPanelParameters = ["title", "content"];
					options.panels.forEach((panel, index) => {
						const missingPanelParameters = requiredPanelParameters
							.map(rpp => (isNil(panel[rpp]) ? rpp : null))
							.filter(mpp => mpp !== null);
						errors.push(...missingPanelParameters.map(mpp => `Panel #${index} must contain property ${mpp}`));
					});
				}
			}
			return {
				ok: errors.length === 0,
				errors
			};
		}

		/**
		 * @private Render the accordion according to the provided options
		 */
		_render() {
			const selector = this._options.container;
			const container = document.getElementById(selector);
			container.setAttribute("class", "js-accordion");
			let innerHTML = "";
			const hasHeader = !isNil(this._options.mainTitle);
			if (hasHeader) {
				innerHTML += TEMPLATES.headerTemplate.replace("HEADER_TITLE", this._options.mainTitle);
			}
			const panelElements = this._options.panels.map(this._renderPanel);
			innerHTML += panelElements.join("");
			container.innerHTML = innerHTML;
			this._host = container;
		}

		/**
		 * @private Render the provided panel
		 * @param {AccordionPanel} panel The panel to render
		 * @returns {string} The HTML string representing the panel instance
		 */
		_renderPanel(panel) {
			const hasDescription = panel.subtitle;
			let renderedPanel = TEMPLATES.panelTemplate
				.replace("PANEL_TITLE", panel.title)
				.replace("DESCRIPTION_CLASS", hasDescription ? "with-description" : "")
				.replace("DESCRIPTION_PLACEHOLDER", hasDescription ? TEMPLATES.descriptionTemplate.replace("PANEL_DESCRIPTION", panel.subtitle) : "")
				.replace("PANEL_CONTENT", panel.content);
			return renderedPanel;
		}

		/**
		 * @private Attach event handlers to the interactive elements in the panel (e.g.: the toggle)
		 */
		_attachListeners() {
			const listener = panel => evt => this._togglePanel(panel);
			const panels = this._host.getElementsByClassName("panel");
			for (let i = 0; i < panels.length; ++i) {
				const panel = panels.item(i);
				const toggle = panel.getElementsByClassName("icon").item(0); // .toggle is always visible
				toggle.addEventListener("click", listener(panel));
			}
		}

		/**
		 * @private Closes the currently opened panel, if any
		 */
		_closeOpenPanel() {
			if (isNil(this._openedPanel)) {
				return;
			}
			this._closePanel(this._openedPanel);
			this._openedPanel = null;
		}

		/**
		 * @private Checks whether the supplied panel is open
		 * @param {HTMLElement} panel The panel to test
		 */
		_isOpen(panel) {
			return panel.classList.contains("open");
			// const panelClassAttr = panel.getAttribute("class");
			// const panelClasses = panelClassAttr.split(" ");
			// return panelClasses.includes("open");
		}

		/**
		 * @private Toggles the supplied panel
		 * @param {HTMLElement} panel The panel to toggle
		 */
		_togglePanel(panel) {
			const isOpen = this._isOpen(panel);
			if (isOpen) {
				assert(panel === this._openedPanel);
				this._closeOpenPanel();
			} else {
				this._closeOpenPanel();
				this._openPanel(panel);
			}
		}

		/**
		 * @private Opens the supplied panel
		 * @param {HTMLElement} panel The panel to open
		 */
		_openPanel(panel) {
			if (this._isOpen(panel)) {
				return;
			}
			panel.classList.add("open", "transitioning");
			const content = panel.getElementsByClassName("content").item(0);
			const contentWrapper = content.getElementsByClassName("content-wrapper").item(0);
			const height = contentWrapper.getBoundingClientRect().height;
			content.style.height = `${height}px`;
			this._openedPanel = panel;
			// After the transition, ensure that content height is auto to avoid having fixed height if the content grows
			setTimeout(() => panel.classList.remove("transitioning"), TRANSITION_DURATION_MS);
		}

		/**
		 * @private Closes the supplied panel
		 * @param {HTMLElement} panel The panel to close
		 */
		_closePanel(panel) {
			if (!this._isOpen(panel)) {
				return;
			}
			panel.classList.add("transitioning");
			panel.classList.remove("open");
			const content = panel.getElementsByClassName("content").item(0);
			content.style.height = 0;
			setTimeout(() => panel.classList.remove("transitioning"), TRANSITION_DURATION_MS);
		}
	}

	window.Accordion = Accordion;
})();
