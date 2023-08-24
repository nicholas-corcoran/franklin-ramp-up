import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Toggles the entire nav
 * @param {Element} menu The menu container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleContainer(menu, forceExpanded = null) {
  if (forceExpanded) {
    menu.classList.remove('active');
  } else {
    menu.classList.toggle('active');
  }
}

/**
 * Toggles the presence of a list item within a container,
 * based on the provided navigation section (navSection)
 * @param {*} navSection Object representing the navigation
 * section to be toggled. Should contain keys: textContent, href.
 * @param {*} container DOM element representing the container
 * where the list item should be toggled.
 * @param {*} append A boolean indicating whether the item should
 * be appended (true) or prepended (false) to the container. Default is true.
 * @param {*} forceExpanded A boolean indicating whether
 * to forcefully remove the item. Default is null.
 * @returns
 */
function toggleNavSectionListItems(navSection, container, append = true, forceExpanded = null) {
  const ulElement = container.querySelector('ul');

  if (!ulElement) {
    // eslint-disable-next-line no-console
    console.error('Container does not contain a UL element.');
    return;
  }

  const existingLi = ulElement.querySelector(`a[href="${navSection.href}"]`);

  if (forceExpanded || existingLi) {
    setTimeout(() => ulElement.removeChild(existingLi.parentElement), 300);
  } else {
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href = navSection.href;
    a.textContent = navSection.textContent;

    li.append(a);
    if (append) {
      ulElement.append(li);
    } else {
      ulElement.prepend(li);
    }
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) {
        section.classList.add(`nav-${c}`);
        if (classes[i] === 'brand') {
          section.setAttribute('title', 'Ensemble');
        }
        if (classes[i] === 'tools') {
          const button = document.createElement('button');
          button.appendChild(section.cloneNode(true));
          button.classList.add('nav-button');
          section.parentNode.replaceChild(button, section);
        }
      }
    });

    // nav menu for smaller screens
    const menuContainer = document.createElement('div');
    menuContainer.classList.add('menu');
    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      menuContainer.append(navSections.cloneNode(true));
    }
    const header = document.querySelector('header');
    header.append(menuContainer);

    const menuUnderlay = document.createElement('div');
    menuUnderlay.classList.add('menu-underlay');

    const toggleMenu = (forceExpanded = null) => {
      toggleContainer(menuContainer, forceExpanded);
      toggleContainer(menuUnderlay, forceExpanded);
      toggleNavSectionListItems(
        {
          textContent: 'Home',
          href: nav.children[1].querySelector('a').href,
        },
        menuContainer,
        false,
        forceExpanded,
      );
      toggleNavSectionListItems(
        {
          textContent: nav.children[nav.children.length - 1].textContent,
          href: nav.children[nav.children.length - 1].querySelector('a').href,
        },
        menuContainer,
        true,
        forceExpanded,
      );
    };

    menuUnderlay.addEventListener('click', () => toggleMenu());
    header.append(menuUnderlay);

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu());
    nav.prepend(hamburger);

    // prevent mobile nav behavior on window resize
    isDesktop.addEventListener('change', () => toggleMenu(isDesktop.matches));

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);
  }
}
