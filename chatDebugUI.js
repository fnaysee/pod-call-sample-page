!function () {
    let mainContent;
    let watcherInterval;
    let chatSDK;
    let messages = [];
    let messageStack = new messageStackManager();
    let isFilter = false;
    let newWindow;
    let itemId = 0;

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

    function initDebugger() {
        // chatSDK = chatAgent;

        // chatSDK.on("asyncMessageLog", function (data) {
        //     messageStack.push(data);
        //     messages.push(data);
        //     // insertRow(data);
        // });

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
            max-width: 600px;
            display: none;
            flex-direction: column;
        }
        #async-debugger-modal.open {
            visibility: visible;
            display: flex;
        }
        .async-debugger-modal-toolbar {
            position:relative;
            top:0;
            left:0;
            width:100%;
            min-height:25px;
        }
        .async-debugger-modal-toolbar h3{
            margin: 0;
            padding: 0;
        }
        .async-debugger-modal-close, .async-debugger-modal-object-parse-close {
            position: absolute;
            right: 5px;
            font-size: 20px;
            top: 0px;
            cursor: pointer;
        }
        .async-debugger-modal-object-parse-close{
            right: 15px;
        }
        .async-debugger-modal-content {
            overflow: hidden;
            overflow-y: auto;
            flex-grow: 1;
        }
        .async-debugger-modal-content-headers, .async-debugger-modal-content-messages {
            display: flex;
            flex-direction: row;
            overflow: hidden;
            height: 20px;
            border-bottom: 1px solid #847e7e;
        }
        .async-debugger-modal-content-headers{
            min-height: 25px;
            align-items: center;
        }
        .async-debugger-modal-content-messages {
            cursor: pointer;
        }
        .async-debugger-modal-content-messages.selected {
            background-color: #75b3f5 !important
        }

        .async-debugger-modal-content-data {
            width: 80%;
            white-space: nowrap;
            overflow: hidden;
            font-size: 13px;
        }
        .async-debugger-modal-content-time {
            padding-left: 8px;
        }
        .async-debugger-modal-object{
            width: 100%;
            background-color: #d3d0d0;
            padding: 5px 25px 5px 5px;
            font-size: 12px;
            overflow-y: scroll;
            border-top: 1px solid #716e6e;
            border-bottom: 1px solid #716e6e;
        }
        .async-debugger-modal-search-row{
            width: 100%;
            background-color: #d3d0d0;
            display: flex;
            flex-direction: row;
            min-height: 30px;
        }
        .async-debugger-modal-clearAll-icon{
            width: 26px;
            height: 25px;
            height: 30px;
            margin-left: 5px;
            cursor: pointer;
            font-size: 20px;
        }
        .async-debugger-modal-filter-input{
            width: 60%;
            padding:5px;
            margin: 0;
            background: #e8e6e6;
        }
        .async-debugger-modal-object-row{
            display: none;
            flex-direction: column;
            position: relative;
            max-height: 150px;
            min-height: 100px;
        }
        .async-debugger-modal-object-row.active{
            display: flex;
        }
        .async-debugger-modal-object{
            position: relative;
            min-height: 100px;
        }
        .copy-button{
            width: 45px;
            height: 22px;
            position: absolute;
            top: 5px;
            right: 18px;
        }
    .string { color: green; }
    .number { color: darkorange; }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: #0e2b5a; }
    .pre {
        border: 1px solid #999;
        page-break-inside: avoid;
        display: block;
        padding: 3px 3px 2px;
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        /*white-space: pre;
        white-space: pre-wrap;*/
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        border: 1px solid rgba(0, 0, 0, 0.15);
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
        font-size: 12px;
        color: #333333;
    }

    .pre code{
        padding: 0;
        color: inherit;
        white-space: pre;
        white-space: pre-wrap;
        background-color: transparent;
        border: 0;
    }
    .async-debugger-modal-object-parse{
        border-width: thin;
        max-width: 100%;
        outline: none;
        text-decoration: none;
        transition-property: box-shadow,opacity;
        white-space: normal;
        ont-size: 13px;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #f5f5f5;
        display:none;
        overflow: hidden;
    }
    .async-debugger-modal-object-parse-container {
        overflow: scroll !important;
        height: 100%;
    }
    .async-debugger-modal-object-parse.active {
        display: block;
    }`;
        document.head.appendChild(styles);
    }

    function showModal() {
        if (!window) {
            console.error("chat debugging UI can only be run in browser");
            return
        }

        let modal = document.createElement("div");
        modal.id = "async-debugger-modal";
        modal.classList.add('open');

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

        let title = document.createElement("h3");
        title.innerText = "Message debugger";
        toolbar.appendChild(title);
        toolbar.appendChild(close);
        modal.appendChild(toolbar);

        let searchBar = document.createElement('div');
        searchBar.setAttribute("class", "async-debugger-modal-search-row");

        let removeAll = document.createElement("div");
        removeAll.innerText = "X";
        removeAll.setAttribute("class", "async-debugger-modal-clearAll-icon");
        searchBar.appendChild(removeAll);
        modal.appendChild(searchBar);
        removeAll.onclick = ()=> {
            let el = document.querySelector(".async-debugger-modal-object-row");
            el.classList.remove("active");
            messages = [];
            mainContent.innerHTML = "";
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
        modal.appendChild(headers);

        let content = document.createElement("div");
        content.setAttribute("class", "async-debugger-modal-content");
        content.setAttribute("id", "async-debugger-modal-content-id")
        mainContent = content;
        modal.appendChild(content);
        let showObjectRow = document.createElement('div');
        let copyBtn= document.createElement('button');
        copyBtn.innerHTML = "copy";
        copyBtn.className = "copy-button";
        showObjectRow.setAttribute("class", "async-debugger-modal-object-row");
        let showObject = document.createElement('div');
        showObject.setAttribute("class", "async-debugger-modal-object");
        let ParseObject = document.createElement('div');
        ParseObject.setAttribute("class", "async-debugger-modal-object-parse");
        ParseObject.style.fontSize = "13px";
        let ParseObjectContainer = document.createElement('div');
        ParseObjectContainer.setAttribute("class", "async-debugger-modal-object-parse-container");
        ParseObjectContainer.style.fontSize = "13px";
        ParseObject.appendChild(ParseObjectContainer)

        let closeParsedEl = document.createElement("div");
        closeParsedEl.innerHTML = "X";
        closeParsedEl.setAttribute("class", "async-debugger-modal-object-parse-close")
        closeParsedEl.onclick = function () {
            ParseObject.classList.remove("active");
        };
        ParseObject.appendChild(closeParsedEl);
        showObject.onclick = () => {
            let pre = document.getElementsByTagName("pre");
            if(pre && pre.length)
                ParseObjectContainer.removeChild(pre[0]);

            let preParse = document.createElement("pre");
            preParse.setAttribute("class", "pre");

            preParse.innerHTML = syntaxHighlight(JSON.stringify(analyse(showObject.innerText), null, 4));
            // ParseObject.innerHTML = "";
            ParseObjectContainer.appendChild(preParse);
            ParseObject.classList.add("active");
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
                return `<span class="${cls}"> ${match} </span>`;
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
        // showObjectRow.appendChild(ParseObject);

        modal.appendChild(showObjectRow);
        modal.appendChild(ParseObject);

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
        item.setAttribute("class", "async-debugger-modal-content-messages");
        item.setAttribute("data-itemid", msg.itemId);

        let data = document.createElement("div");
        data.setAttribute("class", "async-debugger-modal-content-data")

        data.innerText = msg.msg
        let time = document.createElement("div");
        let msgTime = new Date(msg.time);
        time.innerText = `${(('0'+msgTime.getHours()).slice(-2))}:${(('0'+msgTime.getMinutes()).slice(-2))}:${(('0'+msgTime.getSeconds()).slice(-2))}.${(('00'+msgTime.getMilliseconds()).slice(-3))}`
        time.setAttribute("class", "async-debugger-modal-content-time")

        item.appendChild(data);
        item.appendChild(time);
        item.addEventListener("click", function (event) {
            let selectors = document.querySelectorAll(".async-debugger-modal-content-messages.selected")
            if(selectors.length)
                selectors.forEach(item=>{
                    item.classList.remove("selected");
                })
            item.classList.add("selected");
            // prev.querySelector(".async-debugger-modal-content-data").click();
            let el = document.querySelector(".async-debugger-modal-object");
            el.innerText = data.innerText;
            let el2 = document.querySelector(".async-debugger-modal-object-row");
            el2.classList.add("active");
        });

        if ((msg.direction) === "send") {
            item.style.background = "rgba(214,252,206,0.74)";
        } else {
            item.style.background = "rgba(224,200,200,0.74)";
        }

        if(mainContent)
            mainContent.appendChild(item);
    }

    document.onkeydown = (e) => {
        let cel = document.querySelector(".async-debugger-modal-content-messages.selected"),
            modal = document.querySelector("#async-debugger-modal.open")
        if(!cel || !modal)
            return;

        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        if (e.keyCode === 38) {
            let prev = selectPrevSibling(cel);
            if(prev) {
                cel.classList.remove("selected");
                prev.click();
            }
        } else if (e.keyCode === 40) {
            let next = selectNextSibling(cel);
            if(next) {
                cel.classList.remove("selected");
                next.click();
            }
        }
        // else if (e.keyCode === 37) {
        //     console.log("left arrow pressed");
        // } else if (e.keyCode === 39) {
        //     console.log("right arrow pressed");
        // }
    };

    function selectNextSibling(el){
        let nextSibling = el.nextSibling;
        while(nextSibling && nextSibling.nodeType != 1) {
            nextSibling = nextSibling.nextSibling
        }
        return nextSibling;
    }
    function selectPrevSibling(el){
        let previousSibling = el.previousSibling;
        while(previousSibling && previousSibling.nodeType != 1) {
            previousSibling = previousSibling.nextSibling
        }
        return previousSibling;
    }


    initDebugger();
    function messageCallback(data){
        data.itemId = itemId;
        itemId++;
        messageStack.push(data);
        messages.push(data);
        insertRow(data)
    }

    if (window) {
        window.asyncMessageDebuggerCallback = messageCallback;
        window.showAsyncMessageDebugger = showModal;
    }
}()
