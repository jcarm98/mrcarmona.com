import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate
} from 'react-router-dom';
import './index.scss';

/**
 * Loads the images listed in global onLoadCalls.
 * Called on document load and when route links are clicked.
 * @returns {void}
 */
function loadImages() {
    for (let func of Object.values(onLoadCalls)) {
        try {
            func();
        }
        catch (e) {
            if (String(e) !== 'TypeError: imageContainer is null')
                console.log('Problem during body.onLoad:', e);
        }
    }
}

document.body.onload = loadImages;

/* eslint-disable */
// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
/**
 * Generates a uuidv4 value.
 * Used here to give images unique ids, so they can have the low quality version of images replaced with the actual image.
 * @returns {string} A version 4 UUID
 * */
export function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
/* eslint-enable */

/**
 * Opens a modal when the selected image for a section is clicked for that image.
 * Further clicking on the image in the opened modal opens the image in a new tab.
 * Returns a function so this function doesn't need to be wrapped when passing to onClick.
 * 
 * sourceId should be the uuid that matches the id of an img tag
 * @param {string} sourceId - The UUID of the image to fetch for the modal
 * @returns {Function}
 */
export function openImageModal(sourceId) {
    const dneError = `No source img tag found for id ${sourceId} when creating modal.`;
    if (sourceId === null || sourceId === undefined || sourceId.length === 0) {
        console.error(dneError);
        return;
    }
    const imageId = uuidv4();
    return () => {
        const sourceImg = document.getElementById(sourceId);
        if (sourceImg === null || sourceImg === undefined) {
            console.error(dneError);
            return;
        }

        const source = sourceImg.src;
        const openImage = (e) => {
            window.open(source, '_blank');
        };
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class='overlay'></div>
            <div id='modal' class='image-modal'>
                <h3>Click or tap the image to open it in a new tab</h3>
                <div>
                    <img id='${imageId}' class='image' src='${source}'/>
                    <div class='close-button'>&#x00D7;</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const close = (event, override = false) => {
            if (override || (event.target !== document.getElementById(imageId) && !document.getElementById(imageId).contains(event.target))) {
                document.body.removeChild(modal);
                document.removeEventListener('mousedown', close);
            }
        }
        document.addEventListener('mousedown', close);
        // Exit button
        // Not needed since the close function works when clicking anywhere that is not the image itself.
        // modal.children[1].children[1].children[1].addEventListener('click', (e) => close(e, true));

        // Open image in new tab
        document.getElementById(imageId).addEventListener('click', openImage);
    }
}

/**
 * Dictionary of functions that replace low quality images with actual images.
 * Populated when LazyLoadImage elements are rendered.
 * @type {Object.<string, Function>}
 * */
const onLoadCalls = {};

/**
 * @typedef {Object} LazyLoadImage
 * @property {string} source
 * @property {string} lqSource
 * @property {string} altText
 * @property {string} id
 * @property {boolean} modalEnabled
 * @param {LazyLoadImage} props
 * @returns {JSX.Element}
 */
export function LazyLoadImage(props) {
    const id = props.id;
    const source = props.lqSource;
    if (Object.keys(onLoadCalls).includes(id) === false) {
        onLoadCalls[id] = () => {
            const imageContainer = document.getElementById(id);
            const imageElement = document.createElement('img');
            imageElement.onload = () => {
                imageElement.decode().then()
                    .catch((error) => {
                        console.error(`Image onload error for ${props.source}.`);
                        console.error(error);
                    })
                    .finally(() => {
                        if (imageContainer === null || imageContainer === undefined) {
                            // console.log(`Container ${id} is not rendered!`);
                            return;
                        } else {
                            // console.log(`Found ${id} container!`);
                        }
                        imageContainer.src = props.source;
                    });
            }
            imageElement.src = props.source;
        };
    }
    if (props.modalEnabled)
        return (<img class='image' id={id} src={source} alt={props.altText} tabIndex='0' onClick={openImageModal(id)} />);
    else
        return (<img class='image' id={id} src={source} alt={props.altText} tabIndex='0'/>);
}

/**
 * Returns a function that switches the image in the selected container with the image provided in path.
 * Returns a function since onclick calls functions immediately.
 * @param {string} elementId
 * @param {string} path
 * @returns {Function}
 */
export function selectImage(elementId, path, altText) {
    const noIdError = `No element id: ${elementId} found when selecting image`;
    const noPathError = `No path found when selecting image`;
    return () => {
        if (elementId === undefined || elementId === null || elementId.length < 1) {
            console.error(noIdError);
            return;
        }
        if (path === undefined || path === null || path.length < 1) {
            console.error(noPathError);
            return;
        }
        const imageElement = document.getElementById(elementId);
        if (imageElement === undefined || imageElement === null) {
            console.error(noIdError);
            return;
        }
        imageElement.src = path;
        imageElement.alt = altText;
    }
}

/**
 * @typedef {Object} idObject
 * @property {string[]} ids
 * @property {string} containerId
 * */
/**
 * Stores the ids for image elements
 * @type {Object.<string, idObject>} imageIds
 * */
const imageIds = {};

/**
 * @typedef {Object} imageObject
 * @property {string} source
 * @property {string} lqSource
 * @property {string} altText
 */
/**
 * Fetches a set of ids used for image elements if present, otherwise generates and returns them.
 * @param {imageObject[]} images
 * @returns {idObject}
 */
export function getImageIds(images) {
    const key = images.map(image => image.source).reduce((current, next) => current + next, '');
    const length = images.length;
    if (key in imageIds) {
        return imageIds[key];
    }
    const idObject = {
        ids: new Array(length).fill().map(() => uuidv4()),
        containerId: uuidv4(),
    };
    imageIds[key] = idObject;
    return imageIds[key];
}

/**
 * Creates an image picker from a given list of images.
 * Creates options to select other images from the list if there is more than one image.
 * @param {imageObject[]} images
 * @returns {JSX.Element}
 */
export function imagePicker(images) {
    const idObject = getImageIds(images);
    const ids = idObject.ids;
    const selectedContainerId = idObject.containerId;

    const optionsContainer = images.length > 1
        ? <div class='picker-option-container'>
            {
                images.map((image, index) => (
                    <div class='picker-opt' onClick={selectImage(selectedContainerId, image.source, image.altText)} key={index}>
                        <LazyLoadImage
                            source={image.source}
                            lqSource={image.lqSource}
                            altText={image.altText}
                            id={ids[index]}
                        />
                    </div>
                ))
            }
        </div>
        : '';
    return (
        <div class='image-picker'>
            {LazyLoadImage({
                source: images[0].source,
                lqSource: images[0].lqSource,
                altText: images[0].altText,
                modalEnabled: true,
                id: selectedContainerId,
            })}
            {optionsContainer}
        </div>
    );
}

/**
 * Creates a single panel with content staggering based on index value.
 * Panels will collapse to column view on smaller screens.
 * @typedef {Object} Panel
 * @property {string} content
 * @property {string[]} resources
 * @property {string} title
 * @property {string} [link]
 * @property {boolean} [source]
 * @property {imageObject[]} images
 * @property {number} index
 * @param {Panel} props
 * @returns {JSX.Element}
 */
export function Panel(props) {
    const inOrder = 'index' in props && props.index % 2 === 1;
    const hasLink = 'link' in props;
    const hasSource = 'source' in props;

    const resourceItems = (props.resources ?? []).map((el, index) => {
        return (
            <li key={index}>
                {el}
            </li>
        );
    });
    const resourceList = (
        <ul tabIndex='0'>
            {resourceItems}
        </ul>
    );
    const imagePickerElement = 'images' in props && props.images.length > 0 ? imagePicker(props.images) : '';
    const panelContent2 = (
        <div class='project-content-2' tabIndex='0'>
            {props.content}
        </div>
    );

    let content;
    if (inOrder === true) {
        content = (
            <div class='panel-content'>
                <div class='project-content-1'>
                    <div class='project-image-align'>
                        {resourceList}
                        {imagePickerElement}
                    </div>
                </div>
                {panelContent2}
            </div>
        );
    }
    else {
        content = (
            <div class='panel-content'>
                {panelContent2}
                <div class='project-content-1'>
                    <div class='project-image-align'>
                        {imagePickerElement}
                        {resourceList}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class='panel'>
            <div class='corner-200-tl'></div>
            <div class='title-bar'>
                <h2 tabIndex='0'>
                    {props.title}{hasLink ? ': ' : ''}{hasLink ? <a href={props.link}>{props.link}</a> : ''}
                </h2>
                {hasSource ? (<a href={props.source} class='gradient-button' tabIndex='0'>Source</a>) : <div class='gradient-button hidden-button'>Source</div>}
            </div>
            {content}
        </div>
    );
}

/**
 * Wrapper component to render each page/section while calling load images at the appropriate time.
 * */
class RenderMain extends React.Component {
    componentDidMount() {
        loadImages();
    }

    render() {
        return (
            <main id={this.props.id ?? ''}>
                {this.props.children}
            </main>
        );
    }
}

/**
 * Creates an array of props to create Panels for Hardware section.
 * @returns {JSX.Element}
 * */
function Hardware() {
    const websites = [
        {
            content: 'The IntelliShades:Pro was developed by 4 engineers to create shades that respond to sunlight in the environment.',
            resources: [
                'Circuits',
                'Java',
                'Python'
            ],
            title: 'IntelliShades: Pro',
            images: [
                {
                    source: `${process.env.PUBLIC_URL}/pictures/ip1.png`,
                    lqSource: `${process.env.PUBLIC_URL}/pictures/ip1-lq.png`,
                    altText: 'Demo of the project showing the shade retracted.',
                },
                {
                    source: `${process.env.PUBLIC_URL}/pictures/ip2.png`,
                    lqSource: `${process.env.PUBLIC_URL}/pictures/ip2-lq.png`,
                    altText: 'Demo of the project showing the shade extended.',
                },
            ],
        },
        {
            content: 'The Touch Gate was developed by 4 engineers to create a sliding gate that only opens in response to an NFC chip.',
            resources: [
                'Circuits',
                'Python'
            ],
            title: 'Touch Gate',
            images: [{
                source: `${process.env.PUBLIC_URL}/pictures/tg.png`,
                lqSource: `${process.env.PUBLIC_URL}/pictures/tg-lq.png`,
                altText: 'Circuit diagram of the project based on a Raspberry Pi.',
            }],
        }
    ];
    const panels = websites.map((obj, index) => {
        obj.index = index + 1;
        return (<Panel {...obj} key={index} />);
    });
    return (
        <RenderMain id={'hardware'}>
            {panels}
        </RenderMain>
    );
}

/**
 * Creates an array of props to create Panels for Software section.
 * @returns {JSX.Element}
 * */
function Software() {
    const websites = [
        {
            content: 'Extrasensory perception. Bounding boxes marking each CPU player are created through applying matrix transformations to entity coordinates.',
            resources: [
                'C++',
                'GDI+',
                'Windows API'
            ],
            title: 'Video Game ESP',
            link: 'https://youtube.com/watch?v=9fd9ya3nhgQ',
            images: [{
                source: `${process.env.PUBLIC_URL}/pictures/ac.png`,
                lqSource: `${process.env.PUBLIC_URL}/pictures/ac-lq.png`,
                altText: 'Screenshot of AssaultCube showing team colored player boxes.'
            }],
        },
        {
            content: 'Client-server chess for easily playing online with an opened port.',
            resources: [
                'Java'
            ],
            title: 'Chess',
            source: 'https://github.com/jcarm98/chess',
            images: [
                {
                    source: `${process.env.PUBLIC_URL}/pictures/ch1.png`,
                    lqSource: `${process.env.PUBLIC_URL}/pictures/ch1-lq.png`,
                    altText: 'Screenshot of Chess, white perspective with silver and gold theme.',
                },
                {
                    source: `${process.env.PUBLIC_URL}/pictures/ch2.png`,
                    lqSource: `${process.env.PUBLIC_URL}/pictures/ch2-lq.png`,
                    altText: 'Screenshot of Chess, black perspective with black and white theme.',
                },
            ],
        }
    ];
    const panels = websites.map((obj, index) => {
        obj.index = index + 1;
        return (<Panel {...obj} key={index} />);
    });
    return (
        <RenderMain id={'software'}>
            {panels}
        </RenderMain>
    );
}

/**
 * Creates an array of props to create Panels for Websites section.
 * */
class Portfolio extends React.Component {
    /* Useless constructor
    constructor(props){
        super(props);
    }
    */
    render() {
        const websites = [
            {
                content: 'Split Receipt is a web app designed to make it easy to split a receipt with your friends.',
                resources: [
                    'CSS',
                    'DigitalOcean',
                    'Javascript',
                    'Nginx',
                    'React.js',
                ],
                title: 'Split Receipt',
                link: 'https://splitreceipt.app',
                source: 'https://github.com/jcarm98/splitreceipt',
                images: [
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/sr1.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/sr1-lq.png`,
                        altText: 'First screen of Split Receipt, where you list everyone\'s names.',
                    },
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/sr2.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/sr2-lq.png`,
                        altText: 'Second screen of Split Receipt, where you list each item.',
                    },
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/sr3.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/sr3-lq.png`,
                        altText: 'Third screen of Split Receipt, where you select items to split.',
                    },
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/sr4.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/sr4-lq.png`,
                        altText: 'Fourth screen of Split Receipt, where you assign names to a selected item.',
                    },
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/sr5.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/sr5-lq.png`,
                        altText: 'Final screen of Split Receipt, where you view everyone\'s totals and adjust tax and tip.',
                    },
                ],
            },
            {
                content: 'Food Tourney is a web app that helps you decide where to eat using your address, location, or zip code.',
                resources: [
                    'Apache',
                    'ASP.NET',
                    'Bootstrap',
                    'C#',
                    'Google Cloud Platform',
                    'SCSS',
                    'Typescript',
                    'Vue 3'
                ],
                title: 'Food Tourney',
                link: 'https://foodtourney.app',
                source: 'https://github.com/jcarm98/food-tourney',
                images: [{
                    source: `${process.env.PUBLIC_URL}/pictures/ft.png`,
                    lqSource: `${process.env.PUBLIC_URL}/pictures/ft-lq.png`,
                    altText: 'Food Tourney landing screen, where you select a location by ZIP or allow location permission.',
                }],
            },
            {
                content: 'Hobby Share is a social platform to share and collaborate on projects.',
                resources: [
                    'Angular',
                    'Bootstrap 3',
                    'CSS',
                    'DigitalOcean',
                    'Django',
                    'Nginx',
                    'Python',
                    'Typescript'
                ],
                title: 'Hobby Share',
                link: 'https://hobbyshare.app',
                source: 'https://github.com/jcarm98/hobby-share',
                images: [
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/hs1.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/hs1-lq.png`,
                        altText: 'My profile on Hobby Share.',
                    },
                    {
                        source: `${process.env.PUBLIC_URL}/pictures/hs2.png`,
                        lqSource: `${process.env.PUBLIC_URL}/pictures/hs2-lq.png`,
                        altText: 'One of my projects on Hobby Share.',
                    },
                ],
            }
        ];
        const panels = websites.map((obj, index) => {
            obj.index = index + 1;
            return (<Panel {...obj} key={index} />);
        });
        return (
            <RenderMain id={'websites'}>
                {panels}
            </RenderMain>
        );
    }
}

/**
 * Copies specified text to the users clipboard and displays a tooltip on the provided element by id.
 * Timeout is timed to remove the element when fading animation ends.
 * @returns {void}
 * */
export function copyToClipboard(elementId, copyText) {
    const noElementError = `No element found for id: ${elementId} when attempting to copy to clipboard.`
    const noCopyText = `Text:${copyText} is invalid when attempting to copy to clipboard.`;
    if (elementId === null || elementId === undefined || elementId.length < 0) {
        console.error(noElementError);
        return;
    }
    if (copyText === null || copyText === undefined || copyText.length < 0) {
        console.error(noCopyText);
        return;
    }
    const copy = document.getElementById(elementId);
    if (copy === null || copy === undefined) {
        copy.error(noElementError);
        return;
    }
    const tooltip = document.createElement('span');
    tooltip.innerHTML = 'Copied!';
    tooltip.classList.add('tooltip');
    copy.appendChild(tooltip);
    navigator.clipboard.writeText(copyText);
    setTimeout(() => { copy.removeChild(tooltip); }, 6000);
}

const emailCopyId = 'copyEmail';
const githubCopyId = 'copyGithub';
const linkedInCopyId = 'copyLinkedIn';
const githubLink = 'https://github.com/jcarm98';
const linkedInLink = 'https://www.linkedin.com/in/joseph-carmona-347433155/';

function copyEmail() {
    copyToClipboard(emailCopyId, 'joseph@splitreceipt.app');
}

function copyGithub() {
    copyToClipboard(githubCopyId, githubLink);
}

function copyLinkedIn() {
    copyToClipboard(linkedInCopyId, linkedInLink);
}

/**
 * Main body of the page. All pages are rendered through here. Includes router links.
 * @returns {JSX.Element}
 * */
export function RouterOutput() {
    const websiteRoute = '/';
    const softwareRoute = '/software';
    const hardwareRoute = '/hardware';
    const headerTuples = [
        {
            label: 'Websites',
            route: websiteRoute,
        },
        {
            label: 'Software',
            route: softwareRoute,
        },
        {
            label: 'Hardware',
            route: hardwareRoute,
        },
    ];
    const delayMap = ['', 'delay-30', 'delay-60'];
    const headerLinks = headerTuples.map((header, index) => (
        <Link class='cancel-anchor-style glow-link' to={header.route} key={index}>
            <div class={`tab-padding gradient-text ${delayMap[index]}`}>
                {header.label}
            </div>
            <div class={`tab-padding gradient-text blur ${delayMap[index]}`}>
                {header.label}
            </div>
        </Link>
    ));

    return (
        <div id='container-wrapper'>
            <div id='left-gradient'></div>
            <div id='container'>
                <Router>
                    <header>
                        <div class='corner-200-tl'></div>
                        <div class='corner-200-tr'></div>
                        <h1 tabIndex='0'>Joseph Carmona</h1>
                        <h2 tabIndex='0'>Full Stack Developer</h2>
                        <h2><span tabIndex='0'>joseph&lt;at&gt;splitreceipt&#123;dot&#125;app</span> <div class='copy' id={emailCopyId} onClick={copyEmail}>&nbsp;&nbsp;&nbsp;</div> | <a href={githubLink}>Github</a> <div class='copy' id={githubCopyId} onClick={copyGithub}>&nbsp;&nbsp;&nbsp;</div> | <a href={linkedInLink}>LinkedIn</a> <div class='copy' id={linkedInCopyId} onClick={copyLinkedIn}>&nbsp;&nbsp;&nbsp;</div></h2>
                        <div id='router-links' class='link-container'>
                            {headerLinks}
                        </div>
                    </header>
                    <Routes>
                        <Route path={websiteRoute} element={<Portfolio />} />
                        <Route path={softwareRoute} element={<Software />} />
                        <Route path={hardwareRoute} element={<Hardware />} />
                        <Route path='*' element={<Navigate to='/' replace />} />
                    </Routes>
                </Router>
                <div id='footer-spacer'></div>
                <footer class='link-container'>
                    <div class='corner-200-tl'></div>
                    <a href='https://v1.mrcarmona.com' class='gradient-button'>v1</a>
                </footer>
                {// Normal rendering of svgs
                /*
                    <object style={{ zIndex: 3, width: '100%', height: '100%' }} data='./test.svg' type='image/svg+xml'></object>
                */}
            </div>
            <div id='right-gradient'></div>
         </div>
    );
}

// Jest tests fail without document root check
const documentRoot = document.getElementById('root');
if (documentRoot !== undefined && documentRoot !== null) {
    const root = ReactDOM.createRoot(documentRoot);
    root.render(
        <React.StrictMode>
            <RouterOutput />
        </React.StrictMode>
    );
}
