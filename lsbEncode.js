function lsbEncodeHelper(){
    const canvas = document.getElementById("encode-canvas");
    const imageInput = document.getElementById("encode-image");
    lsbEncode(document.getElementById("message-contents").value, imageInput, canvas);
}

function lsbEncode(message, img, canvas){
    
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
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(currFile);
}
