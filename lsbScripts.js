//Helper function for the encoding
async function lsbEncodeHelper(){
    const canvas = document.getElementById("encode-canvas");
    const imageInput = document.getElementById("encode-image");
    let  message = document.getElementById("message-contents").value;
    const key = document.getElementById('key-input').value;
    if(key != ""){
        message = await pgpEncode(key, message);
    }
    
    lsbEncode(message, imageInput, canvas);
}

//Main encoding function
async function lsbEncode(message, img, canvas){
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
async function lsbDecodeHelper(){
    lsbDecode(document.getElementById("decode-canvas"), document.getElementById("message-contents"));
}

//Main decode function
async function lsbDecode(canvas, messageBox){
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
        if(document.getElementById("key-input").value != ""){
            messageString = await pgpDecode(document.getElementById("key-input").value, binaryToString(messageString));
        }else{
            messageString = binaryToString(messageString);
        }
        messageBox.value = messageString;
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
    if(message.length > data.length *0.75){
        console.log("TEST");
    }
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

async function pgpEncode(key, message){
    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: await openpgp.readKey({ armoredKey: key })
    })
    return encrypted;
}

async function pgpDecode(key, message){
    let passphrase = document.getElementById('password').value;

    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: key }),
        passphrase
    });

    console.log(message);
    const decrypted = await openpgp.decrypt({
        message: await openpgp.readMessage({ armoredMessage: message }),
        decryptionKeys: privateKey
    });

    return(decrypted.data);
}