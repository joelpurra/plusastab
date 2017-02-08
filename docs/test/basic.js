/* global
JoelPurra,
jQuery,
console,
QUnit,
*/

(function($)
{
    var
        $container,
        defaultKeyTimeout = 1;

    // Keyboard simulation
    // DEBUG
    function logArguments()
    {
        try
        {
            /* eslint-disable no-console */
            console.log(arguments);
            /* eslint-enable no-console */
        } catch (e)
        {
                // Could show an alert message, but what the hell
        }
    }

    function performDeferredAsync(fnc, timeout)
    {
        var deferred = new $.Deferred();

        setTimeout($.proxy(function()
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
        return performDeferredAsync(function()
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
                    .pipe(function()
                {
                        return pressKeyPress($element, key)
                            .pipe(function()
                            {
                                return pressKeyUp($element, key);
                            });
                    }));
    }

    // Simulated keypress helpers
    function getSimulatedKeyEventOptions(keyCode, shift)
    {
        shift = !!shift;

        var key
                = {
                    // Cannot use "which" with $.simulate
                    keyCode: keyCode,
                    shiftKey: shift,
                };

        return key;
    }

    function pressSimulatedKeyCode($element, keyCode, shift)
    {
        var key = getSimulatedKeyEventOptions(keyCode, shift);

            // TODO: simulate 'keyCode' being added to text boxes (but it will be cancelled)
        return pressKey($element, key, $.noop);
    }

    // Tabbing related key press helpers
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

    // Test keys simulation helpers
    // Keys from
    // https://api.jquery.com/event.which/
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

    // Test helpers
    function normalSetup()
    {
        var $qunitFixture = $("#qunit-fixture"),
            $div = $("<div />");

        $div.appendTo($qunitFixture);

        $container = $div;
    }

    function resetKeyOptions() {
        JoelPurra.PlusAsTab.setOptions({
            key: KEY_NUM_PLUS,
        });
    }

    function useEnterKeyOptions() {
        JoelPurra.PlusAsTab.setOptions({
            key: KEY_ENTER,
        });
    }

    function useEnterArrowDownKeysOptions() {
        JoelPurra.PlusAsTab.setOptions({
            key: [KEY_ENTER, KEY_ARROW_DOWN],
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

    // Assertion functions
    function assertId(assert, $element, id)
    {
            // DEBUG
        if ($element.attr("id") !== id)
        {
            try
            {
                /* eslint-disable no-console */
                console.error([$element, $element.attr("id"), id]);
                /* eslint-enable no-console */
            } catch (e)
            {
                // Could show an alert message, but what the hell
            }
        }

        assert.strictEqual($element.attr("id"), id, "The id did not match for element " + $element);
    }

    function assertFocusedId(assert, id)
    {
        assertId(assert, getFocusedElement(), id);
    }

    function assertFocusStart(assert)
    {
        $("#start").focus();

        assertFocusedId(assert, "start");
    }

    function assertEnd(assert)
    {
        assertFocusedId(assert, "end");
    }

    function enterAssertId(assert, id, shift)
    {
        return function()
        {
            return pressEnterAndGetFocusedElement(shift)
                .pipe(function($focused)
                {
                    assertId(assert, $focused, id);
                });
        };
    }

    function arrowDownAssertId(assert, id, shift)
    {
        return function()
        {
            return pressArrowDownAndGetFocusedElement(shift)
                .pipe(function($focused)
                {
                    assertId(assert, $focused, id);
                });
        };
    }

    function numpadPlusAssertId(assert, id, shift)
    {
        return function()
        {
            return pressNumpadPlusAndGetFocusedElement(shift)
                .pipe(function($focused)
                {
                    assertId(assert, $focused, id);
                });
        };
    }

    (function()
    {
        QUnit.module("Library load");

        QUnit.test("Object exists", function(assert)
        {
            assert.expect(3);

            assert.notStrictEqual(typeof (JoelPurra.PlusAsTab), "undefined", "JoelPurra.PlusAsTab is undefined.");
            assert.strictEqual(typeof (JoelPurra.PlusAsTab), "object", "JoelPurra.PlusAsTab is not an object.");
            assert.strictEqual(typeof ($.fn.plusAsTab), "function", "$.fn.plusAsTab is not a function.");
        });
    }());

    (function()
    {
        QUnit.module("init");

        QUnit.test("Static elements", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            var $staticContainer = $("#elements-initialized-at-startup");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "b"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done)
                .pipe(function()
            {
                    // Run the static tests only once
                    $staticContainer.remove();
                });
        });
    }());

    (function()
    {
        QUnit.module("Elements forward",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("With class name", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" class=\"plus-as-tab\" />")
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("With data attribute", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("Elements reverse",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("With class name", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" class=\"plus-as-tab\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("With data attribute", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("setOptions",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Enter as tab", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            useEnterKeyOptions();

            $container
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(enterAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(enterAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done)
                .pipe(resetKeyOptions);
        });

        QUnit.test("Enter as tab reverse", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            useEnterKeyOptions();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(enterAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(enterAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done)
                .pipe(resetKeyOptions);
        });
    }());

    (function()
    {
        QUnit.module("setOptions multiple keys",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Elements forward", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            useEnterArrowDownKeysOptions();

            $container
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(enterAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(arrowDownAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done)
                .pipe(resetKeyOptions);
        });

        QUnit.test("Elements reverse", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            useEnterArrowDownKeysOptions();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" data-plus-as-tab=\"true\" />")
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" data-plus-as-tab=\"true\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(enterAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(arrowDownAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done)
                .pipe(resetKeyOptions);
        });
    }());

    (function()
    {
        QUnit.module("Containers forward",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("With class name", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div class=\"plus-as-tab\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />"))
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("With data attribute", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />"))
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude with class name", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div class=\"plus-as-tab\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" class=\"disable-plus-as-tab\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude with data attribute", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" data-plus-as-tab=\"false\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("Containers reverse",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("With class name", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append($("<div class=\"plus-as-tab\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("With data attribute", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude with class name", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div class=\"plus-as-tab\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" class=\"disable-plus-as-tab\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude with data attribute", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" data-plus-as-tab=\"false\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab elements forward enable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Element", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(function()
            {
                    $("#start").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab elements reverse enable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Element", function(assert)
        {
            assert.expect(3);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />");

            $.when()
                .pipe(function()
            {
                    $("#start").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab containers forward enable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Container", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div id=\"container\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />"))
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />");

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div id=\"container\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" data-plus-as-tab=\"false\" />"));

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab containers reverse enable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Container", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                .append($("<div id=\"container\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });

        QUnit.test("Exclude", function(assert)
        {
            assert.expect(5);
            var done = assert.async();

            $container
                .append($("<div id=\"container\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" data-plus-as-tab=\"false\" />")
                    .append("<input id=\"a\" type=\"text\" value=\"text field that is plussable\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab();
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "a", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab elements forward disable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Element", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />"));

            $.when()
                .pipe(function()
            {
                    $("#end").plusAsTab(false);
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab elements reverse disable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Element", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(function()
            {
                    $("#end").plusAsTab(false);
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab containers forward disable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Container", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />")
                    .append($("<div id=\"container\" />")
                        .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />")));

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab(false);
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(numpadPlusAssertId(assert, "end"))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());

    (function()
    {
        QUnit.module("$.fn.plusAsTab containers reverse disable",
            {
                beforeEach: normalSetup,
            });

        QUnit.test("Container", function(assert)
        {
            assert.expect(4);
            var done = assert.async();

            $container
                .append($("<div data-plus-as-tab=\"true\" />")
                    .append($("<div id=\"container\" />")
                        .append("<input id=\"end\" type=\"submit\" value=\"submit button that is at the end of the plussable elements\" />"))
                    .append("<input id=\"start\" type=\"text\" value=\"text field that is the starting point\" />"));

            $.when()
                .pipe(function()
            {
                    $("#container").plusAsTab(false);
                })
                .pipe(assertFocusStart.bind(null, assert))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(numpadPlusAssertId(assert, "end", true))
                .pipe(assertEnd.bind(null, assert))
                .pipe(done);
        });
    }());
}(jQuery));
