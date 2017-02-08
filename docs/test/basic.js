/// <reference path="qunit/qunit/qunit.js" />
/// <reference path="jquery-ui/jquery-1.7.1.js" />
/// <reference path="jquery-ui/tests/jquery.simulate.js" />
/// <reference path="../src/plusastab.joelpurra.js" />

/*jslint browser: true, vars: true, white: true, regexp: true, maxlen: 150*/
/*global JoelPurra, jQuery, console, module, test, asyncTest, start, ok, strictEqual, notStrictEqual*/

(function ($)
{
	var 
		$container,
		defaultKeyTimeout = 1;

	// Keyboard simulation
	{
		// DEBUG
		function logArguments()
		{
			try
			{
				console.log.call(console, arguments);

			} catch (e)
			{
				// Could show an alert message, but what the hell
			}
		}

		function performDeferredAsync(fnc, timeout)
		{
			var deferred = new $.Deferred();

			setTimeout($.proxy(function ()
			{
				try
				{
					var result = fnc();

					deferred.resolve(result);
				}
				catch (e)
				{
					deferred.reject(e);
				}

			}, this), timeout);

			return deferred.promise();
		}

		function deferredPressKey(eventName, $element, key)
		{
			return performDeferredAsync(function ()
			{
				var savedEvent;

				function saveEvent(event)
				{
					savedEvent = event;
				}

				$element.on(eventName + ".deferredPressKey", saveEvent);
				$element.simulate(eventName, key);
				$element.off(eventName + ".deferredPressKey", saveEvent);

				return savedEvent;

			}, defaultKeyTimeout);
		}

		function pressKeyDown($element, key, keyDownAction)
		{
			keyDownAction = keyDownAction || $.noop;

			return deferredPressKey("keydown", $element, key)
				.then(keyDownAction);
		}

		function pressKeyPress($element, key)
		{
			return deferredPressKey("keypress", $element, key);
		}

		function pressKeyUp($element, key)
		{
			return deferredPressKey("keyup", $element, key);
		}

		function pressKey($element, key, keyDownAction)
		{
			return $.when(
				pressKeyDown($element, key, keyDownAction)
					.pipe(function ()
					{
						return pressKeyPress($element, key)
								.pipe(function ()
								{
									return pressKeyUp($element, key);
								});
					}));
		}
	}

	// Simulated keypress helpers
	{
		function getSimulatedKeyEventOptions(keyCode, shift)
		{
			shift = !!shift;

			var key =
				{
					// Cannot use "which" with $.simulate
					keyCode: keyCode,
					shiftKey: shift
				};

			return key;
		}

		function pressSimulatedKeyCode($element, keyCode, shift)
		{
			var key = getSimulatedKeyEventOptions(keyCode, shift);

			// TODO: simulate 'keyCode' being added to text boxes (but it will be cancelled)
			return pressKey($element, key, $.noop);
		}
	}

	// Tabbing related key press helpers
	{
		function getFocusedElement()
		{
			return $(document.activeElement);
		}

		function pressKeyFromFocusedElement(keyCode, shift)
		{
			return pressSimulatedKeyCode(getFocusedElement(), keyCode, shift);
		}

		function pressKeyAndGetFocusedElement(keyCode, shift)
		{
			return pressKeyFromFocusedElement(keyCode, shift)
				.pipe(getFocusedElement);
		}
	}

	// Test keys simulation helpers
	{
		// Keys from
		// http://api.jquery.com/event.which/
		// https://developer.mozilla.org/en/DOM/KeyboardEvent#Virtual_key_codes
		var KEY_ENTER = 13;
		var KEY_ARROW_DOWN = 40;
		var KEY_NUM_PLUS = 107;

		function pressEnterAndGetFocusedElement(shift)
		{
			return pressKeyAndGetFocusedElement(KEY_ENTER, shift);
		}

		function pressArrowDownAndGetFocusedElement(shift)
		{
			return pressKeyAndGetFocusedElement(KEY_ARROW_DOWN, shift);
		}

		function pressNumpadPlusAndGetFocusedElement(shift)
		{
			return pressKeyAndGetFocusedElement(KEY_NUM_PLUS, shift);
		}
	}

	// Test helpers
	{
		function normalSetup()
		{
			var $qunitFixture = $("#qunit-fixture");
			var $div = $("<div />");

			$div.appendTo($qunitFixture);

			$container = $div;
		}

		function resetKeyOptions(){
			JoelPurra.PlusAsTab.setOptions({
			  key: KEY_NUM_PLUS
			});
		}

		function useEnterKeyOptions(){
			JoelPurra.PlusAsTab.setOptions({
			  key: KEY_ENTER
			});
		}

		function useEnterArrowDownKeysOptions(){
			JoelPurra.PlusAsTab.setOptions({
			  key: [KEY_ENTER, KEY_ARROW_DOWN]
			});
		}

		function fnPlusA()
		{
			$("#a").plusAsTab();
		}

		function fnPlusContainer()
		{
			$("#container").plusAsTab();
		}
	}

	// Assertion functions
	{
		function assertId($element, id)
		{
			// DEBUG
			if ($element.attr("id") !== id)
			{
				try
				{
					console.error([$element, $element.attr("id"), id]);

				} catch (e)
				{
					// Could show an alert message, but what the hell
				}
			}

			strictEqual($element.attr("id"), id, "The id did not match for element " + $element);
		}

		function assertFocusedId(id)
		{
			assertId(getFocusedElement(), id);
		}

		function assertFocusStart()
		{
			$("#start").focus();

			assertFocusedId("start");
		}

		function assertEnd()
		{
			assertFocusedId("end");
		}

		function enterAssertId(id, shift)
		{
			return function ()
			{
				return pressEnterAndGetFocusedElement(shift)
					.pipe(function ($focused)
					{
						assertId($focused, id);
					});
			};
		}

		function arrowDownAssertId(id, shift)
		{
			return function ()
			{
				return pressArrowDownAndGetFocusedElement(shift)
					.pipe(function ($focused)
					{
						assertId($focused, id);
					});
			};
		}

		function numpadPlusAssertId(id, shift)
		{
			return function ()
			{
				return pressNumpadPlusAndGetFocusedElement(shift)
					.pipe(function ($focused)
					{
						assertId($focused, id);
					});
			};
		}
	}

	(function ()
	{
		module("Library load");

		test("Object exists", 3, function ()
		{
			notStrictEqual(typeof (JoelPurra.PlusAsTab), "undefined", "JoelPurra.PlusAsTab is undefined.");
			strictEqual(typeof (JoelPurra.PlusAsTab), "object", "JoelPurra.PlusAsTab is not an object.");
			strictEqual(typeof ($.fn.plusAsTab), "function", "$.fn.plusAsTab is not a function.");
		});

	} ());

	(function ()
	{
		module("init");

		asyncTest("Static elements", 5, function ()
		{
			var $staticContainer = $("#elements-initialized-at-startup");

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("b"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start)
				.pipe(function ()
				{
					// Run the static tests only once
					$staticContainer.remove();
				});
		});

	} ());

	(function ()
	{
		module("Elements forward",
		{
			setup: normalSetup
		});

		asyncTest("With class name", 3, function ()
		{
			$container
				.append('<input id="start" type="text" value="text field that is the starting point" class="plus-as-tab" />')
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("With data attribute", 3, function ()
		{
			$container
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />')
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("Elements reverse",
		{
			setup: normalSetup
		});

		asyncTest("With class name", 3, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append('<input id="start" type="text" value="text field that is the starting point" class="plus-as-tab" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("With data attribute", 3, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("setOptions",
		{
			setup: normalSetup
		});

		asyncTest("Enter as tab", 5, function ()
		{
			useEnterKeyOptions();

			$container
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />')
				.append('<input id="a" type="text" value="text field that is plussable" data-plus-as-tab="true" />')
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(enterAssertId("a"))
				.pipe(numpadPlusAssertId("a"))
				.pipe(enterAssertId("end"))
				.pipe(assertEnd)
				.pipe(start)
				.pipe(resetKeyOptions);
		});

		asyncTest("Enter as tab reverse", 5, function ()
		{
			useEnterKeyOptions();

			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append('<input id="a" type="text" value="text field that is plussable" data-plus-as-tab="true" />')
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(enterAssertId("a", true))
				.pipe(numpadPlusAssertId("a", true))
				.pipe(enterAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start)
				.pipe(resetKeyOptions);
		});

	} ());

	(function ()
	{
		module("setOptions multiple keys",
		{
			setup: normalSetup
		});

		asyncTest("Elements forward", 5, function ()
		{
			useEnterArrowDownKeysOptions();

			$container
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />')
				.append('<input id="a" type="text" value="text field that is plussable" data-plus-as-tab="true" />')
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(enterAssertId("a"))
				.pipe(numpadPlusAssertId("a"))
				.pipe(arrowDownAssertId("end"))
				.pipe(assertEnd)
				.pipe(start)
				.pipe(resetKeyOptions);
		});

		asyncTest("Elements reverse", 5, function ()
		{
			useEnterArrowDownKeysOptions();

			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append('<input id="a" type="text" value="text field that is plussable" data-plus-as-tab="true" />')
				.append('<input id="start" type="text" value="text field that is the starting point" data-plus-as-tab="true" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(enterAssertId("a", true))
				.pipe(numpadPlusAssertId("a", true))
				.pipe(arrowDownAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start)
				.pipe(resetKeyOptions);
		});

	} ());

	(function ()
	{
		module("Containers forward",
		{
			setup: normalSetup
		});

		asyncTest("With class name", 4, function ()
		{
			$container
				.append($('<div class="plus-as-tab" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />'))
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("With data attribute", 4, function ()
		{
			$container
				.append($('<div data-plus-as-tab="true" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />'))
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude with class name", 5, function ()
		{
			$container
				.append($('<div class="plus-as-tab" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" class="disable-plus-as-tab" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude with data attribute", 5, function ()
		{
			$container
				.append($('<div data-plus-as-tab="true" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" data-plus-as-tab="false" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("Containers reverse",
		{
			setup: normalSetup
		});

		asyncTest("With class name", 4, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append($('<div class="plus-as-tab" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("With data attribute", 4, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append($('<div data-plus-as-tab="true" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude with class name", 5, function ()
		{
			$container
				.append($('<div class="plus-as-tab" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" class="disable-plus-as-tab" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude with data attribute", 5, function ()
		{
			$container
				.append($('<div data-plus-as-tab="true" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" data-plus-as-tab="false" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab elements forward enable",
		{
			setup: normalSetup
		});

		asyncTest("Element", 3, function ()
		{
			$container
				.append('<input id="start" type="text" value="text field that is the starting point" />')
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(function ()
				{
					$("#start").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab elements reverse enable",
		{
			setup: normalSetup
		});

		asyncTest("Element", 3, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append('<input id="start" type="text" value="text field that is the starting point" />');

			$.when()
				.pipe(function ()
				{
					$("#start").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab containers forward enable",
		{
			setup: normalSetup
		});

		asyncTest("Container", 4, function ()
		{
			$container
				.append($('<div id="container" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />'))
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />');

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude", 5, function ()
		{
			$container
				.append($('<div id="container" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" data-plus-as-tab="false" />'));

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab containers reverse enable",
		{
			setup: normalSetup
		});

		asyncTest("Container", 4, function ()
		{
			$container
				.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
				.append($('<div id="container" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

		asyncTest("Exclude", 5, function ()
		{
			$container
				.append($('<div id="container" />')
					.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" data-plus-as-tab="false" />')
					.append('<input id="a" type="text" value="text field that is plussable" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab();
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("a", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab elements forward disable",
		{
			setup: normalSetup
		});

		asyncTest("Element", 4, function ()
		{
			$container
					.append($('<div data-plus-as-tab="true" />')
						.append('<input id="start" type="text" value="text field that is the starting point" />')
						.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />'));

			$.when()
				.pipe(function ()
				{
					$("#end").plusAsTab(false);
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab elements reverse disable",
		{
			setup: normalSetup
		});

		asyncTest("Element", 4, function ()
		{
			$container
					.append($('<div data-plus-as-tab="true" />')
						.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')
						.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(function ()
				{
					$("#end").plusAsTab(false);
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab containers forward disable",
		{
			setup: normalSetup
		});

		asyncTest("Container", 4, function ()
		{
			$container
				.append($('<div data-plus-as-tab="true" />')
					.append('<input id="start" type="text" value="text field that is the starting point" />')
					.append($('<div id="container" />')
						.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />')));

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab(false);
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end"))
				.pipe(numpadPlusAssertId("end"))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

	(function ()
	{
		module("$.fn.plusAsTab containers reverse disable",
		{
			setup: normalSetup
		});

		asyncTest("Container", 4, function ()
		{
			$container
				.append($('<div data-plus-as-tab="true" />')
					.append($('<div id="container" />')
						.append('<input id="end" type="submit" value="submit button that is at the end of the plussable elements" />'))
					.append('<input id="start" type="text" value="text field that is the starting point" />'));

			$.when()
				.pipe(function ()
				{
					$("#container").plusAsTab(false);
				})
				.pipe(assertFocusStart)
				.pipe(numpadPlusAssertId("end", true))
				.pipe(numpadPlusAssertId("end", true))
				.pipe(assertEnd)
				.pipe(start);
		});

	} ());

} (jQuery));


