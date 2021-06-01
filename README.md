# [PlusAsTab](https://joelpurra.com/projects/plusastab/) javascript library

<p class="donate">
  <a href="https://joelpurra.com/donate/proceed/?amount=5&currency=usd"><kbd>Donate $5 now</kbd></a>
  <a href="https://joelpurra.com/donate/proceed/?amount=25&currency=usd"><kbd>Donate $25 now</kbd></a>
  <a href="https://joelpurra.com/donate/proceed/?amount=100&currency=usd&invoice=true"><kbd>Donate $100 now</kbd></a>
  <a href="https://joelpurra.com/donate/"><kbd>More options</kbd></a>
</p>

A jQuery plugin to use the numpad plus key (configurable) as a tab key equivalent.



> ## ⚠️ This project has been archived
>
> No future updates are planned. Feel free to continue using it, but expect no support.



- [Project page](https://joelpurra.com/projects/plusastab/)
- [Source code on Github](https://github.com/joelpurra/plusastab)
- [Basic demo](https://joelpurra.com/projects/plusastab/docs/example/demo.html)
- [Enter-as-tab demo](https://joelpurra.com/projects/plusastab/docs/example/enter-as-tab.html)
- [Test suite](https://joelpurra.com/projects/plusastab/docs/test/)

With PlusAsTab, elements can be marked as *plussable*, allowing the user to use the <kbd>+</kbd> on the  [numeric keypad](https://en.wikipedia.org/wiki/Numeric_keypad) (*numpad* or *tenkey* for short) to navigate page. For numeric input it is closer than the <kbd>tab</kbd> key and therefor increases input speed and allows for one-handed entry in multiple fields.

- The normal <kbd>tab</kbd> key is unaffected and works as usual.
- Plussable fields that may need to have the plus character entered into them can still use the <kbd>+</kbd> key on the typewriter keys.
- Laptops may not have physical numpads, but instead it is emulated with the <kbd>Fn</kbd> key (or similar). PlusAsTab is not targeted at laptop users. It is possible to use an external/separate USB numpads though.



## Get it

- Directly: [`src/plusastab.joelpurra.js`](src/plusastab.joelpurra.js)
- [Bower](https://bower.io/):

```bash
bower install jquery-plusastab
```



## Demos

- [`example/demo.html`](https://joelpurra.com/projects/plusastab/docs/example/demo.html): Simple demo for playing around.
- [`example/enter-as-tab.html`](https://joelpurra.com/projects/plusastab/docs/example/enter-as-tab.html): Setting the options to listen to the <kbd>enter</kbd>/<kbd>&crarr;</kbd> key instead.



## Usage

### HTML

```html
<!-- Can be applied to plussable elements one by one -->
<input type="text" data-plus-as-tab="true" />
<textarea data-plus-as-tab="true"></textarea>
<a href="https://joelpurra.com/" data-plus-as-tab="true">Joel Purra</a>

<input type="button" value="This button has not been enabled for plussing" />

<!-- Can be applied using a class name -->
<input type="text" value="" class="plus-as-tab" />

<!-- Can be applied to all plussable elements within a container -->
<ol data-plus-as-tab="true">
	<li><input type="checkbox" /> Checkbox, plussable</li>
	<li><input type="checkbox" /> Another checkbox, plussable</li>

	<!-- Can be explicitly exluded from plussing -->
	<li><input type="checkbox" data-plus-as-tab="false" /> Checkbox, plussing disabled</li>
	<li><input type="checkbox" class="disable-plus-as-tab" /> Another checkbox, plussing disabled</li>
</ol>
```



### Javascript

```javascript
// Apply plus as tab to the selected elements/containers
$(selector).plusAsTab();

// Exclude plus as tab to the selected elements/containers
$(selector).plusAsTab(false);

// Equivalent static function
JoelPurra.PlusOnTab.plusAsTab($(selector));
JoelPurra.PlusOnTab.plusAsTab($(selector), false);

// Change the "tab" key from "numpad +" to something else
JoelPurra.PlusAsTab.setOptions({
  // Use enter instead of plus
  // Number 13 found through demo at
  // https://api.jquery.com/event.which/
  key: 13
});

// You can assign multiple keys as "tab" keys; just pass an array
JoelPurra.PlusAsTab.setOptions({
  // Use the enter key and arrow down key as tab keys
  key: [13, 40]
});
```



### Using another key (or keys) instead of numpad plus

PlusAsTab should be able to intercept most keys, since it listens to [the keydown event](https://api.jquery.com/keydown/). To change the key, use `JoelPurra.PlusAsTab.setOptions({key: YOUR_KEY});`, where `YOUR_KEY` is a number that you can find by using the [jQuery `event.which` demo](https://api.jquery.com/event.which/). In case you want multiple keys to function as tab, use an array; for example `[13, 40, 107]` for the enter key, arrow down key and numpad plus key.



### Plussable elements

Elements that can be focused/tabbed include `<input>`, `<select>`, `<textarea>`, `<button>` and `<a href="...">` (the `href` attribute must exist and the tag must have some contents). These are also the elements that can be plussable.

Note that `<input type="hidden" />`, `<a>` (without `href` or empty contents), `disabled="disabled"` or `display: none;` elements cannot be focused.



### Static elements

Static plussable html elements can have, or be contained within elements that have, the attribute `data-plus-as-tab="true"` or the class `.plus-as-tab`. They are enabled automatically when the library has been loaded/executed.



### Dynamic elements

Dynamic elements are initialized to PlusAsTab in code after adding them to the DOM; `$("#my-optional-input").plusAsTab()`. This is not necessary if the added element already is contained within an element that is marked for plussing. You can also call `.plusAsTab()` on containers.



### Containers

When PlusAsTab is applied to html containers, like `<div>`, `<ul>` or `<fieldset>`, all plussable child elements are implicitly plussable. This applies to static html and subsequently added child elements.



### Disabling plussing

Plussable elements, or containers with plussable children, marked with class `.disable-plus-as-tab` or attribute `data-plus-as-tab="false"` never have plussing enabled. Disabling can also be done dynamically on elements/containers with `$(selector).plusAsTab(false)`. If plussing is disabled for the element when it receives focus, or any of its elements parents, it will not be tabbed. Disabling plussing takes precedence over enabling plussing.



## Original purpose

Developed to increase the speed and usability when entering numbers in consecutive fields in a web application for registering and administering letters. Examples of plussed fields are consecutive date, zip code and quantity fields. Any other text fields, dropdowns with sensible defaults and secondary buttons were also set as plussable to maximize the flow.



## Dependencies

PlusAsTab's runtime dependencies are

- [jQuery](https://jquery.com/)
- [EmulateTab](https://github.com/joelpurra/emulatetab), one of PlusAsTab's sister projects.



## Browser compatibility

Should be about as compatible as jQuery is, since most functions depend on jQuery's normalization. You are engouraged to [run the PlusAsTab test suite](https://joelpurra.com/projects/plusastab/docs/test/) and then report any issues.



## Todo

- Break out reusable key press functions from tests.
- Implement a "real world" demo.



## See also

PlusAsTab's sister projects.

- [SkipOnTab](https://github.com/joelpurra/skipontab) - speed up form filling by skipping some fields in the forward tab order.
- [EmulateTab](https://github.com/joelpurra/emulatetab) - the tab emulator used by both SkipOnTab and PlusAsTab.



---



[PlusAsTab](https://joelpurra.com/projects/plusastab/) copyright &copy; 2011, 2012, 2013, 2014, 2015, 2016, 2017 The Swedish Post and Telecom Authority (PTS). All rights reserved. Released under the BSD license. Developed for PTS by [Joel Purra](https://joelpurra.com/). [Your donations are appreciated!](https://joelpurra.com/donate/)
