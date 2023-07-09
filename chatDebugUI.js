!function () {
    let mainContent;
    let watcherInterval;
    let chatSDK;
    let messages = [];
    let messageStack = new messageStackManager();
    let isFilter = false;


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
        showObjectRow.setAttribute("class", "async-debugger-modal-object-row");
        let showObject = document.createElement('div');
        showObject.setAttribute("class", "async-debugger-modal-object");
        let ParseObject = document.createElement('div');
        ParseObject.setAttribute("class", "async-debugger-modal-object-parse");
        ParseObject.style.fontSize = "13px";
        showObject.onclick = () => {
           ParseObject.innerHTML = JSON.parse(showObject.innerHTML);
        }
        showObjectRow.appendChild(showObject);
        showObjectRow.appendChild(ParseObject);

        modal.appendChild(showObjectRow);

        showMessages(false, null);
        document.body.appendChild(modal);
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
        let content = document.getElementById('async-debugger-modal-content-id');
        if(isFilter){
            if(content.hasChildNodes()){
                content.innerHTML = "";
            }
        }
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
            el.innerText = JSON.stringify(data.innerText);
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
