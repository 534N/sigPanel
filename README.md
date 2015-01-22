# sigPanel

This is a backend management system I built for Alcatel-Lucent TS Helper, which is web app that visualizes useful data from user uploaded binary file that is generated from Alcatel-Lucent 7x50 SR routers.

This biggest purpose of this platform is to provide a way for user to manage regular expressions that are used to slurp information from the input file

One cool thing it does is to validate Regex on fly and only validate regex can be save. 

This project is built with Express 3.x/Node.js, with Jade, Stylus, Angular.js and MongoDB. It does however employee a couple of PHP script in the backend for PCRE regex parsing. 

Task management tool is done with Grunt, which is in charge of minify Javascripts and CSS scripts. 

Testing is powered by Karma+Jasmine (frontend) and Mocha+Chai (backend), however, due to the time constraint I had when developing this proejct, I had to give up on TDD, which still wakes me up in the night... 

I am trying to setup a demo site, but before it is live, snap shots can be seen at http://seanyang.io. 
