//Helper function for the encoding
function lsbEncodeHelper(){
    const canvas = document.getElementById("encode-canvas");
    const imageInput = document.getElementById("encode-image");
    lsbEncode(document.getElementById("message-contents").value, imageInput, canvas);
}

//Main encoding function
function lsbEncode(message, img, canvas){
    const startString = "lsbSTART";
    const endString = "lsbEND";
    message = startString + message + endString;
    message = stringToBinary(message);
    const fileList = img.files;
    const currFile = fileList[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const imgElement = new Image();
        imgElement.onload = function () {
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            const context = canvas.getContext("2d");
            context.drawImage(imgElement, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            writeToImage(message, imageData);
            context.putImageData(imageData, 0, 0);
        };
        imgElement.src = e.target.result;
    };
    reader.readAsDataURL(currFile);
}

//Helper function for decoding
function lsbDecodeHelper(){
    lsbDecode(document.getElementById("decode-canvas"), document.getElementById("message-contents"));
}

//Main decode function
function lsbDecode(canvas, messageBox){
    const startString = stringToBinary("lsbSTART");
    const endString = stringToBinary("lsbEND");
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    //Check for starting String:
    var messageString = '';
    var i = 0;
    var j = 0;
    while(i < startString.length){
        if(j%4 != 3){
            messageString+= (data[j] & 0x01);
            i++;
        }
        j++;
    }
    if(messageString == startString){
        var endCon = false;
        messageString = ''
        while(!endCon){
            if(j%4 != 3){
                messageString+= (data[j] & 0x01);
            }
            j++;
            if(messageString.length >= endString.length && messageString.substring(messageString.length-endString.length, messageString.length) == endString){
                endCon = true;
            }
        }
        messageString = messageString.substring(0, messageString.length-endString.length);
        messageBox.value = binaryToString(messageString)
    }else{
        console.log("Not a steg");
        //IMAGE DOES NOT HAVE START TAG
    }
}
// Convert a string to binary (8 bits per character)
function stringToBinary(inputString){
    output = "";
    for(var i = 0; i < inputString.length; i++){
        output += inputString[i].charCodeAt(0).toString(2).padStart(8, '0');
    }
    return(output);
}

//Convert binary text back to the original string
function binaryToString(inputBinary){
    var output = "";
    for(var i = 0; i < inputBinary.length; i+=8){
        output+= String.fromCharCode(parseInt(inputBinary.substring(i, i + 8), 2));
    }
    return(output);
    
}

//Hide the data in the image
function writeToImage(message, imageData){
    var data = imageData.data;
    var j = 0;
    var i = 0;
    while(i < message.length){
        if(j%4 != 3){
            data[j] = (data[j] & 0xFE) | parseInt(message[i]);
            i++;
        }
        j++;
    }
}

//Download for the encode page
function downloadEncodedImage(){
    const imageInput = document.getElementById("encode-image")
    const fileList = imageInput.files;
    const currFile = fileList[0];
    const canvas = document.getElementById("encode-canvas");
    const img = canvas.toDataURL("image/png");
    const tempEl = document.createElement('a');
    tempEl.href = img;
    tempEl.download = currFile['name'].split('.')[0];
    tempEl.click();
    tempEl.remove();
}