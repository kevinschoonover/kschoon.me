# api.kschoon.me
[View Live](https://api.kschoon.me) |
[Report Bug](https://github.com/kevinschoonover/kschoon.me/issues) |
[Request Feature](https://github.com/kevinschoonover/kschoon.me/issues)

Backend API for facilitating all server-side interactions that will include:
+ Communicating with a [nomad instance](https://nomadproject.io/) to schedule
  automated airline check-in.

and more.
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
+ [python](https://www.python.org/downloads/) (>= 3.7)
+ [docker](https://docs.docker.com/)
+ [docker-compose](https://docs.docker.com/compose/install/) (>= 3.0)

### Installation
 
1. Clone the kschoon.me repository using Git Bash:
```sh
# Make sure to setup ssh keys on your github account
# https://help.github.com/en/articles/adding-a-new-ssh-key-to-your-github-account
git clone git@github.com:kevinschoonover/kschoon.me.git
```

2. Change into the `backend` directory:
```bash
cd <YOUR_REPO_NAME>/backend/
```

3. Install the necessary dependencies:
```bash
pip install poetry
poetry install
```

<!-- USAGE EXAMPLES -->
## Usage
### To **start** the entire backend **in development mode**
1. Change into the root directory of the repository:
    ```
    cd ../
    ```

2. Run the docker-compose file:
    ```bash
    docker-compose up
    ```

### To **deploy** a **production-ready version** of the backend
Checkout the README located in `<GIT_REPO_ROOT>/deploy/`

### To **managed dependencies**
Use poetry:
+ To **update**:
    ```
    poetry update
    ```
+ To **add**:
    ```
    poetry add <dependency>
    ```

But make sure to **update the requirements.txt AFTER applying any change**:
```
poetry export -f requirements.txt -o requirements.txt
```

This is because the docker build currently relies on the requirements.txt and
not poetry. The may be changed after monitoring 
[this issue on github](https://github.com/python-poetry/poetry/issues/1301).

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
