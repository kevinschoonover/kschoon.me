# sso.kschoon.me
[View Live](https://sso.kschoon.me) |
[Report Bug](https://github.com/kevinschoonover/kschoon.me/issues) |
[Request Feature](https://github.com/kevinschoonover/kschoon.me/issues)

[OpenID Compliant](https://openid.net/what-is-openid/) Single Sign-On
implementation for all \*.kschoon.me services using the following technologies:
+ TypeScript
+ [node-oidc-provider](https://github.com/panva/node-oidc-provider) -
  Implements the entire OpenID specification and provides configuration to hook
  into it.
+ [redis](https://redis.io/) - Stores state information about oauth2
  authentication/authorization interaction state and 
+ [grpc](https://grpc.io) - Used for communication between \*.kschoon.me
  services


This service is dependent on the following other services:
+ **identity.kschoon.me** - For finding the identity of users based on email /
  ID and sending passwordless authentication code via text.

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

2. Change into the `sso` directory:
```bash
cd <YOUR_REPO_NAME>/sso/
```

3. Install the necessary dependencies:
```bash
yarn
```

4. Navigate to the `identity` services at `../identity/README.md` and preform
   the installation instructions. **NOTE** this is necessary as you cannot
   currently run the identity service in isolation and requires full
   integration. Future versions of this application hope to remove this
   requirement. 

## Usage
The sso service runs in production with a redis instance backing the session
data. In development, node-oidc-provider provides a in-memory adapter that
allows it to be run in isolation as a result. 

### Development
#### Run with 'manual' integration (w/o redis)
1. Navigate to the `identity` service in a new terminal and perform the manual
   integration steps in the usage section.

2. Start the sso service:
```bash
yarn start:dev
```

3. Look at the
   [openid-configuration](http://localhost:3000/auth?client_id=foo&response_type=code&scope=openid)
   to make sure the application is working at.

4. Start [an authorization
   request](http://localhost:3000/auth?client_id=foo&response_type=code&scope=openid).

##### Run with 'manual' intergration (w/ redis)
1. Start the `redis` instance using docker:
```bash
$(docker stop redis && docker rm redis); docker run --name redis -p 6379:6379 redis:6.0-alpine
```

2. Navigate to the `identity` service in a new terminal and perform the manual
   integration steps in the usage section.

3. Start the sso service with appropriate environment variables:
```bash
USE_REDIS=true REDIS_URL=redis://localhost:6379 yarn start:dev
```

4. Look at the
   [openid-configuration](http://localhost:3000/auth?client_id=foo&response_type=code&scope=openid)
   to make sure the application is working at.

5. Start [an authorization
   request](http://localhost:3000/auth?client_id=foo&response_type=code&scope=openid).


#### Run using docker-compose
1. Navigate to the root directory of the reposity:
```bash
cd ../
```

2. Start the services using `docker-compose`:
```bash
docker-compose up
```

4. Look at the
   [openid-configuration](http://lvh.me/auth?client_id=foo&response_type=code&scope=openid)
   to make sure the application is working at.

5. Start [an authorization
   request](http://lvh.me/auth?client_id=foo&response_type=code&scope=openid).

### Production
TODO


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
