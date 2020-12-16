import React from 'react';
import ReactDOM from 'react-dom';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css'
import 'jquery/dist/jquery.min.js'
import 'bootstrap/dist/js/bootstrap.min.js'

import './index.css';

function Image(props) {
    return (
        <img src={props.path}
            alt=""
            style={{
                maxWidth: "100%",
                maxHeight: "100%",
            }} />
    );
}

function Tile(props) {
    const list = props.skills.map((skill, index) => (
        <li key={index}>
            {skill}
        </li>
    ));

    return (
        <div className="pb-2">
            <div className="btn btn-outline-light w-100"
                style={{
                    color: "#000000",
                    borderColor: "#000000",
                    cursor: "auto",
                    backgroundColor: "transparent",
                }}>

                <h5 className="row no-gutters">
                    {props.name}:&nbsp;{props.link !== undefined ? (<a href={props.link}>{props.link}</a>) : ""}
                </h5>

                <div className="row no-gutters">

                    <div className="col">
                        <div className="row no-gutters"
                            style={{
                                borderRadius: "0.25rem",
                                overflow: "hidden"
                            }}>
                            <div className="col">
                                <Image path={props.path} />
                            </div>

                            {props.path2 !== undefined ? <div className="col"><Image path={props.path2} /></div> : ""}

                        </div>
                    </div>

                    <div className="col-auto text-left">
                        <ul>{list}</ul>
                    </div>

                </div>

                <div className="text-left pt-2">{props.about}</div>

            </div>
        </div>
    );
}

class Project {
    constructor(name, link, skills, about, path, path2) {
        this.name = name;
        this.link = link;
        this.skills = skills;
        this.about = about;
        this.path = path;
        this.path2 = path2;
    }
}

class Websites extends React.Component {
    constructor(props) {
        super(props);

        let splitreceipt = new Project(
            "SplitReceipt.app",
            "https://splitreceipt.app",
            ["CSS", "Javascript", "Nginx", "React.js"],
            "SplitReceipt.app is a web app designed to make it easy to split a receipt with your friends.",
            "sr.png",
        );
        let hobbyshare = new Project(
            "HobbyShare.app",
            "https://hobbyshare.app",
            ["Angular", "Bootstrap", "CSS", "Django", "Typescript", "Nginx", "Python"],
            "HobbyShare.app is a social platform to share and collaborate on projects.",
            "hs1.png",
            "hs2.png"
        );

        let mikemcbridemasonry = new Project(
            "Mike McBride Masonry",
            "https://mikemcbridemasonry.com",
            ["Apache", "Bootstrap", "CSS", "Javascript", "React.js"],
            "Mike McBride Masonry is a masonry business located in Coachella Valley, California.",
            "mmm.png",
        );

        this.state = {
            websites: [mikemcbridemasonry, hobbyshare, splitreceipt],
        };
    }

    render() {
        const tiles = this.state.websites.map((website, index) => (
            <Tile key={index}
                name={website.name}
                link={website.link}
                path={website.path}
                path2={website.path2}
                skills={website.skills}
                about={website.about} />
            ));
        return (
            <div>
                {tiles}
            </div>
        );
    }
}

class Software extends React.Component {
    constructor(props) {
        super(props);
        let wallhacks = new Project(
            "Video Game ESP",
            "https://youtu.be/9fd9ya3nhgQ",
            ["C++", "GDI+", "Windows API"],
            "Bounding boxes marking each CPU player are created through transforming entity coordinates.",
            "ac.png"
        );

        let chess = new Project(
            "Chess",
            "",
            ["Java"],
            "Client-server chess for easily playing online." +
            " This was created before Windows 10, which decreases the size of the program window.",
            "ch1.png",
            "ch2.png"
        );

        this.state = {
            software: [wallhacks, chess],
        };
    }

    render() {
        const tiles = this.state.software.map((program, index) => (
            <Tile key={index}
                name={program.name}
                link={program.link}
                path={program.path}
                path2={program.path2}
                skills={program.skills}
                about={program.about} />
        ));
        return (
            <div>
                {tiles}
            </div>
        );
    }
}

class Hardware extends React.Component {
    constructor(props) {
        super(props);
        let intellishades = new Project(
            "IntelliShades: Pro",
            "",
            ["Electronics", "Java", "Python"],
            "The IntelliShades: Pro was developed by 4 engineers to create shades that respond to sunlight in the environment.",
            "ip1.png",
            "ip2.png"
        );

        let touchgate = new Project(
            "Touch Gate",
            "",
            ["Electronics", "Python"],
            "The Touch Gate was developed by 4 engineers to create a sliding gate that only opens in response to an NFC chip.",
            "tg.png"
        );

        this.state = {
            hardware: [intellishades, touchgate],
        };
    }

    render() {
        const tiles = this.state.hardware.map((project, index) => (
            <Tile key={index}
                name={project.name}
                link={project.link}
                path={project.path}
                path2={project.path2}
                skills={project.skills}
                about={project.about} />
        ));
        return (
            <div>
                {tiles}
            </div>
        );
    }
}

function Section(props) {
    const display = (props.size !== undefined && props.size === "h1")
        ? (<h1 className="text-center">{props.display}</h1>)
        : (<h4 className="text-center">{props.display}</h4>);
    const title = (props.size !== undefined && props.size === "h1")
        ? "Joseph Carmona"
        : "Joseph Carmona | " + props.display;

    return (
        <Link to={props.route}
            style={{
                color: "#000000",
            }}
            onClick={() => props.update(title)}>
            {display}
        </Link>
    );
}

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updated: false,
        };
    }

    setTitle(title) {
        document.title = title;
        this.setState({
            updated: !this.state.updated,
        });
    }

    componentDidMount() {
        if (window.location.href.substring(window.location.href.length - 9, window.location.href.length) === "/websites") {
            this.setTitle("Joseph Carmona | Websites");
        }
        if (window.location.href.substring(window.location.href.length - 9, window.location.href.length) === "/software") {
            this.setTitle("Joseph Carmona | Software");
        }
        if (window.location.href.substring(window.location.href.length - 9, window.location.href.length) === "/hardware") {
            this.setTitle("Joseph Carmona | Hardware");
        }
    }
    // backgroundImage: "linear-gradient( to right, #128e0b, transparent)"
    render() {
        return (
            <Router>
                <div className="container bg-light"
                    style={{
                        color: "#000000",
                        minHeight: "100vh",
                    }}>

                    <Section
                        route="/"
                        display="Joseph Carmona"
                        update={(title) => this.setTitle(title)}
                        size="h1" />

                    <h4 className="text-center">joseph[at]splitreceipt[dot]app</h4>

                    <div className="row no-gutters">
                        <div className="col text-center">
                            <Section
                                route="/websites"
                                display="Websites"
                                update={(title) => this.setTitle(title)} />
                        </div>
                        <div className="col text-center">
                            <Section
                                route="/software"
                                display="Software"
                                update={(title) => this.setTitle(title)} />
                        </div>
                        <div className="col text-center">
                            <Section
                                route="/hardware"
                                display="Hardware"
                                update={(title) => this.setTitle(title)}
                                size="h3" />
                        </div>
                    </div>
                    <Switch>
                        <Route path="/websites">
                            <Websites />
                        </Route>
                        <Route path="/software">
                            <Software />
                        </Route>
                        <Route path="/hardware">
                            <Hardware />
                        </Route>
                        <Route path="/">
                            {<Redirect to="/websites" />}
                        </Route>
                    </Switch>
                    <div class="pt-1"></div>
                </div>
            </Router>
        );
    }
}

ReactDOM.render(
    <Portfolio id="portfolio" />,
    document.getElementById('root')
);