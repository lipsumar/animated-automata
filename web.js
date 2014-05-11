/**
 * Get a parameter from the query string.
 * Taken from http://stackoverflow.com/a/901144/3484614
 */
var parameter = function(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/** Paint an image onto a canvas's context. */
var paintImage = function(context, colours, image)
{
    // The unpainted canvas is already white, so we only need to
    // paint the filled-in pixels.
    for (var j = 0; j < image.height; j++) {
        for (var i = 0; i < image.width; i++) {
            // There are various ways to paint a 1x1 pixel:
            // http://jsperf.com/setting-canvas-pixel
            // I've chosen the one that works for me.
            var pixel = image[j][i];
            context.fillStyle = colours[pixel];
            context.fillRect(i * image.pixelSize, j * image.pixelSize, image.pixelSize, image.pixelSize);
        }
    }
};

var getInitialConditions = function(ic, radix)
{
    if (ic === null || ic === 'random') {
        return function() { return Math.floor(Math.random() * radix); };
    } else if (ic === 'middle') {
        return function(i) { return (i === Math.floor(canvas.width / pixelSize / 2)) ? 1 : 0; };
    } else if (ic.match(/\d/)) {
        var n = parseInt(ic);
        return function() { return n; };
    }
};

var getWrap = function(wrap, radix)
{
    if (wrap === 'random') {
        return function() { return Math.floor(Math.random() * radix); };
    } else if (wrap == 'true') {
        return function(wrapped) { return wrapped; };
    } else {
        return function() { return 0; };
    }
};

// Ages ago, life was born in the primitive sea...
var getLife = function()
{
    var string = parameter('string');
    var radix = parameter('radix') || 2;
    var rule = parameter('rule');

    // The user can input either a string, or a rule number, and a radix.
    // If we already have a string, then use that. But if we have a rule,
    // then the rule will have to be turned into a string.
    if (string) {
        return { radix: radix, string: string };
    } else if (rule && !string) {
        return { radix: radix, string: automata.stringify(parseInt(rule), radix) };
    } else if (!rule && !string) {
        // If we have neither then just go with a cool default!
        return { radix: 2, string: automata.stringify(73, 2) };
    }
};

// ---- web stuff ----

var canvas = document.getElementById('canvas');
var panelSize = parameter('panelSize');

var docWidth = document.width;
var docHeight = document.height;

if (panelSize == 'full') {
    canvas.style.marginTop = 0;
    var width = document.width;
    var height = document.height;
    canvas.style.margin = 0;
    canvas.style.padding = 0;
    canvas.style.top = 0;
    canvas.style.position = 'absolute';
    canvas.width = docWidth;
    canvas.height = docHeight;
} else {
    canvas.width = 1000;
    canvas.height = 500;
}

var pixelSize = parseInt(parameter('pixelSize')) || 1;

var myColours = [ '#fff', '#444', '#888', '#bbb' ];

var ic = parameter('ic');

if ((canvas.width % pixelSize) !== 0) {
    canvas.width = canvas.width + (pixelSize - (canvas.width % pixelSize));
}

if (ic === 'middle') {
    if (Math.floor(canvas.width / pixelSize) % 2 === 0) {
        canvas.width = canvas.width + pixelSize;
    }
}

if (panelSize === 'full') {
    if (canvas.width != docWidth) {
        canvas.style.left = "" + (Math.floor(0 - ((canvas.width - docWidth) / 2))) + "px";
    } else {
        canvas.style.left = 0;
    }
}

var options = getLife();

var image = [];
image[0] = automata.initialRow(canvas.width / pixelSize, getInitialConditions(ic, options.radix));
image.width = canvas.width / pixelSize;
image.height = canvas.height / pixelSize;
image.pixelSize = pixelSize;

var wrap = getWrap(parameter('wrap'), options.radix);
var lifeFunction = automata.generate(options.string, options.radix);

for (var j = 1; j < canvas.height / pixelSize; j++) {
    image[j] = automata.cellularlyAutomate(image[j - 1], wrap, lifeFunction);
}

paintImage(canvas.getContext('2d'), myColours, image);
