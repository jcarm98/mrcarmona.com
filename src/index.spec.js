import { act, render } from '@testing-library/react';
const index = require('./index');

// CI=true to disable watch
describe('Index', () => {
    afterEach(() => {
        document.getElementsByTagName('html')[0].innerHTML = '';
    });
    it('should copy image src on modal open', () => {
        const img = document.createElement('img');
        img.src = 'test.png';
        img.id = 'test';
        document.body.appendChild(img);

        expect(document.getElementById('modal')).toBeFalsy();
        index.openImageModal('test')();

        const modal = document.getElementById('modal');
        expect(modal).toBeTruthy();

        const imgs = modal.getElementsByTagName('img');
        expect(imgs.length).toBe(1);
        expect(imgs[0]).toBeDefined();
        expect(imgs[0].src).toBe(img.src);
    });
    it('should render LazyLoadImage with an img with given id, alt, and src', () => {
        const lqSource = 'test.png'
        let altText = 'alt'
        const id = 'id';
        render(<index.LazyLoadImage lqSource={lqSource} altText={altText} id={id} />);

        const imgs = document.getElementsByTagName('img');
        expect(imgs.length).toBe(1);
        expect(imgs[0]).toBeDefined();

        const img = imgs[0];
        expect(img.id).toBe(id);
        expect(img.alt).toBe(altText);
        expect(img.src).toContain(lqSource);
        expect(img.onclick).toBeFalsy();
    });
    it('should add an onclick function when LazyLoadImage has modalEnabled', () => {
        render(<index.LazyLoadImage modalEnabled={true} id='id' />);
        const imgs = document.getElementsByTagName('img');
        expect(imgs.length).toBe(1);
        expect(imgs[0]).toBeDefined();

        const img = imgs[0];
        expect(img.onclick).toBeTruthy();
    });
    it('should set img tag with id elementId src to path and alt to altText on selectImage call', () => {
        const img = document.createElement('img');
        const id = 'id';
        img.id = id;
        document.body.appendChild(img);

        const path = 'test.png';
        const altText = 'alt';
        index.selectImage(id, path, altText)();

        expect(img.src).toContain(path);
        expect(img.alt).toBe(altText);
    });
    it('should do nothing when calling the same selectImage twice', () => {
        const img = document.createElement('img');
        const id = 'id';
        img.id = id;
        document.body.appendChild(img);

        const path = 'test.png';
        const altText = 'alt';
        index.selectImage(id, path, altText)();
        index.selectImage(id, img.src, img.alt)();

        expect(img.src).toContain(path);
        expect(img.alt).toBe(altText);
    });
    it('should return the same array of ids for a given array of image objects on getImageIds call', () => {
        const images = ['test1.png', 'test2.png'].map(image => {
            return {
                source: image,
            }
        });
        const ids = index.getImageIds(images);
        expect(index.getImageIds(images)).toBe(ids);
    });
    it('should return different values of ids for different arrays of image objects on getImageIds call', () => {
        const images = ['test1.png', 'test2.png'].map(image => {
            return {
                source: image,
            }
        });
        const images2 = ['test2.png', 'test1.png'].map(image => {
            return {
                source: image,
            }
        });
        const ids = index.getImageIds(images);
        expect(index.getImageIds(images2)).not.toBe(ids);
    });
    it('should create no options for list of 1 image object on imagePicker render', () => {
        const images = [{}];
        render(index.imagePicker(images));
        const imgs = document.getElementsByTagName('img');
        expect(imgs.length).toBe(1);
        expect(imgs[0]).toBeDefined();

        const optionContainer = document.getElementsByClassName('picker-option-container');
        expect(optionContainer.length).toBe(0);
    });
    it('should create options for a list of >1 image object on imagePicker render', () => {
        const images = [{}, {}];
        render(index.imagePicker(images));
        const imgs = document.getElementsByTagName('img');
        expect(imgs.length).toBe(images.length + 1);

        const optionContainer = document.getElementsByClassName('picker-option-container');
        expect(optionContainer.length).toBe(1);

        const options = optionContainer[0].getElementsByClassName('picker-opt');
        expect(options.length).toBe(images.length);

        expect(imgs[0].onclick).toBeTruthy();
    });
    it('should render a panel with order 1-2 with odd index', () => {
        render(<index.Panel index={1} />);
        const panelContentList = document.getElementsByClassName('panel-content');
        expect(panelContentList).toBeTruthy();
        expect(panelContentList.length).toBe(1);
        const panelContent = panelContentList[0];
        expect(panelContent.children).toBeTruthy();
        expect(panelContent.children.length).toBe(2);
        expect(panelContent.children[0].classList).toContain('project-content-1');
        expect(panelContent.children[1].classList).toContain('project-content-2');
    });
    it('should render a panel with order 2-1 with even index', () => {
        render(<index.Panel index={2} />);
        const panelContentList = document.getElementsByClassName('panel-content');
        expect(panelContentList).toBeTruthy();
        expect(panelContentList.length).toBe(1);
        const panelContent = panelContentList[0];
        expect(panelContent.children).toBeTruthy();
        expect(panelContent.children.length).toBe(2);
        expect(panelContent.children[0].classList).toContain('project-content-2');
        expect(panelContent.children[1].classList).toContain('project-content-1');
    });
    it('should not render an image picker when Panel is not given images on render', () => {
        render(<index.Panel />);
        const panelContent1 = document.getElementsByClassName('project-content-1');
        expect(panelContent1).toBeTruthy();
        expect(panelContent1.length).toBe(1);
        const child = panelContent1[0];
        expect(child).toBeTruthy();
        expect(child.children).toBeTruthy();
        expect(child.children.length).toBe(1);
        expect(child.children[0].children).toBeTruthy();
        expect(child.children[0].children.length).toBe(1);
    });
    it('should render a Panel with resources before images with odd index', () => {
        render(<index.Panel index={1} images={[{}]} />);
        const panelContent1 = document.getElementsByClassName('project-content-1');
        expect(panelContent1).toBeTruthy();
        expect(panelContent1.length).toBe(1);
        const child = panelContent1[0];
        expect(child).toBeTruthy();
        expect(child.children).toBeTruthy();
        expect(child.children.length).toBe(1);
        expect(child.children[0].children).toBeTruthy();
        expect(child.children[0].children.length).toBe(2);
        expect(child.children[0].children[0].tagName.toLowerCase()).toBe('ul');
        expect(child.children[0].children[1].tagName.toLowerCase()).toBe('div');
    });
    it('should render a Panel with resources after images with even index', () => {
        render(<index.Panel index={2} images={[{}]} />);
        const panelContent1 = document.getElementsByClassName('project-content-1');
        expect(panelContent1).toBeTruthy();
        expect(panelContent1.length).toBe(1);
        const child = panelContent1[0];
        expect(child).toBeTruthy();
        expect(child.children).toBeTruthy();
        expect(child.children.length).toBe(1);
        expect(child.children[0].children).toBeTruthy();
        expect(child.children[0].children.length).toBe(2);
        expect(child.children[0].children[0].tagName.toLowerCase()).toBe('div');
        expect(child.children[0].children[1].tagName.toLowerCase()).toBe('ul');
    });
    it('should render an anchor when Panel is provided a link', () => {
        const link = 'https://example.com/';
        render(<index.Panel link={link} />);
        const anchor = document.getElementsByTagName('a');
        expect(anchor.length).toBe(1);
        expect(anchor[0]).toBeDefined();
        expect(anchor[0].href).toBe(link);
    });
    it('should not render an anchor when Panel is not given a link', () => {
        render(<index.Panel />);
        const anchor = document.getElementsByTagName('a');
        expect(anchor.length).toBe(0);
    });
    it('should render a source button when Panel is provided a source', () => {
        const source = 'https://example.com/';
        render(<index.Panel source={source} />);
        const anchor = document.getElementsByTagName('a');
        expect(anchor.length).toBe(1);
        expect(anchor[0]).toBeDefined();
        expect(anchor[0].href).toBe(source);
    });
    it('should not render a button when Panel is not given a source', () => {
        render(<index.Panel />);
        const anchor = document.getElementsByTagName('a');
        expect(anchor.length).toBe(0);
    });
    it('should have two anchors when Panel is rendered with a link and source', () => {
        const link = 'https://example.com/';
        const source = 'https://example2.com/';
        render(<index.Panel link={link} source={source} />);
        const anchors = document.getElementsByTagName('a');
        expect(anchors.length).toBe(2);
        expect(anchors[0]).toBeDefined();
        expect(anchors[0].href).toBe(link);
        expect(anchors[1]).toBeDefined();
        expect(anchors[1].href).toBe(source);
    });
    // Cannot run these tests in jest since navigator.clipboard.writText is not supported
    /*
    it('should render a tooltip in element with provided id on copyToClipboard call', () => { });
    it('should copy the specified text to clipboard on copyToClipboard call', () => { });
    */
    it('should render website Main on render', () => {
        render(index.RouterOutput());
        const main = document.getElementById('websites');
        expect(main).toBeTruthy();
    });
    it('should render software Main when software link (2nd link) is clicked', () => {
        const softwareLinkPosition = 1;
        render(index.RouterOutput());
        const linkContainer = document.getElementById('router-links');
        expect(linkContainer).toBeTruthy();
        expect(linkContainer.children).toBeTruthy();
        expect(linkContainer.children.length).toBe(3);
        expect(linkContainer.children[softwareLinkPosition]).toBeTruthy();
        act(() => {
            linkContainer.children[softwareLinkPosition].click();
        });
        const main = document.getElementById('software');
        expect(main).toBeTruthy();
    });
    it('should render hardware Main when hardware link (3rd link) is clicked', () => {
        const hardWareLinkPosition = 2;
        render(index.RouterOutput());
        const linkContainer = document.getElementById('router-links');
        expect(linkContainer).toBeTruthy();
        expect(linkContainer.children).toBeTruthy();
        expect(linkContainer.children.length).toBe(3);
        expect(linkContainer.children[hardWareLinkPosition]).toBeTruthy();
        act(() => {
            linkContainer.children[hardWareLinkPosition].click();
        });
        const main = document.getElementById('hardware');
        expect(main).toBeTruthy();
    });
});

/*
playwright tests?

clicking on a copy button will copy expected text to clipboard
clicking on a copy button will render a tooltip in that area

click on selected image in a section opens modal
click on image in modal opens that image in new tab
click elsewhere closes modal

click on non-selected image in picker selects that image
click on non-default selected image opens modal of that image
click on image in second modal opens the same image

nav to software
select chess image 2
click selected
open image in new tab
compare paths
close modal
click chess image 1
click selected
open image in new tab
compare paths
close
*/
