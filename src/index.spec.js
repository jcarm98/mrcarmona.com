import { cleanup, screen, render } from '@testing-library/react';
const index = require('./index');

afterEach(() => {
    cleanup();
})

describe("Index", () => {
    it('should return true', () => {
        expect(true).toBe(true);
    });

    it('should be called', () => {
        render(<index.Panel resources={["Java"]} ids={[]} images={[]}/>);
        const elements = document.getElementsByClassName("panel");
        expect(elements.length).toBe(1);
        expect(elements[0]).toBeDefined();
    });
);

