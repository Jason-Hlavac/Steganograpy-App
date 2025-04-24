function lsbEncodeHelper(){
    const canvas = document.getElementById("encode-canvas");
    const imageInput = document.getElementById("encode-image");
    lsbEncode(document.getElementById("message-contents").value, imageInput, canvas);
}

function lsbEncode(message, img, canvas){
    const startString = "lsbSTART";
    const endString = "lsbEND"
    const fileList = img.files;
    const currFile = fileList[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            const context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            console.log(imageData);
            console.log(stringToBinary("test"));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(currFile);
}

// Convert a string to binary (7 bits per character)
function stringToBinary(inputString){
    output = "";
    for(var i = 0; i < inputString.length; i++){
        output += inputString[i].charCodeAt(0).toString(2);
    }
    return(output);
}

function binaryToString(inputBinary){
    output = "";
    const bitsPerChar = 7
    for(var i = 0; i < inputBinary.length; i+=bitsPerChar){
        output += inputBinary.slice(i, i+7).charCodeAt(0).toString(10);
    }
    return(output);
}