var DEFAULT_REGION_NAME = "Impostor";
var SERVER_PORT = 22023;

$(document).ready(function () {
    fillIPAdressUsingLocationHash();
    showPlatformText();

    $("#serverFileForm").submit(function (e) {
        e.preventDefault();

        // LOG 1: What is actually in the input box right now?
        let rawInputValue = $("#regionName").val();
        alert("LOG 1 (Input Value): '" + rawInputValue + "'");

        let regionName = rawInputValue.trim() || DEFAULT_REGION_NAME;
        let serverIp = $("#ip").val();
        let serverPort = $("#port").val();

        // LOG 2: What is being sent to the generator?
        alert("LOG 2 (Final Name): " + regionName + "\nIP: " + serverIp + "\nPort: " + serverPort);

        let serverFileBytes = generateServerFile(regionName, serverIp, serverPort);
        let blob = new Blob([serverFileBytes.buffer]);

        saveFile(blob, "regionInfo.dat");
    });
});

function generateServerFile(regionName, ip, port) {
    // LOG 3: Confirming we are inside the generator with the right name
    alert("LOG 3 (Inside Generator): Writing '" + regionName + "' to bytes...");

    let bytesArray = int32(0);

    bytesArray.push(regionName.length);
    bytesArray = concatArrays(bytesArray, stringToBytes(regionName));

    bytesArray.push(ip.length);
    bytesArray = concatArrays(bytesArray, stringToBytes(ip));

    bytesArray = concatArrays(bytesArray, int32(1));

    let serverName = regionName + "-Master-1";

    bytesArray.push(serverName.length);
    bytesArray = concatArrays(bytesArray, stringToBytes(serverName));
    bytesArray = concatArrays(bytesArray, ipAddressToBytes(ip));
    bytesArray = concatArrays(bytesArray, int16(port));
    bytesArray = concatArrays(bytesArray, int32(0));

    return Uint8Array.from(bytesArray);
}

// --- KEEP ALL YOUR OTHER FUNCTIONS (saveFile, stringToBytes, etc.) BELOW THIS ---

function fillIPAdressUsingLocationHash() {
    let urlServerAddress = document.location.hash.substr(1).split(":");
    let serverIp = urlServerAddress[0];
    let serverPort = urlServerAddress.length > 1
        ? urlServerAddress[1]
        : SERVER_PORT.toString();

    const ipPattern = $("#ip").attr("pattern");

    if (new RegExp(ipPattern).test(serverIp)) {
        $("#ip").val(serverIp);
    }
    if (/^[0-9]+$/.test(serverPort)) {
        $("#port").val(serverPort);
    }
}

function showPlatformText() {
    if (navigator.userAgent.match(/iPhone|iPod/i)) {
        $('.ios-support').show();
    } else if (navigator.userAgent.match(/android/i)) {
        $('.android-support').show();
    } else {
        $('.desktop-support').show();
    }
}

function saveFile(blob, fileName) {
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

function stringToBytes(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function int16(int) {
    return [int & 0xFF, (int & 0xFF00) >> 8];
}

function int32(int) {
    return [
        int & 0xFF,
        (int & 0xFF00) >> 8,
        (int & 0xFF0000) >> 16,
        (int & 0xFF000000) >> 24
    ];
}

function ipAddressToBytes(ipAddress) {
    return ipAddress.split(".").map(octet => parseInt(octet));
}

function concatArrays(a, b) {
    return a.concat(b);
}

