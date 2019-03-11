import { createElement as h, render } from '../../src/index';
import { setupScratch, teardown } from '../_util/helpers';

/** @jsx h */


import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;
chai.use(require('sinon-chai'));

import {workerDOM} from '../workerdom';
global.window = workerDOM;
global.document = window.document;

// import {JSDOM} from 'jsdom';
// global.window = new JSDOM().window;
// global.document = window.document;


// hacky normalization of attribute order across browsers.
function sortAttributes(html) {
	return html.replace(/<([a-z0-9-]+)((?:\s[a-z0-9:_.-]+=".*?")+)((?:\s*\/)?>)/gi, (s, pre, attrs, after) => {
		let list = attrs.match(/\s[a-z0-9:_.-]+=".*?"/gi).sort( (a, b) => a>b ? 1 : -1 );
		if (~after.indexOf('/')) after = '></'+pre+'>';
		return '<' + pre + list.join('') + after;
	});
}


describe('svg', () => {
	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should render SVG to string', () => {
		render((
			<svg viewBox="0 0 360 360">
				<path stroke="white" fill="black" d="M 347.1 357.9 L 183.3 256.5 L 13 357.9 V 1.7 h 334.1 v 356.2 Z M 58.5 47.2 v 231.4 l 124.8 -74.1 l 118.3 72.8 V 47.2 H 58.5 Z" />
			</svg>
		), scratch);

		let html = sortAttributes(String(scratch.innerHTML).replace(' xmlns="http://www.w3.org/2000/svg"', ''));
		expect(html).to.equal(sortAttributes(`
			<svg viewBox="0 0 360 360">
				<path d="M 347.1 357.9 L 183.3 256.5 L 13 357.9 V 1.7 h 334.1 v 356.2 Z M 58.5 47.2 v 231.4 l 124.8 -74.1 l 118.3 72.8 V 47.2 H 58.5 Z" fill="black" stroke="white"></path>
			</svg>
		`.replace(/[\n\t]+/g,'')));
	});

	it('should render SVG to DOM', () => {
		const Demo = () => (
			<svg viewBox="0 0 360 360">
				<path d="M 347.1 357.9 L 183.3 256.5 L 13 357.9 V 1.7 h 334.1 v 356.2 Z M 58.5 47.2 v 231.4 l 124.8 -74.1 l 118.3 72.8 V 47.2 H 58.5 Z" fill="black" stroke="white" />
			</svg>
		);
		render(<Demo />, scratch);

		let html = sortAttributes(String(scratch.innerHTML).replace(' xmlns="http://www.w3.org/2000/svg"', ''));
		expect(html).to.equal(sortAttributes('<svg viewBox="0 0 360 360"><path stroke="white" fill="black" d="M 347.1 357.9 L 183.3 256.5 L 13 357.9 V 1.7 h 334.1 v 356.2 Z M 58.5 47.2 v 231.4 l 124.8 -74.1 l 118.3 72.8 V 47.2 H 58.5 Z"></path></svg>'));
	});

	it('should render with the correct namespace URI', () => {
		render(<svg />, scratch);

		let namespace = scratch.querySelector('svg').namespaceURI;

		expect(namespace).to.equal('http://www.w3.org/2000/svg');
	});

	it('should use attributes for className', () => {
		const Demo = ({ c }) => (
			<svg viewBox="0 0 360 360" {...(c ? { class: 'foo_'+c } : {})}>
				<path class={c && ('bar_'+c)} stroke="white" fill="black" d="M347.1 357.9L183.3 256.5 13 357.9V1.7h334.1v356.2zM58.5 47.2v231.4l124.8-74.1 118.3 72.8V47.2H58.5z" />
			</svg>
		);
		render(<Demo c="1" />, scratch);
		let root = scratch.firstChild;
		sinon.spy(root, 'removeAttribute');
		render(<Demo />, scratch);
		expect(root.removeAttribute)
			.to.have.been.calledOnce
			.and.calledWith('class');

		root.removeAttribute.restore();

		render(<div />, scratch);
		render(<Demo />, scratch);
		root = scratch.firstChild;
		sinon.spy(root, 'setAttribute');
		render(<Demo c="2" />, scratch);
		expect(root.setAttribute).to.have.been.calledOnce.and.calledWith('class', 'foo_2');

		root.setAttribute.restore();
	});

	it('should still support class attribute', () => {
		render((
			<svg viewBox="0 0 1 1" class="foo bar" />
		), scratch);

		expect(scratch.innerHTML).to.contain(` class="foo bar"`);
	});

	it('should still support className attribute', () => {
		render((
			<svg viewBox="0 0 1 1" className="foo bar" />
		), scratch);

		expect(scratch.innerHTML).to.contain(` class="foo bar"`);
	});

	it('should switch back to HTML for <foreignObject>', () => {
		render((
			<svg>
				<g>
					<foreignObject>
						<a href="#foo">test</a>
					</foreignObject>
				</g>
			</svg>
		), scratch);
		const anchors = scratch.getElementsByTagName('a');
		expect(anchors.length).to.equal(1);
		const a = anchors[0];
		expect(a.constructor.name).to.equal('HTMLAnchorElement');
	});

	it('should render foreignObject as an svg element', () => {
		render((
			<svg>
				<g>
					<foreignObject>
						<a href="#foo">test</a>
					</foreignObject>
				</g>
			</svg>
		), scratch);

		expect(scratch.querySelector('foreignObject').localName).to.equal('foreignObject');
	});

	it('should transition from DOM to SVG and back', () => {
		render((
			<div>
				<svg id="svg1923" width="700" xmlns="http://www.w3.org/2000/svg" height="700">
					<circle cy="333" cx="333" r="333" />
					<circle cy="333" cx="333" r="333" fill="#fede58" />
				</svg>
			</div>
		), scratch);

		expect(scratch.firstChild).to.be.an('HTMLDivElement');
		expect(scratch.firstChild.firstChild).to.be.an('SVGSVGElement');
	});
});
