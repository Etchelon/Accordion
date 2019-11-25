"use strict";

/**
 * typedef {Object} AccordionPanel
 * @property {string} title - The (mandatory) title of the panel
 * @property {string} [description] - The (mandatory) title of the panel
 * @property {string} content - The (mandatory) HTML content of the panel
 */

/**
 * @typedef {Object} AccordionOptions
 * @property {string} container - The id of the HTML element that will host the accordion
 * @property {string} [mainTitle] - The (optional) header for the accordion
 * @property {AccordionPanel} panels - The list of panels to display inside the accordion
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} ok - Whether the validation was successful
 * @property {string[]} [errors] - The (optional) list of errors that explain why validation failed
 */

/**
 * The class for the accordion component, which is responsible to display and manage
 * multiple expandable panels with content provided by the user of the class.
 */
class Accordion {
	/**
	 * @private The options provided
	 * @type {AccordionOptions}
	 */
	_options = null;

	/**
	 * The constructor, which takes a mandatory configuration object
	 * @param {AccordionOptions} options the configuration options for the accordion
	 */
	constructor(options) {
		this._setOptions(options);
		this._render();
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
		errors.push(missingParameters.map(mp => `The provided options must contain property ${mp}`));

		// Do single pass validation: find out all possible issues at once instead of breaking out early
		// e.g.: if "container" is missing but "panels" was provided, check that it is a valid array of panels
		if (!isNil(options.panels)) {
			if (!Array.isArray(options.panels)) {
				errors.push(`The panels parameter must be an array of objects`);
			} else {
				const requiredPanelParameters = ["title", "content"];
				options.panels.forEach((panel, index) => {
					const missingPanelParameters = requiredPanelParameters.map(rpp => (isNil(panel[rpp]) ? rpp : null)).filter(mpp => mpp !== null);
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
		const TEMPLATES = {
			headerTemplate: '<div class="accordion-header">MAIN_TITLE</div>',
			panelTemplate: '<div class="accordion-panel">MAIN_TITLE</div>'
		};
		const selector = this._options.container;
		const container = document.getElementById(selector);
		const hasTitle = !isNil(this._options.mainTitle);
		if (hasTitle) {
			container.append(TEMPLATES.headerTemplate.replace("MAIN_TITLE", this._options.mainTitle));
		}
		const panelElements = this._options.panels.map(this._renderPanel);
		container.append(panelElements);
	}

	/**
	 * Render the provided panel
	 * @private
	 * @param {AccordionPanel} panel The panel to render
	 * @returns {string} The HTML string representing the panel instance
	 */
	_renderPanel(panel) {}
}
