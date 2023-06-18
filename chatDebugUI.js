!function () {
    let mainContent;
    let watcherInterval;
    let chatSDK;
    let messageStack = new messageStackManager();


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
            insertRow(data);
        });

        let styles = document.createElement("style" );
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
            height: 100%;
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

        `
        document.head.appendChild(styles)
    }

    function showModal(){

        if (!window) {
            console.error("chat debugging UI can only be run in browser")
            return
        }

        let modal = document.createElement("div");
        modal.id = "async-debugger-modal";
        modal.style.visibility = "visible"

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

        let content = document.createElement("div");
        content.setAttribute("class", "async-debugger-modal-content")
        mainContent = content;
        modal.appendChild(content);

        let headers = document.createElement("div");
        headers.setAttribute("class", "async-debugger-modal-content-headers")
        let data = document.createElement("div");
        data.innerText = "Data";
        data.setAttribute("class", "async-debugger-modal-content-data")

        let time = document.createElement("div");
        time.innerText = "Time";
        time.setAttribute("class", "async-debugger-modal-content-time")

        headers.appendChild(data);
        headers.appendChild(time);
        content.appendChild(headers);

        document.body.appendChild(modal);
    }

    function insertRow(message) {
        if (!mainContent) {
            return;
        }

        let item = document.createElement("div");
        item.setAttribute("class", "async-debugger-modal-content-messages")

        if (message.direction == "send") {
            item.style.background = "rgba(214,252,206,0.74)";
        } else {
            item.style.background = "rgba(224,200,200,0.74)";
        }

        let data = document.createElement("div");
        data.setAttribute("class", "async-debugger-modal-content-data")

        data.innerText = JSON.stringify(message.msg)
        let time = document.createElement("div");
        time.innerText = new Date(message.time).toLocaleTimeString();
        time.setAttribute("class", "async-debugger-modal-content-time")

        item.appendChild(data);
        item.appendChild(time);
        mainContent.appendChild(item);
    }

    if (window) {
        window.asyncMessageDebugger = initDebugger;
        window.showAsyncMessageDebugger = showModal;
    }
}()
