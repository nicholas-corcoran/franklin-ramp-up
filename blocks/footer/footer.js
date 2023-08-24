import { decorateIcons, readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(
    `${footerPath}.plain.html`,
    window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {},
  );

  if (resp.ok) {
    const html = await resp.text();

    const footerHtml = document.createElement('div');
    footerHtml.innerHTML = html;

    // decorate footer DOM
    const footer = document.createElement('div');

    const footerBackgroundImage = footerHtml.getElementsByTagName('picture')[0];
    const footerElements = Array.from(footerHtml.getElementsByTagName('div'));
    const footerTableElements = footerElements.slice(1, footerElements.length - 1);

    const footerTable = document.createElement('div');
    footerTable.classList.add('footer-table');
    footerTableElements.forEach((divElement) => {
      footerTable.appendChild(divElement);
    });

    const footerEndContainer = footerElements.slice(-1)[0];
    footerEndContainer.classList.add('footer-end');

    const paragraphs = footerEndContainer.querySelectorAll('p');
    const newDiv = document.createElement('div');
    paragraphs.forEach((paragraph) => {
      newDiv.appendChild(paragraph);
    });
    newDiv.classList.add('footer-copyright');
    footerEndContainer.appendChild(newDiv);

    footer.appendChild(footerBackgroundImage);
    footer.appendChild(footerTable);
    footer.appendChild(footerEndContainer);

    decorateIcons(footer);
    block.append(footer);
  }
}
