import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate
} from "react-router-dom";

/*
function panel(props) {
    /*
     Requires:
        title
        details
        skills (list)
        img path
    Optional but should be set:
        type
    Optional:
        link
        source linke
     
    if (!("type" in props)) {
        props.type === "both";
    }
    return (<div></div>
        );
}
*/

function loadImages() {
    setTimeout(() => {
        for (let func of Object.values(onLoadCalls)) {
            try {
                func();
            }
            catch (e) {
                if (String(e) !== "TypeError: imageContainer is null")
                    console.log("Problem during body.onLoad:", e);
            }
        }
    }, 100);
}

document.body.onload = loadImages;

/* eslint-disable */
// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
export function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
/* eslint-enable */

function openImageModal(sourceId) {
    let id = uuidv4();
    let imageId = uuidv4();
    return () => {
        let source = document.getElementById(sourceId).src;
        let openImage = (e) => {
            window.open(source, '_blank');
        };
        let modal = document.createElement("div");
        modal.innerHTML = `
            <div class="overlay"></div>
            <div id="${id}" class="image-modal">
                <h3>Click or tap the image to open it in a new tab</h3>
                <div>
                    <img id="${imageId}" class="image" src="${source}"/>
                    <div class="close-button">&#x00D7;</div>
                </div>
            </div>
            
        `;
        document.body.appendChild(modal);
        let close = (event, override = false) => {
            if (override || (event.target !== document.getElementById(imageId) && !document.getElementById(imageId).contains(event.target))) {
                document.body.removeChild(modal);
                document.removeEventListener('mousedown', close);
            }
        }
        document.addEventListener('mousedown', close);
        // Exit button
        // modal.children[1].children[0].addEventListener('click', (e) => close(e, true));
        // Not needed since the close function uses the image as the bastion for clicking
        // Open image in new tab
        document.getElementById(imageId).addEventListener('click', openImage);
    }
}

let onLoadCalls = {};

function LazyLoadImage(props) {
    let id = "id" in props ? props.id : uuidv4();
    let source = props.source.slice(0, props.source.indexOf(".png")) + `-lq.png`;
    onLoadCalls[id] = () => {
        let imageContainer = document.getElementById(id);
        let index = imageContainer.src.indexOf("-lq");
        if (index === -1) return;
        imageContainer.src = imageContainer.src.slice(0, index) + imageContainer.src.slice(index + 3);
    };
    if (props.modalEnabled)
        return (<img class="image" id={id} src={source} onClick={openImageModal(id)} />);
    else
        return (<img class="image" id={id} src={source} />);
}


function imagePicker(images, ids) {
    let id = ids.slice(-1)[0];
    function selectImage(name){
        return () => {
            let imageContainer = document.getElementById(id);
            imageContainer.src = `${imageContainer.src.slice(0, imageContainer.src.indexOf("/pictures/") + 10)}${name}.png`;
        }
    }
    let options = images.map((image, index) => (
        <div class="picker-opt" onClick={selectImage(image.slice(image.indexOf("/pictures/") + 10, image.indexOf(".png")))}>
            <LazyLoadImage
                source={image}
                id={ids[index]}
            />
        </div>
    ));
    return (
        <div class="image-picker">
            {LazyLoadImage({ source: images[0], modalEnabled: true, id: id })}
            <div class="picker-option-container">
                {images.length > 1 ? options : ""}
            </div>
        </div>
    );
}

function Panel(props) {
    let resourceList = props.resources.map((el, index) => {
        return (
            <li>
                {el}
            </li>
        );
    });
    let content;
    if ("index" in props && props.index % 2 === 1) {
        content = (
            <div class="panel-content">
                <div class="project-content-1">
                    <div class="project-image-align">
                        <ul tabIndex="0">
                            {resourceList}
                        </ul>
                        {imagePicker(props.images, props.ids)}
                    </div>
                </div>
                <div class="project-content-2">
                    {props.content}
                </div>
            </div>
        );
    }
    else {
        content = (
            <div class="panel-content">
                <div class="project-content-2">
                    {props.content}
                </div>
                <div class="project-content-1">
                    <div class="project-image-align">
                        {imagePicker(props.images, props.ids)}
                        <ul tabIndex="0">
                            {resourceList}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div class="panel">
            <div class="corner-200-tl"></div>
            <div class="title-bar">
                <h2 tabIndex="0">
                    {props.title}{'link' in props ? ": " : ""}{"link" in props ? <a href={props.link}>{props.link}</a> : ""}
                </h2>
                {"source" in props ? (<a href={props.source} class="gradient-button" tabIndex="0">Source</a>) : ""}
            </div>
            {content}
        </div>
    );
}

/*
    <div class="gradient-text">
        {gradTextTest}
    </div><div class="gradient-text blur">
        {gradTextTest}
    </div>
*/

function copyToClipboard() {
    let copy = document.getElementById("copy");
    let tooltip = document.createElement("span");
    tooltip.innerHTML = `Copied!`;
    tooltip.classList.add("tooltip");
    copy.appendChild(tooltip);
    navigator.clipboard.writeText('joseph@splitreceipt.app');
    setTimeout(() => { copy.removeChild(tooltip); }, 6000);
}

function createIds(n) {
    let array = [];
    for (let i = 0; i < n; i++) {
        array.push(uuidv4());
    }
    return array;
}

let hardwareIds1 = createIds(3);
let hardwareIds2 = createIds(1);

function Hardware(props) {
    let websites = [
        {
            content: "The IntelliShades:Pro was developed by 4 engineers to create shades that respond to sunlight in the environment.",
            resources: [
                "Circuits",
                "Java",
                "Python"
            ],
            title: "IntelliShades: Pro",
            images: [
                `${process.env.PUBLIC_URL}/pictures/ip1.png`,
                `${process.env.PUBLIC_URL}/pictures/ip2.png`,
            ],
            index: 1,
            ids: hardwareIds1,
        },
        {
            content: "The Touch Gate was developed by 4 engineers to create a sliding gate that only opens in response to an NFC chip.",
            resources: [
                "Circuits",
                "Python"
            ],
            title: "Touch Gate",
            images: [
                `${process.env.PUBLIC_URL}/pictures/tg.png`,
            ],
            index: 2,
            ids: hardwareIds2,
        }
    ];
    let panels = websites.map((obj, index) => Panel(obj));
    return (
        <main id="test">
            {panels}
        </main>
    );
}

/**
 "70f5a416-6af0-487b-b09a-0f89a94b0ecc"
          93e7bc04-3744-4e27-8b89-e637ca22df43
         26a0abec-9fe0-4d68-baf9-059709b787bf

         dd97d9af-869b-4a0a-b45f-76c4de4f982e
         b77aae24-7502-48d0-8784-5d161a5ec4da
         f45cef01-d55c-44bb-9c1d-e124b3bfc600
 
 */

let softwareIds1 = createIds(1);
let softwareIds2 = createIds(3);

function Software(props) {
    let websites = [
        {
            content: "Extrasensory perception. Bounding boxes marking each CPU player are created through applying matrix transformations to entity coordinates.",
            resources: [
                "C++",
                "GDI+",
                "Windows API"
            ],
            title: "Video Game ESP",
            link: "https://youtube.com/watch?v=9fd9ya3nhgQ",
            images: [
                `${process.env.PUBLIC_URL}/pictures/ac.png`,
            ],
            index: 1,
            ids: softwareIds1,
        },
        {
            content: "Client-server chess for easily playing online with an opened port.",
            resources: [
                "Java"
            ],
            title: "Chess",
            source: "https://github.com/jcarm98/chess",
            images: [
                `${process.env.PUBLIC_URL}/pictures/ch1.png`,
                `${process.env.PUBLIC_URL}/pictures/ch2.png`,
            ],
            index: 2,
            ids: softwareIds2,
        }
    ];
    let panels = websites.map((obj, index) => Panel(obj));
    return (
        <main id="test">
            {panels}
        </main>
    );
}

let websiteIds1 = createIds(6);
let websiteIds2 = createIds(1);
let websiteIds3 = createIds(3);

class Portfolio extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        let websites = [
            {
                content: "Split Receipt is a web app designed to make it easy to split a receipt with your friends.",
                resources: [
                    "CSS",
                    "DigitalOcean",
                    "Javascript",
                    "Nginx",
                    "React.js",
                ],
                title: "Split Receipt",
                link: "https://splitreceipt.app",
                source: "https://github.com/jcarm98/splitreceipt",
                images: [
                    `${process.env.PUBLIC_URL}/pictures/sr1.png`,
                    `${process.env.PUBLIC_URL}/pictures/sr2.png`,
                    `${process.env.PUBLIC_URL}/pictures/sr3.png`,
                    `${process.env.PUBLIC_URL}/pictures/sr4.png`,
                    `${process.env.PUBLIC_URL}/pictures/sr5.png`,
                ],
                index: 1,
                ids: websiteIds1,
            },
            {
                content: "Food Tourney is a web app that helps you decide where to eat using your address, location, or zip code.",
                resources: [
                    "Apache",
                    "ASP.NET",
                    "Bootstrap",
                    "C#",
                    "Google Cloud Platform",
                    "SCSS",
                    "Typescript",
                    "Vue 3"
                ],
                title: "Food Tourney",
                link: "https://foodtourney.app",
                source: "https://github.com/jcarm98/food-tourney",
                images: [
                    `${process.env.PUBLIC_URL}/pictures/ft.png`,
                ],
                index: 2,
                ids: websiteIds2,
            },
            {
                content: "Hobby Share is a social platform to share and collaborate on projects.",
                resources: [
                    "Angular",
                    "Bootstrap 3",
                    "CSS",
                    "DigitalOcean",
                    "Django",
                    "Nginx",
                    "Python",
                    "Typescript"
                ],
                title: "Hobby Share",
                link: "https://hobbyshare.app",
                source: "https://github.com/jcarm98/hobby-share",
                images: [
                    `${process.env.PUBLIC_URL}/pictures/hs1.png`,
                    `${process.env.PUBLIC_URL}/pictures/hs2.png`,
                ],
                index: 3,
                ids: websiteIds3,
            }
        ];
        let panels = websites.map((obj, index) => Panel(obj));
        /*
         93e7bc04-3744-4e27-8b89-e637ca22df43
         26a0abec-9fe0-4d68-baf9-059709b787bf

         dd97d9af-869b-4a0a-b45f-76c4de4f982e
         b77aae24-7502-48d0-8784-5d161a5ec4da
         f45cef01-d55c-44bb-9c1d-e124b3bfc600



         0398827f-55e6-48bd-b805-4d1bc7658ec4
         
         bd27ab03-fd47-4bd9-9b3e-d742a4e46fee

         8e6b5c88-8cd2-4214-8a29-b09ee0e24406
         1412fdcd-2825-4e85-8ce4-baf26a9be9eb

         49bda5d9-c1c3-4c64-9a12-f6690c2e5b97

         e11cd4c3-9581-45c2-a9ff-35274d67972e

         08557ee8-2cf6-4586-b905-5af61e9200df
         a523613e-80a5-41b3-bcb3-dd524eb09b3b
         be3398e3-4111-4467-82d9-e51016041aea
         */
        return (
            <main id="test">
                {panels}
            </main>
        );
    }
}

window.onLoadCalls = onLoadCalls;
window.uuid = uuidv4;


function RouterTemplate() {
    let headerText = ['Websites', 'Software', 'Hardware'];
    headerText = headerText.map((text, index) => (
        <Link style={{ position: "relative", display: "flex", "align-items": "center", cursor: "pointer" }}
            class="cancel-anchor-style"
            to={index === 0 ? "/" : index === 1 ? "/software" : "/hardware"}
            onClick={loadImages}
        >
            <div class={
                index === 0
                    ? "tab-padding gradient-text"
                    : index === 1
                        ? "tab-padding gradient-text delay-30"
                        : "tab-padding gradient-text delay-60"}>
                {text}
            </div><div class={
                index === 0
                    ? "tab-padding gradient-text blur"
                    : index === 1
                        ? "tab-padding gradient-text blur delay-30"
                        : "tab-padding gradient-text blur delay-60"}>
                {text}
            </div>
        </Link>
    ));

    return (
        <div id="container-wrapper">
                <div id="div1"></div>
                <div id="container">

                <Router>
                    <header>
                        <div class="corner-200-tl"></div>
                        <div class="corner-200-tr"></div>
                        <h1>Joseph Carmona</h1>
                        <h2>Full Stack Developer</h2>
                        <h2>joseph&lt;at&gt;splitreceipt&#123;dot&#125;app <div id="copy" onClick={copyToClipboard}>&nbsp;&nbsp;&nbsp;</div> | <a href="https://github.com/jcarm98">Github</a> | <a href="https://www.linkedin.com/in/joseph-carmona-347433155/">LinkedIn</a></h2>
                        <div style={{ display: "flex", "justify-content": "space-around", "width": "100%" }}>
                            {headerText}
                        </div>
                    </header>
                    <Routes>
                        <Route path="/" element={<Portfolio />} />
                        <Route path="/software" element={<Software />} />
                        <Route path="/hardware" element={<Hardware />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>

                    <div id="footer-spacer"></div>
                    <footer>
                        <div class="corner-200-tl"></div>
                        footer
                    </footer>
                    {/*
                        <object style={{ zIndex: 3, width: "100%", height: "100%" }} data="./test.svg" type="image/svg+xml"></object>
                    */}
                </div>
                <div id="div2"></div>
            </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
        <RouterTemplate />
  </React.StrictMode>
);
