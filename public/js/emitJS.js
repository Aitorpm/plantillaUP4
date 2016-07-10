/**
 * Created by aitor on 10/7/16.
 */
$(document).ready(function() {
    var video = document.getElementById('video');
    var logger = document.getElementById('logger');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var videoSelect = document.querySelector('select#videoSource');
    var selectors = [videoSelect];
    context.width = 680;
    context.height = 510;

    function gotDevices(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        var values = selectors.map(function (select) {
            return select.value;
        });
        selectors.forEach(function (select) {
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
        selectors.forEach(function (select, selectorIndex) {
            if (Array.prototype.slice.call(select.childNodes).some(function (n) {
                    return n.value === values[selectorIndex];
                })) {
                select.value = values[selectorIndex];
            }
        });
    }

    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        video.srcObject = stream;
        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
    }

    function log(message) {
        logger.innerHTML = logger.innerHTML + message + "<br/>";
    };

    function start() {
        if (window.stream) {
            window.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        var videoSource = videoSelect.value;
        var constraints = {
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
    }

    videoSelect.onchange = start;

    start();

    function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }


    /* SOCKET.IO */

    var socket = io.connect('https://bip05.upc.es:5000');

    console.log("sockets")
    socket.on('connect', function () {
        console.log("sockets2")
        log('connected');
    });

    socket.on('disconnect', function () {
        log('disconnected');
    });

    function emit(message) {
        socket.emit('data', message);
    }

    /* END SOCKET.IO */

//en
    function sendFrame(video, context) {
        context.drawImage(video, 0, 5, 200, 200);
        emit(canvas.toDataURL('image/webp'));
    }

    setInterval(function () {
        sendFrame(video, context);
    }, 100);
});