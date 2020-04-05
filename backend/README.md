# api.kschoon.me
[View Live](https://api.kschoon.me) |
[Report Bug](https://github.com/kevinschoonover/kschoon.me/issues) |
[Request Feature](https://github.com/kevinschoonover/kschoon.me/issues)

Backend API for facilitating all server-side interactions that will include:
+ Communicating with a [docker](https://docs.docker.com/) to schedule
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
+ [rust](https://www.rust-lang.org/tools/install)
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

## Usage
### Testing
The API has a [pytest](https://docs.pytest.org/en/latest/) test suite that can
be run with the following instructions:

1. Start a postgres database in the background for the tests to connect to:
    ```bash
    docker run -d -e POSTGRES_PASSWORD=postgres \
               --name db -p 5432:5432 \
               --tmpfs /var/lib/postgresql/data:rw \
               postgres:12
    ```

    **NOTE:** if you see, something like:
    ```
    docker: Error response from daemon: Conflict. The container name "/db" is
    already in use by container
    "6e134e3f18743d0aaf86730452038374354ab6a31430020950649d7bd0b81d4e". You have
    to remove (or rename) that container to be able to reuse that name.
    ```

    You will need to run remove the already existing docker container and start
    it again as so:
    ```bash
    docker stop db && \
      docker rm db && \
      docker run -d -e POSTGRES_PASSWORD=postgres \
               --name db -p 5432:5432 \
               --tmpfs /var/lib/postgresql/data:rw \
               postgres:12
    ```

2. Create the `.env` file:
    ```bash
    echo DATABASE_URL=postgres://postgres:postgres@localhost/postgres > .env
    ```

2. Run the tests:
    ```bash
    cargo test
    ```

3. When you're done, make sure you turn off and delete the database to prevent
   the clashes mentioned above:
   ```
   docker stop db && docker rm db
   ```

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
