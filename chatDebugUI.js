!function () {
    let mainContent;
    let watcherInterval;
    let chatSDK;
    let messages = [];
    let messageStack = new messageStackManager();
    let isFilter = false;
    let newWindow;

    // const response = document.getElementById('response');
    // window.addEventListener('message', (event) => {
    //     console.log("9999", event);
    //     if(event) {
    //         window.opener.background = "#ccc";
    //         response.innerHTML = event.data;
    //     }
    // })



    function messageStackManager() {
        let msgStack = [];

        return {
            push(data) {
                msgStack.push(data);
            },
            clear() {
                msgStack = [];
            }
        }
    }

    function initDebugger(chatAgent) {
        chatSDK = chatAgent;

        chatSDK.on("asyncMessageLog", function (data) {
            messageStack.push(data);
            messages.push(data);
            insertRow(data);
        });

        let styles = document.createElement("style");
        styles.setAttribute("type", "text/css");
        styles.innerText = `
        #async-debugger-modal {
            position: fixed;
            width: 80%;
            left: 10%;
            right: 50%;
            overflow: hidden;
            background: #fff;
            outline: 2px darkcyan solid;
            height: 90%;
            top: 5%;
            padding-top: 30px;
        }
        .async-debugger-modal-toolbar {
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:30px;
        }
        .async-debugger-modal-toolbar h3{
            margin: 0;
            padding: 0;
        }
        .async-debugger-modal-close {
            position: absolute;
            right: 5px;
            font-size: 20px;
            top: 0px;
            cursor: pointer;
        }
        .async-debugger-modal-content {
            height: 55%;
            overflow: hidden;
            overflow-y: auto;
        }
        .async-debugger-modal-content-headers, .async-debugger-modal-content-messages {
            display: flex;
            flex-direction: row;
            overflow: hidden;
            height: 20px;
            border-bottom: 1px solid #847e7e;
        }
        .async-debugger-modal-content-messages {
            cursor: pointer;
        }
        .async-debugger-modal-content-data {
            width: 80%;
            white-space: nowrap;
            overflow: hidden;
            font-size: 12px;
        }
        .async-debugger-modal-content-time {
            padding-left: 8px;
        }
        .async-debugger-modal-object{
            width: 100%;
            height: 120px;
            background-color: #d3d0d0;
            padding: 5px 25px 5px 5px;
            font-size: 12px;
            overflow-y: scroll;
            border-top: 1px solid #716e6e;
            border-bottom: 1px solid #716e6e;
        }
        .async-debugger-modal-search-row{
            width: 100%;
            height:30px;
            background-color: #d3d0d0;
            display: flex;
            flex-direction: row;
            align-items: baseline;
        }
        .async-debugger-modal-clearAll-icon{
            width:25px;
            height: 25px;
            height: 10px;
            margin-left:5px;
            cursor: pointer;
        }
        .async-debugger-modal-filter-input{
            width: 60%;
            margin:5px 0px;
            padding:0px;
        }
        .async-debugger-modal-object-row{
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
        }
        .async-debugger-modal-object{
            position: relative;

        }
        .copy-button{
            width: 45px;
            height: 22px;
            position: absolute;
            top: 5px;
            right: 18px;
        }
        pre {padding: 5px; overflow-x: auto }
    .string { color: green; }
    .number { color: darkorange; }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: #0e2b5a; }
    pre {
        display: block;
        font-family: monospace;
        white-space-collapse: preserve;
        text-wrap: nowrap;
        margin: 1em 0px;
        padding: 5px;
    overflow-x: auto;
    }
    .async-debugger-modal-object-parse{
            border-width: thin;
        display: block;
        max-width: 100%;
        outline: none;
        text-decoration: none;
        transition-property: box-shadow,opacity;
        position: relative;
        white-space: normal;
    }
        `
        document.head.appendChild(styles)
    }

    function showModal() {
        if (!window) {
            console.error("chat debugging UI can only be run in browser")
            return
        }

        let modal = document.createElement("div");
        modal.id = "async-debugger-modal";
        modal.style.visibility = "visible";

        let ShowLogActionsModal = document.createElement("div");
        ShowLogActionsModal.className = "modal-window";
        // modal.prototype.hide = function () {
        //     modal.style.visibility = "hidden";
        // }
        // modal.prototype.show = function () {
        //     modal.style.visibility = "visible";
        // }
        let toolbar = document.createElement("div");
        toolbar.setAttribute("class", "async-debugger-modal-toolbar")


        let close = document.createElement("div");
        close.innerHTML = "X";
        close.setAttribute("class", "async-debugger-modal-close")
        close.onclick = function () {
            modal.remove();
        };

        toolbar.appendChild(close);

        let title = document.createElement("h3");
        title.innerText = "Message debugger";
        toolbar.appendChild(title);
        modal.appendChild(toolbar);

        let searchBar = document.createElement('div');
        searchBar.setAttribute("class", "async-debugger-modal-search-row");

        let removeAll = document.createElement("div");
        removeAll.innerText = "X";
        removeAll.setAttribute("class", "async-debugger-modal-clearAll-icon");
        searchBar.appendChild(removeAll);
        modal.appendChild(searchBar);
        removeAll.onclick = ()=>{
            while(messages.length >0){
                messages.pop();
                mainContent.innerHTML = "";
            }
        }
        let filterInput = document.createElement('input');
        filterInput.setAttribute("class", "async-debugger-modal-filter-input");
        filterInput.placeholder = " search by something...";
        filterInput.addEventListener('keyup', () => {
            if(filterInput.value){
                isFilter = true;
                showMessages(true, filterInput.value);
            } else{
                isFilter = false;
                showMessages(false, null);
            }
        })
        searchBar.appendChild(filterInput);

        let content = document.createElement("div");
        content.setAttribute("class", "async-debugger-modal-content");
        content.setAttribute("id", "async-debugger-modal-content-id")
        mainContent = content;
        modal.appendChild(content);

        let headers = document.createElement("div");
        headers.setAttribute("class", "async-debugger-modal-content-headers")
        let data = document.createElement("div");
        data.innerText = "Data";
        data.setAttribute("class", "async-debugger-modal-content-data");


        let time = document.createElement("div");
        time.innerText = "Time";
        time.setAttribute("class", "async-debugger-modal-content-time")

        headers.appendChild(data);
        headers.appendChild(time);
        content.appendChild(headers);

        let showObjectRow = document.createElement('div');
        let copyBtn= document.createElement('button');
        copyBtn.innerHTML = "copy";
        copyBtn.className = "copy-button";
        showObjectRow.setAttribute("class", "async-debugger-modal-object-row");
        let showObject = document.createElement('div');
        showObject.setAttribute("class", "async-debugger-modal-object");
        let ParseObject = document.createElement('div');
        let preParse = document.createElement("pre");
        preParse.setAttribute("class", "html");
        ParseObject.appendChild(preParse);
        ParseObject.setAttribute("class", "async-debugger-modal-object-parse");
        ParseObject.style.fontSize = "13px";
        showObject.onclick = () => {
           var invoice = window.open(generateURL(), '');
           invoice.receiptdata = showObject.innerText;

            function generateURL() {
                var blob = new Blob([`<script>document.write(window.receiptdata)<\/script>`], {type: 'text/html'});
                return URL.createObjectURL(blob);
            }
           //let element = JSON.parse(showObject.innerHTML);
           //ParseObject.appendChild(element);
           //preParse.innerHTML = syntaxHighlight(JSON.stringify(analyse(showObject.innerText)), null, 4);

                //syntaxHighlight(JSON.stringify(analyse(showObject.innerHTML)));
              //JSON.stringify(showObject.innerHTML);
            //ParseObject.innerHTML = syntaxHighlight(JSON.stringify(analyse(showObject.innerText)), null, 4);
        }
        function analyse(string) {
            let parsed = parseTheData(string);
            if(!parsed) {
                return string;
            }
            return recursiveParse(parsed);
        }
        function parseTheData(string) {
            try {
                return JSON.parse(string);
            } catch (error) {
                //console.log(error);
                return false
            }
        }
        function recursiveParse(obj){
            for(let i in obj) {
                if(typeof obj[i] === "string" && parseTheData(obj[i])) {
                    obj[i] = parseTheData(obj[i]);
                    obj[i] = recursiveParse(obj[i]);
                }
            }

            return obj;
        }
        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(showObject.innerHTML).then(() => {
                console.log('Content copied to clipboard:', showObject.innerHTML);
                /* Resolved - text copied to clipboard successfully */
            },() => {
                console.error('Failed to copy');
                /* Rejected - text failed to copy to the clipboard */
            });
        }
        showObjectRow.appendChild(showObject);
        showObjectRow.appendChild(copyBtn);
        showObjectRow.appendChild(ParseObject);

        modal.appendChild(showObjectRow);

        showMessages(false, null);
        document.body.appendChild(modal);
    }
    function showData(json){
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    function showMessages(isfilter, val) {
        if (messages.length) {
            if (isfilter) {
                let filteredMessages = messages.filter((item, index) => {
                    let cn = JSON.stringify(item.msg);
                    if (cn.includes(val)) {
                        return true;
                    } else {
                        return false;
                    }
                });
                let content = document.getElementById('async-debugger-modal-content-id');
                    if(content.hasChildNodes()){
                        content.innerHTML = "";
                    }
                for (let msg in filteredMessages) {
                    fillTable(filteredMessages[msg]);
                }
            } else {
                if (!mainContent) {
                    return;
                }
                for (let message in messages) {
                    fillTable(messages[message]);
                }
            }
        }
    }
    function insertRow(message) {
        fillTable(message);
    }

    function fillTable(msg) {
        let item = document.createElement("div");
        item.setAttribute("class", "async-debugger-modal-content-messages")

        if ((msg.direction) === "send") {
            item.style.background = "rgba(214,252,206,0.74)";
        } else {
            item.style.background = "rgba(224,200,200,0.74)";
        }

        let data = document.createElement("div");
        data.setAttribute("class", "async-debugger-modal-content-data")

        data.innerText = JSON.stringify(msg.msg)
        let time = document.createElement("div");
        time.innerText = new Date(msg.time).toLocaleTimeString();
        time.setAttribute("class", "async-debugger-modal-content-time")

        data.onclick = () => {
            let el = document.querySelector(".async-debugger-modal-object");
            el.innerText = data.innerText;
        }
        item.appendChild(data);
        item.appendChild(time);
        mainContent.appendChild(item);
    }

    if (window) {
        window.asyncMessageDebugger = initDebugger;
        window.showAsyncMessageDebugger = showModal;
    }
}()
