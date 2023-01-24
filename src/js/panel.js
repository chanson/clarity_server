let visualize = new window.visualizer();
let sessionId = "";
let events = window.decodedEvents || [];

function replay() {
    // Execute only if there are events to render
    if (events.length > 0) {
        let event = events[0];
        console.log(event)
        let end = event.time + 16; // 60FPS => 16ms / frame
        let index = 0;
        console.log(`end: ${end}; event time: ${event.time}`)
        while (event && event.time < end) {
            console.log('in while')
            event = event[++index];
        }

        visualize.render(events.splice(0, index));
    }
    requestAnimationFrame(replay);
}

function resize(width, height) {
    let margin = 10;
    let px = "px";
    let iframe = document.getElementById("clarity");
    let container = iframe.ownerDocument.documentElement;
    let offsetTop = iframe.offsetTop;
    let availableWidth = container.clientWidth - (2 * margin);
    let availableHeight = container.clientHeight - offsetTop - (2 * margin);
    let scale = Math.min(Math.min(availableWidth / width, 1), Math.min(availableHeight / height, 1));
    iframe.style.position = "absolute";
    iframe.style.width = width + px;
    iframe.style.height = height + px;
    iframe.style.transformOrigin = "0 0 0";
    iframe.style.transform = "scale(" + scale + ")";
    iframe.style.border = "1px solid #cccccc";
    iframe.style.overflow = "hidden";
    iframe.style.left = ((container.clientWidth - (width * scale)) / 2) + px;
}

function reset(envelope) {
    if (console) { console.clear(); }
    let info = document.getElementById("info");
    let metadata = document.getElementById("header");
    let iframe = document.getElementById("clarity");
    let download = document.getElementById("download");
    let links = download.querySelectorAll("a");
    if (iframe) { iframe.parentElement.removeChild(iframe); }
    iframe = document.createElement("iframe");
    iframe.id = "clarity";
    iframe.title = "Microsoft Clarity Developer Tools";
    iframe.setAttribute("scrolling", "no");
    document.body.appendChild(iframe);
    console.log("Clearing out previous session... moving on to next one.");
    if (sessionId !== envelope.sessionId) {
        eJson = [];
        sessionId = envelope.sessionId;
    } else { eJson.push(pJson); }
    events = [];
    pJson = [];
    dJson = [];
    pageNum = envelope.pageNum;
    info.style.display = "none";
    metadata.style.display = "block";
    download.style.display = "block";
    iframe.style.display = "block";
    for (let i = 0; i < links.length; i++) {
        (links[i]).onclick = function() { save(i); };
    }
    visualize.setup(iframe.contentWindow, { version: envelope.version, onresize: resize, metadata });
}

function sort(a, b) {
    return a.time - b.time;
}

function copy(input) {
    return JSON.parse(JSON.stringify(input));
}

document.addEventListener("DOMContentLoaded", async () => {
	let metadata = document.getElementById("header");
	let iframe = document.getElementById("clarity")
	iframe.style.display = "block";
	metadata.style.display = "block";

	const response = await fetch('http://localhost:3456/db_fetch');
	let dbEvents = await response.json()
	const firstEvent = JSON.parse(dbEvents[0].decoded_event);

	visualize.setup(iframe.contentWindow, { version: firstEvent.envelope.version, onresize: resize, metadata });

	dbEvents.forEach((event) => {
    const decodedEvent = JSON.parse(event.decoded_event);
    const merged = visualize.merge([decodedEvent]);
    events = events.concat(merged.events).sort(sort);
    visualize.dom(merged.dom);
  })
})

// Call replay on every animation frame to emulate near real-time playback
requestAnimationFrame(replay);
