// ==UserScript==
// @name         ChatGPT Add Copy Code Button
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Adds a "Copy code" button to the bottom of each code block in ChatGPT chat, preserving the original button position and ensuring it is added only once.
// @author       Rob Streeter w/ ChatGPT 4o copilot
// @license      MIT
// @match        *://chatgpt.com/*
// @grant        none
// ==/UserScript==

/*!
 * MIT License
 *
 * Copyright (c) 2024 Rob Streeter
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function() {
    'use strict';

    let debounceTimeout;

    function debounce(func, wait) {
        return function(...args) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function createButtonContent(text) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm" style="margin-right: 2px;">
                <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span style="margin-left: 2px; margin-right: -3px;">${text}</span>
        `;
    }

    function createCopyButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex items-center new-button-container';

        const span = document.createElement('span');
        span.className = 'new-button-span';
        span.setAttribute('data-state', 'closed');

        const button = document.createElement('button');
        button.className = 'new-copy-button flex items-center';
        button.style.padding = '2px 4px';
        button.style.height = '30px'; // Decrease the height slightly
        button.innerHTML = createButtonContent('Copy code');

        span.appendChild(button);
        buttonContainer.appendChild(span);
        return buttonContainer;
    }

    function addCopyButtons() {
        try {
            // Find all code blocks
            const codeBlocks = document.querySelectorAll('pre');

            codeBlocks.forEach(block => {
                // Check if the button container already exists
                if (block.querySelector('.new-button-container')) {
                    return;
                }

                // Create a new "Copy code" button
                const newButton = createCopyButton();

                // Add click event to copy code
                newButton.querySelector('button').addEventListener('click', () => {
                    const code = block.querySelector('code').innerText;
                    navigator.clipboard.writeText(code).then(() => {
                        const button = newButton.querySelector('button');
                        button.innerHTML = createButtonContent('Copied!');
                        setTimeout(() => button.innerHTML = createButtonContent('Copy code'), 2000);
                    });
                });

                // Create a bottom container with rounded bottom corners
                const bottomContainer = document.createElement('div');
                bottomContainer.className = 'flex items-center relative text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-end rounded-b-md new-bottom-container';
                bottomContainer.style.paddingTop = '0';
                bottomContainer.style.paddingBottom = '0';

                // Add the new button to the bottom container
                bottomContainer.appendChild(newButton);

                // Append the bottom container to the code block
                block.appendChild(bottomContainer);
            });
        } catch (error) {
            console.error('Error in addCopyButtons:', error);
        }
    }

    // Debounced version of the addCopyButtons function
    const debouncedAddCopyButtons = debounce(addCopyButtons, 300);

    // Observe changes in the document body to handle dynamic content
    const observer = new MutationObserver(debouncedAddCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call to add buttons to existing content
    addCopyButtons();
})();
