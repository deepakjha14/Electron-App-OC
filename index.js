// In renderer process (web page).
const testEditData = "this is line 1 \n this is line 2 \n this is line 3 \n this is line 4 \n this is line 5";
const {ipcRenderer} = require('electron');
//const customModule = require('./customModule.js');
var brkPointNum;
let positionObject;
let jsonActions = {};

//let IPCBtn = document.getElementById('IPCButton');
let ExeBtn = document.getElementById('ExeCode');
let invokeBtn = document.getElementById('invokeButton');
let hiddenPath = document.getElementById('hiddenPath');
let receiveDiv = document.getElementById("sendReceiveData");
let debugDiv = document.getElementById("debugArea");
let cleanCode = document.getElementById("cleanCode");
let jsonDataValuesDiv = document.getElementById("jsonDataValues");
let dataValuesDiv = document.getElementById("dataValues");
let fs = require('fs');
var rwPath;
let editArea = CodeMirror(document.getElementById("codeEditor"), {
    mode:"c",
    lineNumbers: true,
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
    theme:"3024-day"
});

cleanCode.addEventListener('click', ()=>{
    editArea.setValue(editArea.getValue());
    debugDiv.innerHTML = '<div style="display:none"></div>';
    dataValues.innerHTML = " ";//customModule;
    receiveDiv.innerHTML = '';
});

/*
editArea.on("keyup", (doc, chgObj)=>{
    console.log("Keyup Document ",doc,"Change Object",chgObj);
    if(brkPointNum != undefined){
        editArea.removeLineClass(brkPointNum, "wrap", "breakpoint-highlight");
        brkPointNum--;
        editArea.addLineClass(brkPointNum, "wrap", "breakpoint-highlight");
    }
});*/

editArea.on("update", (doc)=>{
    positionObject = new Object({activityLineNumbers :[], startLine:0, endLine:0, pngFiles:'' });
    positionObject.codeArray = doc.getValue().split('\n');
    //readFiles();
    getPath();
    for(let i=0; i<positionObject.codeArray.length; i++){
        switch(positionObject.codeArray[i].trim()){
            case "//**Start":
                positionObject.startLine = i;
                positionObject.activityLineNumbers.push(i);
                break;
            case "//**End":
                positionObject.endLine = i;
                positionObject.activityLineNumbers.push(i);
                break;
            case "//##Activity":
                //startActivity = i;
                positionObject.activityLineNumbers.push(i);
                break;
        }     
    }
});

function getPath(){
    try { 
        if(rwPath == undefined){
            rwPath = hiddenPath.innerHTML;
        }
        //hiddenPath.innerHTML = rwPath;
        fs.readdir(rwPath,function(err,files){
            console.log(files);
            positionObject.pngFiles = files.filter(function(fileName,idx){if(fileName.indexOf('.png')>0) return true;})
                                        .map(function(c){if(c.indexOf('.png')>0) return c.split(".png")[0];}).sort((el, nextEl)=>{return el-nextEl});
        });
    } catch(e) {
        alert('Unable To Read Directory'); 
    }
}

function displayDebugImage(brkPointNum){
    let temp = 0;
    //let tempJsonValue = JSON.parse(dataValuesDiv.innerText);
    var elem = document.createElement("img");
    if(brkPointNum>positionObject.startLine && brkPointNum<positionObject.endLine){
        for(temp=0;temp<positionObject.activityLineNumbers.length;temp++){
            if(brkPointNum<positionObject.activityLineNumbers[temp+1]) break;
        }
            elem.setAttribute("src", rwPath+"/"+positionObject.pngFiles[temp]+".png");
            //elem.setAttribute("height", "100");
            //elem.setAttribute("width", "100");
            elem.setAttribute("class", "debugImage");
            debugDiv.replaceChild(elem,debugDiv.childNodes[0]);
            //jsonDataValuesDiv.innerHTML = tempJsonValue[temp];
            //jsonDataValuesDiv
            if(temp>0){
                dataValuesDiv.innerHTML = "Control Type: "+JSON.stringify(jsonActions[temp-1].ControlType)+ " Value :"+ JSON.stringify(jsonActions[temp-1].value);
            }
    }
}

function readJsonDisplay(){
    if(rwPath == undefined){
        rwPath = hiddenPath.innerHTML;
    }
    fs.readFile(rwPath+"/json.json", 'utf-8' , (err, jsonData)=>{
        if(err){
            console.log("Error in json file reading : ", err);
        }

        console.log(jsonData, " dj reading json");
        jsonDataValuesDiv.innerHTML = (JSON.parse(jsonData).Actions).toString();
        jsonActions = JSON.parse(jsonData).Actions;
    });
}

editArea.on("keydown", (doc, chgObj)=>{
    //console.log("Keydown Document ",doc,"Change Object",chgObj);
    if(chgObj.key=="F10"){
        readJsonDisplay();
        editArea.removeLineClass(brkPointNum, "wrap", "breakpoint-highlight");
        brkPointNum++;
        editArea.addLineClass(brkPointNum, "wrap", "breakpoint-highlight");
        displayDebugImage(brkPointNum);
        
    }
    if(chgObj.key=="F9"){
        readJsonDisplay();
        editArea.removeLineClass(brkPointNum, "wrap", "breakpoint-highlight");
        brkPointNum--;
        editArea.addLineClass(brkPointNum, "wrap", "breakpoint-highlight");
        displayDebugImage(brkPointNum);
    }
});

/*
editArea.on("viewportChange", (doc, chgObj)=>{ 
    console.log("Keydown Document ",doc,"Change Object",chgObj); 
});*/

editArea.on("gutterClick", function(cm, n) {
    //cm.setValue(cm.getValue());
    var info = cm.lineInfo(n);
    cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
    cm.addLineClass(n, "wrap", "breakpoint-highlight");
    brkPointNum=n;
});

/*let scrollEventCapture = editArea.scroll();
scrollEventCapture.addEventListener('mousemove', function(evt){
    console.log(evt, " Something happened !!! ");
});*/
/*
IPCBtn.addEventListener('click', function(){
    console.log('Inside the index.js file');
    console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"
    ipcRenderer.send('asynchronous-message', 'ping');
}); 
*/
ExeBtn.addEventListener('click', function(){
    console.log('Writing file in the directory'); // prints "pong"
    try { 
        if(rwPath == undefined){
            rwPath = hiddenPath.innerHTML;
        }
        hiddenPath.innerHTML = rwPath;
        receiveDiv.innerHTML='';
        editArea.setValue(editArea.getValue());
        fs.writeFile(rwPath+'/tobeValidated.txt', editArea.getValue(), 'utf-8');
        ipcRenderer.send('validate-code', rwPath+'/tobeValidated.txt');
    } catch(e) {
        alert('Failed to save the file !'); 
    }
}); 

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong"
});

invokeBtn.addEventListener('click', function(){
    console.log('Invoke the bat file');
    ipcRenderer.send('invoke-bat', 'Please invoke the bat file for stdin and stdout');
});   

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong"
});

ipcRenderer.on('response-bat', (event, arg) => {
    console.log(arg) // prints out the response
    //receiveDiv.innerText = arg;
});   

ipcRenderer.on('main-datareceive-event', (event, arg) => {
    console.log(arg, " This data arrived DJ");  // prints data from the main process   
    if(arg.path != undefined)  {
    rwPath = arg.path;  
    hiddenPath.innerHTML = rwPath;
    }
    readJsonDisplay();
    fs.readFile(arg.path+"/GeneratedAssembly.cs", 'utf-8' , (err, fileData)=>{
        if(err){
            console.log("Error in file reading : ", err);
        }
        console.log(fileData);
        editArea.setValue(fileData);
    });
    if(arg.hasError){
        let errorLine;
        let errorNode;// = document.createElement("div");
        let errorTextNode;
        for(let errorIdx = 0;errorIdx<arg.errors.length; errorIdx++){
            errorLine = (parseInt(arg.errors[errorIdx].split(',')[0])-1);
            errorNode = document.createElement("div");
            errorTextNode = document.createTextNode(JSON.stringify(arg.errors[errorIdx]))
            errorNode.appendChild(errorTextNode);
            if(receiveDiv.innerText == undefined || receiveDiv.innerText == ''){
                receiveDiv.appendChild(errorNode);               
            } else{
                receiveDiv.appendChild(errorNode); 
                //receiveDiv.appendChild("</div>"+JSON.stringify(arg.errors[errorIdx])+"</div>");
                // += "/n"+JSON.stringify(arg.errors[errorIdx]);
            }
            editArea.addLineClass(errorLine,"wrap","highlight-error");
            editArea.scrollIntoView({line:errorLine,char:1});
        }
       /* arg.errors.forEach((element, idx) => {
            if(receiveDiv.innerText == undefined || receiveDiv.innerText == ''){
                receiveDiv.innerText = JSON.stringify(element);                
            } else{
                receiveDiv.innerText += JSON.stringify(element);
            }
            editArea.addLineClass(errorLine,"wrap","highlight-error");
        });
        
        receiveDiv.innerText = JSON.stringify(arg.errors[0]); //+' Custom Event Received with Data';
        let errorLine = (parseInt(arg.errors[0].split(',')[0])-1);
        editArea.addLineClass(errorLine,"wrap","highlight-error");*/
    }
    
});        

ipcRenderer.on('custom-message-test', (event, arg) => {
    console.log(arg);
    editArea.setValue(testEditData);
});
  
function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
}