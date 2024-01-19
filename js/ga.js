//====================================================================
// ==ClosureCompiler==
// http://closure-compiler.appspot.com/home
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name index.min.js
// @output_format text
// @output_info compiled_code
// ==/ClosureCompiler==
//====================================================================

var {sin, cos, random:rnd} = Math,
    hsv_hi, hsv_f, hsv_p, hsv_q, hsv_t,
    num_canvas = 3,
    current_canvas = 0,
    context = [],
    screen_width  = a.width,
    screen_height = a.height,
    mult = 10,
    mid_x = (screen_width  * (mult / 2)) | 0,
    mid_y = (screen_height * (mult / 2)) | 0,
    quarter_x = (screen_width  * (mult / 4.2)) | 0,
    quarter_y = (screen_height * (mult / 4.2)) | 0,
    num = 1200,
    offset    = [-2.0, -2.9, 2.7, 2.4],
    amplitude = [ 0.7,  0.5, 0.6, 0.4],
    period    = [ 128,  109, 113, 107],
    constant  = [],
    va = [],
    vb = [],
    vc = [],
    vd = [],
    position = [],
    x,
    y,
    z,
    index,
    image,
    imageData,
    color,
    newCanvas,
    doc = document,
    iteration = 0;

/*=====================================*/
/* Click handler: randomize parameters */
/*=====================================*/

doc.onclick = function() {
    for (i = 0 ; i < 4 ; i++) {
        offset[i]    = (i < 2) ? random(-3, -1) : random(1, 3);
        amplitude[i] = random(0.3, 0.7);
        period[i]    = random(64, 128) | 0;
    }
    console.log([offset,amplitude,period]);
}

/*===============*/
/* Run main demo */
/*===============*/

init();
anim();

/*===========================================*/
/* Return a random float between min and max */
/*===========================================*/

function random(min, max) {
    return rnd() * (max - min) + min;
}

/*=======================================*/
/* Convert a Hue Saturation Value to RGB */
/*=======================================*/

function hsv2rgb(h, s, v) {
    hsv_hi = (h * 6) | 0;
    hsv_f = (h * 6) - hsv_hi;
    v *= 256;
    hsv_p = v * (1 - s);
    hsv_q = v * (1 - hsv_f * s);
    hsv_t = v * (1 - (1 - hsv_f) * s);
    return (
        (hsv_hi == 1)
        ? [hsv_q, v, hsv_p]
        : ( (hsv_hi == 2)
            ? [hsv_p, v, hsv_t]
            : ( (hsv_hi == 3)
                ? [hsv_p, hsv_q, v]
                : ( (hsv_hi == 4)
                    ? [hsv_t, hsv_p, v]
                    : ( (hsv_hi == 5)
                        ? [v, hsv_p, hsv_q]
                        : [v, hsv_t, hsv_p]
                    )
                )
            )
        )
    );
}

/*=================*/
/* Initializations */
/*=================*/

function init() {
    // Mrdoob's JavaScript Performance Monitor
    addstats();
    // Starting position
    for (i = num ; i-- ; ) {
        position[i] = [
            random(0, screen_width  * mult) | 0,
            random(0, screen_height * mult) | 0
        ];
    }
    // Create multiple canvas
    c.fillRect(0, 0, screen_width, screen_height);
    a.style.position = 'absolute';
    for (i = num_canvas ; i-- ; ) {
        // Create new canvas
        z = a.cloneNode();
        // Append to DOM
        doc.body.appendChild(z);
        // Get context
        context[i] = z.getContext('2d');
    }
}

/*================*/
/* Main animation */
/*================*/

function anim() {
    // Mrdoob's JavaScript Performance Monitor
    updatestats();
    // Swap visible canvas
    current_canvas = ++current_canvas % num_canvas;
    z = current_canvas;
    for (i = num_canvas ; i-- ; ) {
        context[z = ++z % num_canvas].canvas.style.opacity = 1 - i * 0.2;
    }
    // Set attractor constants
    for (i = 0 ; i < 4 ; i++) {
        constant[i] = offset[i] + amplitude[i] * sin(iteration / period[i]);
    }
    // Initialize LUTs
    index = (screen_width * mult - mid_x) / quarter_x;
    z = 1 / quarter_x;
    for (i = screen_width * mult ; i-- ; ) {
        vb[i] = (quarter_x * cos(constant[2] * index)) | 0;
        vc[i] = mid_y + (quarter_y * sin(constant[1] * index)) | 0;
        index -= z;
    }
    index = (screen_height * mult - mid_y) / quarter_y;
    z = 1 / quarter_y;
    for (j = screen_height * mult ; j-- ; ) {
        va[j] = mid_x + (quarter_x * sin(constant[0] * index)) | 0;
        vd[j] = (quarter_y * cos(constant[3] * index)) | 0;
        index -= z;
    }
    // Create a new blank ImageData object
    image = context[current_canvas].createImageData(screen_width, screen_height);
    imageData = image.data;
    // Draw Peter de Jong Attractor
    color = hsv2rgb((iteration % 1000) / 1000, 1.0, 1.0);
    for (i = num ; i-- ; ) {
        x = position[i][0];
        y = position[i][1];
        for (j = num / 8 ; j-- ; ) {
            z = va[y] - vb[x];
            y = vc[x] - vd[y];
            x = z;
            index = (screen_width * ((y / mult) << 2)) + ((x / mult) << 2);
            imageData[index++] = color[0];
            imageData[index++] = color[1];
            imageData[index++] = color[2];
            imageData[index++] += 64;
        }
    }
    // Copy to current canvas
    context[current_canvas].putImageData(image, 0, 0);
    // Next frame
    iteration++;
    requestAnimationFrame(anim);
}
