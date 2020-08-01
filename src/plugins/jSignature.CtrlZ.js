/** @license
jSignature v2 jSignature's undo functionality plugin. Undo last action on keypress of Escape or Ctrl+Z.

Copyright (c) 2020 by UtilMind (https://github.com/utilmind)
MIT License <http://www.opensource.org/licenses/mit-license.php>

based on

Copyright (c) 2011 Willow Systems Corp http://willow-systems.com
MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

;(function() {
        var apinamespace = "jSignature";

        function attachHandlers(buttonRenderer, apinamespace, extensionName) {
                var $ctrlZ = buttonRenderer.call(this);

                ;(function(jSignatureInstance, $ctrlZ, apinamespace) {

                        var eventName = apinamespace + ".undo";

                        document.addEventListener("keyup", function(e) {
                            // check if signature canvas disabled, and do nothing if it's really disabled.
                            if (!$(jSignatureInstance.canvas).hasClass("disabled") &&
                               ((27 === e.keyCode) ||
                                ((90 === e.keyCode) && e.ctrlKey))) {
                              jSignatureInstance.events.publish(eventName);
                            }
                        });

                        // This one creates new "undo" event listener to jSignature instance
                        // It handles the actual undo-ing.
                        jSignatureInstance.events.subscribe(
                                eventName
                                , function() {
                                        var data = jSignatureInstance.dataEngine.data
                                        if (data.length) {
                                                data.pop();
                                                jSignatureInstance.resetCanvas(data);
                                        }
                                }
                        );
                })(
                        this
                        , $ctrlZ
                        , this.events.topics.hasOwnProperty( apinamespace + ".undo" ) ?
                                // oops, seems some other plugin or code has already claimed "jSignature.undo" event
                                // we will use this extension's name for event name prefix
                                extensionName :
                                // Great! we will use 'jSignature' for event name prefix.
                                apinamespace
                )
        }

        function ExtensionInitializer(extensionName) {
                // we are called very early in instance's life.
                // right after the settings are resolved and
                // jSignatureInstance.events is created
                // and right before first ("jSignature.initializing") event is called.
                // You don't really need to manupilate
                // jSignatureInstance directly, just attach
                // a bunch of events to jSignatureInstance.events
                // (look at the source of jSignatureClass to see when these fire)
                // and your special pieces of code will attach by themselves.

                // this function runs every time a new instance is set up.
                // this means every var you create will live only for one instance
                // unless you attach it to something outside, like "window."
                // and pick it up later from there.

                // when globalEvents' events fire, 'this' is globalEvents object
                // when jSignatureInstance's events fire, 'this' is jSignatureInstance

                // Here,
                // this = is new jSignatureClass's instance.

                // The way you COULD approch setting this up is:
                // if you have multistep set up, attach event to "jSignature.initializing"
                // that attaches other events to be fired further lower the init stream.
                // Or, if you know for sure you rely on only one jSignatureInstance's event,
                // just attach to it directly

                this.events.subscribe(
                        // name of the event
                        apinamespace + ".attachingEventHandlers"
                        // event handlers, can pass args too, but in majority of cases,
                        // 'this' which is jSignatureClass object instance pointer is enough to get by.
                        , function(){

                                // hooking up "undo" button     to lower edge of Canvas.
                                // but only when options passed to jSignature('init', options)
                                // contain "undoButton":renderingFunction pair.
                                // or "undoButton":true (in which case default, internal rendering fn is used)
                                if (this.settings[extensionName]) {
                                        var oursettings = this.settings[extensionName]
                                        if ("function" !== typeof oursettings) { // it should be function
                                                oursettings = function() {
                                                    return true;
                                                }
                                        }

                                        attachHandlers.call(
                                                this
                                                , oursettings
                                                , apinamespace
                                                , extensionName
                                        )
                                }
                        }
                )
        }

        var ExtensionAttacher = function() {
                $.fn[apinamespace](
                        "addPlugin"
                        ,"instance" // type of plugin
                        ,"CtrlZ" // extension name
                        ,ExtensionInitializer
                )
        }


//  //Because plugins are minified together with jSignature, multiple defines per (minified) file blow up and dont make sense
//      //Need to revisit this later.

//      if ( typeof define === "function" && define.amd != null) {
//              // AMD-loader compatible resource declaration
//              // you need to call this one with jQuery as argument.
//              define(function(){return Initializer} )
//      } else {
                ExtensionAttacher();
//      }

})();