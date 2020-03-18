# kschoon.me
[View Live](https://kschoon.me) |
[Report Bug](https://github.com/kevinschoonover/kschoon.me/issues) |
[Request Feature](https://github.com/kevinschoonover/kschoon.me/issues)

Personal branding / landing page.

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites
+ [Git](https://git-scm.com/download/)
+ [NodeJS](https://yarnpkg.com/getting-started) (at least current LTS)
+ [Yarn](https://yarnpkg.com/getting-started)

### Installation
 
1. Clone the kschoon.me repository using Git Bash:
```sh
# Make sure to setup ssh keys on your github account
# https://help.github.com/en/articles/adding-a-new-ssh-key-to-your-github-account
git clone git@github.com:kevinschoonover/kschoon.me.git
```

2. Change into the `index` directory:
```bash
cd <YOUR_REPO_NAME>/index/
```

3. Install the necessary dependencies:
```bash
yarn
```

<!-- USAGE EXAMPLES -->
## Usage

### Serving the site locally
```bash
yarn dev
```

### Adding new features/plugins

You can add other features by having a look at the official [plugins page](https://www.gatsbyjs.org/docs/plugins/).

### Building your site

```
yarn build
```

Copy the content of the `public` folder to your webhost or use a website like Netlify which automates that for you.

### Configuration

You have multiple options to configure this project.

1. Use the `config/website.js` to configure data passed to the SEO component and other parts of the Gatsby site:

```JS
module.exports = {
  pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "/portfolio"

  siteTitle: 'Cara - Gatsby Starter Portfolio', // Navigation and Site Title
  siteTitleAlt: 'Cara', // Alternative Site title for SEO
  siteTitleShort: 'Cara', // short_name for manifest
  siteHeadline: 'Creating marvelous art & blazginly fast websites', // Headline for schema.org JSONLD
  siteUrl: 'https://cara.lekoarts.de', // Domain of your site. No trailing slash!
  siteLanguage: 'en', // Language Tag on <html> element
  siteLogo: '/logo.png', // Used for SEO and manifest
  siteDescription: 'Playful & Colorful One-Page website with Parallax effect',
  author: 'LekoArts', // Author for schema.org JSONLD

  // siteFBAppID: '123456789', // Facebook App ID - Optional
  userTwitter: '@cara', // Twitter Username
  ogSiteName: 'cara', // Facebook Site Name
  ogLanguage: 'en_US', // Facebook Language

  // Manifest and Progress color
  themeColor: tailwind.colors.orange,
  backgroundColor: tailwind.colors.blue,
}
```

2. Use the `tailwind.js` file to configure TailwindCSS. Their [documentation](https://tailwindcss.com/docs/configuration) explains it step-by-step.

3. Modify the files in the `src/styles` directory.

4. Modify the sections in the `src/views` directory. They contain the Dividers & SVG icons.

5. You can also place the icons somewhere else on the page, modify their animation and hide them on smaller screens:

```JSX
  <SVG icon="triangle" hideMobile width={48} stroke={colors.orange} left="10%" top="20%" />
  <SVG icon="hexa" width={48} stroke={colors.red} left="60%" top="70%" />
  <SVG icon="box" width={6} fill={colors['grey-darker']} left="60%" top="15%" />
```

- For `icon`, you have the options: `triangle, circle, arrowUp, upDown, box, hexa, cross`
- If you want the SVG to be hidden on mobile view, add `hideMobile` to the SVG component
- You can define the width via the TailwindCSS width [option](https://tailwindcss.com/docs/width)
- The colors get defined via the TailwindCSS color [option](https://tailwindcss.com/docs/colors)
  - Please note that you will either have to define the color in `stroke` **or** `fill` depending on the icon. For reference, have a look at the currently used SVGs
- The options `left` and `top` position the icon relatively to its parent container
- You can also wrap the SVGs with `<UpDown />` or `<UpDownWide />` to animate them

#### Typography

Instead of relying on Google's CDN to host its fonts, this site self-hosts the fonts and therefore benefits from increased performance. The installed fonts can be found in `src/components/Layout.jsx`:

```JSX
import 'typeface-cantata-one';
import 'typeface-open-sans';
```

This starter uses [typefaces](https://github.com/KyleAMathews/typefaces) by Kyle Mathews. Have a look at the repository if you want to install & use other fonts.

You'll also need to configure `fonts` in `tailwind.js` to reflect the changes. You then can use the fonts with `font-sans` and `font-serif`.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/kevinschoonover/kschoon.me/issues) for a list
of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

These are mostly just my personal projects, but if you're interested in
contributing please:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MPL-2.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Me - me@kschoon.me

Project Link: [https://github.com/kevinschoonover/kschoon.me](https://github.com/kevinschoonover/kschoon.me)



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[kevinschoonover-organization]: https://github.com/kevinschoonover/
[contributors-shield]: https://img.shields.io/github/contributors/kevinschoonover/kschoon.me.svg?style=flat-square
[contributors-url]: https://github.com/kevinschoonover/kschoon.me/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kevinschoonover/kschoon.me.svg?style=flat-square
[forks-url]: https://github.com/kevinschoonover/kschoon.me/network/members
[stars-shield]: https://img.shields.io/github/stars/kevinschoonover/kschoon.me.svg?style=flat-square
[stars-url]: https://github.com/kevinschoonover/kschoon.me/stargazers
[issues-shield]: https://img.shields.io/github/issues/kevinschoonover/kschoon.me.svg?style=flat-square
[issues-url]: https://github.com/kevinschoonover/kschoon.me/issues
[license-shield]: https://img.shields.io/github/license/kevinschoonover/kschoon.me?style=flat-square
[license-url]: https://github.com/kevinschoonover/kschoon.me/blob/master/LICENSE.txt
