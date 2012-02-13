# PlusAsTab javascript library
A jQuery plugin to use the numpad plus key as a tab key equivalent.

With PlusAsTab, elements can be marked as *plussable*, allowing the user to use the <kbd>+</kbd> on the *keypad* to navigate page. It is a closer than the <kbd>tab</kbd> key and therefor increases input speed and allows for one-handed entry.

* The normal <kbd>tab</kbd> key is unaffected and works as usual.
* Plussable fields that may need to have the plus character entered into them can still use the <kbd>plus</kbd> key on the typewriter keys.
* Laptops may not have physical keypads, but instead it is emulated with the <kbd>Fn</kbd> key (or similar). PlusAsTab is not targeted at laptop users. It is possible to use an external/separate USB keypad though.

## Demos
* `examples/demo.html`: Simple demo for playing around.

## Usage

### HTML

```html
<!-- Can be applied to plussable elements one by one -->
<input type="text" data-plus-as-tab="true" />
<textarea data-plus-as-tab="true"></textarea>
<a href="http://joelpurra.se/" data-plus-as-tab="true">Joel Purra</a>

<input type="button" value="This button has not been enabled for plussing" />

<!-- Can be applied using a class name -->
<input type="text" value="" class="plus-as-tab" />

<!-- Can be applied to all plussable elements within a container -->
<ol data-plus-as-tab="true">
	<li><input type="checkbox" /> Checkbox, plussable</li>
	<li><input type="checkbox" /> Another checkbox, plussable</li>

	<!-- Can be explicitly exluded from plussing -->
	<li><input type="checkbox" data-plus-as-tab="false" /> Checkbox, plussing not enabled</li>
	<li><input type="checkbox" class="disable-plus-as-tab" /> Another checkbox, plussing not enabled</li>
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
```

### Plussable elements
Elements that can be focused/tabbed include `<input>`, `<select>`, `<textarea>`, `<button>` and `<a href="...">` (the `href` attribute must exist). These are also the elements that can be plussable.

Note that `<input type="hidden" />`, `<a>` (without `href`), `disabled="disabled"` or `display: none;` elements cannot be focused.

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

* [jQuery](http://jquery.com/)
* [EmulateTab](https://github.com/joelpurra/emulatetab), one of PlusAsTab's sister projects.

## Todo
* Write tests.
* Implement a "real world" demo.

## See also
PlusAsTab's sister projects.

* [SkipOnTab](https://github.com/joelpurra/skipontab) - speed up form filling by skipping some fields in the forward tab order.
* [EmulateTab](https://github.com/joelpurra/emulatetab) - the tab emulator used by both SkipOnTab and PlusAsTab.

## License
Developed for PTS by Joel Purra <http://joelpurra.se/>

Copyright (c) 2011, 2012, The Swedish Post and Telecom Authority (PTS)
All rights reserved.

Released under the BSD license.
