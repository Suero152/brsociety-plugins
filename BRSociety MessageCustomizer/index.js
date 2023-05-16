// ==UserScript==
// @name         BRSociety Custom Message Plugin
// @namespace    https://brsociety.club/
// @version      2.2
// @description  Plugin para enviar mensagens com customização.
// @author       Suero & Anekin
// @match        https://brsociety.club/
// @icon         https://brsociety.club/img/logo.png
// @grant        none
// @license      MIT
// ==/UserScript==
// Criado por: https://brsociety.club/users/Suero & https://brsociety.club/users/anekin
// Aproveite o plugin <3

(function () {
    'use strict';

    const _config = {
        // Main color which will be automatically applied. ( Won't be applied if any other mode is enabled)
        colorCode: '#ff2626',
        rainbowMode: true,
        gradientMode: {
            enabled: false,
            startColor: '#ba0000',
            endColor: '#7d0000'
        }

    }

    // Function required by rgbToHex
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    // Converts RGB into HEX
    function rgbToHex(colors) {
        return "#" + componentToHex(colors.r) + componentToHex(colors.g) + componentToHex(colors.b);
    }

    // Converts HEX into RGB
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Creates LERP fade between two colors.
    function twoColorFade(color1, color2, length) {
        var rIncr = (color2.r - color1.r) / (length - 1),
            gIncr = (color2.g - color1.g) / (length - 1),
            bIncr = (color2.b - color1.b) / (length - 1),
            colors = [],
            r = color1.r,
            g = color1.g,
            b = color1.b,
            ii;

        for (ii = 0; ii < length; ii++) {
            colors.push({ r: Math.floor(r), b: Math.floor(b), g: Math.floor(g) });
            r = r + rIncr;
            g = g + gIncr;
            b = b + bIncr;
        }

        return colors;
    };

    // Creates LERP fade between multiple colors, used to make the rainbow effect.
    var multiColorFade = function (colors, length) {
        var colorIncr = (length - 1) / (colors.length - 1),
            ii,
            len = Math.min(colors.length - 1, length),
            startPos = 0,
            endPos = 1,
            retColors = [],
            tmpColors,
            dist;

        for (ii = 0; ii < len; ii++) {
            endPos = Math.max(startPos + 2, endPos + colorIncr);
            dist = Math.round(endPos) - Math.round(startPos);

            tmpColors = twoColorFade(colors[ii], colors[ii + 1], dist);
            retColors.pop(); // remove last color
            retColors = retColors.concat(tmpColors);

            startPos = Math.round(endPos) - 1;
        }
        return retColors;
    };


    // Format a string to be faded on BBCode formatting.
    function textFader(startColor, endColor, string) {
        let colorsArray = twoColorFade(hexToRgb(startColor), hexToRgb(endColor), string.length)
        let fadedString = ''

        for (let i = 0; i < string.length; i++) {
            const char = string.charAt(i)

            if (char == ' ') {
                fadedString += char
            } else {
                fadedString += `[color=${rgbToHex(colorsArray[i])}]${char}[/color]`
            }
        }
        return fadedString
    }

    // Format a string to be rainbowified on BBCode formatting.
    function rainbowifyText(string) {
        let colorsArray = multiColorFade([{'r': 255,'g':0,'b':0}, {'r':255,'g':127,'b':0},{'r':255,'g':255,'b':0 },{'r':0,'g':255,'b': 0 }, { 'r': 0, 'g': 255, 'b': 255 }, { 'r': 0, 'g': 0, 'b': 255 }, { 'r': 139, 'g': 0, 'b': 255 }]
            , string.length)
        let rainbowifiedString = ''
        console.log(colorsArray)
        for (let i = 0; i < string.length; i++) {
            const char = string.charAt(i)
            
            if (char == ' ') {
                rainbowifiedString += char
            } else {
                rainbowifiedString += `[color=${rgbToHex(colorsArray[i])}]${char}[/color]`
            }
        }
        console.log(rainbowifiedString)
        return rainbowifiedString
    }


    axios.interceptors.request.use((config) => {
        /** In dev, intercepts request and logs it into console for dev */
        if (config.url == '/api/chat/messages') {

            let message = config.data.message
            if (!message.match('/msg') && !message.match('/gift')) {
                let newMessage
                const quoteRegex = /\[quote\](.*?)\[\/quote\]/;
                const match = config.data.message.match(quoteRegex);
                const citation = match ? match[0] : "";
                const messageWithoutCitation = config.data.message.replace(quoteRegex, "").trim();

                if (_config.rainbowMode) {
                    console.log('rainbow mode is enabled.')
                    newMessage = `${citation} ${rainbowifyText(messageWithoutCitation)}`;
                    config.data.message = newMessage
                    return config;
                }

                if (_config.gradientMode.enabled) {
                    newMessage = `${citation} ${textFader(_config.gradientMode.startColor, _config.gradientMode.endColor, messageWithoutCitation)}`;
                    config.data.message = newMessage
                    return config;
                }

                newMessage = `${citation} [color=${_config.colorCode}]${messageWithoutCitation}[/color]`;
                config.data.message = newMessage
                return config;

            }

        }
        return config
    }, (error) => {
        return Promise.reject(error);
    });

})();
